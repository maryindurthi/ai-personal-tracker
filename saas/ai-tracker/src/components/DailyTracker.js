"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function DailyTracker() {
  const [mood, setMood] = useState("");
  const [habits, setHabits] = useState([]);
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");

  const habitOptions = ["Meditated", "Exercised", "Read", "Drank water"];

  // Fetch last 5 logs
  useEffect(() => {
    async function fetchLogs() {
      if (!auth.currentUser) return;

      const logsRef = collection(db, "users", auth.currentUser.uid, "logs");
      const q = query(logsRef, orderBy("date", "desc"), limit(5));
      const snapshot = await getDocs(q);
      const logsData = snapshot.docs.map(doc => doc.data());
      setLogs(logsData);
    }
    fetchLogs();
  }, []);

  const handleHabitChange = (habit) => {
    if (habits.includes(habit)) {
      setHabits(habits.filter(h => h !== habit));
    } else {
      setHabits([...habits, habit]);
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      setStatus("Please login first.");
      return;
    }

    const logData = {
      date: new Date().toISOString().split("T")[0],
      mood,
      habits,
      symptoms,
      notes
    };

    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "logs"), logData);
      setStatus("Log saved ✅");
      setMood("");
      setHabits([]);
      setSymptoms("");
      setNotes("");
      setLogs([logData, ...logs].slice(0,5)); // update last 5 logs
    } catch (err) {
      console.error(err);
      setStatus("Error saving log ❌");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Daily Tracker</h1>

      <label className="block mb-2">Mood:</label>
      <select value={mood} onChange={(e) => setMood(e.target.value)} className="mb-4 border p-2 w-full">
        <option value="">Select Mood</option>
        <option value="Happy">Happy</option>
        <option value="Neutral">Neutral</option>
        <option value="Sad">Sad</option>
        <option value="Anxious">Anxious</option>
        <option value="Energetic">Energetic</option>
      </select>

      <label className="block mb-2">Habits:</label>
      <div className="mb-4">
        {habitOptions.map((habit) => (
          <label key={habit} className="mr-4">
            <input
              type="checkbox"
              checked={habits.includes(habit)}
              onChange={() => handleHabitChange(habit)}
            /> {habit}
          </label>
        ))}
      </div>

      <label className="block mb-2">Symptoms:</label>
      <textarea
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        className="mb-4 border p-2 w-full"
      />

      <label className="block mb-2">Notes:</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="mb-4 border p-2 w-full"
      />

      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
        Save Log
      </button>

      <p className="mt-4">{status}</p>

      <h2 className="text-lg font-bold mt-6 mb-2">Last Logs</h2>
      <ul>
        {logs.map((log, idx) => (
          <li key={idx} className="mb-2 border p-2 rounded">
            <strong>{log.date}</strong> — Mood: {log.mood}, Habits: {log.habits.join(", ")}
            <br />
            Symptoms: {log.symptoms || "-"}, Notes: {log.notes || "-"}
          </li>
        ))}
      </ul>
    </div>
  );
}
