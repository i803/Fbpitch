"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/button";
import {
  Settings,
  ShoppingCart,
  Shirt,
  Globe,
  Clock,
  Moon,
  Sun,
  Search,
} from "lucide-react";

// Simple spinner component
function Spinner() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent z-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function FootballKitStore() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state for spinner
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
        localStorage.setItem("products", JSON.stringify(data.products || []));
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
        setFilteredProducts([]);
        localStorage.setItem("products", JSON.stringify([]));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    const userToken = localStorage.getItem("userToken");
    const loggedInUser = localStorage.getItem("loggedInUser");
    setIsUserLoggedIn(!!userToken);

    if (loggedInUser) {
      const storedCart = JSON.parse(
        localStorage.getItem(`cart-${loggedInUser}`) || "[]"
      );
      setCart(storedCart);
    } else {
      setCart([]);
    }

    // Sync dark mode with system preference if no saved preference
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
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    let filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedCategory]);

  const handleAddToCartClick = (product) => {
    router.push(`/product/${product._id || product.id}`);
  };

  const handleAdminAccess = async () => {
    const username = prompt("Enter Admin Username:");
    const password = prompt("Enter Admin Password:");
    if (!username || !password)
      return alert("Username and Password are required");

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

  const categories = [
    "ALL",
    "NEW ARRIVALS",
    "RETRO",
    "SPECIAL KITS",
    "NATIONAL TEAM",
    "KITS FOR KIDS",
  ];

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } font-sans`}
    >
      <Sidebar />
      <div className="flex-grow p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto relative z-10">
        <header className="mb-6 px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 justify-center md:justify-start"
            >
              <img
                src="/fbpitch-logo.png"
                alt="Fbpitch Logo"
                className="h-10 sm:h-12 w-10 sm:w-12 object-contain"
              />
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide uppercase text-indigo-600 font-poppins">
                Fbpitch
              </h1>
            </Link>

            <div className="relative w-full md:flex-1 md:mx-6">
              <input
                type="text"
                placeholder="Search kits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border dark:border-gray-600 rounded-full px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>

              <Button
                variant="outline"
                onClick={handleAdminAccess}
                className="p-2 border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings size={20} />
              </Button>

              <Link href="/cart">
                <Button className="flex items-center gap-2 p-2 border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ShoppingCart size={20} />
                  <span className="font-semibold text-sm">{cart.length}</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="mb-6 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : darkMode
                  ? "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-400"
              }`}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <Spinner />
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product._id || product.id}
                className={`border dark:border-gray-600 rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.03] transition-transform duration-300 cursor-pointer ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
                onClick={() => handleAddToCartClick(product)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => e.key === "Enter" && handleAddToCartClick(product)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 sm:h-56 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                  <p className="text-lg mb-4">
                    KD {Number(product.price).toFixed(3)}
                  </p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCartClick(product);
                    }}
                    className="w-full bg-black text-white py-2 hover:bg-gray-800"
                  >
                    Customize & Add to Cart
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
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
