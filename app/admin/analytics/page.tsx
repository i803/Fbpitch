"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    minAmount: "",
    customer: "",
  });

  const router = useRouter();

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    const verifyAdmin = async () => {
      try {
        const res = await fetch("/api/verify-admin", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Not admin");

        await res.json();

        fetchOrders(token);
        fetchProducts();
      } catch (err) {
        console.error("Admin verification failed", err);
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
      }
    };

    verifyAdmin();
  }, [router]);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async (
    token: string,
    customFilters: Record<string, string> = {}
  ) => {
    try {
      const params = new URLSearchParams(customFilters);
      const url =
        "/api/orders" + (params.toString() ? `?${params}` : "");

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

      const revenue = ordersList.reduce(
        (sum: number, order: any) =>
          sum + (Number(order.amount) || 0),
        0
      );

      setTotalRevenue(revenue);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      const productList = data.products || [];

      setProducts(productList);

      const counts = productList.reduce(
        (acc: Record<string, number>, p: any) => {
          if (!p.category) return acc;
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        },
        {}
      );

      setCategoryCounts(counts);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  /* ================= FILTERS ================= */
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const applyFilters = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchOrders(token, filters);
  };

  /* ================= DELETE ORDER ================= */
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

      setOrders((prev) => {
        const deleted = prev.find((o) => o._id === id);
        if (deleted) {
          setTotalRevenue((rev) =>
            Math.max(0, rev - (Number(deleted.amount) || 0))
          );
        }
        return prev.filter((o) => o._id !== id);
      });

      alert("Order deleted successfully");
    } catch (err) {
      console.error("Error deleting order", err);
    }
  };

  /* ================= UI ================= */
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Orders"
          value={orders.length}
          color="text-red-500"
        />
        <StatCard
          title="Total Revenue (KWD)"
          value={totalRevenue.toFixed(3)}
          color="text-green-400"
        />
        <StatCard
          title="Total Products"
          value={products.length}
          color="text-white"
        />
      </div>

      {/* Filters */}
      <div className="bg-gray-900 p-6 rounded-lg shadow mb-10 border-t-4 border-red-600">
        <h2 className="text-2xl font-bold mb-4">Filter Orders</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FilterInput label="Start Date" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          <FilterInput label="End Date" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          <FilterInput label="Min Amount (KWD)" type="number" name="minAmount" value={filters.minAmount} onChange={handleFilterChange} />
          <FilterInput label="Customer Name" type="text" name="customer" value={filters.customer} onChange={handleFilterChange} placeholder="Search by name" />
        </div>

        <button
          onClick={applyFilters}
          className="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Apply Filters
        </button>
      </div>

      {/* Category Stats */}
      <div className="bg-gray-900 p-6 rounded-lg shadow mb-10 border-t-4 border-white">
        <h2 className="text-2xl font-bold mb-4">
          Product Count by Category
        </h2>

        {Object.keys(categoryCounts).length === 0 ? (
          <p className="text-gray-400">No category data available.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <li key={cat} className="flex justify-between border-b border-gray-700 pb-2">
                <span className="capitalize">
                  {cat.replace(/-/g, " ")}
                </span>
                <span className="text-red-500 font-semibold">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Orders */}
      <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <p className="text-gray-400 col-span-full">
            No orders available.
          </p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-900 p-5 rounded-lg border-t-4 border-red-600 shadow hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold mb-2">
                  Customer: {order.customer || "Unknown"}
                </h3>

                <p className="text-gray-300">
                  Amount Paid: KD {(Number(order.amount) || 0).toFixed(3)}
                </p>

                <p className="text-gray-400 text-sm mb-2">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "N/A"}
                </p>

                {order.items?.length > 0 && (
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {order.items.map((item: any, i: number) => (
                      <li key={i}>
                        {item.name}
                        {item.size && ` - Size: ${item.size}`}
                        {item.quality && ` - Quality: ${item.quality}`}
                        {item.price &&
                          ` - KD ${(Number(item.price) || 0).toFixed(3)}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                onClick={() => deleteOrder(order._id)}
                className="mt-4 bg-red-700 hover:bg-red-800 px-3 py-2 rounded text-sm"
              >
                Delete Order
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg border-l-4 border-red-600 shadow">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
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
  return (
    <div>
      <label className="block mb-1 text-gray-300">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 rounded bg-black border focus:ring-2 focus:ring-red-600"
      />
    </div>
  );
}
