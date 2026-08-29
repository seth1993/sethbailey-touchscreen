import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  LogOut,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
  Circle,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Flame,
} from "lucide-react";
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
import VisitorAnalytics from "./VisitorAnalytics";

const PLANFUL_SEED_TASKS = [
  "Work on userflow",
  "User subscription",
  "Landing page",
  "App review",
  "Getting users to test",
];

const LoggedInView = ({ onLogout, onToggleView, showPublicView }) => {
  const [projectItems, setProjectItems] = useState({
    bidfolder: [],
    planful: [],
    fusion: [],
  });
  const [editingItem, setEditingItem] = useState(null);
  const [addingToProject, setAddingToProject] = useState(null);
  const [newItemText, setNewItemText] = useState("");
  const [editItemText, setEditItemText] = useState("");
  const seeded = useRef(false);

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

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (items[data.projectId]) {
          items[data.projectId].push({ id: docSnap.id, ...data });
        }
      });

      // Seed Planful tasks once if none exist
      if (items.planful.length === 0 && !seeded.current) {
        seeded.current = true;
        for (const text of PLANFUL_SEED_TASKS) {
          const docRef = await addDoc(collection(db, "projectItems"), {
            projectId: "planful",
            text,
            completed: false,
            createdAt: new Date().toISOString(),
          });
          items.planful.push({
            id: docRef.id,
            projectId: "planful",
            text,
            completed: false,
          });
        }
      }

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
        completed: false,
        createdAt: new Date().toISOString(),
      });
      setProjectItems((prev) => ({
        ...prev,
        [projectId]: [
          ...prev[projectId],
          {
            id: docRef.id,
            projectId,
            text: newItemText.trim(),
            completed: false,
          },
        ],
      }));
      setNewItemText("");
      setAddingToProject(null);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleToggleComplete = async (itemId, projectId) => {
    const item = projectItems[projectId].find((i) => i.id === itemId);
    if (!item) return;
    const newCompleted = !item.completed;
    try {
      await updateDoc(doc(db, "projectItems", itemId), {
        completed: newCompleted,
        updatedAt: new Date().toISOString(),
      });
      setProjectItems((prev) => ({
        ...prev,
        [projectId]: prev[projectId].map((i) =>
          i.id === itemId ? { ...i, completed: newCompleted } : i
        ),
      }));
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  const handleEditItem = async (itemId, projectId) => {
    if (!editItemText.trim()) return;
    try {
      await updateDoc(doc(db, "projectItems", itemId), {
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

  // Totals
  const allItems = Object.values(projectItems).flat();
  const totalItems = allItems.length;
  const completedItems = allItems.filter((i) => i.completed).length;
  const progressPct = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const projectConfigs = [
    {
      id: "bidfolder",
      name: "Bidfolder",
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      check: "text-blue-400",
      accent: "border-blue-500/20",
    },
    {
      id: "planful",
      name: "Planful",
      icon: Target,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      check: "text-purple-400",
      accent: "border-purple-500/20",
    },
    {
      id: "fusion",
      name: "Fusion Project",
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-500/10",
      check: "text-green-400",
      accent: "border-green-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-neutral-900/80 backdrop-blur border-b border-neutral-800">
        <div className="mx-auto max-w-4xl px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg text-white font-medium tracking-wide">
            Tasks &amp; Thoughts
          </h1>
          <div className="flex gap-3">
            <button
              onClick={onToggleView}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              {showPublicView ? "Back" : "Public Page"}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 bg-neutral-800 hover:bg-neutral-800/80 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Progress banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-500/15 p-3 rounded-xl">
              <Flame className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-white">
                {completedItems}
                <span className="text-lg text-gray-500 font-normal">
                  {" "}
                  / {totalItems} done
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                {completedItems === 0
                  ? "Fresh start. Pick one and go."
                  : completedItems < Math.ceil(totalItems * 0.5)
                  ? "Building momentum — keep going."
                  : completedItems < totalItems
                  ? "More than halfway. You're crushing it."
                  : "Everything knocked out. Add what's next."}
              </p>
            </div>
          </div>
          {totalItems > 0 && (
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          )}
        </motion.div>

        {/* Visitor analytics */}
        <VisitorAnalytics />

        {/* Project task columns */}
        <div className="grid gap-5 md:grid-cols-3">
          {projectConfigs.map((project, idx) => {
            const Icon = project.icon;
            const items = projectItems[project.id] || [];
            const active = items.filter((i) => !i.completed);
            const done = items.filter((i) => i.completed);
            const projectDone = done.length;
            const projectTotal = items.length;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 flex flex-col text-left"
              >
                {/* Project header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`${project.bg} p-2 rounded-lg`}>
                      <Icon className={`w-4 h-4 ${project.color}`} />
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {project.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {projectTotal > 0 && (
                      <span className="text-xs text-gray-500">
                        {projectDone}/{projectTotal}
                      </span>
                    )}
                    <button
                      onClick={() => startAdding(project.id)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
                      title="Add task"
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Add form */}
                {addingToProject === project.id && (
                  <div className="mb-3 p-3 bg-neutral-800/60 rounded-lg border border-neutral-700">
                    <textarea
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="What needs to happen?"
                      className="w-full bg-neutral-900 text-gray-200 text-sm rounded p-2 mb-2 border border-neutral-700 focus:outline-none focus:border-emerald-500 resize-none"
                      rows="2"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddItem(project.id);
                        }
                      }}
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

                {/* Active tasks */}
                <ul className="space-y-1 flex-1">
                  {active.map((item) => (
                    <li key={item.id} className="group">
                      {editingItem?.id === item.id ? (
                        <div className="p-2 bg-neutral-800/60 rounded-lg border border-neutral-700">
                          <textarea
                            value={editItemText}
                            onChange={(e) => setEditItemText(e.target.value)}
                            className="w-full bg-neutral-900 text-gray-200 text-sm rounded p-2 mb-2 border border-neutral-700 focus:outline-none focus:border-emerald-500 resize-none"
                            rows="2"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleEditItem(item.id, project.id);
                              }
                            }}
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
                        <div className="flex items-start gap-2.5 py-1.5 rounded-lg px-1 -mx-1 hover:bg-neutral-800/40 transition-colors">
                          <button
                            onClick={() =>
                              handleToggleComplete(item.id, project.id)
                            }
                            className="mt-0.5 flex-shrink-0"
                          >
                            <Circle className="w-[18px] h-[18px] text-gray-600 hover:text-emerald-400 transition-colors" />
                          </button>
                          <span className="text-sm text-gray-200 flex-1 leading-snug">
                            {item.text}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditing(item, project.id)}
                              className="p-1 rounded hover:bg-neutral-700 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3 text-gray-500 hover:text-blue-400" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteItem(item.id, project.id)
                              }
                              className="p-1 rounded hover:bg-neutral-700 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Completed tasks */}
                {done.length > 0 && (
                  <>
                    <div className="border-t border-neutral-800 mt-3 pt-2">
                      <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-1 px-1">
                        Done
                      </p>
                    </div>
                    <ul className="space-y-0.5">
                      {done.map((item) => (
                        <li key={item.id} className="group">
                          <div className="flex items-start gap-2.5 py-1 rounded-lg px-1 -mx-1 hover:bg-neutral-800/40 transition-colors">
                            <button
                              onClick={() =>
                                handleToggleComplete(item.id, project.id)
                              }
                              className="mt-0.5 flex-shrink-0"
                            >
                              <CheckCircle2 className={`w-[18px] h-[18px] ${project.check} opacity-70`} />
                            </button>
                            <span className="text-sm text-gray-500 line-through flex-1 leading-snug">
                              {item.text}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() =>
                                  handleDeleteItem(item.id, project.id)
                                }
                                className="p-1 rounded hover:bg-neutral-700 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3 text-gray-600 hover:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Empty state */}
                {items.length === 0 && addingToProject !== project.id && (
                  <p className="text-gray-600 text-sm text-center py-6 italic">
                    Nothing here yet
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoggedInView;
