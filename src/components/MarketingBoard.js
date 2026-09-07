import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Eye,
  ListTodo,
  LogOut,
  Minus,
  Minimize2,
  Plus,
  RefreshCw,
  Radio,
  Sparkles,
  Tv,
  FlaskConical,
  Wifi,
  WifiOff,
} from "lucide-react";
import { PERIODS, useMarketingData } from "../marketing/useMarketingData";
import { OUTREACH_CHANNELS } from "../marketing/projects";
import { logOutreach } from "../marketing/report";

const SPOTLIGHT_MS = 9000;

// A card is only ever in one of these states, and each one says something
// different about what to go do — so the badge names the source rather than
// collapsing everything into live/not-live.
const feedBadge = (feed = {}) => {
  if (feed.source === "ga4") {
    return { label: "live · ga", Icon: Wifi, tone: "text-emerald-300 border-emerald-500/30 bg-emerald-500/15" };
  }
  if (feed.source === "firestore") {
    return { label: "live", Icon: Wifi, tone: "text-emerald-300 border-emerald-500/30 bg-emerald-500/15" };
  }
  if (feed.status === "no_access") {
    return { label: "no access", Icon: AlertTriangle, tone: "text-amber-300 border-amber-500/30 bg-amber-500/15" };
  }
  if (feed.status === "error") {
    return { label: "ga error", Icon: AlertTriangle, tone: "text-amber-300 border-amber-500/30 bg-amber-500/15" };
  }
  return { label: "no feed", Icon: WifiOff, tone: "text-neutral-400 border-neutral-700 bg-black/60" };
};

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

// Filled sparkline. Flat/empty series still draws a baseline so a card never
// looks broken — it looks quiet, which is the honest reading.
const Sparkline = ({ values, color, height = 44 }) => {
  const width = 240;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((v, i) => [i * step, height - (v / max) * (height - 4) - 2]);
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} ${width},${height} 0,${height}`;
  const gradientId = `spark-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// One chip carries the whole "is it working?" answer, so the three states —
// up, down, and nothing-to-compare — all have to read from across a room.
const VarianceChip = ({ pct, isNew, points, suffix = "%", size = "md" }) => {
  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-lg px-3.5 py-1.5 gap-2 font-semibold",
  };
  const value = points != null ? points : pct;

  if (isNew) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/25 ${sizes[size]}`}
      >
        <Sparkles className="w-[1em] h-[1em]" />
        new
      </span>
    );
  }
  if (value == null || Math.abs(value) < 0.05) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 ${sizes[size]}`}
      >
        <Minus className="w-[1em] h-[1em]" />
        flat
      </span>
    );
  }
  const up = value > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizes[size]} ${
        up
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
          : "bg-rose-500/15 text-rose-300 border-rose-500/25"
      }`}
    >
      <Icon className="w-[1em] h-[1em]" />
      {up ? "+" : ""}
      {Math.abs(value) >= 100 ? Math.round(value) : value.toFixed(1)}
      {points != null ? " pts" : suffix}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Project card                                                        */
/* ------------------------------------------------------------------ */

const ProjectCard = ({ project, spotlight, tv, onLogOutreach }) => {
  const [imgOk, setImgOk] = useState(true);

  const width = tv ? 420 : 330;
  const badge = feedBadge(project.feed);
  const realtime = project.feed?.realtimeUsers;

  return (
    <motion.div
      animate={{
        scale: spotlight ? 1.03 : 1,
        opacity: spotlight || !tv ? 1 : 0.62,
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex-shrink-0 rounded-lg overflow-hidden border bg-neutral-900 text-left"
      style={{
        width,
        borderColor: spotlight ? project.accent : "rgb(38 38 38)",
        boxShadow: spotlight ? `0 0 60px -12px ${project.accent}` : "none",
      }}
    >
      {/* Cover — the whole site, not a crop of it. object-contain letterboxes
          rather than slicing the header off a screenshot. */}
      <div
        className="relative overflow-hidden border-b border-neutral-800"
        style={{
          height: tv ? 200 : 160,
          background: `linear-gradient(135deg, ${project.accent}22, rgb(10 10 10) 70%)`,
        }}
      >
        {imgOk ? (
          <img
            src={project.image}
            alt=""
            className="w-full h-full object-contain object-center"
            onError={() => setImgOk(false)}
          />
        ) : null}
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Visit ${project.name}`}
            className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-neutral-700 bg-black/60 text-neutral-300 backdrop-blur-sm hover:text-white hover:border-neutral-500 hover:bg-black/80 transition-colors"
          >
            Visit <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <span
          className={`absolute top-2 right-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-sm ${badge.tone}`}
          title={project.feed?.error || undefined}
        >
          <badge.Icon className="w-3 h-3" />
          {badge.label}
        </span>
      </div>

      {/* Title */}
      <div className="px-4 pt-3.5">
        <h3 className="text-lg font-bold text-white leading-tight">{project.name}</h3>
        <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{project.summary}</p>
      </div>

      {/* Traffic */}
      <div className="px-4 pt-3">
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1 flex items-center gap-2">
              Visits
              {realtime > 0 && (
                <span
                  className="flex items-center gap-1 text-emerald-400 normal-case tracking-normal"
                  title="Active users in the last 30 minutes"
                >
                  <Radio className="w-3 h-3" />
                  {realtime} now
                </span>
              )}
            </p>
            <span className="text-4xl font-bold text-white tabular-nums leading-none">
              {project.visits.now.toLocaleString()}
            </span>
          </div>
          <VarianceChip
            pct={project.visits.pct}
            isNew={project.visits.isNew}
            size={tv ? "lg" : "md"}
          />
        </div>
        <Sparkline values={project.spark} color={project.accent} height={tv ? 48 : 38} />
      </div>

      {/* Conversion + outreach */}
      <div className="grid grid-cols-2 divide-x divide-neutral-800 border-t border-neutral-800 mt-2">
        <div className="p-3.5">
          <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">Conversion</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-white tabular-nums">
              {project.conversionRate.now.toFixed(1)}
            </span>
            <span className="text-sm text-neutral-500">%</span>
            <span className="text-xs text-neutral-600 ml-1">
              {project.conversions.now} conv
            </span>
          </div>
          <div className="mt-2">
            <VarianceChip points={project.conversionRate.points} size="sm" />
          </div>
        </div>
        <div className="p-3.5">
          <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">Outreach</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-white tabular-nums">
              {project.outreach.now}
            </span>
            <span className="text-sm text-neutral-500">posts</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <VarianceChip pct={project.outreach.pct} isNew={project.outreach.isNew} size="sm" />
            <button
              onClick={() => onLogOutreach(project)}
              className="ml-auto p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
              title={`Log outreach for ${project.name}`}
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Goal */}
      {project.goalPct != null && (
        <div className="px-4 py-3 border-t border-neutral-800">
          <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
            <span>Goal pace</span>
            <span className="tabular-nums">{Math.round(project.goalPct)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: project.accent }}
              initial={{ width: 0 }}
              animate={{ width: `${project.goalPct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {!project.reporting && (
        <div className="px-4 pb-3.5">
          <p className="text-[10px] text-neutral-600 leading-relaxed">
            {project.feed?.status === "no_access" ? (
              <>
                GA4 property{" "}
                <code className="text-amber-400/80">{project.feed.propertyId}</code> isn't shared
                with this dashboard yet — grant the service account Viewer access in GA Admin →
                Property Access Management.
              </>
            ) : project.feed?.status === "error" ? (
              <>GA couldn't be read for this site: {project.feed.error}</>
            ) : (
              <>
                No GA4 property mapped — add one in{" "}
                <code className="text-neutral-500">functions/index.js</code>, or call{" "}
                <code className="text-neutral-500">logVisit("{project.site}")</code> from this app.
              </>
            )}
          </p>
        </div>
      )}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Outreach logging sheet                                              */
/* ------------------------------------------------------------------ */

const OutreachSheet = ({ project, onClose, onLogged }) => {
  const [saving, setSaving] = useState(null);

  const submit = async (channel) => {
    setSaving(channel);
    const id = await logOutreach(project.site, channel);
    setSaving(null);
    if (id) {
      onLogged();
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-left"
      >
        <p className="text-sm text-neutral-500 uppercase tracking-wider mb-1">Log outreach</p>
        <h3 className="text-2xl font-bold text-white mb-5">{project.name}</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {OUTREACH_CHANNELS.map((channel) => (
            <button
              key={channel}
              disabled={saving !== null}
              onClick={() => submit(channel)}
              className="px-4 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white text-base transition-colors"
            >
              {saving === channel ? "Saving…" : channel}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Board                                                               */
/* ------------------------------------------------------------------ */

const MarketingBoard = ({ onLogout, onToggleView, onOpenTasks }) => {
  // Demo mode is for judging the layout on the TV before real feeds exist.
  // It is always badged, and it never touches Firestore.
  const [demo, setDemo] = useState(false);
  const {
    loading,
    errors,
    lastUpdated,
    refresh,
    buildStats,
    gaError,
    needsAccess,
    serviceAccount,
  } = useMarketingData(demo);
  const [periodKey, setPeriodKey] = useState("week");
  const [tv, setTv] = useState(false);
  const [spotlight, setSpotlight] = useState(0);
  const [clock, setClock] = useState(new Date());
  const [outreachFor, setOutreachFor] = useState(null);

  const stats = useMemo(() => buildStats(periodKey), [buildStats, periodKey]);
  const { projects } = stats;

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  // TV mode moves the spotlight on its own so the room always has something moving.
  useEffect(() => {
    if (!tv) return undefined;
    const id = setInterval(
      () => setSpotlight((i) => (i + 1) % projects.length),
      SPOTLIGHT_MS
    );
    return () => clearInterval(id);
  }, [tv, projects.length]);

  // Cards wrap now, so coming out of TV mode just resets the spotlight.
  useEffect(() => {
    if (!tv) setSpotlight(0);
  }, [tv]);

  const toggleTv = useCallback(async () => {
    const next = !tv;
    setTv(next);
    try {
      if (next && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (!next && document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen can be refused (permissions, iframes) — the bigger layout
      // is the point, so carry on without it.
    }
  }, [tv]);

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setTv(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div
      className="min-h-screen bg-black text-left"
      style={tv ? { zoom: 1.25 } : undefined}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/85 backdrop-blur border-b border-neutral-900">
        <div className="mx-auto max-w-[1800px] px-8 py-4 flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              Marketing Control
              {demo && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-md bg-amber-400 text-black">
                  Demo data
                </span>
              )}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {clock.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}{" "}
              ·{" "}
              {clock.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
              {lastUpdated && (
                <>
                  {" "}
                  · updated{" "}
                  {lastUpdated.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </>
              )}
            </p>
          </div>

          {/* Period switch */}
          <div className="flex gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
            {Object.values(PERIODS).map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodKey(p.key)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                  periodKey === p.key
                    ? "bg-white text-black font-medium"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setDemo((d) => !d)}
              className={`p-2 rounded-lg transition-colors ${
                demo
                  ? "bg-amber-400 text-black"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
              title={demo ? "Back to live data" : "Preview with sample data"}
            >
              <FlaskConical className="w-4 h-4" />
            </button>
            <button
              onClick={refresh}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Refresh now"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={toggleTv}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                tv
                  ? "bg-white text-black"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
              }`}
              title="TV mode — fullscreen, bigger type, auto-rotating spotlight"
            >
              {tv ? <Minimize2 className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
              {tv ? "Exit TV" : "TV mode"}
            </button>
            {!tv && (
              <>
                <button
                  onClick={onOpenTasks}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
                >
                  <ListTodo className="w-4 h-4" />
                  Tasks
                </button>
                <button
                  onClick={onToggleView}
                  className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                  title="View public site"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-rose-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1800px] px-8 py-7 space-y-8">
        {demo && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            <strong className="font-semibold">Demo data.</strong> Every number below is
            generated for layout preview only. Turn the flask off to see live traffic.
          </div>
        )}

        {errors.length > 0 && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Couldn't read: {errors.join(", ")}. Check the Firestore rules for those
            collections — everything else on this board is still live.
          </div>
        )}

        {needsAccess.length > 0 && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <strong className="font-semibold">
              {needsAccess.length} GA4 {needsAccess.length === 1 ? "property is" : "properties are"} not
              shared with this dashboard.
            </strong>{" "}
            In GA Admin → Property Access Management, add{" "}
            <code className="text-amber-200">{serviceAccount}</code> as a Viewer on:{" "}
            {needsAccess.map((a) => `${a.site} (${a.propertyId})`).join(", ")}. Each property needs its
            own grant; those cards fall back to first-party visits until then.
          </div>
        )}

        {gaError && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Analytics feed unavailable: {gaError}. Cards are showing first-party visits only.
          </div>
        )}

        {/* The lineup */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-600 mb-3">
            The lineup
          </p>
          <div className="flex flex-wrap gap-4">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.site}
                project={project}
                spotlight={tv && i === spotlight}
                tv={tv}
                onLogOutreach={setOutreachFor}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {outreachFor && (
          <OutreachSheet
            project={outreachFor}
            onClose={() => setOutreachFor(null)}
            onLogged={refresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketingBoard;
