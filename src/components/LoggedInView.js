import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  LogOut,
  Target,
  TrendingUp,
  Users,
  Activity,
  CheckCircle2,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import inspirationImage from "../inspiration.png";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const LoggedInView = ({
  onLogout,
  onToggleView,
  showPublicView,
  highImpactSummary,
}) => {
  // State for managing items
  const [projectItems, setProjectItems] = useState({
    bidfolder: [],
    planful: [],
    fusion: [],
  });
  const [editingItem, setEditingItem] = useState(null);
  const [addingToProject, setAddingToProject] = useState(null);
  const [newItemText, setNewItemText] = useState("");
  const [editItemText, setEditItemText] = useState("");

  // Revenue per project (persisted in Firestore: collection "projectRevenue")
  const [revenue, setRevenue] = useState({
    bidfolder: 0,
    planful: 0,
    fusion: 0,
  });
  const [editingRevenue, setEditingRevenue] = useState(null);
  const [revenueDraft, setRevenueDraft] = useState("");

  // Load items + revenue from Firestore on mount
  useEffect(() => {
    loadItemsFromFirestore();
    loadRevenueFromFirestore();
  }, []);

  const loadItemsFromFirestore = async () => {
    try {
      const itemsQuery = query(
        collection(db, "projectItems"),
        orderBy("createdAt", "asc")
      );
      const querySnapshot = await getDocs(itemsQuery);
      const items = { bidfolder: [], planful: [], fusion: [] };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (items[data.projectId]) {
          items[data.projectId].push({ id: doc.id, ...data });
        }
      });

      setProjectItems(items);
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const loadRevenueFromFirestore = async () => {
    try {
      const snapshot = await getDocs(collection(db, "projectRevenue"));
      const next = { bidfolder: 0, planful: 0, fusion: 0 };
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (docSnap.id in next) {
          next[docSnap.id] = Number(data.amount) || 0;
        }
      });
      setRevenue(next);
    } catch (error) {
      console.error("Error loading revenue:", error);
    }
  };

  const startEditingRevenue = (projectId) => {
    setEditingRevenue(projectId);
    setRevenueDraft(String(revenue[projectId] ?? 0));
  };

  const cancelEditingRevenue = () => {
    setEditingRevenue(null);
    setRevenueDraft("");
  };

  const handleSaveRevenue = async (projectId) => {
    const amount = Math.max(0, Math.round(Number(revenueDraft) || 0));
    try {
      await setDoc(doc(db, "projectRevenue", projectId), {
        amount,
        updatedAt: new Date().toISOString(),
      });
      setRevenue((prev) => ({ ...prev, [projectId]: amount }));
      setEditingRevenue(null);
      setRevenueDraft("");
    } catch (error) {
      console.error("Error saving revenue:", error);
    }
  };

  const handleAddItem = async (projectId) => {
    if (!newItemText.trim()) return;

    try {
      const docRef = await addDoc(collection(db, "projectItems"), {
        projectId,
        text: newItemText.trim(),
        createdAt: new Date().toISOString(),
      });

      setProjectItems((prev) => ({
        ...prev,
        [projectId]: [
          ...prev[projectId],
          { id: docRef.id, projectId, text: newItemText.trim() },
        ],
      }));

      setNewItemText("");
      setAddingToProject(null);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleEditItem = async (itemId, projectId) => {
    if (!editItemText.trim()) return;

    try {
      const itemRef = doc(db, "projectItems", itemId);
      await updateDoc(itemRef, {
        text: editItemText.trim(),
        updatedAt: new Date().toISOString(),
      });

      setProjectItems((prev) => ({
        ...prev,
        [projectId]: prev[projectId].map((item) =>
          item.id === itemId ? { ...item, text: editItemText.trim() } : item
        ),
      }));

      setEditingItem(null);
      setEditItemText("");
    } catch (error) {
      console.error("Error editing item:", error);
    }
  };

  const handleDeleteItem = async (itemId, projectId) => {
    try {
      await deleteDoc(doc(db, "projectItems", itemId));

      setProjectItems((prev) => ({
        ...prev,
        [projectId]: prev[projectId].filter((item) => item.id !== itemId),
      }));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const startEditing = (item, projectId) => {
    setEditingItem({ id: item.id, projectId });
    setEditItemText(item.text);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditItemText("");
  };

  const startAdding = (projectId) => {
    setAddingToProject(projectId);
    setNewItemText("");
  };

  const cancelAdding = () => {
    setAddingToProject(null);
    setNewItemText("");
  };

  // High-impact summary can come from Linear / API later.
  const totalThisWeek = highImpactSummary?.totalThisWeek ?? 0;
  const weeklyTarget = highImpactSummary?.weeklyTarget ?? 10;

  const progress =
    weeklyTarget > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((totalThisWeek / weeklyTarget) * 100))
        )
      : 0;

  const byProject = highImpactSummary?.byProject ?? {
    bidfolder: 0,
    planful: 0,
    fusion: 0,
  };

  // Best guess at your high-impact work per project
  const projectConfigs = [
    {
      id: "bidfolder",
      name: "Bidfolder",
      icon: TrendingUp,
      color: "text-sky-300",
      bg: "bg-sky-500/10",
      gradient: "from-sky-500 to-cyan-400",
      glow: "shadow-sky-500/20",
      ring: "ring-sky-500/30",
      description: "Get in front of more bid teams and stay top-of-mind.",
    },
    {
      id: "planful",
      name: "Planful",
      icon: Target,
      color: "text-violet-300",
      bg: "bg-violet-500/10",
      gradient: "from-violet-500 to-fuchsia-400",
      glow: "shadow-violet-500/20",
      ring: "ring-violet-500/30",
      description: "Make it stable and delightful for real users.",
    },
    {
      id: "fusion",
      name: "Fusion Project",
      icon: Users,
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
      gradient: "from-emerald-500 to-teal-400",
      glow: "shadow-emerald-500/20",
      ring: "ring-emerald-500/30",
      description:
        "Ship the pieces that make weekly project reviews effortless.",
    },
  ];

  const totalRevenue = projectConfigs.reduce(
    (sum, p) => sum + (revenue[p.id] || 0),
    0
  );
  const topProject = projectConfigs.reduce(
    (best, p) => ((revenue[p.id] || 0) > (revenue[best.id] || 0) ? p : best),
    projectConfigs[0]
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[35rem] h-[35rem] bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header with controls */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/[0.03] border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </span>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Dashboard
            </h1>
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

      {/* Main content */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* Revenue overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-end justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30">
                <DollarSign className="w-6 h-6 text-white" />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Revenue by Project
                </h2>
                <p className="text-sm text-gray-400">
                  Total earned across every project you're building.
                </p>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs uppercase tracking-wider text-gray-500">
                Total Revenue
              </span>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                {currency.format(totalRevenue)}
              </span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {projectConfigs.map((project) => {
              const Icon = project.icon;
              const amount = revenue[project.id] || 0;
              const share =
                totalRevenue > 0
                  ? Math.round((amount / totalRevenue) * 100)
                  : 0;
              const isEditing = editingRevenue === project.id;
              const isTop = project.id === topProject.id && totalRevenue > 0;

              return (
                <div
                  key={project.id}
                  className={`group relative rounded-2xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:-translate-y-0.5 hover:shadow-xl ${project.glow}`}
                >
                  {/* Accent top bar */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${project.gradient}`}
                  />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${project.bg} ring-1 ${project.ring}`}
                      >
                        <Icon className={`w-5 h-5 ${project.color}`} />
                      </span>
                      <div>
                        <p className="font-semibold text-white leading-tight">
                          {project.name}
                        </p>
                        {isTop && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300">
                            <ArrowUpRight className="w-3 h-3" /> Top earner
                          </span>
                        )}
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => startEditingRevenue(project.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit revenue"
                      >
                        <Edit2 className="w-4 h-4 text-gray-300" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div>
                      <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 px-3 py-2 focus-within:border-emerald-400/60">
                        <span className="text-gray-400 text-lg">$</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={revenueDraft}
                          onChange={(e) => setRevenueDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleSaveRevenue(project.id);
                            if (e.key === "Escape") cancelEditingRevenue();
                          }}
                          className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleSaveRevenue(project.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={cancelEditingRevenue}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-sm transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-4xl font-bold tracking-tight text-white">
                        {currency.format(amount)}
                      </p>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>Share of total</span>
                          <span>{share}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${project.gradient} transition-all duration-500`}
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* High-impact metric + definition + inspiration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]"
        >
          {/* High-impact summary */}
          <div className="rounded-2xl p-6 md:p-8 bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-emerald-500/15 ring-1 ring-emerald-500/30 p-3 rounded-xl">
                  <Activity className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Weekly High-Impact Work
                  </h2>
                  <p className="text-sm text-gray-400">
                    Moves that actually push Bidfolder, Planful, and Fusion
                    toward your goals.
                  </p>
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs uppercase tracking-wider text-gray-500">
                  This Week
                </span>
                <span className="text-3xl font-semibold text-white">
                  {totalThisWeek}
                  <span className="text-gray-500 text-lg">
                    {" "}
                    / {weeklyTarget}
                  </span>
                </span>
              </div>
            </div>

            {/* Mobile metric */}
            <div className="md:hidden flex flex-col gap-1 mb-4">
              <span className="text-xs uppercase tracking-wider text-gray-500">
                This Week
              </span>
              <span className="text-2xl font-semibold text-white">
                {totalThisWeek}{" "}
                <span className="text-gray-500 text-base">
                  / {weeklyTarget}
                </span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                <span>0</span>
                <span>{weeklyTarget} moves</span>
              </div>
            </div>

            {/* Per-project mini summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {projectConfigs.map((project) => {
                const Icon = project.icon;
                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${project.bg}`}
                      >
                        <Icon className={`w-4 h-4 ${project.color}`} />
                      </span>
                      <span className="text-gray-200 text-sm">
                        {project.name}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {byProject?.[project.id] ?? 0}
                      <span className="text-xs text-gray-500 ml-1">moves</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspiration / definition card */}
          <div className="rounded-2xl p-6 md:p-8 bg-white/[0.04] border border-white/10 backdrop-blur-sm flex flex-col gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="bg-yellow-500/15 ring-1 ring-yellow-500/30 p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  What Counts as High-Impact?
                </h2>
                <p className="text-sm text-gray-400">
                  Simple rule: it either ships something real, gets real
                  feedback, or builds a real relationship.
                </p>
              </div>
            </div>

            <ul className="text-sm text-gray-300 space-y-2 text-left">
              <li>• Ships something users or buyers can actually see.</li>
              <li>• Creates or deepens a relationship with a key person.</li>
              <li>• Removes a painful blocker or bug for real users.</li>
              <li>• Gives you honest feedback from the right people.</li>
            </ul>

            <div className="mt-2 flex-1 flex items-center justify-center">
              <div className="bg-black/30 rounded-xl p-3 border border-white/10 w-full">
                <img
                  src={inspirationImage}
                  alt="Design Inspiration"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Per-project: concrete high-impact items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {projectConfigs.map((project) => {
            const Icon = project.icon;
            const items = projectItems[project.id] || [];
            return (
              <div
                key={project.id}
                className="rounded-2xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-sm flex flex-col text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${project.bg} ring-1 ${project.ring} p-2.5 rounded-xl`}>
                    <Icon className={`w-5 h-5 ${project.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {project.name}
                    </h3>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      High-impact this week
                    </p>
                  </div>
                  <button
                    onClick={() => startAdding(project.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="Add item"
                  >
                    <Plus className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  {project.description}
                </p>

                {/* Add new item form */}
                {addingToProject === project.id && (
                  <div className="mb-3 p-3 bg-black/30 rounded-lg border border-white/10">
                    <textarea
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Enter new item..."
                      className="w-full bg-black/40 text-gray-200 text-sm rounded p-2 mb-2 border border-white/10 focus:outline-none focus:border-emerald-500"
                      rows="2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddItem(project.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={cancelAdding}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-sm rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Items list */}
                <ul className="space-y-2 text-sm text-gray-300 flex-1">
                  {items.map((item) => (
                    <li key={item.id} className="group">
                      {editingItem?.id === item.id ? (
                        <div className="p-2 bg-black/30 rounded-lg border border-white/10">
                          <textarea
                            value={editItemText}
                            onChange={(e) => setEditItemText(e.target.value)}
                            className="w-full bg-black/40 text-gray-200 text-sm rounded p-2 mb-2 border border-white/10 focus:outline-none focus:border-emerald-500"
                            rows="2"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEditItem(item.id, project.id)
                              }
                              className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded transition-colors"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-white text-xs rounded transition-colors"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="flex-1">{item.text}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditing(item, project.id)}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3 text-sky-300" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteItem(item.id, project.id)
                              }
                              className="p-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                  {items.length === 0 && addingToProject !== project.id && (
                    <li className="text-gray-500 italic text-center py-4">
                      No items yet. Click + to add one.
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
};

export default LoggedInView;
