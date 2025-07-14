"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/ui/button";
import {
  Settings,
  ShoppingCart,
  Shirt,
  Globe,
  Clock,
  Moon,
  Sun,
  Search,
  Instagram,
} from "lucide-react";

export default function ShortsPage() {
  const [cart, setCart] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [filteredShorts, setFilteredShorts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const categories = [
    "ALL",
    "NEW ARRIVALS",
    "RETRO",
    "SPECIAL KITS",
    "NATIONAL TEAM",
    "KITS FOR KIDS",
    "SHORTS",
  ];

  const [selectedCategory, setSelectedCategory] = useState("SHORTS");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const shortsOnly = (data.products || []).filter((p) => p.shortsImage);
        setShorts(shortsOnly);
        setFilteredShorts(shortsOnly);
      } catch (err) {
        console.error("Failed to fetch shorts:", err);
        setShorts([]);
        setFilteredShorts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      const storedCart = JSON.parse(localStorage.getItem(`cart-${loggedInUser}`) || "[]");
      setCart(storedCart);
    }

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
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const filtered = shorts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredShorts(filtered);
  }, [searchTerm, shorts]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat !== "SHORTS") {
      router.replace(`/?category=${encodeURIComponent(cat)}`);
    }
  };

  const handleAddToCartClick = (product) => {
    router.push(`/product/${product._id || product.id}`);
  };

  const handleAdminAccess = async () => {
    const username = prompt("Enter Admin Username:");
    const password = prompt("Enter Admin Password:");
    if (!username || !password) return alert("Username and Password are required");

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("adminToken", data.token);
        window.location.href = "/admin";
      } else {
        alert("Access Denied");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying credentials");
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} font-sans`}>
      <div className="md:hidden">
        <Sidebar />
      </div>

      <div className="flex-grow p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto relative z-10">
        <header className="mb-6 px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 justify-center md:justify-start">
  <img
    src="/Fbpitch-shorts.png"
    alt="Fbpitch Logo"
    className="h-12 w-auto object-contain" // changed from h-20 to h-12
  />
</Link>


            <div className="relative w-full md:flex-1 md:-ml-2 md:mr-4">
  <input
    type="text"
    placeholder="Search shorts..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10 pr-4 py-2 rounded-full w-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
  />
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
</div>

            <div className="flex justify-end gap-4">
              <a href="https://www.instagram.com/fbpitch/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="p-2 border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Instagram size={20} />
                </Button>
              </a>

              <Button variant="outline" onClick={() => setDarkMode(!darkMode)} className="p-2 border dark:border-gray-600">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>

              <Button variant="outline" onClick={handleAdminAccess} className="p-2 border dark:border-gray-600">
                <Settings size={20} />
              </Button>

              <Link href="/cart">
                <Button className="flex items-center gap-2 p-2 border dark:border-gray-600">
                  <ShoppingCart size={20} />
                  <span className="font-semibold text-sm">{cart.length}</span>
                </Button>
              </Link>
            </div>
          </div>

          <section className="mt-4 mb-4 overflow-x-auto w-full md:mx-6">
            <div className="flex flex-nowrap gap-3 whitespace-nowrap pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-full border transition-colors duration-200 shrink-0 ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : darkMode
                      ? "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-400"
                  }`}
                  onClick={() => handleCategoryClick(cat)}
                  aria-pressed={selectedCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-6 md:px-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="border rounded-xl overflow-hidden animate-pulse bg-white dark:bg-gray-800 flex flex-col"
                >
                  <div className="h-64 bg-gray-300 dark:bg-gray-700" />
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4" />
                    </div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))
            : filteredShorts.length > 0
            ? filteredShorts.map((product) => (
                <div
                  key={product._id || product.id}
                  className={`border dark:border-gray-600 rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.03] transition-transform duration-300 cursor-pointer flex flex-col ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  }`}
                  onClick={() => handleAddToCartClick(product)}
                >
                  <img
                    src={product.shortsImage}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <h2 className="text-sm sm:text-base font-semibold mb-2 line-clamp-3">{product.name} Shorts</h2>
                    <p className="text-sm sm:text-lg mb-3">KD {Number(product.price).toFixed(3)}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCartClick(product);
                      }}
                      className="mt-auto bg-black text-white text-sm font-medium py-2 px-4 rounded hover:bg-gray-800 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            : <p>No shorts found.</p>}
        </section>

        <footer className="mt-16 text-center text-sm">
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-center">
            <div className="flex items-center gap-2">
              <Shirt size={18} /> Retro & Current Kits
            </div>
            <div className="flex items-center gap-2">
              <Globe size={18} /> Shipping Within Kuwait Only
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} /> Fast Delivery
            </div>
          </div>
          <p>&copy; 2025 Fbpitch. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
