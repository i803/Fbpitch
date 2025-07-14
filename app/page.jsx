"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Instagram,
} from "lucide-react";

function Spinner() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent z-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// HeroBanner with no width limits on header and text container to remove "borders"
function HeroBanner({
  darkMode,
  setDarkMode,
  cartLength,
  searchTerm,
  setSearchTerm,
  handleAdminAccess,
  handleAddToCartClick,
  selectedCategory,
  setSelectedCategory,
  categories,
  onShopNowClick,
}) {
  return (
    <section
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-banner.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 px-4 md:px-8 py-4 md:py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between z-20 bg-transparent">

        {/* Logo + Search */}
        <div className="flex w-full items-center gap-3 md:flex-1">
          <Link href="/" 
          className="flex-shrink-0 ml-6 sm:ml-0"
          >
            <img
              src="/fbpitch-logo.png"
              alt="Fbpitch Logo"
              className="h-20 w-auto object-contain"
            />
          </Link>

          <div className="relative flex-grow">
            <input
              type="text"
  placeholder="Search kits..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onShopNowClick(); // scrolls to products
    }
  }}
              className="border border-white bg-black bg-opacity-30 rounded-full px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white placeholder-white"
              aria-label="Search kits"
            />
            <Search className="absolute left-3 top-2.5 text-white" size={18} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 flex-wrap md:flex-nowrap">
          <a
            href="https://www.instagram.com/fbpitch/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="p-2 border-white text-white hover:bg-indigo-700 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </Button>
          </a>

          <Button
            variant="outline"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 border-white text-white hover:bg-indigo-700 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <Button
            variant="outline"
            onClick={handleAdminAccess}
            className="p-2 border-white text-white hover:bg-indigo-700 transition-colors"
            aria-label="Admin Access"
          >
            <Settings size={20} />
          </Button>

          <Link href="/cart" aria-label="View cart">
            <Button className="flex items-center gap-2 p-2 border-white text-white hover:bg-indigo-700 transition-colors">
              <ShoppingCart size={20} />
              <span className="font-semibold text-sm">{cartLength}</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Text */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-6 z-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 leading-snug drop-shadow-lg">
          Discover the Latest Football Kits
        </h1>
        <p className="text-base sm:text-lg md:text-2xl mb-8 drop-shadow-md max-w-2xl">
          Shop the newest collections from top leagues and teams.
        </p>
        <button
          onClick={onShopNowClick}
          className="
            relative
            inline-flex
            items-center
            justify-center
            bg-white
            text-gray-800
            font-semibold
            px-8
            py-4
            rounded-lg
            shadow-md
            hover:bg-gray-100
            hover:text-gray-900
            hover:shadow-lg
            hover:scale-105
            transition
            transform
            duration-300
            ease-in-out
            focus:outline-none
            focus:ring-4
            focus:ring-gray-400
            focus:ring-opacity-50
            overflow-hidden
          "
          type="button"
          aria-label="Shop now"
        >
          Shop Now
        </button>
      </div>
    </section>
  );
}

export default function FootballKitStore() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
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
  ];

  // Ref for scrolling to products
  const productsRef = useRef(null);

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

const scrollToProducts = () => {
  if (!productsRef.current) return;

  // Calculate exact position of productsRef relative to the viewport
  // We'll scroll so productsRef's top aligns exactly to window top (offset 0)
  // If you have a fixed header, add its height here to offset accordingly
  const headerHeight = 0; // set to e.g. 80 if you have fixed header
  const targetY = productsRef.current.getBoundingClientRect().top + window.pageYOffset - headerHeight;

  const startY = window.pageYOffset;
  const distance = targetY - startY;
  const duration = 600; // scroll duration in ms
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = easeInOutQuad(progress);

    window.scrollTo(0, startY + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
};

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.products || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
        setLoading(false);
      }
    }

    fetchProducts();

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      const storedCart = JSON.parse(localStorage.getItem(`cart-${loggedInUser}`) || "[]");
      setCart(storedCart);
    } else {
      setCart([]);
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
    // Exclude shorts category
    let filtered = products.filter(
      (p) =>
        Array.isArray(p.categories) &&
        !p.categories.includes("SHORTS")
    );

    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(
        (p) =>
          Array.isArray(p.categories) &&
          p.categories.includes(selectedCategory)
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);

    // Sync category to URL (without adding history entry)
    const encodedCategory = encodeURIComponent(selectedCategory);
    const url = selectedCategory === "ALL" ? "/" : `/?category=${encodedCategory}`;
    router.replace(url, { scroll: false });
  }, [selectedCategory, searchTerm, products, router]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

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
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } font-sans`}
    >
      <HeroBanner
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        cartLength={cart.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleAdminAccess={handleAdminAccess}
        handleAddToCartClick={handleAddToCartClick}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onShopNowClick={scrollToProducts}
      />

      <div className="md:hidden">
        <Sidebar />
      </div>

      <div
        ref={productsRef}
        className="flex-grow p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto relative z-10"
      >
        {/* Suspense wrapper for searchParams handler */}
        <Suspense fallback={null}>
          <SearchParamHandler
            categories={categories}
            setSelectedCategory={setSelectedCategory}
          />
        </Suspense>

        {/* Category Bar */}
        <section className="overflow-x-auto px-4 pb-2">
          <div className="flex flex-nowrap gap-3 whitespace-nowrap">
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
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
              >
                {cat}
              </button>
            ))}

            <Link href="/shorts" passHref>
              <button
                className={`px-4 py-2 rounded-full border transition-colors duration-200 shrink-0 ${
                  darkMode
                    ? "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-400"
                }`}
              >
                SHORTS
              </button>
            </Link>
          </div>
        </section>

        {/* Products Grid */}
        <section className="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-6 md:px-8">
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
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product._id || product.id}
                className={`border dark:border-gray-600 rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.03] transition-transform duration-300 cursor-pointer flex flex-col ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
                onClick={() => handleAddToCartClick(product)}
              >
                <div className="relative w-full h-64 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Badges */}
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

                {/* Text content */}
                <div className="p-4 flex flex-col justify-between flex-grow ">
                  <h2 className="text-sm sm:text-base font-semibold mb-2 line-clamp-3">
                    {product.name}
                  </h2>
                  <p className="text-sm sm:text-lg mb-3">
                    KD {Number(product.price).toFixed(3)}
                  </p>

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
            <p className="text-center w-full">No products found.</p>
          )}
        </section>

        <footer className="mt-16 text-center text-sm">
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-center mb-2">
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

// SearchParamHandler: sets category from URL param once on mount
function SearchParamHandler({ categories, setSelectedCategory }) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category")?.toUpperCase() || "ALL";

  useEffect(() => {
    if (categories.includes(category)) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("ALL");
    }
    // Run only once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
