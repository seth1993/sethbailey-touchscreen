import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Globe2,
  Monitor,
  Smartphone,
  Tablet,
  Radio,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { auth } from "../firebase";
import { PROJECT_BY_SITE } from "../marketing/projects";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "28d", days: 28 },
  { label: "90d", days: 90 },
];

const endpoint =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:5001/sethbaileydev-84a1e/us-central1/getAnalyticsReport"
    : "https://us-central1-sethbaileydev-84a1e.cloudfunctions.net/getAnalyticsReport";

const deviceIcon = (device) => {
  const key = (device || "").toLowerCase();
  if (key === "mobile") return Smartphone;
  if (key === "tablet") return Tablet;
  return Monitor;
};

const formatDuration = (seconds) => {
  if (!seconds) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

const shortDate = (iso) => {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
};

// A labelled horizontal bar list -- used for channels, countries and devices.
const Breakdown = ({ title, rows, icons = false }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-2">{title}</p>
      {rows.length === 0 ? (
        <p className="text-gray-600 text-sm italic">No data yet</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const Icon = icons ? deviceIcon(row.label) : Globe2;
            return (
              <li key={row.label} className="flex items-center gap-2.5">
                <Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-300 flex-1 truncate">{row.label}</span>
                <span className="h-1.5 w-16 bg-neutral-800 rounded-full overflow-hidden hidden sm:block">
                  <span
                    className="block h-full bg-emerald-500/70 rounded-full"
                    style={{ width: `${(row.value / max) * 100}%` }}
                  />
                </span>
                <span className="text-xs text-gray-500 w-8 text-right">{row.value}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const SiteAnalytics = () => {
  const [days, setDays] = useState(28);
  const [site, setSite] = useState("portfolio");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // The function owns the slug -> property map, so the list of sites we can
  // offer comes back with the report rather than being duplicated here.
  const [availableSites, setAvailableSites] = useState(["portfolio"]);

  const loadReport = useCallback(async (rangeDays, siteSlug) => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You need to be signed in to view analytics.");

      // The Data API only accepts service-account credentials, so this goes
      // through the getAnalyticsReport function rather than straight to Google.
      const token = await user.getIdToken();
      const response = await fetch(
        `${endpoint}?days=${rangeDays}&site=${encodeURIComponent(siteSlug)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const payload = await response.json().catch(() => ({}));
      // Even a rejection tells us which sites exist -- keep the picker usable.
      if (payload.availableSites) setAvailableSites(payload.availableSites);
      if (!response.ok) {
        throw new Error(payload.details || payload.error || "Failed to load analytics.");
      }
      setReport(payload);
    } catch (err) {
      console.error("Error loading GA4 report:", err);
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport(days, site);
  }, [days, site, loadReport]);

  const totals = report?.totals;
  const daily = report?.daily || [];
  const maxDaily = Math.max(1, ...daily.map((d) => d.activeUsers));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800"
    >
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-emerald-500/15 p-3 rounded-xl">
          <Activity className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-white">Google Analytics</h2>
          <p className="text-sm text-gray-400">Sessions, sources and reach from GA4</p>
        </div>

        {report?.realtimeUsers != null && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <Radio className="w-3 h-3" />
            {report.realtimeUsers} now
          </span>
        )}

        <button
          onClick={() => loadReport(days, site)}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1.5"
          title="Refresh"
          aria-label="Refresh analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Range picker */}
      <div className="flex gap-1.5 mb-5">
        {RANGES.map((range) => (
          <button
            key={range.days}
            onClick={() => setDays(range.days)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              days === range.days
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-neutral-800/60 border-neutral-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            {range.label}
          </button>
        ))}

        {availableSites.length > 1 && (
          <select
            value={site}
            onChange={(e) => setSite(e.target.value)}
            aria-label="Site"
            className="ml-auto text-xs px-3 py-1.5 rounded-lg border bg-neutral-800/60 border-neutral-800 text-gray-300 hover:text-white focus:outline-none focus:border-emerald-500/40"
          >
            {availableSites.map((slug) => (
              <option key={slug} value={slug}>
                {PROJECT_BY_SITE[slug]?.name || slug}
              </option>
            ))}
          </select>
        )}
      </div>

      {error ? (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-200">{error}</p>
            <p className="text-xs text-amber-200/60 mt-1">
              GA4 needs the Data API enabled, the service account granted Viewer
              access, and GA4_PROPERTY_ID set on the function.
            </p>
          </div>
        </div>
      ) : loading && !report ? (
        <p className="text-gray-500 text-sm py-6 text-center">Loading analytics…</p>
      ) : totals ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Active users", value: totals.activeUsers },
              { label: "New users", value: totals.newUsers },
              { label: "Sessions", value: totals.sessions },
              { label: "Page views", value: totals.pageViews },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-neutral-800/60 rounded-xl p-4 border border-neutral-800"
              >
                <div className="text-2xl font-bold text-white">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Daily bar chart */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[11px] uppercase tracking-wider text-gray-600">
                Active users · last {days} days
              </p>
              <p className="text-[11px] text-gray-600">
                avg session {formatDuration(totals.averageSessionDuration)}
              </p>
            </div>
            <div className="flex items-end gap-1 h-24">
              {daily.map((day, i) => (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center justify-end h-full gap-1"
                  title={`${shortDate(day.date)}: ${day.activeUsers} users, ${day.sessions} sessions`}
                >
                  <motion.div
                    className="w-full rounded-t bg-emerald-500/70"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${Math.max(day.activeUsers > 0 ? 8 : 2, (day.activeUsers / maxDaily) * 100)}%`,
                    }}
                    transition={{ duration: 0.5, delay: i * 0.01 }}
                    style={{
                      minHeight: day.activeUsers > 0 ? 6 : 2,
                      opacity: day.activeUsers > 0 ? 1 : 0.3,
                    }}
                  />
                </div>
              ))}
            </div>
            {daily.length > 0 && (
              <div className="flex justify-between text-[9px] text-gray-600 mt-1">
                <span>{shortDate(daily[0].date)}</span>
                <span>{shortDate(daily[daily.length - 1].date)}</span>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Breakdown title="Channels" rows={report.channels || []} />
            <Breakdown title="Countries" rows={report.countries || []} />
            <Breakdown title="Devices" rows={report.devices || []} icons />
          </div>
        </>
      ) : null}
    </motion.div>
  );
};

export default SiteAnalytics;
