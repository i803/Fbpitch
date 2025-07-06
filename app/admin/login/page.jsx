"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (username === process.env.NEXT_PUBLIC_ADMIN_USERNAME && password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      alert("Login successful!");
      router.push("/admin");
    } else {
      alert("Invalid username or password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 to-purple-600 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-900">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-3 border border-indigo-300 rounded-md" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border border-indigo-300 rounded-md" />
          <button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-md">{loading ? "Logging in..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}
