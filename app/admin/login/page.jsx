"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Login successful!");
        localStorage.setItem("adminToken", data.token);
        router.push("/admin");
      } else {
        alert(data.message || "Invalid username or password");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 px-6">
      <div className="max-w-md w-full bg-gradient-to-tr from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-pink-500 tracking-wide">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-gray-300 font-semibold"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 border border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block mb-2 text-gray-300 font-semibold"
            >
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 border border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-[55%] right-3 -translate-y-1/2 text-pink-500 hover:text-pink-400 transition"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-bold py-3 rounded-lg shadow-lg shadow-pink-500/50 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
