"use client";

import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function AIRecommendations() {
  const [recommendation, setRecommendation] = useState("");
  const [status, setStatus] = useState("Fetching recommendation...");

  useEffect(() => {
    async function fetchRecommendation() {
      if (!auth.currentUser) {
        setStatus("Please login to see AI recommendations.");
        return;
      }

      const res = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: auth.currentUser.uid }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecommendation(data.recommendation);
        setStatus("");
      } else {
        setStatus(data.error);
      }
    }

    fetchRecommendation();
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto border rounded">
      <h2 className="text-lg font-bold mb-2">AI Recommendations</h2>
      {status && <p className="text-red-500">{status}</p>}
      {recommendation && <p>{recommendation}</p>}
    </div>
  );
}
