"use client";

import { useEffect, useState } from "react";
import Footer from "../../components/Footer";

export default function CareInstructions() {
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
    <>
      <div className="max-w-4xl mx-auto py-16 px-6 sm:px-12 text-gray-900 font-serif space-y-8 dark:text-white dark:bg-gray-900">
        <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-indigo-900 dark:text-indigo-400">
          Care Instructions
        </h1>

        <section>
          <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">
            Washing
          </h2>
          <p className="leading-relaxed text-lg">
            Machine wash cold with like colors. Use mild detergent. Avoid bleach to maintain vibrant colors.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">
            Drying
          </h2>
          <p className="leading-relaxed text-lg">
            Tumble dry low or hang dry to avoid shrinking or damage to fabric.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">
            Ironing
          </h2>
          <p className="leading-relaxed text-lg">
            If needed, iron on low heat. Avoid ironing directly on printed or embroidered areas.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2 dark:border-indigo-700">
            Storage
          </h2>
          <p className="leading-relaxed text-lg">
            Store in a cool, dry place away from direct sunlight to preserve fabric quality and colors.
          </p>
        </section>
      </div>

      <Footer />
    </>
  );
}
