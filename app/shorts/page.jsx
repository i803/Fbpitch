"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import {
  Shirt,
  Globe,
  Clock,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

function Spinner() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent z-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function ShortsPage() {
  const [cart, setCart] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [filteredShorts, setFilteredShorts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("SHORTS");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showStickyTop, setShowStickyTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef(null);

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

  // Fetch shorts (products with shortsImage)
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

    // Load cart from localStorage
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      const storedCart = JSON.parse(localStorage.getItem(`cart-${loggedInUser}`) || "[]");
      setCart(storedCart);
    }

    // Dark mode setup (with system fallback)
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === null) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      localStorage.setItem("darkMode", prefersDark.toString());
    } else {
      setDarkMode(savedDarkMode === "true");
    }
  }, []);

  // Dark mode effect + localStorage sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Filter shorts by search term
  useEffect(() => {
    const filtered = shorts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredShorts(filtered);
  }, [searchTerm, shorts]);

  // Sticky header hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setShowStickyTop(currentY < lastScrollY || currentY < 50);
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Focus mobile search input when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Mobile search toggle handler
  const handleMobileSearchToggle = () => {
    setMobileSearchOpen(!isMobileSearchOpen);
  };

  // Mobile search submit handler
  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    setMobileSearchOpen(false);
    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  // Category click handler
  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat !== "SHORTS") {
      router.replace(`/?category=${encodeURIComponent(cat)}`);
    }
  };

  // Navigate to product page on click
  const handleAddToCartClick = (product) => {
    router.push(`/product/${product._id || product.id}`);
  };

  // Calculate total cart quantity
  const totalCartItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } font-sans`}
    >
      {/* Sidebar only on mobile */}
      <div className="md:hidden">
        <Sidebar />
      </div>

      <div className="flex-grow p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto relative z-10">
        {/* Sticky Header */}
        <div
          className={`sticky top-0 z-40 shadow-md transition-all duration-700 ease-in-out ${
            showStickyTop ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          } ${darkMode ? "bg-gray-900" : "bg-white"}`}
        >
          <header className="px-4 py-2 max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-3">

              {/* Logo */}
              <Link href="/" className="flex-shrink-0 flex items-center">
                <img
                  src="/fbpitch-logo.png"
                  alt="Fbpitch Logo"
                  className="h-12 w-auto object-contain"
                />
              </Link>

              {/* Search + Cart (big screens) */}
              <div className="hidden sm:flex items-center flex-grow mx-4 gap-4">
                <div className="relative flex-grow min-w-0">
                  <input
                    type="text"
                    placeholder="Search shorts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border dark:border-gray-600 rounded-full px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                </div>
                <Link
                  href="/cart"
                  aria-label="View Cart"
                  className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <ShoppingCart
                    size={24}
                    className={`${darkMode ? "text-white" : "text-gray-900"}`}
                  />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
              </div>

              {/* Search + Cart (small screens) */}
              <div className="sm:hidden flex items-center gap-2">
                <button
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
                  aria-label="Open search"
                  onClick={handleMobileSearchToggle}
                >
                  <Search
                    size={24}
                    className={`${darkMode ? "text-white" : "text-gray-900"}`}
                  />
                </button>
                <Link
                  href="/cart"
                  aria-label="View Cart"
                  className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
                >
                  <ShoppingCart
                    size={24}
                    className={`${darkMode ? "text-white" : "text-gray-900"}`}
                  />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-[9999] flex flex-col p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-200 text-xl font-semibold">Search Shorts</h2>
                  <button
                    className="text-gray-200"
                    aria-label="Close search"
                    onClick={handleMobileSearchToggle}
                  >
                    <X size={28} />
                  </button>
                </div>
                <form
                  onSubmit={handleMobileSearchSubmit}
                  className="flex-grow flex items-start"
                >
                  <input
                    type="search"
                    ref={mobileSearchInputRef}
                    placeholder="Search shorts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 text-gray-200 placeholder-gray-500 pb-1 focus:outline-none focus:border-white text-lg"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </form>
              </div>
            )}
          </header>

          {/* Categories */}
          <section className="overflow-x-auto px-4 pb-2">
            <div className="flex flex-nowrap gap-3 whitespace-nowrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-2 rounded-full border shrink-0 ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : darkMode
                      ? "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
              
            </div>
          </section>
        </div>

        {/* Products Grid */}
        <section className="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
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
          ) : filteredShorts.length > 0 ? (
            filteredShorts.map((product) => (
              <div
                key={product._id || product.id}
                className={`border dark:border-gray-600 rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.03] transition-transform duration-300 cursor-pointer flex flex-col ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
                onClick={() => handleAddToCartClick(product)}
              >
                <div className="relative w-full h-64 overflow-hidden">
                  <img
                    src={product.shortsImage}
                    alt={`${product.name} Shorts`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <h2 className="text-sm sm:text-base font-semibold mb-2 line-clamp-3">
                    {product.name} Shorts
                  </h2>
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
          ) : (
            <p>No shorts found.</p>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm">
          <div className="flex items-center gap-4 flex-wrap justify-center mb-2">
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
