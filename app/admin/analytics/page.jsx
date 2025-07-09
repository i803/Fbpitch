"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    minAmount: "",
    customer: "",
  });

  const [darkMode, setDarkMode] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return router.push("/admin/login");

    fetchOrders(token);
    fetchProducts();

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  const fetchOrders = async (token, customFilters = {}) => {
    try {
      const params = new URLSearchParams(customFilters);
      const url = "/api/orders" + (params.toString() ? `?${params.toString()}` : "");

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Error fetching orders:", data.error || "Unknown error");
        return;
      }

      const data = await res.json();
      setOrders(data.orders || []);
      const revenue = (data.orders || []).reduce((sum, order) => sum + Number(order.amount), 0);
      setTotalRevenue(revenue);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      setProducts(data.products || []);

      const counts = {};
      (data.products || []).forEach((p) => {
        counts[p.category] = (counts[p.category] || 0) + 1;
      });
      setCategoryCounts(counts);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return router.push("/admin/login");
    fetchOrders(token, filters);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      } min-h-screen p-4 md:p-8 transition-colors duration-300`}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">Admin Analytics</h1>
        <button
          onClick={toggleDarkMode}
          className={`px-4 py-2 rounded ${
            darkMode
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-300 text-gray-800 hover:bg-gray-400"
          } transition`}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow hover:shadow-xl transition`}>
          <h3 className={`${darkMode ? "text-gray-200" : "text-gray-800"} text-xl font-semibold mb-2`}>Total Orders</h3>
          <p className="text-3xl font-bold text-indigo-600">{orders.length}</p>
        </div>

        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow hover:shadow-xl transition`}>
          <h3 className={`${darkMode ? "text-gray-200" : "text-gray-800"} text-xl font-semibold mb-2`}>
            Total Revenue (KWD)
          </h3>
          <p className="text-3xl font-bold text-green-600">{totalRevenue.toFixed(3)}</p>
        </div>

        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow hover:shadow-xl transition`}>
          <h3 className={`${darkMode ? "text-gray-200" : "text-gray-800"} text-xl font-semibold mb-2`}>Total Products</h3>
          <p className="text-3xl font-bold text-purple-600">{products.length}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow mb-10 space-y-4`}>
        <h2 className={`${darkMode ? "text-gray-200" : "text-gray-800"} text-2xl font-bold mb-4`}>Filter Orders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={`${darkMode ? "text-gray-300" : "text-gray-600"} block mb-1`}>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className={`border p-2 w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : ""}`}
            />
          </div>
          <div>
            <label className={`${darkMode ? "text-gray-300" : "text-gray-600"} block mb-1`}>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className={`border p-2 w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : ""}`}
            />
          </div>
          <div>
            <label className={`${darkMode ? "text-gray-300" : "text-gray-600"} block mb-1`}>Min Amount (KWD)</label>
            <input
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleFilterChange}
              className={`border p-2 w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : ""}`}
            />
          </div>
          <div>
            <label className={`${darkMode ? "text-gray-300" : "text-gray-600"} block mb-1`}>Customer Name</label>
            <input
              type="text"
              name="customer"
              value={filters.customer}
              onChange={handleFilterChange}
              placeholder="Search by name"
              className={`border p-2 w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : ""}`}
            />
          </div>
        </div>
        <button
          onClick={applyFilters}
          className={`mt-4 rounded px-4 py-2 transition ${
            darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          Apply Filters
        </button>
      </div>

      {/* Category Counts */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow mb-10`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
          Product Count by Category
        </h2>
        {Object.keys(categoryCounts).length === 0 ? (
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>No category data available.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <li
                key={category}
                className={`flex justify-between border-b pb-2 ${darkMode ? "border-gray-700" : "border-gray-300"}`}
              >
                <span className="capitalize">{category.replace(/-/g, " ")}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Orders List */}
      <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Recent Orders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} col-span-full`}>No orders available.</p>
        ) : (
          orders.map((order, idx) => (
            <div
              key={idx}
              className={`${
                darkMode ? "bg-gray-700 shadow-gray-900" : "bg-white shadow-md"
              } rounded-lg p-5 hover:shadow-xl transition`}
            >
              <h3 className={`${darkMode ? "text-gray-200" : "text-gray-800"} text-lg font-semibold mb-2`}>
                Customer: {order.customer}
              </h3>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>
                Amount Paid: KD {Number(order.amount).toFixed(3)}
              </p>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-sm mb-2`}>
                Order Date: {new Date(order.createdAt).toLocaleString()}
              </p>
              {order.items && order.items.length > 0 && (
                <div>
                  <h4 className={`${darkMode ? "text-gray-200" : "text-gray-800"} font-semibold mb-1`}>Products Ordered:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.name}
                        {item.size ? ` - Size: ${item.size}` : ""}
                        {item.quality ? ` - Quality: ${item.quality}` : ""}
                        {item.price ? ` - KD ${Number(item.price).toFixed(3)}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
