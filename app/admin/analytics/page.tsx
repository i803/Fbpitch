"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    minAmount: "",
    customer: "",
  });

  const router = useRouter();

  // ✅ Auth Guard
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchOrders(token);
    fetchProducts();
  }, [router]);

  // ✅ Fetch Orders (with optional filters)
  const fetchOrders = async (token: string, customFilters: Record<string, string> = {}) => {
    try {
      const params = new URLSearchParams(customFilters);
      const url = "/api/orders" + (params.toString() ? `?${params}` : "");

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Error fetching orders:", await res.text());
        return;
      }

      const data = await res.json();
      const ordersList = data.orders || [];
      setOrders(ordersList);

      // ✅ Safe revenue calculation
      const revenue = ordersList.reduce((sum: number, order: any) => {
        return sum + (Number(order.amount) || 0);
      }, 0);
      setTotalRevenue(revenue);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  // ✅ Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      const productList = data.products || [];
      setProducts(productList);

      const counts = productList.reduce((acc: Record<string, number>, p: any) => {
        if (!p.category) return acc;
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});
      setCategoryCounts(counts);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  // ✅ Filters
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchOrders(token, filters);
  };

  // ✅ Delete Order
  const deleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Error deleting order:", await res.text());
        return;
      }

      // Update state
      setOrders((prev) => prev.filter((o) => o._id !== id));
      setTotalRevenue((prev) => {
        const deletedOrder = orders.find((o) => o._id === id);
        return deletedOrder ? prev - (Number(deletedOrder.amount) || 0) : prev;
      });

      alert("Order deleted successfully");
    } catch (err) {
      console.error("Error deleting order", err);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
      onClick={() => router.push("/admin")}
      className="text-3xl font-bold text-red-600"
    >
      Admin Analytics
    </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Orders" value={orders.length} color="text-red-500" />
        <StatCard title="Total Revenue (KWD)" value={totalRevenue.toFixed(3)} color="text-green-400" />
        <StatCard title="Total Products" value={products.length} color="text-white" />
      </div>

      {/* Filter Controls */}
      <div className="bg-gray-900 p-6 rounded-lg shadow mb-10 space-y-4 border-t-4 border-red-600">
        <h2 className="text-2xl font-bold mb-4 text-white">Filter Orders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FilterInput label="Start Date" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          <FilterInput label="End Date" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          <FilterInput label="Min Amount (KWD)" type="number" name="minAmount" value={filters.minAmount} onChange={handleFilterChange} />
          <FilterInput label="Customer Name" type="text" name="customer" value={filters.customer} onChange={handleFilterChange} placeholder="Search by name" />
        </div>
        <button
          onClick={applyFilters}
          className="mt-4 rounded px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition"
        >
          Apply Filters
        </button>
      </div>

      {/* Category Counts */}
      <div className="bg-gray-900 p-6 rounded-lg shadow mb-10 border-t-4 border-white">
        <h2 className="text-2xl font-bold mb-4 text-white">Product Count by Category</h2>
        {Object.keys(categoryCounts).length === 0 ? (
          <p className="text-gray-400">No category data available.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <li key={category} className="flex justify-between border-b pb-2 border-gray-700">
                <span className="capitalize">{category.replace(/-/g, " ")}</span>
                <span className="font-semibold text-red-500">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Orders List */}
      <h2 className="text-2xl font-bold mb-4 text-white">Recent Orders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <p className="text-gray-400 col-span-full">No orders available.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-900 shadow-md rounded-lg p-5 border-t-4 border-red-600 hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Customer: {order.customer || "Unknown"}
                </h3>
                <p className="text-gray-300 mb-1">
                  Amount Paid: KD {(Number(order.amount) || 0).toFixed(3)}
                </p>
                <p className="text-gray-400 text-sm mb-2">
                  Order Date:{" "}
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                </p>

                {order.items?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1 text-white">Products Ordered:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {order.items.map((item: any) => (
                        <li key={item._id || `${item.name}-${item.size || ""}-${item.quality || ""}`}>
                          {item.name}
                          {item.size ? ` - Size: ${item.size}` : ""}
                          {item.quality ? ` - Quality: ${item.quality}` : ""}
                          {item.price ? ` - KD ${(Number(item.price) || 0).toFixed(3)}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* --- Subcomponents --- */
function StatCard({ title, value, color }: { title: string; value: string | number; color?: string }) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow hover:shadow-xl transition border-l-4 border-red-600">
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function FilterInput({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  const id = `filter-${name}`;
  return (
    <div>
      <label htmlFor={id} className="text-gray-300 block mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border p-2 w-full rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-red-600"
      />
    </div>
  );
}
