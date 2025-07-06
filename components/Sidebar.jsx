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
    checkLogin(); // Check on first mount

    const handleFocus = () => checkLogin(); // Check when window gains focus
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    checkLogin(); // Check on route change
  }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (href) => pathname === href;

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("loggedInUser");
    setIsUserLoggedIn(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <div>
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="p-3 text-black fixed top-4 left-4 z-50 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 shadow-xl z-40 flex flex-col p-6 gap-6 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        <h2 className="text-3xl font-bold mb-8 text-black select-none tracking-wide">Fbpitch</h2>

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
              className={`hover:text-blue-600 transition ${
                isActive(href) ? "font-bold text-blue-600" : "text-black"
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
                className={`hover:text-blue-600 transition ${
                  isActive("/signup") ? "font-bold text-blue-600" : "text-black"
                }`}
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={`hover:text-blue-600 transition ${
                  isActive("/login") ? "font-bold text-blue-600" : "text-black"
                }`}
              >
                Login
              </Link>
            </>
          )}
        </nav>

        {isUserLoggedIn && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full justify-center"
          >
            <LogOut size={18} />
            Logout
          </button>
        )}
      </aside>
    </div>
  );
}
