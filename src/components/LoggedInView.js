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
} from "lucide-react";
import Tiles from "./tiles";
import inspirationImage from "../inspiration.png";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

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

  // Load items from Firestore on mount
  useEffect(() => {
    loadItemsFromFirestore();
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
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      description: "Get in front of more bid teams and stay top-of-mind.",
    },
    {
      id: "planful",
      name: "Planful",
      icon: Target,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      description: "Make it stable and delightful for real users.",
    },
    {
      id: "fusion",
      name: "Fusion Project",
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-500/10",
      description: "Ship the pieces that make weekly project reviews effortless.",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header with controls */}
      <div className="bg-neutral-900/80 backdrop-blur border-b border-neutral-700">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl text-white tracking-[0.2em]">
            DASHBOARD
          </h1>
          <div className="flex gap-4">
            <button
              onClick={onToggleView}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPublicView ? "Back to Dashboard" : "View Public Page"}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* High-impact metric + definition + inspiration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]"
        >
          {/* High-impact summary */}
          <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 border border-neutral-800">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-emerald-500/20 p-3 rounded-xl">
                  <Activity className="w-6 h-6 text-emerald-400" />
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
                <span className="text-xs uppercase text-gray-400">
                  This Week
                </span>
                <span className="text-3xl font-semibold text-white">
                  {totalThisWeek}
                  <span className="text-gray-500 text-lg"> / {weeklyTarget}</span>
                </span>
              </div>
            </div>

            {/* Mobile metric */}
            <div className="md:hidden flex flex-col gap-1 mb-4">
              <span className="text-xs uppercase text-gray-400">
                This Week
              </span>
              <span className="text-2xl font-semibold text-white">
                {totalThisWeek}{" "}
                <span className="text-gray-500 text-base">/ {weeklyTarget}</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
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
                    className="flex items-center justify-between bg-neutral-800/60 border border-neutral-700 rounded-xl px-4 py-3"
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
                      <span className="text-xs text-gray-500 ml-1">
                        moves
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspiration / definition card */}
          <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 border border-neutral-800 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="bg-yellow-500/15 p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-yellow-400" />
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
              <div className="bg-neutral-800/60 rounded-xl p-3 border border-neutral-700 w-full">
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
          transition={{ duration: 0.35, delay: 0.05 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {projectConfigs.map((project) => {
            const Icon = project.icon;
            const items = projectItems[project.id] || [];
            return (
              <div
                key={project.id}
                className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 flex flex-col text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${project.bg} p-2.5 rounded-xl`}>
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
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
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
                  <div className="mb-3 p-3 bg-neutral-800/60 rounded-lg border border-neutral-700">
                    <textarea
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Enter new item..."
                      className="w-full bg-neutral-900 text-gray-200 text-sm rounded p-2 mb-2 border border-neutral-700 focus:outline-none focus:border-emerald-500"
                      rows="2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddItem(project.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={cancelAdding}
                        className="flex items-center gap-1 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded transition-colors"
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
                        <div className="p-2 bg-neutral-800/60 rounded-lg border border-neutral-700">
                          <textarea
                            value={editItemText}
                            onChange={(e) => setEditItemText(e.target.value)}
                            className="w-full bg-neutral-900 text-gray-200 text-sm rounded p-2 mb-2 border border-neutral-700 focus:outline-none focus:border-emerald-500"
                            rows="2"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEditItem(item.id, project.id)
                              }
                              className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center gap-1 px-2 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-xs rounded transition-colors"
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
                              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3 text-blue-400" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteItem(item.id, project.id)
                              }
                              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
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
      </div>
    </div>
  );
};

export default LoggedInView;
