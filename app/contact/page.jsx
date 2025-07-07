"use client";

import { useState, useEffect } from "react";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === null) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      localStorage.setItem("darkMode", prefersDark.toString());
    } else {
      setDarkMode(savedDarkMode === "true");
    }
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send message. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-6 sm:px-12 text-gray-900 font-sans dark:text-white dark:bg-gray-900">
      <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-indigo-900 text-center dark:text-indigo-400">
        Contact Us
      </h1>

      <p className="text-lg mb-8 text-center">
        Have questions or feedback? We're here to help! Fill out the form below and we'll get back to you soon.
      </p>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center dark:bg-green-900 dark:border-green-600 dark:text-green-300">
          Thank you for contacting us! We'll respond shortly.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center dark:bg-red-900 dark:border-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full p-3 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition dark:bg-gray-800 dark:border-indigo-600 dark:text-white"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full p-3 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition dark:bg-gray-800 dark:border-indigo-600 dark:text-white"
        />
        <textarea
          placeholder="Your Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={5}
          required
          className="w-full p-3 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none dark:bg-gray-800 dark:border-indigo-600 dark:text-white"
        ></textarea>
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
          } text-white font-semibold py-3 rounded-md transition`}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      <p className="mt-12 text-center text-gray-700 dark:text-gray-400 text-sm">
        Retro & Current Kits • Shipping Within Kuwait Only • Fast Delivery
        <br />
        © 2025 Fbpitch. All rights reserved.
      </p>
    </div>
  );
}
