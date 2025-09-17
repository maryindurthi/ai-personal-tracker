import admin from "firebase-admin";

// Only initialize once
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
