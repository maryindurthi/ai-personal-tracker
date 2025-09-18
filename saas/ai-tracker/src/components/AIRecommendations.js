"use client";

import { useState } from "react";
import { auth } from "../firebase";

export default function AIRecommendations({ isPremium }) {
  const [tips, setTips] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTips = async () => {
    if (!auth.currentUser) {
      setTips("Please log in first.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.currentUser.uid }),
      });

      const data = await res.json();
      setTips(data.recommendation || "No tips available.");
    } catch (err) {
      setTips("Error fetching tips.");
    }

    setLoading(false);
  };

  if (!isPremium) {
    return (
      <div className="p-4 border rounded mt-6">
        <h2 className="text-lg font-bold">AI Recommendations</h2>
        <p className="text-gray-500">Upgrade to Premium to unlock personalized AI tips.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded mt-6">
      <h2 className="text-lg font-bold mb-2">AI Recommendations</h2>
      <button
        onClick={fetchTips}
        disabled={loading}
        className="bg-purple-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Loading..." : "Get Tips"}
      </button>
      <p className="mt-4 whitespace-pre-line">{tips}</p>
    </div>
  );
}
