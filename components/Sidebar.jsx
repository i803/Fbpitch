"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LogOut, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const checkLogin = () => {
    const token = localStorage.getItem("userToken");
    setIsUserLoggedIn(!!token);
  };

  // Load dark mode from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Update dark mode class and localStorage whenever toggled
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    checkLogin();

    const handleFocus = () => {
      checkLogin();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    checkLogin();
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (href) => pathname === href;

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("loggedInUser");
    setIsUserLoggedIn(false);
    setOpen(false);
    router.push("/");
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <>
      {/* Sidebar Button (always visible) */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="fixed top-4 left-4 z-[100] p-3 rounded-full transition duration-300 text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-500 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        <div className="p-6 flex flex-col h-full">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-3xl font-bold mb-8 tracking-wide ml-10 hover:text-blue-500 transition dark:text-white"
          >
            Fbpitch
          </Link>

          <nav className="flex flex-col gap-4 text-lg flex-grow">
            {[
              { href: "/", label: "Home" },
              { href: "/return-policy", label: "Return Policy" },
              { href: "/terms", label: "Terms & Conditions" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/contact", label: "Contact Us" },
              { href: "/care", label: "Care Instructions" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`hover:text-blue-500 transition dark:hover:text-blue-400 ${
                  isActive(href) ? "font-bold text-blue-500 dark:text-blue-400" : "dark:text-gray-300"
                }`}
              >
                {label}
              </Link>
            ))}

            {!isUserLoggedIn && (
              <>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className={`hover:text-blue-500 transition dark:hover:text-blue-400 ${
                    isActive("/signup") ? "font-bold text-blue-500 dark:text-blue-400" : "dark:text-gray-300"
                  }`}
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={`hover:text-blue-500 transition dark:hover:text-blue-400 ${
                    isActive("/login") ? "font-bold text-blue-500 dark:text-blue-400" : "dark:text-gray-300"
                  }`}
                >
                  Login
                </Link>

                {/* Admin Login Button */}
                <Link
                  href="/admin/login"
                  onClick={() => setOpen(false)}
                  className={`hover:text-blue-500 transition dark:hover:text-blue-400 ${
                    isActive("/admin/login") ? "font-bold text-blue-500 dark:text-blue-400" : "dark:text-gray-300"
                  }`}
                >
                  Admin Login
                </Link>
              </>
            )}
          </nav>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="mt-6 flex items-center justify-center gap-2 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition w-full select-none"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          {isUserLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full justify-center mt-4"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
