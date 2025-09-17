"use client";
import { useState } from "react";
import { auth } from "../../utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-2 p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-2 border rounded" required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="p-2 border rounded" required />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="p-2 bg-green-500 text-white rounded mt-2">Login</button>
    </form>
  );
}
