"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ThankYouPage() {
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

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans p-6 ${darkMode ? "bg-gradient-to-br from-gray-900 to-gray-700 text-white" : "bg-gradient-to-br from-white to-gray-100 text-black"}`}>
      <div className={`rounded-xl p-10 md:p-16 max-w-xl w-full text-center shadow-2xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Thank You for Your Purchase!
        </h1>

        <p className="text-lg md:text-xl mb-8 leading-relaxed">
          Your order has been successfully placed. We appreciate your business and hope you love your new football kits!
        </p>

        <Link href="/" className="inline-block">
          <button className="px-8 py-3 rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 bg-black text-white hover:bg-gray-800 dark:bg-indigo-700 dark:hover:bg-indigo-600">
            Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}
