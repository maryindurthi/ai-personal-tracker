"use client";

import React from "react";
import { motion } from "framer-motion";

export default function MoodBarChart({ logs }) {
  const moodCount = logs.reduce((acc, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1;
    return acc;
  }, {});

  const moods = Object.keys(moodCount);

  return (
    <div className="w-full flex gap-6 items-end justify-center p-6 bg-gradient-to-br from-indigo-800/30 to-purple-800/30 rounded-xl shadow-inner">
      {moods.length > 0 ? (
        moods.map((mood, idx) => (
          <motion.div
            key={mood}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: moodCount[mood] * 40, opacity: 1 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="relative flex flex-col items-center"
          >
            <div className="w-12 rounded-t-xl bg-gradient-to-t from-pink-500 via-purple-500 to-indigo-500 shadow-[0_0_15px_#ff00ff]" />
            <span className="mt-3 text-xl">{mood}</span>
            <span className="text-sm text-white/70">{moodCount[mood]}</span>
          </motion.div>
        ))
      ) : (
        <p className="text-white/60">No mood data yet</p>
      )}
    </div>
  );
}
