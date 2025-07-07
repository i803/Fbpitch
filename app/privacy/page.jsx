"use client";

import { useEffect, useState } from "react";

export default function PrivacyPolicy() {
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
    <div className="max-w-4xl mx-auto py-16 px-6 sm:px-12 text-gray-900 font-serif space-y-8 dark:text-white dark:bg-gray-900">
      <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-indigo-900 dark:text-indigo-400">Privacy Policy</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Introduction</h2>
        <p className="leading-relaxed text-lg">
          At Fbpitch, we value your privacy and are committed to protecting your personal information...
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Information We Collect</h2>
        <p className="leading-relaxed text-lg">
          We collect information when you use our services, including:
        </p>
        <ul className="list-disc list-inside ml-6 mt-3 space-y-2 text-lg">
          <li>Personal details like your name, email address, and contact information.</li>
          <li>Order and payment information.</li>
          <li>Cookies and usage data to improve your experience.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">How We Use Your Information</h2>
        <p className="leading-relaxed text-lg">
          We use the collected data to:
        </p>
        <ul className="list-disc list-inside ml-6 mt-3 space-y-2 text-lg">
          <li>Process and fulfill your orders.</li>
          <li>Improve our website and services.</li>
          <li>Send you updates and promotions (with your consent).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Your Rights</h2>
        <p className="leading-relaxed text-lg">
          You have the right to access, correct, or delete your personal information at any time by contacting us.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Contact Us</h2>
        <p className="leading-relaxed text-lg">
          For any questions about your privacy or this policy, please email us at support@fbpitch.com.
        </p>
      </section>

      <p className="mt-12 text-center text-gray-700 dark:text-gray-400 text-sm">
        Retro & Current Kits • Shipping Within Kuwait Only • Fast Delivery
        <br />
        © 2025 Fbpitch. All rights reserved.
      </p>
    </div>
  );
}
