import { auth, db } from "../../../firebase"; // adjust path
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";

export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return new Response(JSON.stringify({ error: "No userId provided" }), { status: 400 });

    const logsRef = collection(db, "users", userId, "logs");
    const q = query(logsRef, orderBy("date", "desc"), limit(5));
    const snapshot = await getDocs(q);
    const logsData = snapshot.docs.map(doc => doc.data());

    return new Response(JSON.stringify({ logs: logsData }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch logs" }), { status: 500 });
  }
}
