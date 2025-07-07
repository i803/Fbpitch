"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Button } from "../../components/ui/button";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";

function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [username, setUsername] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(3.25);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
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
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    setUsername(loggedInUser);

    if (loggedInUser) {
      const storedCart = JSON.parse(localStorage.getItem(`cart-${loggedInUser}`) || "[]");
      setCart(
        storedCart.map((item) => ({
          ...item,
          price: parseFloat(item.price) || 0,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/KWD")
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates?.USD) setExchangeRate(data.rates.USD);
      })
      .catch(() => console.warn("Failed to fetch live exchange rate; using default."));
  }, []);

  const totalKWD = cart.reduce((sum, item) => {
    const basePrice = Number(item.price) || 0;
    const playerAddon = item.quality === "Player Version" ? 1 : 0;
    return sum + basePrice + playerAddon;
  }, 0);

  const totalUSD = (totalKWD * exchangeRate).toFixed(2);

  const saveCartForUser = (updatedCart) => {
    if (username) {
      localStorage.setItem(`cart-${username}`, JSON.stringify(updatedCart));
    }
  };

  const handleClearCart = () => {
    setCart([]);
    saveCartForUser([]);
  };

  const handleRemoveItem = (index) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    saveCartForUser(updated);
  };

  if (!username) {
    return (
      <div className={`min-h-screen flex flex-col md:flex-row ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
        <Sidebar />
        <main className="flex-grow flex flex-col justify-center items-center p-6 md:ml-64">
          <p className="mb-4 text-lg text-center">
            Please{" "}
            <Link href="/signup" className="text-blue-600 underline">
              Sign up
            </Link>{" "}
            or log in to view your cart and checkout.
          </p>
          <Link href="/signup">
            <Button>Go to Sign Up</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
      <div className={`min-h-screen flex flex-col md:flex-row font-sans ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        <Sidebar />

        <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-4xl mx-auto md:ml-64">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold">Your Cart</h1>
            <Link href="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </header>

          {loading ? (
            <Spinner />
          ) : cart.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Your cart is empty.</p>
          ) : (
            <>
              <ul className="space-y-4 mb-8">
                {cart.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-500">
                          {item.size || "N/A"}, {item.quality || "N/A"}, {item.sleeve || "N/A"}
                        </p>
                        {item.patch && item.patch !== "N/A" && <p className="text-gray-500">Patch: {item.patch}</p>}
                        {item.customName && <p className="text-gray-500">Custom: {item.customName}</p>}
                        {item.instagram && <p className="text-gray-500">Instagram: {item.instagram}</p>}
                        <p className="text-gray-700 font-semibold dark:text-gray-200">
                          KD {(Number(item.price) + (item.quality === "Player Version" ? 1 : 0)).toFixed(3)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => handleRemoveItem(idx)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="text-xl font-semibold mb-6">Total: KD {totalKWD.toFixed(3)}</div>

              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={(data, actions) =>
                  actions.order.create({
                    purchase_units: [{ amount: { value: totalUSD } }],
                  })
                }
                onApprove={(data, actions) =>
                  actions.order.capture().then((details) => {
                    fetch("/api/save-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        orderId: details.id,
                        amount: details.purchase_units[0].amount.value,
                        customer: username,
                      }),
                    })
                      .then(() => {
                        handleClearCart();
                        window.location.href = "/thank-you";
                      })
                      .catch(() => {
                        alert("Failed to save order to database.");
                      });
                  })
                }
              />
            </>
          )}
        </main>
      </div>
    </PayPalScriptProvider>
  );
}
