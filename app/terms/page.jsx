"use client";

import { useEffect, useState } from "react";

export default function TermsAndConditions() {
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
      <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-indigo-900 dark:text-indigo-400">Terms & Conditions</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Acceptance of Terms</h2>
        <p className="leading-relaxed text-lg">
          By using Fbpitch, you agree to comply with and be bound by these terms and conditions.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Ordering</h2>
        <p className="leading-relaxed text-lg">
          All orders are subject to availability and confirmation of the order price.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Payments</h2>
        <p className="leading-relaxed text-lg">
          Payments are processed securely via PayPal. Prices are subject to change without notice.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Shipping & Delivery</h2>
        <p className="leading-relaxed text-lg">
          We strive to deliver orders promptly but are not responsible for delays outside our control.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Limitation of Liability</h2>
        <p className="leading-relaxed text-lg">
          Fbpitch is not liable for indirect or consequential damages arising from product use.
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
