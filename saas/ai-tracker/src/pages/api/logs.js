import { adminDb } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  const { method } = req;

  if (method === "POST") {
    // Add a new log
    const { userId, date, mood, habit, symptom } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const docRef = adminDb.collection("users").doc(userId).collection("logs").doc(date);
      await docRef.set({ mood, habit, symptom });
      return res.status(200).json({ message: "Log saved successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === "GET") {
    // Get logs for a user
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ error: "Missing userId" });

    try {
      const logsSnap = await adminDb.collection("users").doc(userId).collection("logs").get();
      const logs = logsSnap.docs.map(doc => doc.data());
      return res.status(200).json({ logs });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
