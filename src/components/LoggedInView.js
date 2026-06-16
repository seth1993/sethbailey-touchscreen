import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  LogOut,
  Zap,
  Flame,
  Coffee,
  Trophy,
  Send,
  MessageSquare,
  Megaphone,
  HelpCircle,
  Sparkles,
  Plus,
  X,
  ArrowRight,
  Trash2,
  Users,
} from "lucide-react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

/* ------------------------------------------------------------------ */
/* Game config                                                         */
/* ------------------------------------------------------------------ */

// Moves you can make, straight from the Bidfolder GTM playbook.
const ACTION_TYPES = [
  {
    key: "community_post",
    label: "Community Post",
    blurb: "Share a takeoff tip or answer in a group",
    xp: 10,
    icon: Megaphone,
    accent: "blue",
  },
  {
    key: "helpful_answer",
    label: "Answer a Question",
    blurb: "Be useful in a thread, no pitch",
    xp: 8,
    icon: HelpCircle,
    accent: "violet",
  },
  {
    key: "dm",
    label: "DM an Engager",
    blurb: "Message someone who engaged",
    xp: 12,
    icon: Send,
    accent: "sky",
  },
  {
    key: "problem_interview",
    label: "Invite to Interview",
    blurb: "“Can I buy you 15 min + a coffee?”",
    xp: 25,
    icon: Coffee,
    accent: "amber",
  },
];

// The funnel. Advancing a contact = a conversion.
const STAGES = [
  { key: "logged", label: "Outreach", icon: Send, accent: "sky" },
  { key: "engaged", label: "Engaged", icon: MessageSquare, accent: "violet" },
  { key: "interview", label: "Interview", icon: Coffee, accent: "amber" },
  { key: "customer", label: "Customer", icon: Trophy, accent: "emerald" },
];

const CHANNELS = [
  "Facebook — Construction Estimating",
  "Facebook — trade group (concrete/electrical/framing)",
  "Reddit — r/Construction",
  "Reddit — r/estimators",
  "Reddit — r/Contractor",
  "The Blue Book",
  "AGC / ABC chapter",
  "Plan room",
  "LinkedIn",
  "Email",
  "Other",
];

const INTERVIEW_TARGET = 30;

// Bonus XP for moving a contact deeper into the funnel.
const STAGE_BONUS = { logged: 0, engaged: 10, interview: 20, customer: 60 };

// Explicit class maps so Tailwind keeps them.
const ACCENT = {
  blue: {
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/30",
    bar: "from-blue-500 to-cyan-400",
    solid: "bg-blue-500 hover:bg-blue-400",
  },
  violet: {
    text: "text-violet-300",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/30",
    bar: "from-violet-500 to-fuchsia-400",
    solid: "bg-violet-500 hover:bg-violet-400",
  },
  sky: {
    text: "text-sky-300",
    bg: "bg-sky-500/10",
    ring: "ring-sky-500/30",
    bar: "from-sky-500 to-cyan-400",
    solid: "bg-sky-500 hover:bg-sky-400",
  },
  amber: {
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/30",
    bar: "from-amber-500 to-orange-400",
    solid: "bg-amber-500 hover:bg-amber-400",
  },
  emerald: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/30",
    bar: "from-emerald-500 to-teal-400",
    solid: "bg-emerald-500 hover:bg-emerald-400",
  },
};

/* ------------------------------------------------------------------ */
/* XP / level helpers                                                  */
/* ------------------------------------------------------------------ */

const xpForLevelStart = (level) => 25 * level * (level - 1); // 0, 50, 150, 300, 500...

const levelFromXp = (xp) => {
  let lvl = 1;
  while (xpForLevelStart(lvl + 1) <= xp) lvl++;
  return lvl;
};

const activityXp = (a) => {
  const base = ACTION_TYPES.find((t) => t.key === a.type)?.xp ?? 5;
  return base + (STAGE_BONUS[a.stage] ?? 0);
};

const stageIndex = (key) => STAGES.findIndex((s) => s.key === key);

const dayKey = (iso) => (iso ? iso.slice(0, 10) : "");

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const LoggedInView = ({ onLogout, onToggleView, showPublicView }) => {
  const [activities, setActivities] = useState([]);
  const [composerType, setComposerType] = useState(null); // an ACTION_TYPES key
  const [form, setForm] = useState({ contact: "", channel: CHANNELS[0], notes: "" });
  const [toasts, setToasts] = useState([]);
  const [toastSeq, setToastSeq] = useState(0);

  // Live subscription — real data, trickles in as it changes.
  useEffect(() => {
    const q = query(collection(db, "growthActivities"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = [];
        snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
        setActivities(rows);
      },
      (err) => console.error("growthActivities subscription error:", err)
    );
    return () => unsub();
  }, []);

  const pushToast = (text, accent = "blue", icon = Sparkles) => {
    const id = `t-${toastSeq}`;
    setToastSeq((n) => n + 1);
    setToasts((prev) => [...prev, { id, text, accent, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  /* ---- derived game state ---- */
  const stats = useMemo(() => {
    const totalXp = activities.reduce((sum, a) => sum + activityXp(a), 0);
    const level = levelFromXp(totalXp);
    const start = xpForLevelStart(level);
    const next = xpForLevelStart(level + 1);
    const levelProgress =
      next > start ? Math.round(((totalXp - start) / (next - start)) * 100) : 0;

    const interviews = activities.filter(
      (a) => a.stage === "interview" || a.stage === "customer"
    ).length;
    const customers = activities.filter((a) => a.stage === "customer").length;

    const byStage = STAGES.reduce((acc, s) => {
      acc[s.key] = activities.filter((a) => a.stage === s.key);
      return acc;
    }, {});

    // Daily streak: consecutive days (ending today) with at least one move.
    const days = new Set(activities.map((a) => dayKey(a.createdAt)).filter(Boolean));
    let streak = 0;
    const cursor = new Date();
    // Allow the streak to count even if nothing logged *yet* today.
    if (!days.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      totalXp,
      level,
      levelProgress,
      xpIntoLevel: totalXp - start,
      xpForLevel: next - start,
      interviews,
      customers,
      byStage,
      streak,
      moves: activities.length,
    };
  }, [activities]);

  /* ---- actions ---- */
  const openComposer = (type) => {
    setComposerType(type);
    setForm({ contact: "", channel: CHANNELS[0], notes: "" });
  };

  const logMove = async () => {
    const type = composerType;
    if (!type) return;
    const def = ACTION_TYPES.find((t) => t.key === type);
    const payload = {
      type,
      contact: form.contact.trim() || "Anonymous estimator",
      channel: form.channel,
      notes: form.notes.trim(),
      stage: "logged",
      project: "bidfolder",
      createdAt: new Date().toISOString(),
    };
    setComposerType(null);
    try {
      await addDoc(collection(db, "growthActivities"), payload);
      pushToast(`+${def.xp} XP · ${def.label}`, def.accent, def.icon);
    } catch (e) {
      console.error("Error logging move:", e);
      pushToast("Couldn't save that move", "amber", X);
    }
  };

  const advance = async (activity) => {
    const idx = stageIndex(activity.stage);
    if (idx >= STAGES.length - 1) return;
    const nextStage = STAGES[idx + 1];
    try {
      await updateDoc(doc(db, "growthActivities", activity.id), {
        stage: nextStage.key,
        updatedAt: new Date().toISOString(),
      });
      if (nextStage.key === "interview") {
        pushToast(`☕ Interview booked with ${activity.contact}!`, "amber", Coffee);
      } else if (nextStage.key === "customer") {
        pushToast(`🏆 ${activity.contact} converted to a customer!`, "emerald", Trophy);
      } else {
        pushToast(`${activity.contact} → ${nextStage.label}`, nextStage.accent, ArrowRight);
      }
    } catch (e) {
      console.error("Error advancing:", e);
    }
  };

  const removeActivity = async (id) => {
    try {
      await deleteDoc(doc(db, "growthActivities", id));
    } catch (e) {
      console.error("Error deleting:", e);
    }
  };

  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[35rem] h-[35rem] bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Toast layer */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-[min(90vw,22rem)]">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = t.icon || Sparkles;
            const a = ACCENT[t.accent] || ACCENT.blue;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-xl`}
              >
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${a.bg} ring-1 ${a.ring}`}>
                  <Icon className={`w-4 h-4 ${a.text}`} />
                </span>
                <span className="text-sm font-medium text-white">{t.text}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/[0.03] border-b border-white/10">
        <div className="mx-auto max-w-[1500px] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
              <Zap className="w-5 h-5 text-white" />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-semibold">Growth Quest</h1>
              <p className="text-xs text-gray-400">Bidfolder · estimator outreach</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onToggleView}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPublicView ? "Back to Dashboard" : "View Public Page"}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 text-sm text-white transition-colors shadow-lg shadow-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1500px] mx-auto px-6 py-8 space-y-8">
        {/* Stat bar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Level / XP */}
          <div className="rounded-2xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-500/30">
                <Trophy className="w-5 h-5 text-violet-300" />
              </span>
              <PopNumber value={stats.level} className="text-3xl font-bold" prefix="Lv " />
            </div>
            <p className="mt-3 text-xs text-gray-400">
              {stats.xpIntoLevel} / {stats.xpForLevel} XP to next level
            </p>
            <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                animate={{ width: `${stats.levelProgress}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          {/* Streak */}
          <StatTile
            icon={Flame}
            accent="amber"
            value={stats.streak}
            label={stats.streak === 1 ? "day streak" : "day streak"}
            sub={stats.streak > 0 ? "Keep it alive — log a move today" : "Log a move to start a streak"}
          />

          {/* Interviews to target */}
          <div className="rounded-2xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30">
                <Coffee className="w-5 h-5 text-amber-300" />
              </span>
              <div className="text-right">
                <PopNumber value={stats.interviews} className="text-3xl font-bold" />
                <span className="text-gray-500 text-lg"> / {INTERVIEW_TARGET}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">problem interviews</p>
            <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                animate={{
                  width: `${Math.min(100, (stats.interviews / INTERVIEW_TARGET) * 100)}%`,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          {/* Customers */}
          <StatTile
            icon={Trophy}
            accent="emerald"
            value={stats.customers}
            label={stats.customers === 1 ? "customer won" : "customers won"}
            sub={`${stats.moves} total moves logged`}
          />
        </motion.section>

        {/* Make a move */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-300" />
            <h2 className="text-lg font-semibold">Make a move</h2>
            <span className="text-sm text-gray-500">— every action earns XP and feeds the pipeline</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ACTION_TYPES.map((t) => {
              const Icon = t.icon;
              const a = ACCENT[t.accent];
              return (
                <button
                  key={t.key}
                  onClick={() => openComposer(t.key)}
                  className="group text-left rounded-2xl p-5 bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} ring-1 ${a.ring}`}>
                      <Icon className={`w-5 h-5 ${a.text}`} />
                    </span>
                    <span className={`text-xs font-semibold ${a.text}`}>+{t.xp} XP</span>
                  </div>
                  <p className="mt-3 font-semibold text-white">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3" /> Log it
                  </span>
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Pipeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-sky-300" />
            <h2 className="text-lg font-semibold">Pipeline</h2>
            <span className="text-sm text-gray-500">— advance a contact to watch conversions trickle in</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const a = ACCENT[stage.accent];
              const items = stats.byStage[stage.key] || [];
              return (
                <div
                  key={stage.key}
                  className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex flex-col min-h-[12rem]"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${a.bg}`}>
                        <Icon className={`w-4 h-4 ${a.text}`} />
                      </span>
                      <span className="text-sm font-semibold text-white">{stage.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">{items.length}</span>
                  </div>

                  <div className="p-3 space-y-2 flex-1">
                    <AnimatePresence initial={false}>
                      {items.map((item) => {
                        const def = ACTION_TYPES.find((t) => t.key === item.type);
                        const canAdvance = stageIndex(item.stage) < STAGES.length - 1;
                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="group rounded-xl bg-white/[0.04] border border-white/10 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {item.contact}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                  {def?.label} · {item.channel}
                                </p>
                              </div>
                              <button
                                onClick={() => removeActivity(item.id)}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                            {item.notes && (
                              <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">{item.notes}</p>
                            )}
                            {canAdvance && (
                              <button
                                onClick={() => advance(item)}
                                className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 py-1.5 text-xs font-medium text-gray-200 transition-colors"
                              >
                                Move to {STAGES[stageIndex(item.stage) + 1].label}
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {items.length === 0 && (
                      <p className="text-xs text-gray-600 italic text-center py-6">
                        Nothing here yet
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      </main>

      {/* Composer modal */}
      <AnimatePresence>
        {composerType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setComposerType(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#13141c] border border-white/10 p-6 shadow-2xl"
            >
              {(() => {
                const def = ACTION_TYPES.find((t) => t.key === composerType);
                const Icon = def.icon;
                const a = ACCENT[def.accent];
                return (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} ring-1 ${a.ring}`}>
                          <Icon className={`w-5 h-5 ${a.text}`} />
                        </span>
                        <div>
                          <h3 className="font-semibold text-white">{def.label}</h3>
                          <p className="text-xs text-gray-400">{def.blurb} · +{def.xp} XP</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setComposerType(null)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                      >
                        <X className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>

                    <label className="block text-xs text-gray-400 mb-1">Who / handle</label>
                    <input
                      value={form.contact}
                      onChange={(e) => setForm({ ...form, contact: e.target.value })}
                      placeholder="e.g. @concrete_carl, Jane (estimator)"
                      autoFocus
                      className="w-full mb-4 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-400/60"
                    />

                    <label className="block text-xs text-gray-400 mb-1">Channel</label>
                    <select
                      value={form.channel}
                      onChange={(e) => setForm({ ...form, channel: e.target.value })}
                      className="w-full mb-4 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400/60"
                    >
                      {CHANNELS.map((c) => (
                        <option key={c} value={c} className="bg-[#13141c]">
                          {c}
                        </option>
                      ))}
                    </select>

                    <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                      placeholder="What you shared / asked"
                      className="w-full mb-5 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-400/60"
                    />

                    <button
                      onClick={logMove}
                      className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors ${a.solid}`}
                    >
                      Log it · +{def.xp} XP
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

function StatTile({ icon: Icon, accent, value, label, sub }) {
  const a = ACCENT[accent] || ACCENT.blue;
  return (
    <div className="rounded-2xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${a.bg} ring-1 ${a.ring}`}>
          <Icon className={`w-5 h-5 ${a.text}`} />
        </span>
        <PopNumber value={value} className="text-3xl font-bold" />
      </div>
      <p className="mt-3 text-xs text-gray-300">{label}</p>
      {sub && <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// Number that pops when it changes — cheap "count" juice.
function PopNumber({ value, className = "", prefix = "" }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 12, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -12, opacity: 0, position: "absolute" }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          className="inline-block tabular-nums"
        >
          {prefix}
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default LoggedInView;
