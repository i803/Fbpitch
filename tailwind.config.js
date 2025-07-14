/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // dark mode via class strategy
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html", // In case you use public HTML templates
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        // Optional: Custom grays to standardize across dark/light
        "gray-900": "#111827",
        "gray-800": "#1F2937",
        "gray-700": "#374151",
        "gray-600": "#4B5563",
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
