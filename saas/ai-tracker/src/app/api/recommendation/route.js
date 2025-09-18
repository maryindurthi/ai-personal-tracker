import { NextResponse } from "next/server";
import { auth, db } from "../../../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    // Fetch last 5 logs
    const logsRef = collection(db, "users", userId, "logs");
    const q = query(logsRef, orderBy("date", "desc"), limit(5));
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => doc.data());

    // Call OpenAI API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful wellness coach." },
          { role: "user", content: `Here are my recent logs: ${JSON.stringify(logs)}. Please give me 3 wellness tips.` }
        ],
      }),
    });

    const data = await openaiRes.json();
    const recommendation = data?.choices?.[0]?.message?.content || "No recommendation available.";

    return NextResponse.json({ recommendation });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 });
  }
}
