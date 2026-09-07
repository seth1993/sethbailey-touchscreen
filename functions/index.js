const {onRequest} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const admin = require("firebase-admin");
const {Resend} = require("resend");

const CORS_ORIGINS = [
  "http://localhost:3000",
  "https://sethbailey.dev",
  "https://www.sethbailey.dev",
  "https://sethbaileydev-84a1e.web.app",
  "https://sethbaileydev-84a1e.firebaseapp.com"
];

exports.sendContactEmail = onRequest({
  cors: {
    origin: CORS_ORIGINS,
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
}, async (req, res) => {
  // Initialize Resend with API key from environment
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    // Parse the request body
    const {name, email, project, message} = req.body;

    // Validate required fields
    if (!name || !email || !project || !message) {
      logger.warn("Missing required fields in contact form submission");
      return res.status(400).json({error: "All fields are required"});
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn(`Invalid email format: ${email}`);
      return res.status(400).json({error: "Invalid email format"});
    }

    // Log form submission attempt
    logger.info("Contact form submission attempt", {
      name: name,
      email: email,
      project: project,
      timestamp: new Date().toISOString()
    });

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
          <h1 style="margin: 0; font-size: 24px; display: flex; align-items: center; gap: 10px;">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" style="background: white; border-radius: 50%; padding: 4px;">
              <circle cx="20" cy="20" r="18" stroke="#3B82F6" stroke-width="2" fill="none"/>
              <path d="M12 15L20 8L28 15L25 20L20 25L15 20Z" fill="#3B82F6" opacity="0.8"/>
              <circle cx="20" cy="20" r="2" fill="#3B82F6"/>
            </svg>
            Seth Bailey - New Project Inquiry
          </h1>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151; font-size: 16px;">👤 Contact Information</strong>
          <div style="margin: 10px 0; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3B82F6;">
            <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #3B82F6; text-decoration: none;">${email}</a></p>
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151; font-size: 16px;">🚀 Project Details</strong>
          <div style="margin: 10px 0; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #8B5CF6;">
            <p style="margin: 0;"><strong>Project Type:</strong> ${project}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <strong style="color: #374151; font-size: 16px;">💬 Message</strong>
          <div style="margin: 10px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #10B981;">
            <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="color: #6b7280; font-size: 14px;">📅 Submitted: ${new Date().toLocaleString()}</span>
          </div>
          <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              💡 <strong>Quick Actions:</strong> Reply directly to this email to respond to ${name}
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email using Resend
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your verified domain
      to: ["sethb23c@gmail.com"], // Replace with your email
      replyTo: email, // This allows you to reply directly to the sender
      subject: `🚀 New ${project} Inquiry from ${name}`,
      html: emailContent,
    });

    logger.info("Email sent successfully", {
      emailId: data.id,
      senderName: name,
      senderEmail: email,
      projectType: project
    });

    return res.status(200).json({
      success: true,
      message: "Thank you for your message! I'll get back to you within 24 hours.",
      id: data.id
    });

  } catch (error) {
    logger.error("Error sending contact email", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      error: "Failed to send message. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// ---------------------------------------------------------------------------
// GA4 reporting
//
// The Google Analytics Data API can only be called with a service-account
// credential, so the browser can never talk to it directly. This function is
// that server hop: the dashboard sends its Firebase ID token, we verify it,
// then read the property with the function's own service account.
//
// Setup this depends on (all one-time, in Google Cloud / GA Admin):
//   1. Enable the "Google Analytics Data API" in project sethbaileydev-84a1e
//   2. GA Admin -> Property Access Management -> add
//      302446346986-compute@developer.gserviceaccount.com as a Viewer.
//      That is the Gen 2 runtime service account (the Compute Engine default),
//      NOT the appspot one -- Gen 1 uses appspot, this project is Gen 2.
//      Every property in GA4_PROPERTIES below needs its own grant.
//   3. Set GA4_PROPERTY_ID to the *numeric* property id from
//      GA Admin -> Property Settings (not the G-XXXX measurement id)
// ---------------------------------------------------------------------------

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;

// Marketing-board slug (src/marketing/projects.js) -> numeric GA4 property id.
//
// GA property names do not match the slugs -- "tracky-c4189" is Planful,
// "chickentinder-ef0a2" is not any of these -- so this table is the only place
// the mapping is written down. Keep it here rather than client-side on purpose:
// the browser sends a slug, never a raw property id, so an authorized user
// cannot point the report at any property this service account happens to see.
//
// tobysquish and drone are deliberately absent -- neither is built yet, so
// there is no Firebase project or GA property to point at. They stay off the
// dashboard's site picker until they exist.
const GA4_PROPERTIES = {
  portfolio: GA4_PROPERTY_ID || "277870276", // sethbaileydev-84a1e
  planful: "234298835", // tracky-c4189
  pmxl: "470530668", // pmxl-f2346
  chorevest: "552924634", // chorevest
  bidfolder: "505912198", // bidfolder-3b18a
  aem: "445161975" // baileymarketing
};

// Comma-separated emails allowed to read analytics. If unset, any signed-in
// user can read them -- set this if sign-up is open to the public.
const ANALYTICS_ALLOWED_EMAILS = (process.env.ANALYTICS_ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

let analyticsClient;
const getAnalyticsClient = () => {
  if (!analyticsClient) {
    const {BetaAnalyticsDataClient} = require("@google-analytics/data");
    analyticsClient = new BetaAnalyticsDataClient();
  }
  return analyticsClient;
};

if (!admin.apps.length) {
  admin.initializeApp();
}

// Pulls the Bearer token off the request and confirms it belongs to a user
// who is allowed to see this data. Returns the decoded token.
const requireAnalyticsReader = async (req) => {
  const header = req.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) {
    const error = new Error("Missing Authorization bearer token");
    error.status = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(header.slice(7));
  } catch (err) {
    const error = new Error("Invalid or expired token");
    error.status = 401;
    throw error;
  }

  if (
    ANALYTICS_ALLOWED_EMAILS.length > 0 &&
    !ANALYTICS_ALLOWED_EMAILS.includes((decoded.email || "").toLowerCase())
  ) {
    const error = new Error("Not authorized to read analytics");
    error.status = 403;
    throw error;
  }

  return decoded;
};

// GA returns dates as "20260905"; the dashboard wants something Date-parseable.
const parseGaDate = (value) =>
  `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;

const rowsToPairs = (report, {labelFallback = "(not set)"} = {}) =>
  (report.rows || []).map((row) => ({
    label: row.dimensionValues?.[0]?.value || labelFallback,
    value: Number(row.metricValues?.[0]?.value || 0),
  }));

exports.getAnalyticsReport = onRequest({
  cors: {
    origin: CORS_ORIGINS,
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
}, async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    await requireAnalyticsReader(req);
  } catch (err) {
    logger.warn("Rejected analytics request", {reason: err.message});
    return res.status(err.status || 401).json({error: err.message});
  }

  // Resolve the slug against the table above -- an unknown slug is rejected
  // rather than falling back, so a typo reads as an error instead of silently
  // charting the portfolio's numbers under another project's name.
  const site = (req.query.site || "portfolio").toString();
  const propertyId = GA4_PROPERTIES[site];

  if (!propertyId) {
    return res.status(400).json({
      error: `No GA4 property mapped for "${site}".`,
      details: `Known sites: ${Object.keys(GA4_PROPERTIES).join(", ")}`,
      availableSites: Object.keys(GA4_PROPERTIES)
    });
  }

  // Clamp to a sane window so a bad query string can't ask for years of data.
  const requestedDays = Number(req.query.days);
  const days = Number.isFinite(requestedDays)
      ? Math.min(Math.max(Math.trunc(requestedDays), 1), 365)
      : 28;

  const property = `properties/${propertyId}`;
  const dateRanges = [{startDate: `${days}daysAgo`, endDate: "today"}];

  try {
    const client = getAnalyticsClient();

    // One batch instead of five round trips.
    const [batch] = await client.batchRunReports({
      property,
      requests: [
        {
          dateRanges,
          metrics: [
            {name: "activeUsers"},
            {name: "newUsers"},
            {name: "sessions"},
            {name: "screenPageViews"},
            {name: "eventCount"},
            {name: "averageSessionDuration"}
          ]
        },
        {
          dateRanges,
          dimensions: [{name: "date"}],
          metrics: [{name: "activeUsers"}, {name: "sessions"}],
          orderBys: [{dimension: {dimensionName: "date"}}],
          limit: 400
        },
        {
          dateRanges,
          dimensions: [{name: "sessionDefaultChannelGroup"}],
          metrics: [{name: "sessions"}],
          orderBys: [{metric: {metricName: "sessions"}, desc: true}],
          limit: 6
        },
        {
          dateRanges,
          dimensions: [{name: "country"}],
          metrics: [{name: "activeUsers"}],
          orderBys: [{metric: {metricName: "activeUsers"}, desc: true}],
          limit: 6
        },
        {
          dateRanges,
          dimensions: [{name: "deviceCategory"}],
          metrics: [{name: "activeUsers"}],
          orderBys: [{metric: {metricName: "activeUsers"}, desc: true}],
          limit: 5
        }
      ]
    });

    const [totalsReport, dailyReport, channelReport, countryReport, deviceReport] =
        batch.reports;

    const totalRow = totalsReport.rows?.[0]?.metricValues || [];
    const metricAt = (index) => Number(totalRow[index]?.value || 0);

    // Realtime is a separate endpoint -- it mirrors GA's "last 30 minutes" card.
    // Treat it as best-effort so the whole panel doesn't fail without it.
    let realtimeUsers = null;
    try {
      const [realtime] = await client.runRealtimeReport({
        property,
        metrics: [{name: "activeUsers"}]
      });
      realtimeUsers = Number(
          realtime.rows?.[0]?.metricValues?.[0]?.value || 0
      );
    } catch (err) {
      logger.warn("Realtime report unavailable", {error: err.message});
    }

    return res.status(200).json({
      site,
      availableSites: Object.keys(GA4_PROPERTIES),
      range: {days, startDate: `${days}daysAgo`, endDate: "today"},
      fetchedAt: new Date().toISOString(),
      totals: {
        activeUsers: metricAt(0),
        newUsers: metricAt(1),
        sessions: metricAt(2),
        pageViews: metricAt(3),
        eventCount: metricAt(4),
        averageSessionDuration: metricAt(5)
      },
      realtimeUsers,
      daily: (dailyReport.rows || []).map((row) => ({
        date: parseGaDate(row.dimensionValues[0].value),
        activeUsers: Number(row.metricValues[0]?.value || 0),
        sessions: Number(row.metricValues[1]?.value || 0)
      })),
      channels: rowsToPairs(channelReport, {labelFallback: "Unassigned"}),
      countries: rowsToPairs(countryReport, {labelFallback: "Unknown"}),
      devices: rowsToPairs(deviceReport, {labelFallback: "Unknown"})
    });
  } catch (error) {
    logger.error("Error fetching GA4 report", {
      error: error.message,
      code: error.code,
      site,
      propertyId
    });

    // PERMISSION_DENIED here almost always means the setup steps above are
    // incomplete, so say that instead of a generic 500.
    if (error.code === 7 || /PERMISSION_DENIED/.test(error.message || "")) {
      return res.status(403).json({
        error: `No access to the GA4 property for "${site}" (${propertyId}).`,
        details: "Grant 302446346986-compute@developer.gserviceaccount.com " +
                 "Viewer access on that property in GA Admin -> Property " +
                 "Access Management. Each property needs its own grant."
      });
    }

    return res.status(500).json({
      error: "Failed to load analytics.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});
