import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
} from "lucide-react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
} from "firebase/firestore";

const DAYS_SHOWN = 14;

const deviceIcon = (device) => {
  if (device === "Mobile") return Smartphone;
  if (device === "Tablet") return Tablet;
  return Monitor;
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Rough location from IANA timezone, e.g. "America/Denver" -> "Denver"
const timezoneCity = (tz) => {
  if (!tz || tz === "unknown") return "Unknown";
  const parts = tz.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
};

const VisitorAnalytics = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVisits = async () => {
      try {
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const visitsQuery = query(
          collection(db, "visits"),
          where("timestamp", ">=", Timestamp.fromDate(since)),
          orderBy("timestamp", "desc"),
          limit(1000)
        );
        const snapshot = await getDocs(visitsQuery);
        const loaded = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.timestamp) {
            loaded.push({ id: docSnap.id, ...data, date: data.timestamp.toDate() });
          }
        });
        setVisits(loaded);
      } catch (error) {
        console.error("Error loading visits:", error);
      } finally {
        setLoading(false);
      }
    };
    loadVisits();
  }, []);

  // Stats
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const visitsToday = visits.filter((v) => v.date >= startOfToday).length;
  const visitsWeek = visits.filter((v) => v.date >= weekAgo).length;

  // Daily counts for the bar chart
  const dailyCounts = [];
  for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
    const day = new Date(startOfToday);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    dailyCounts.push({
      label: day.toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
      count: visits.filter((v) => v.date >= day && v.date < next).length,
    });
  }
  const maxDaily = Math.max(1, ...dailyCounts.map((d) => d.count));

  // Top referrers
  const referrerCounts = {};
  visits.forEach((v) => {
    const ref = v.referrer || "Direct";
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
  });
  const topReferrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recentVisits = visits.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800"
    >
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-sky-500/15 p-3 rounded-xl">
          <BarChart3 className="w-6 h-6 text-sky-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Site Visitors</h2>
          <p className="text-sm text-gray-400">Who's coming to the public site</p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm py-6 text-center">Loading visits…</p>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Today", value: visitsToday },
              { label: "Last 7 days", value: visitsWeek },
              { label: "Last 30 days", value: visits.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-neutral-800/60 rounded-xl p-4 border border-neutral-800"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Daily bar chart */}
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-2">
              Daily visits · last {DAYS_SHOWN} days
            </p>
            <div className="flex items-end gap-1.5 h-24">
              {dailyCounts.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end" title={`${day.label}: ${day.count}`}>
                  <span className="text-[10px] text-gray-500">
                    {day.count > 0 ? day.count : ""}
                  </span>
                  <motion.div
                    className="w-full rounded-t bg-sky-500/70"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(day.count > 0 ? 8 : 2, (day.count / maxDaily) * 100)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.02 }}
                    style={{ minHeight: day.count > 0 ? 6 : 2, opacity: day.count > 0 ? 1 : 0.3 }}
                  />
                  <span className="text-[9px] text-gray-600 whitespace-nowrap">
                    {i % 2 === 0 ? day.label : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top referrers */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-2">
                Where they come from
              </p>
              {topReferrers.length === 0 ? (
                <p className="text-gray-600 text-sm italic">No visits yet</p>
              ) : (
                <ul className="space-y-2">
                  {topReferrers.map(([ref, count]) => (
                    <li key={ref} className="flex items-center gap-2.5">
                      <Globe className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-300 flex-1 truncate">{ref}</span>
                      <span className="text-xs text-gray-500">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent visitors */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-2">
                Recent visitors
              </p>
              {recentVisits.length === 0 ? (
                <p className="text-gray-600 text-sm italic">No visits yet</p>
              ) : (
                <ul className="space-y-2">
                  {recentVisits.map((v) => {
                    const DeviceIcon = deviceIcon(v.device);
                    return (
                      <li key={v.id} className="flex items-center gap-2.5">
                        <DeviceIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-300 truncate">
                          {timezoneCity(v.timezone)}
                        </span>
                        <span className="text-xs text-gray-600 truncate">
                          {v.browser} · {v.referrer}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {timeAgo(v.date)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default VisitorAnalytics;
