"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const checkLogin = () => {
    const token = localStorage.getItem("userToken");
    setIsUserLoggedIn(!!token);
  };

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

  return (
    <>
      {/* Sidebar Button (always visible) */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="fixed top-4 left-4 z-[100] p-3 rounded-full transition duration-300 text-black hover:bg-black/10"
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
        className={`fixed top-0 left-0 h-full w-64 z-50 bg-white shadow-lg transform transition-transform duration-500 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        <div className="p-6 flex flex-col h-full">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-3xl font-bold mb-8 tracking-wide ml-10 hover:text-blue-500 transition"
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
                className={`hover:text-blue-500 transition ${
                  isActive(href) ? "font-bold text-blue-500" : ""
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
                  className={`hover:text-blue-500 transition ${
                    isActive("/signup") ? "font-bold text-blue-500" : ""
                  }`}
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={`hover:text-blue-500 transition ${
                    isActive("/login") ? "font-bold text-blue-500" : ""
                  }`}
                >
                  Login
                </Link>

                {/* Admin Login Button */}
                <Link
                  href="/admin/login"
                  onClick={() => setOpen(false)}
                  className={`hover:text-blue-500 transition ${
                    isActive("/admin/login") ? "font-bold text-blue-500" : ""
                  }`}
                >
                  Admin Login
                </Link>
              </>
            )}
          </nav>

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
