"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import Confetti from "react-confetti";
import useWindowSize from "../hooks/useWindowSize";
import MoodBarChart from "@/components/MoodBarChart";
import AIRecommendations from "@/components/AIRecommendations";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const habitOptions = ["Meditated", "Exercised", "Read", "Drank water"];
const moodOptions = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😱", label: "Anxious" },
  { emoji: "⚡", label: "Energetic" },
];

export default function DailyTracker() {
  const [mood, setMood] = useState(null);
  const [habits, setHabits] = useState([]);
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");
  const [lastSavedLog, setLastSavedLog] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const { width, height } = useWindowSize();

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    if (!auth.currentUser) return;
    const logsRef = collection(db, "users", auth.currentUser.uid, "logs");
    const q = query(logsRef, orderBy("date", "desc"), limit(7));
    const snapshot = await getDocs(q);
    setLogs(snapshot.docs.map(doc => doc.data()));
  }

  const handleHabitToggle = (habit) => {
    setHabits(habits.includes(habit) ? habits.filter(h => h !== habit) : [...habits, habit]);
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      setStatus("Please login first.");
      return;
    }

    if (!mood) {
      setStatus("Select your mood!");
      return;
    }

    const logData = {
      date: new Date().toISOString().split("T")[0],
      mood,
      habits,
      symptoms,
      notes,
    };

    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "logs"), logData);
      setStatus("Log saved ✅");
      setMood(null);
      setHabits([]);
      setSymptoms("");
      setNotes("");
      setLogs([logData, ...logs].slice(0, 7));
      setLastSavedLog(logData);

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (err) {
      console.error(err);
      setStatus("Error saving log ❌");
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10 bg-gradient-to-br from-purple-900 via-indigo-900 to-black min-h-screen text-white">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={300} />}

      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-extrabold mb-6 text-center tracking-wide drop-shadow-[0_0_25px_#ff00ff]"
      >
        Daily Tracker Dashboard
      </motion.h1>

      {/* Mood Selector */}
      <Card className="bg-white/10 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Mood</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center gap-6 flex-wrap">
          {moodOptions.map((m) => (
            <motion.button
              key={m.label}
              onClick={() => setMood(m.emoji)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`text-4xl p-4 rounded-full ${
                mood === m.emoji
                  ? "shadow-[0_0_25px_#ff00ff] bg-gradient-to-br from-pink-500 to-purple-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {m.emoji}
            </motion.button>
          ))}
        </CardContent>
      </Card>

      {/* Habits */}
      <Card className="bg-white/10 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Habits</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {habitOptions.map((habit) => (
            <motion.button
              key={habit}
              onClick={() => handleHabitToggle(habit)}
              whileHover={{ scale: 1.1 }}
              className={`px-5 py-2 rounded-full font-semibold ${
                habits.includes(habit)
                  ? "bg-gradient-to-r from-green-400 to-teal-400 text-black shadow-[0_0_15px_#00ffbb]"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {habit}
            </motion.button>
          ))}
        </CardContent>
      </Card>

      {/* Symptoms & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Textarea
          placeholder="Symptoms..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="p-4 rounded-xl bg-white/10 backdrop-blur-md shadow-lg text-white placeholder-white/60"
        />
        <Textarea
          placeholder="Notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="p-4 rounded-xl bg-white/10 backdrop-blur-md shadow-lg text-white placeholder-white/60"
        />
      </div>

      {/* Save Button */}
      <div className="text-center">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:scale-105 px-10 py-4 text-xl font-bold rounded-full shadow-[0_0_30px_#ff00ff] transition-all"
        >
          Save Log
        </Button>
        <p className="mt-3 text-green-400">{status}</p>
      </div>

      {/* Mood Chart */}
      <Card className="bg-white/10 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Mood Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodBarChart logs={logs} />
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card className="bg-white/10 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Recent Logs</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.map((log, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-4 bg-white/10 backdrop-blur-md rounded-xl shadow-md"
            >
              <p className="text-3xl">{log.mood}</p>
              <p>Habits: {log.habits.length ? log.habits.join(", ") : "-"}</p>
              <p>Symptoms: {log.symptoms || "-"}</p>
              <p>Notes: {log.notes || "-"}</p>
              <p className="text-sm text-white/70">{log.date}</p>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {lastSavedLog && <AIRecommendations log={lastSavedLog} />}
    </div>
  );
}
