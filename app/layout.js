import "../styles/globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Fbpitch",
  description: "Retro & Current Football Kits - Fbpitch Store",
  icons: {
    icon: "/fbpitch-logo.png",  // Make sure you have /public/favicon.png
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen relative font-sans text-gray-900">
        <Sidebar />
        <main className="relative z-10 p-4 sm:p-6">{children}</main>
      </body>
    </html>
  );
}
