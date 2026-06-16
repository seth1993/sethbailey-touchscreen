import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  LogOut,
  Zap,
  Flame,
  Coffee,
  Send,
  Megaphone,
  HelpCircle,
  Sparkles,
  X,
  Trash2,
  Check,
  CheckCircle2,
  RotateCcw,
  Clock,
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

// Suggested daily engagements, from the Bidfolder GTM playbook.
// needsContact quests ask who, and schedule a "circle back" in followUpDays.
const QUESTS = [
  {
    key: "tip",
    label: "Share a takeoff tip",
    sub: "Post value in an estimator group",
    points: 10,
    icon: Megaphone,
    accent: "blue",
    needsContact: false,
    followUpDays: null,
  },
  {
    key: "answer",
    label: "Answer a question",
    sub: "Be useful in a thread, no pitch",
    points: 8,
    icon: HelpCircle,
    accent: "violet",
    needsContact: false,
    followUpDays: null,
  },
  {
    key: "dm",
    label: "DM someone who engaged",
    sub: "Start a real conversation",
    points: 12,
    icon: Send,
    accent: "sky",
    needsContact: true,
    followUpDays: 3,
  },
  {
    key: "interview",
    label: "Invite to a 15-min interview",
    sub: "“Can I buy you a coffee?”",
    points: 25,
    icon: Coffee,
    accent: "amber",
    needsContact: true,
    followUpDays: 2,
  },
  {
    key: "thanks",
    label: "Thank a recent helper",
    sub: "Strengthen a relationship",
    points: 6,
    icon: Sparkles,
    accent: "emerald",
    needsContact: true,
    followUpDays: 7,
  },
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

const WEEKLY_GOAL = 15;
const FOLLOWUP_POINTS = 8;
const MAX_TOUCHES = 3; // after this many touches, the relationship is "warm"

const ACCENT = {
  blue: { text: "text-blue-300", bg: "bg-blue-500/10", ring: "ring-blue-500/30", bar: "from-blue-500 to-cyan-400", solid: "bg-blue-500 hover:bg-blue-400" },
  violet: { text: "text-violet-300", bg: "bg-violet-500/10", ring: "ring-violet-500/30", bar: "from-violet-500 to-fuchsia-400", solid: "bg-violet-500 hover:bg-violet-400" },
  sky: { text: "text-sky-300", bg: "bg-sky-500/10", ring: "ring-sky-500/30", bar: "from-sky-500 to-cyan-400", solid: "bg-sky-500 hover:bg-sky-400" },
  amber: { text: "text-amber-300", bg: "bg-amber-500/10", ring: "ring-amber-500/30", bar: "from-amber-500 to-orange-400", solid: "bg-amber-500 hover:bg-amber-400" },
  emerald: { text: "text-emerald-300", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30", bar: "from-emerald-500 to-teal-400", solid: "bg-emerald-500 hover:bg-emerald-400" },
};

/* ------------------------------------------------------------------ */
/* Date + XP helpers                                                   */
/* ------------------------------------------------------------------ */

const nowIso = () => new Date().toISOString();
const addDaysIso = (days) => new Date(Date.now() + days * 86400000).toISOString();
const dayKey = (iso) => (iso ? iso.slice(0, 10) : "");
const todayKey = () => new Date().toISOString().slice(0, 10);
const isDue = (iso) => !!iso && Date.parse(iso) <= Date.now();
const daysAgo = (iso) => Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 86400000));

const xpForLevelStart = (level) => 25 * level * (level - 1); // 0, 50, 150, 300...
const levelFromXp = (xp) => {
  let lvl = 1;
  while (xpForLevelStart(lvl + 1) <= xp) lvl++;
  return lvl;
};
const earnedXp = (a) => (a.points || 0) + (a.touches || 0) * FOLLOWUP_POINTS;

const questFor = (key) => QUESTS.find((q) => q.key === key);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const LoggedInView = ({ onLogout, onToggleView, showPublicView }) => {
  const [items, setItems] = useState([]);
  const [composerQuest, setComposerQuest] = useState(null);
  const [form, setForm] = useState({ contact: "", channel: CHANNELS[0], notes: "" });
  const [toasts, setToasts] = useState([]);
  const [toastSeq, setToastSeq] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "growthActivities"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = [];
        snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
        setItems(rows);
      },
      (err) => console.error("growthActivities subscription error:", err)
    );
    return () => unsub();
  }, []);

  const pushToast = (text, accent = "blue", icon = Sparkles) => {
    const id = `t-${toastSeq}`;
    setToastSeq((n) => n + 1);
    setToasts((prev) => [...prev, { id, text, accent, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  };

  /* ---- derived game state ---- */
  const stats = useMemo(() => {
    const totalXp = items.reduce((s, a) => s + earnedXp(a), 0);
    const level = levelFromXp(totalXp);
    const start = xpForLevelStart(level);
    const next = xpForLevelStart(level + 1);
    const levelProgress = next > start ? Math.round(((totalXp - start) / (next - start)) * 100) : 0;

    const weekAgo = Date.now() - 7 * 86400000;
    const weekCount = items.filter((a) => Date.parse(a.createdAt) >= weekAgo).length;

    const dueFollowUps = items
      .filter((a) => a.status === "active" && isDue(a.nextFollowUpAt))
      .sort((a, b) => Date.parse(a.nextFollowUpAt) - Date.parse(b.nextFollowUpAt));
    const scheduledCount = items.filter(
      (a) => a.status === "active" && a.nextFollowUpAt && !isDue(a.nextFollowUpAt)
    ).length;

    // counts done today per quest
    const today = todayKey();
    const todayByQuest = {};
    items.forEach((a) => {
      if (dayKey(a.createdAt) === today) {
        todayByQuest[a.questKey] = (todayByQuest[a.questKey] || 0) + 1;
      }
    });
    const todayTotal = items.filter((a) => dayKey(a.createdAt) === today).length;

    // streak from any-activity days (created or last touched)
    const days = new Set();
    items.forEach((a) => {
      if (a.createdAt) days.add(dayKey(a.createdAt));
      if (a.lastTouchAt) days.add(dayKey(a.lastTouchAt));
    });
    let streak = 0;
    const cursor = new Date();
    if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
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
      weekCount,
      dueFollowUps,
      scheduledCount,
      todayByQuest,
      todayTotal,
      streak,
    };
  }, [items]);

  /* ---- actions ---- */
  const handleQuestClick = (quest) => {
    if (quest.needsContact) {
      setComposerQuest(quest);
      setForm({ contact: "", channel: CHANNELS[0], notes: "" });
    } else {
      logQuest(quest, {});
    }
  };

  const logQuest = async (quest, extra) => {
    setComposerQuest(null);
    const payload = {
      questKey: quest.key,
      label: quest.label,
      points: quest.points,
      contact: (extra.contact || "").trim() || null,
      channel: extra.channel || null,
      notes: (extra.notes || "").trim() || "",
      touches: 0,
      status: "active",
      createdAt: nowIso(),
      lastTouchAt: nowIso(),
      nextFollowUpAt: quest.followUpDays ? addDaysIso(quest.followUpDays) : null,
    };
    try {
      await addDoc(collection(db, "growthActivities"), payload);
      const who = payload.contact ? ` · ${payload.contact}` : "";
      pushToast(`+${quest.points} XP · ${quest.label}${who}`, quest.accent, quest.icon);
      if (quest.followUpDays) {
        setTimeout(
          () => pushToast(`Will resurface in ${quest.followUpDays}d to circle back`, "sky", Clock),
          600
        );
      }
    } catch (e) {
      console.error("Error logging quest:", e);
      pushToast("Couldn't save that — check Firestore rules", "amber", X);
    }
  };

  const circleBack = async (item) => {
    const nextTouches = (item.touches || 0) + 1;
    const warm = nextTouches >= MAX_TOUCHES;
    const q = questFor(item.questKey);
    const days = q?.followUpDays || 4;
    try {
      await updateDoc(doc(db, "growthActivities", item.id), {
        touches: nextTouches,
        lastTouchAt: nowIso(),
        status: warm ? "done" : "active",
        nextFollowUpAt: warm ? null : addDaysIso(days),
      });
      if (warm) {
        pushToast(`🔥 ${item.contact || "Contact"} is warm — relationship built! +${FOLLOWUP_POINTS} XP`, "emerald", Flame);
      } else {
        pushToast(`+${FOLLOWUP_POINTS} XP · circled back with ${item.contact || "them"}`, "sky", RotateCcw);
      }
    } catch (e) {
      console.error("Error circling back:", e);
    }
  };

  const snooze = async (item, days = 3) => {
    try {
      await updateDoc(doc(db, "growthActivities", item.id), { nextFollowUpAt: addDaysIso(days) });
      pushToast(`Snoozed ${days}d`, "violet", Clock);
    } catch (e) {
      console.error("Error snoozing:", e);
    }
  };

  const archive = async (item) => {
    try {
      await updateDoc(doc(db, "growthActivities", item.id), { status: "done", nextFollowUpAt: null });
    } catch (e) {
      console.error("Error archiving:", e);
    }
  };

  const remove = async (id) => {
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
                className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-xl"
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
        <div className="mx-auto max-w-[1400px] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
              <Zap className="w-5 h-5 text-white" />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-semibold">Growth Quest</h1>
              <p className="text-xs text-gray-400">Bidfolder · estimator engagement</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onToggleView} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-100 transition-colors">
              <Eye className="w-4 h-4" />
              {showPublicView ? "Back to Dashboard" : "View Public Page"}
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 text-sm text-white transition-colors shadow-lg shadow-red-500/20">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Stat bar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Level */}
          <div className="rounded-2xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-500/30">
                <Zap className="w-5 h-5 text-violet-300" />
              </span>
              <PopNumber value={stats.level} className="text-3xl font-bold" prefix="Lv " />
            </div>
            <p className="mt-3 text-xs text-gray-400">{stats.xpIntoLevel} / {stats.xpForLevel} XP to next level</p>
            <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" animate={{ width: `${stats.levelProgress}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </div>
          </div>

          {/* Streak */}
          <StatTile icon={Flame} accent="amber" value={stats.streak} label="day streak" sub={stats.streak > 0 ? "Keep it alive — engage today" : "Engage today to start a streak"} />

          {/* This week */}
          <div className="rounded-2xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 ring-1 ring-sky-500/30">
                <CheckCircle2 className="w-5 h-5 text-sky-300" />
              </span>
              <div className="text-right">
                <PopNumber value={stats.weekCount} className="text-3xl font-bold" />
                <span className="text-gray-500 text-lg"> / {WEEKLY_GOAL}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">engagements this week</p>
            <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" animate={{ width: `${Math.min(100, (stats.weekCount / WEEKLY_GOAL) * 100)}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </div>
          </div>

          {/* Follow-ups due */}
          <StatTile icon={RotateCcw} accent={stats.dueFollowUps.length ? "emerald" : "violet"} value={stats.dueFollowUps.length} label="follow-ups due" sub={stats.scheduledCount ? `${stats.scheduledCount} scheduled later` : "Nothing scheduled yet"} />
        </motion.section>

        {/* Today's quests */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-300" />
            <h2 className="text-lg font-semibold">Today’s engagement</h2>
            <span className="text-sm text-gray-500">— check one off to earn XP · {stats.todayTotal} done today</span>
          </div>
          <div className="grid gap-3">
            {QUESTS.map((q) => {
              const Icon = q.icon;
              const a = ACCENT[q.accent];
              const doneToday = stats.todayByQuest[q.key] || 0;
              return (
                <div key={q.key} className="group flex items-center gap-4 rounded-2xl p-4 bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-colors backdrop-blur-sm">
                  <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.bg} ring-1 ${a.ring}`}>
                    <Icon className={`w-5 h-5 ${a.text}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white truncate">{q.label}</p>
                      {doneToday > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                          <Check className="w-3 h-3" /> {doneToday}× today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {q.sub}
                      {q.followUpDays ? ` · circle back in ${q.followUpDays}d` : ""}
                    </p>
                  </div>
                  <span className={`hidden sm:block text-xs font-semibold ${a.text}`}>+{q.points} XP</span>
                  <button
                    onClick={() => handleQuestClick(q)}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${a.solid}`}
                  >
                    <Check className="w-4 h-4" />
                    {q.needsContact ? "Log" : "Done"}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Circle back */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw className="w-5 h-5 text-emerald-300" />
            <h2 className="text-lg font-semibold">Circle back</h2>
            <span className="text-sm text-gray-500">— relationships ready for another touch</span>
          </div>

          <div className="grid gap-3">
            <AnimatePresence initial={false}>
              {stats.dueFollowUps.map((item) => {
                const q = questFor(item.questKey);
                const Icon = q?.icon || RotateCcw;
                const a = ACCENT[q?.accent || "emerald"];
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="flex flex-wrap items-center gap-3 rounded-2xl p-4 bg-white/[0.04] border border-white/10 backdrop-blur-sm"
                  >
                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.bg} ring-1 ${a.ring}`}>
                      <Icon className={`w-5 h-5 ${a.text}`} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">
                        {item.contact || "A contact"}
                        {item.touches > 0 && (
                          <span className="ml-2 text-[11px] text-gray-400">touch {item.touches + 1}/{MAX_TOUCHES}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {item.label}
                        {item.channel ? ` · ${item.channel}` : ""} · {daysAgo(item.lastTouchAt)}d ago
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => circleBack(item)} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 transition-colors">
                        <Check className="w-4 h-4" /> Did it
                        <span className="text-emerald-100/80">+{FOLLOWUP_POINTS}</span>
                      </button>
                      <button onClick={() => snooze(item)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="Snooze 3 days">
                        <Clock className="w-4 h-4 text-gray-300" />
                      </button>
                      <button onClick={() => archive(item)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="Done — stop circling back">
                        <CheckCircle2 className="w-4 h-4 text-gray-300" />
                      </button>
                      <button onClick={() => remove(item.id)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {stats.dueFollowUps.length === 0 && (
              <div className="rounded-2xl p-8 bg-white/[0.02] border border-dashed border-white/10 text-center">
                <p className="text-sm text-gray-400">Nothing to circle back on right now.</p>
                <p className="text-xs text-gray-600 mt-1">
                  DM someone or invite them to an interview above — they’ll resurface here in a few days.
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </main>

      {/* Composer modal (for quests that involve a person) */}
      <AnimatePresence>
        {composerQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setComposerQuest(null)}
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
                const Icon = composerQuest.icon;
                const a = ACCENT[composerQuest.accent];
                return (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} ring-1 ${a.ring}`}>
                          <Icon className={`w-5 h-5 ${a.text}`} />
                        </span>
                        <div>
                          <h3 className="font-semibold text-white">{composerQuest.label}</h3>
                          <p className="text-xs text-gray-400">
                            +{composerQuest.points} XP · circle back in {composerQuest.followUpDays}d
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setComposerQuest(null)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                        <X className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>

                    <label className="block text-xs text-gray-400 mb-1">Who</label>
                    <input
                      value={form.contact}
                      onChange={(e) => setForm({ ...form, contact: e.target.value })}
                      placeholder="e.g. @concrete_carl, Jane (estimator)"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") logQuest(composerQuest, form);
                      }}
                      className="w-full mb-4 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-400/60"
                    />

                    <label className="block text-xs text-gray-400 mb-1">Channel</label>
                    <select
                      value={form.channel}
                      onChange={(e) => setForm({ ...form, channel: e.target.value })}
                      className="w-full mb-4 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400/60"
                    >
                      {CHANNELS.map((c) => (
                        <option key={c} value={c} className="bg-[#13141c]">{c}</option>
                      ))}
                    </select>

                    <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                      placeholder="What you said / asked"
                      className="w-full mb-5 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-400/60"
                    />

                    <button onClick={() => logQuest(composerQuest, form)} className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors ${a.solid}`}>
                      Log it · +{composerQuest.points} XP
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
/* Presentational helpers                                              */
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
