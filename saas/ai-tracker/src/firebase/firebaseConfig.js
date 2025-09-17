// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9JCE94cilIc1Jj2JtmRsG63c3ggdk5ts",
  authDomain: "ai-personal-tracker-79359.firebaseapp.com",
  projectId: "ai-personal-tracker-79359",
  storageBucket: "ai-personal-tracker-79359.firebasestorage.app",
  messagingSenderId: "1040886530783",
  appId: "1:1040886530783:web:2640e20cd36256b24b1f6a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
