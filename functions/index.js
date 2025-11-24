const {onRequest} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const {Resend} = require("resend");

exports.sendContactEmail = onRequest({
  cors: {
    origin: [
      "http://localhost:3000",
      "https://sethbailey.dev",
      "https://www.sethbailey.dev",
      "https://sethbaileydev-84a1e.web.app",
      "https://sethbaileydev-84a1e.firebaseapp.com"
    ],
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