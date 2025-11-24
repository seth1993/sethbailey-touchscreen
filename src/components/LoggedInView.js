import React from "react";
import { motion } from "framer-motion";
import { Eye, LogOut, Target, TrendingUp, Users } from "lucide-react";
import Tiles from "./tiles";
import inspirationImage from "../inspiration.png";

const LoggedInView = ({ onLogout, onToggleView, showPublicView }) => {
  return (
    <div className="min-h-screen bg-black">
      {/* Header with controls */}
      <div className="bg-neutral-900/80 backdrop-blur border-b border-neutral-700">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
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

      {/* Goals and Inspiration Section */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 rounded-2xl p-8 mb-8 border border-neutral-800"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Goals Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Site Goals & Vision</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold mb-1">Growth & Reach</h3>
                      <p className="text-gray-300 text-sm">
                        Expand visibility and showcase projects to potential collaborators and clients.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold mb-1">Community Building</h3>
                      <p className="text-gray-300 text-sm">
                        Connect with like-minded developers and create meaningful professional relationships.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold mb-1">Innovation Showcase</h3>
                      <p className="text-gray-300 text-sm">
                        Demonstrate cutting-edge solutions and thought leadership in modern development.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspiration Image */}
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-4">Design Inspiration</h3>
              <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700 flex-1 flex items-center justify-center">
                <img
                  src={inspirationImage}
                  alt="Design Inspiration"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Projects Section - Original Tiles Component */}
      <Tiles />
    </div>
  );
};

export default LoggedInView;
