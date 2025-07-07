"use client";

import { useEffect, useState } from "react";

export default function ReturnPolicy() {
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
      <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-indigo-900 dark:text-indigo-400">Return Policy</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Overview</h2>
        <p className="leading-relaxed text-lg">
          We want you to be fully satisfied with your purchase. If you're not happy with your order, you can return it within 14 days of delivery for a refund or exchange.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Eligibility</h2>
        <ul className="list-disc list-inside ml-6 mt-3 space-y-2 text-lg">
          <li>Items must be unused, unwashed, and in their original condition.</li>
          <li>Return requests must be initiated within 14 days of receipt.</li>
          <li>Custom or personalized items are non-returnable.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">How to Return</h2>
        <p className="leading-relaxed text-lg">
          Contact our support team at fbpitchhelp@gmail.com with your order details to initiate a return. We'll guide you through the process.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">Refunds</h2>
        <p className="leading-relaxed text-lg">
          Refunds will be processed to the original payment method within 7 business days after we receive the returned items.
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
