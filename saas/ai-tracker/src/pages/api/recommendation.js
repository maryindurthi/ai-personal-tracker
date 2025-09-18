import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";
import { Configuration, OpenAIApi } from "openai";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // Use your service account JSON file info here
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

const db = admin.firestore();

// OpenAI config
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { uid } = req.body; // frontend should send the Firebase UID

  if (!uid) return res.status(400).json({ error: "User ID missing" });

  try {
    // Get user doc
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: "User not found" });

    const userData = userDoc.data();
    if (userData.subscription !== "premium") {
      return res.status(403).json({ error: "Upgrade to Premium to use AI" });
    }

    // Fetch last 5 logs
    const logsSnap = await db
      .collection("users")
      .doc(uid)
      .collection("logs")
      .orderBy("date", "desc")
      .limit(5)
      .get();

    const logs = logsSnap.docs.map((doc) => doc.data());

    // Build prompt
    const prompt = `You are an AI assistant for a personal tracker app. 
Analyze the following user logs and give 1-3 actionable health and habit tips in short sentences:\n\n${JSON.stringify(
      logs,
      null,
      2
    )}`;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 200,
    });

    const recommendation = completion.data.choices[0].text.trim();
    res.status(200).json({ recommendation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
