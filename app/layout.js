import "../styles/globals.css";
import Sidebar from "../components/Sidebar";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Fbpitch",
  description: "Retro & Current Football Kits - Fbpitch Store",
  icons: {
    icon: "/fbpitch-logo.png", // Ensure this path points to your favicon in /public
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen relative font-sans text-gray-900">
        {/* Global Toast Notifications */}
        <Toaster position="top-center" />

        {/* Sidebar always visible on small screens */}
        <Sidebar />

        {/* Main content */}
        <main className="relative z-10 p-4 sm:p-6">{children}</main>
      </body>
    </html>
  );
}
