import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { PROJECTS } from "./projects";

// How far back we pull. 30-day windows compared against the prior 30 days
// need 60, plus a little slack for timezone edges.
const LOOKBACK_DAYS = 64;
const SPARK_DAYS = 21;

export const PERIODS = {
  day: { key: "day", label: "Today", days: 1, prevLabel: "yesterday" },
  week: { key: "week", label: "This week", days: 7, prevLabel: "prior 7 days" },
  month: { key: "month", label: "This month", days: 30, prevLabel: "prior 30 days" },
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
};
const dayKey = (d) => startOfDay(d).toISOString().slice(0, 10);

// A collection that doesn't exist yet, or one the rules don't allow, must not
// take the whole board down — each source fails on its own.
const loadCollection = async (name, since) => {
  try {
    const snap = await getDocs(
      query(
        collection(db, name),
        where("timestamp", ">=", Timestamp.fromDate(since)),
        orderBy("timestamp", "desc"),
        limit(5000)
      )
    );
    const rows = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.timestamp) return;
      rows.push({ id: docSnap.id, ...data, date: data.timestamp.toDate() });
    });
    return { rows, error: null };
  } catch (error) {
    console.error(`Error loading ${name}:`, error);
    return { rows: [], error };
  }
};

// Visits logged before sites were tagged belong to the portfolio.
const siteOf = (row) => row.site || "portfolio";

const countIn = (rows, from, to) =>
  rows.reduce((sum, r) => {
    if (r.date < from || r.date >= to) return sum;
    // Outreach rows carry a count; visits and conversions are one apiece.
    return sum + (typeof r.count === "number" ? r.count : 1);
  }, 0);

// Percent change, guarding the divide-by-zero case that dominates early data.
const variance = (current, previous) => {
  if (previous === 0) return current === 0 ? { pct: 0, isNew: false } : { pct: null, isNew: true };
  return { pct: ((current - previous) / previous) * 100, isNew: false };
};

// Deterministic sample rows so the TV layout can be judged before any real
// feed exists. Always surfaced behind an explicit "DEMO" badge — these numbers
// must never be mistaken for traffic that actually happened.
const buildDemoRows = () => {
  const today = startOfDay(new Date());
  const visits = [];
  const conversions = [];
  const outreach = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  PROJECTS.forEach((project, pIdx) => {
    const base = 14 + pIdx * 9;
    for (let d = 0; d < LOOKBACK_DAYS; d++) {
      const day = addDays(today, -d);
      // Slight upward drift toward today plus weekday seasonality.
      const drift = 1 + (LOOKBACK_DAYS - d) / (LOOKBACK_DAYS * 1.4);
      const weekend = [0, 6].includes(day.getDay()) ? 0.55 : 1;
      const count = Math.max(0, Math.round(base * drift * weekend * (0.6 + rand())));
      for (let i = 0; i < count; i++) {
        const at = new Date(day);
        at.setHours(8 + Math.floor(rand() * 12));
        visits.push({ id: `d-v-${project.site}-${d}-${i}`, site: project.site, date: at });
      }
      const convs = Math.round(count * (project.goals.conversionRate / 100) * (0.6 + rand() * 0.9));
      for (let i = 0; i < convs; i++) {
        conversions.push({
          id: `d-c-${project.site}-${d}-${i}`,
          site: project.site,
          type: "signup",
          date: new Date(day),
        });
      }
      if (rand() > 0.55) {
        outreach.push({
          id: `d-o-${project.site}-${d}`,
          site: project.site,
          channel: "LinkedIn",
          count: 1 + Math.floor(rand() * 3),
          date: new Date(day),
        });
      }
    }
  });

  return { visits, conversions, outreach };
};

export const useMarketingData = (demo = false) => {
  const [visits, setVisits] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [outreach, setOutreach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errors, setErrors] = useState([]);

  const refresh = useCallback(async () => {
    if (demo) {
      const rows = buildDemoRows();
      setVisits(rows.visits);
      setConversions(rows.conversions);
      setOutreach(rows.outreach);
      setErrors([]);
      setLastUpdated(new Date());
      setLoading(false);
      return;
    }
    const since = addDays(startOfDay(new Date()), -LOOKBACK_DAYS);
    const [v, c, o] = await Promise.all([
      loadCollection("visits", since),
      loadCollection("conversions", since),
      loadCollection("outreach", since),
    ]);
    setVisits(v.rows);
    setConversions(c.rows);
    setOutreach(o.rows);
    setErrors(
      [
        v.error && "visits",
        c.error && "conversions",
        o.error && "outreach",
      ].filter(Boolean)
    );
    setLastUpdated(new Date());
    setLoading(false);
  }, [demo]);

  useEffect(() => {
    refresh();
    // Board is meant to sit on a TV all day — keep it current on its own.
    const id = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  const buildStats = useCallback(
    (periodKey) => {
      const period = PERIODS[periodKey] || PERIODS.week;
      const today = startOfDay(new Date());
      const currentTo = addDays(today, 1);
      const currentFrom = addDays(currentTo, -period.days);
      const prevFrom = addDays(currentFrom, -period.days);

      const bySite = PROJECTS.map((project) => {
        const pick = (rows) => rows.filter((r) => siteOf(r) === project.site);
        const v = pick(visits);
        const c = pick(conversions);
        const o = pick(outreach);

        const visitsNow = countIn(v, currentFrom, currentTo);
        const visitsPrev = countIn(v, prevFrom, currentFrom);
        const convNow = countIn(c, currentFrom, currentTo);
        const convPrev = countIn(c, prevFrom, currentFrom);
        const outNow = countIn(o, currentFrom, currentTo);
        const outPrev = countIn(o, prevFrom, currentFrom);

        const rateNow = visitsNow > 0 ? (convNow / visitsNow) * 100 : 0;
        const ratePrev = visitsPrev > 0 ? (convPrev / visitsPrev) * 100 : 0;

        // Daily series for the sparkline, oldest first.
        const buckets = new Map();
        for (let i = SPARK_DAYS - 1; i >= 0; i--) buckets.set(dayKey(addDays(today, -i)), 0);
        v.forEach((row) => {
          const key = dayKey(row.date);
          if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1);
        });
        const spark = Array.from(buckets.values());

        const hasAnyData = v.length > 0 || c.length > 0 || o.length > 0;

        return {
          ...project,
          reporting: project.tracking || hasAnyData,
          visits: { now: visitsNow, prev: visitsPrev, ...variance(visitsNow, visitsPrev) },
          conversions: { now: convNow, prev: convPrev, ...variance(convNow, convPrev) },
          conversionRate: {
            now: rateNow,
            prev: ratePrev,
            // Rate variance reads better in points than in percent-of-percent.
            points: rateNow - ratePrev,
          },
          outreach: { now: outNow, prev: outPrev, ...variance(outNow, outPrev) },
          spark,
          goalPct: project.goals?.weeklyVisits
            ? Math.min(
                100,
                (visitsNow / (project.goals.weeklyVisits * (period.days / 7))) * 100
              )
            : null,
        };
      });

      const sum = (key, field) => bySite.reduce((t, p) => t + p[key][field], 0);
      const totalVisits = sum("visits", "now");
      const totalVisitsPrev = sum("visits", "prev");
      const totalConv = sum("conversions", "now");
      const totalConvPrev = sum("conversions", "prev");
      const totalOut = sum("outreach", "now");
      const totalOutPrev = sum("outreach", "prev");
      const rateNow = totalVisits > 0 ? (totalConv / totalVisits) * 100 : 0;
      const ratePrev = totalVisitsPrev > 0 ? (totalConvPrev / totalVisitsPrev) * 100 : 0;

      return {
        period,
        projects: bySite,
        totals: {
          visits: { now: totalVisits, prev: totalVisitsPrev, ...variance(totalVisits, totalVisitsPrev) },
          conversions: {
            now: totalConv,
            prev: totalConvPrev,
            ...variance(totalConv, totalConvPrev),
          },
          conversionRate: { now: rateNow, prev: ratePrev, points: rateNow - ratePrev },
          outreach: { now: totalOut, prev: totalOutPrev, ...variance(totalOut, totalOutPrev) },
        },
      };
    },
    [visits, conversions, outreach]
  );

  return useMemo(
    () => ({ loading, errors, lastUpdated, refresh, buildStats, rawVisits: visits }),
    [loading, errors, lastUpdated, refresh, buildStats, visits]
  );
};
