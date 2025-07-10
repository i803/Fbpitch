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

  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);

  const [addressData, setAddressData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    postal: "",
    state: "Al Asimah",
  });

  const [formError, setFormError] = useState("");

  const promos = { FB10: 10 }; // Add more promos here as needed

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    const savedAddress = JSON.parse(localStorage.getItem("shippingAddress") || "{}");

    if (savedDarkMode === null) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      localStorage.setItem("darkMode", prefersDark.toString());
    } else {
      setDarkMode(savedDarkMode === "true");
    }

    setAddressData((prev) => ({ ...prev, ...savedAddress }));
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
      .catch(() => console.warn("Failed to fetch exchange rate"));
  }, []);

  const saveCartForUser = (updatedCart) => {
    if (username) localStorage.setItem(`cart-${username}`, JSON.stringify(updatedCart));
  };

  const totalKWDBeforeDiscount = cart.reduce((sum, item) => {
    const base = Number(item.price) || 0;
    const addon = item.quality === "Player Version" ? 1 : 0;
    return sum + base + addon;
  }, 0);

  const discountAmount = (totalKWDBeforeDiscount * promoDiscountPercent) / 100;
  const totalKWD = totalKWDBeforeDiscount - discountAmount;
  const totalUSD = (totalKWD * exchangeRate).toFixed(2);

  const handleRemoveItem = (idx) => {
    const updated = cart.filter((_, i) => i !== idx);
    setCart(updated);
    saveCartForUser(updated);
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    const discount = promos[code];
    if (!code || !discount) {
      setPromoError("Invalid or expired promo code.");
      setPromoDiscountPercent(0);
    } else {
      setPromoError("");
      setPromoDiscountPercent(discount);
    }
  };

  const validateForm = () => {
  // Trim phone before validation
  const phoneTrimmed = addressData.phone.trim();
  const { firstName, lastName, street, city, state } = addressData;

  if (!firstName || !lastName || !phoneTrimmed || !street || !city || !state) {
    setFormError("All required fields must be filled.");
    return false;
  }

  if (!/^(5|6|9)\d{7}$/.test(phoneTrimmed)) {
    setFormError("Phone must be a valid 8-digit Kuwait number.");
    return false;
  }

  setFormError("");
  // Save trimmed phone to localStorage and also update state to trimmed phone
  const newAddressData = { ...addressData, phone: phoneTrimmed };
  setAddressData(newAddressData);
  localStorage.setItem("shippingAddress", JSON.stringify(newAddressData));
  return true;
};

const handleClearCart = () => {
  setCart([]);
  if (username) localStorage.removeItem(`cart-${username}`);
};

const sendOrder = async (orderId, amount, method) => {
  try {
    const res = await fetch("/api/save-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        amount,
        customer: username,
        paymentMethod: method,
        promoCode: promoCode?.trim()?.toUpperCase() || null,
        discountPercent: promoDiscountPercent,
        address: addressData,
        items: cart,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Unknown server error");
    }

    handleClearCart();
    sessionStorage.setItem("orderSuccess", "true");
    window.location.href = "/thank-you";
  } catch (error) {
    console.error("Send order failed:", error);
    throw error;
  }
};



  const handleCOD = async () => {
  if (!username) return alert("Please login to place order.");
  if (!validateForm()) return;

  try {
    await sendOrder(`COD-${Date.now()}`, totalKWD.toFixed(3), "COD");
  } catch (err) {
    alert("An error occurred while placing your order: " + err.message);
  }
};


  if (!username) {
    return (
      <div className={`min-h-screen flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
        <Sidebar />
        <main className="flex-grow flex flex-col justify-center items-center p-6 md:ml-64">
          <p className="mb-4 text-lg text-center">
            Please <Link href="/signup" className="text-blue-600 underline">Sign up</Link> or log in to view your cart.
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
      <div
        className={`min-h-screen flex flex-col md:flex-row font-sans ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <Sidebar />

        <main className="flex-grow p-6 max-w-4xl mx-auto md:ml-64">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold">Your Cart</h1>
            <Link href="/">
              <Button variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                Continue Shopping
              </Button>
            </Link>
          </header>

          {loading ? (
            <Spinner />
          ) : cart.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Your cart is empty.</p>
          ) : (
            <>
              <ul className="space-y-6 mb-8">
                {cart.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-300 dark:border-gray-700 pb-5 gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-300 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 text-gray-500">
                          No Image
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-lg">{item.name}</p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {item.size || "N/A"}, {item.quality || "N/A"}
                        </p>
                        <p className="font-semibold dark:text-white mt-1">
                          KD {(Number(item.price) + (item.quality === "Player Version" ? 1 : 0)).toFixed(3)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="py-1 px-3 text-sm hover:bg-red-50 dark:hover:bg-red-900 text-red-600 border-red-600 hover:text-red-700"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>

              {/* Promo Code Section */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="text-xl font-semibold">
                  Total: KD {totalKWD.toFixed(3)}{" "}
                  {promoDiscountPercent > 0 && <span className="text-sm text-green-600">(Discount applied)</span>}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-grow sm:flex-grow-0 border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  <Button onClick={handleApplyPromo} className="py-2 px-6">
                    Apply
                  </Button>
                </div>
              </div>
              {promoError && <p className="text-red-500 mb-4">{promoError}</p>}
              {promoDiscountPercent > 0 && (
                <p className="text-green-600 mb-6 font-medium">Promo applied: {promoDiscountPercent}% off</p>
              )}

              {/* Address Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {/* Country - fixed */}
                <div>
                  <label htmlFor="country" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Country
                  </label>
                  <select
                    id="country"
                    className="w-full bg-gray-200 dark:bg-gray-700 cursor-not-allowed px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    disabled
                  >
                    <option>Kuwait</option>
                  </select>
                </div>

                {/* State dropdown */}
                <div>
                  <label htmlFor="state" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    State
                  </label>
                  <select
                    id="state"
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  >
                    <option>Al Asimah</option>
                    <option>Hawalli</option>
                    <option>Farwaniya</option>
                    <option>Mubarak Al-Kabeer</option>
                    <option>Ahmadi</option>
                    <option>Jahra</option>
                  </select>
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={addressData.firstName}
                    onChange={(e) => setAddressData({ ...addressData, firstName: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={addressData.lastName}
                    onChange={(e) => setAddressData({ ...addressData, lastName: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>

                {/* Phone */}
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Phone (e.g. 98765432)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Phone number"
                    value={addressData.phone}
                    onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label htmlFor="street" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Street address, apartment, suite, floor, etc
                  </label>
                  <input
                    id="street"
                    type="text"
                    placeholder="Street address"
                    value={addressData.street}
                    onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="City"
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label htmlFor="postal" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Postal Code (optional)
                  </label>
                  <input
                    id="postal"
                    type="text"
                    placeholder="Postal Code"
                    value={addressData.postal}
                    onChange={(e) => setAddressData({ ...addressData, postal: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>
              </div>

              {formError && <p className="text-red-500 mb-6 font-semibold">{formError}</p>}

              {/* Checkout Buttons */}
              <div className="space-y-5 max-w-md mx-auto">
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={(data, actions) =>
                    actions.order.create({ purchase_units: [{ amount: { value: totalUSD } }] })
                  }
                  onApprove={async (data, actions) => {
  try {
    const details = await actions.order.capture();
    if (!validateForm()) return;

    await sendOrder(details.id, details.purchase_units[0].amount.value, "PayPal");
  } catch (err) {
    alert("PayPal payment failed or was canceled: " + err.message);
  }
}}


                />
                <Button
                  onClick={handleCOD}
                  className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition"
                >
                  Cash on Delivery (COD)
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </PayPalScriptProvider>
  );
}
