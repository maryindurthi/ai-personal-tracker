"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIRecommendations({ log }) {
  const [recommendations, setRecommendations] = useState("Loading recommendations...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!log) return;

    async function fetchRecommendations() {
      setLoading(true);
      try {
        const res = await fetch("/api/ai-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ log }),
        });

        if (!res.ok) throw new Error("Failed to fetch AI recommendations");

        const data = await res.json();
        setRecommendations(data.recommendation || "No recommendation available.");
      } catch (err) {
        console.error(err);
        setRecommendations("Error fetching recommendations ❌");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [log]);

  return (
    <div className="mt-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl relative overflow-hidden">
      <h2 className="text-3xl font-bold mb-4">AI Recommendations</h2>
      <AnimatePresence>
        <motion.div
          key={recommendations}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className="p-4 bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-500 rounded-xl shadow-lg text-white text-lg relative"
        >
          <div className="absolute -top-4 -left-4 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-2xl animate-pulse">
            🤖
          </div>
          {loading ? "Fetching recommendations..." : recommendations}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
