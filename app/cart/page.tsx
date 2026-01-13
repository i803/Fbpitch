"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css/pagination";
import { Header } from "@/components/header";
import type { CartItem } from "@/lib/types";

interface AddressData {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  postal: string;
  state: string;
}

interface PromoCodeMap {
  [key: string]: number;
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/* --------------------------
   ImageBlock (moved out of component for Sonar)
   -------------------------- */
function ImageBlock({
  item,
  uniqImages,
  isSelected,
  onToggleSelect,
}: Readonly<{
  item: any;
  uniqImages: string[];
  isSelected: boolean;
  onToggleSelect: () => void;
}>) {
  const imageWrapperBase =
    "relative cursor-pointer rounded-xl overflow-hidden bg-transparent transition-shadow";
  const imageWrapperRing = isSelected ? "ring-2 ring-primary" : "ring-0";

  if (uniqImages.length <= 1) {
    const src = uniqImages[0] || "/placeholder.svg";
    return (
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={onToggleSelect}
        className={`${imageWrapperBase} ${imageWrapperRing} w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0`}
        title={isSelected ? "Selected" : "Click to select"}
      >
        <img
          src={src}
          alt={item.productName || item.name || "Product"}
          className="block w-full h-full object-cover max-w-full"
          draggable={false}
          style={{ display: "block" }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onToggleSelect}
      className={`${imageWrapperBase} ${imageWrapperRing} w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 p-0`}
      title={isSelected ? "Selected" : "Click to select"}
    >
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
        style={{ margin: 0, padding: 0 }}
      >
        {uniqImages.map((src) => (
          <SwiperSlide key={`${item.id ?? "item"}-${encodeURIComponent(src)}`}>
            <img
              src={src || "/placeholder.svg"}
              alt={`${item.productName || item.name || "Product"}`}
              className="block w-full h-full object-cover max-w-full"
              draggable={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </button>
  );
}

/* --------------------------
   Main Cart Page
   -------------------------- */
export default function CartPage() {
  const [username, setUsername] = useState<string | null | undefined>(undefined);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [exchangeRate, setExchangeRate] = useState(3.25);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);

  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const [addressData, setAddressData] = useState<AddressData>({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    postal: "",
    state: "Al Asimah",
  });

  const [formError, setFormError] = useState("");

  const promos: PromoCodeMap = { FB10: 10 };

  useEffect(() => {
    try {
      const savedAddress = JSON.parse(localStorage.getItem("shippingAddress") || "{}");
      if (savedAddress && typeof savedAddress === "object") {
        setAddressData((prev) => ({ ...prev, ...savedAddress }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/KWD")
      .then((r) => r.json())
      .then((d) => {
        if (d?.rates?.USD) setExchangeRate(d.rates.USD);
      })
      .catch(() => console.warn("Failed to fetch exchange rate"));
  }, []);

  useEffect(() => {
    try {
      const loggedInUser = localStorage.getItem("loggedInUser");
      const savedCartCount = localStorage.getItem("cartItemCount");
      if (savedCartCount) setCartItemCount(Number.parseInt(savedCartCount));
      setUsername(loggedInUser);

      if (loggedInUser) {
        const raw = localStorage.getItem(`cart-${loggedInUser}`) || "[]";
        const storedCart = JSON.parse(raw);
        setCart(
          Array.isArray(storedCart)
            ? storedCart.map((item: CartItem) => ({
                ...item,
                price:
                  Number.parseFloat((item as any).price?.toString?.() || "0") || 0,
                quantity:
                  typeof (item as any).quantity === "number" &&
                  (item as any).quantity > 0
                    ? (item as any).quantity
                    : 1,
              }))
            : []
        );
      }
    } catch (e) {
      console.warn("Failed to load cart from localStorage", e);
      setUsername(null);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cartItemCount" && e.newValue)
        setCartItemCount(parseInt(e.newValue));
      if (e.key === "loggedInUser") setUsername(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveCartForUser = (updatedCart: CartItem[]) => {
    if (username) localStorage.setItem(`cart-${username}`, JSON.stringify(updatedCart));
  };

  // --------------------------
  // Helpers
  // --------------------------

  const getDisplayName = (item: any) =>
    item.productName || item.name || "Product";

  const getUniqueImagesForItem = (item: any): string[] => {
    if (Array.isArray(item.images) && item.images.length) {
      return Array.from(new Set(item.images.filter(Boolean)));
    }

    const candidates: string[] = [];
    const longImg = item.longSleevesImage;
    const shortsImg = item.shortsImage;
    const legacyMain = item.image;

    let jersey: string | undefined;
    if (item.sleeve === "Long Sleeve" && longImg) {
      jersey = longImg;
    } else if (legacyMain) {
      jersey = legacyMain;
    } else if (longImg) {
      jersey = longImg;
    } else if (shortsImg) {
      jersey = shortsImg;
    }

    if (jersey) candidates.push(jersey);

    const shortsRequested =
      item.addShorts === true ||
      item.shortsSelected === true ||
      item.shorts === true;

    if (shortsRequested && shortsImg && shortsImg !== jersey) {
      candidates.push(shortsImg);
    } else if (shortsImg && !candidates.includes(shortsImg)) {
      candidates.push(shortsImg);
    }

    return Array.from(new Set(candidates.filter(Boolean)));
  };

  const describeExtras = (item: any): string[] => {
    const lines: string[] = [];

    if (Array.isArray(item.patches) && item.patches.length) {
      lines.push(`Patches: ${item.patches.join(", ")}`);
    } else if (item.patches && typeof item.patches === "string") {
      lines.push(`Patches: ${item.patches}`);
    }

    const customName = item.customName ?? item.extraName ?? item.nameText;
    if (customName) lines.push(`Custom Name: ${customName}`);

    const customNumber = item.customNumber ?? item.extraNumber;
    if (customNumber) lines.push(`Custom Number: ${customNumber}`);

    if (item.sleeve === "Long Sleeve" || item.sleeves === "Long" || item.longSleeves) {
      lines.push("Long Sleeves");
    }

    if (item.addShorts === true || item.shortsSelected === true || item.shorts) {
      lines.push("Shorts");
    }

    if (Array.isArray(item.badges) && item.badges.length) {
      lines.push(`Badges: ${item.badges.join(", ")}`);
    } else if (item.badge) {
      lines.push(`Badge: ${item.badge}`);
    } else if (item.leagueBadge) {
      lines.push(`League Badge: ${item.leagueBadge}`);
    }

    if (Array.isArray(item.extras) && item.extras.length) {
      const labels = item.extras
        .map((x: any) => (typeof x === "string" ? x : x?.label))
        .filter(Boolean);
      if (labels.length) lines.push(`Extras: ${labels.join(", ")}`);
    }

    if (item.quality === "Player Version") lines.push("Player Version (+1 KD)");

    return lines;
  };

  const itemTotalKWD = (item: any): number => {
  const qty = typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1;
  return (item.price || 0) * qty; // do NOT add playerBump here
};


  const totalKWDBeforeDiscount = useMemo(
    () => cart.reduce((sum, item) => sum + itemTotalKWD(item), 0),
    [cart]
  );
  const discountAmount = (totalKWDBeforeDiscount * promoDiscountPercent) / 100;
  const totalKWD = totalKWDBeforeDiscount - discountAmount;
  const totalUSD = (totalKWD * exchangeRate).toFixed(2);

  // --------------------------
  // Actions
  // --------------------------

  const handleRemoveItem = (idx: number) => {
    const updated = cart.filter((_, i) => i !== idx);
    setCart(updated);
    saveCartForUser(updated);
    const newCount = Math.max(0, cartItemCount - 1);
    setCartItemCount(newCount);
    localStorage.setItem("cartItemCount", newCount.toString());
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    const discount = promos[code as keyof PromoCodeMap];
    if (!code || !discount) {
      setPromoError("Invalid or expired promo code.");
      setPromoDiscountPercent(0);
    } else {
      setPromoError("");
      setPromoDiscountPercent(discount);
      sessionStorage.setItem("appliedPromoCode", code);
      sessionStorage.setItem("appliedPromoPercent", String(discount));
    }
  };

  useEffect(() => {
    const code = sessionStorage.getItem("appliedPromoCode");
    const percent = sessionStorage.getItem("appliedPromoPercent");
    if (code && percent) {
      setPromoCode(code);
      setPromoDiscountPercent(parseInt(percent));
    }
  }, []);

  const validateForm = () => {
    const phoneTrimmed = addressData.phone.trim();
    const { firstName, lastName, street, city, state } = addressData;

    if (!firstName || !lastName || !phoneTrimmed || !street || !city || !state) {
      setFormError("All required fields must be filled.");
      return false;
    }

    if (!/^[569]\d{7}$/.test(phoneTrimmed)) {
      setFormError("Phone must be a valid 8-digit Kuwait number.");
      return false;
    }

    setFormError("");
    const newAddressData = { ...addressData, phone: phoneTrimmed };
    setAddressData(newAddressData);
    localStorage.setItem("shippingAddress", JSON.stringify(newAddressData));
    return true;
  };

  const handleClearCart = () => {
    setCart([]);
    setCartItemCount(0);
    localStorage.setItem("cartItemCount", "0");
    if (username) localStorage.removeItem(`cart-${username}`);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const sendOrder = async (orderId: string, amount: number, method: string) => {
    try {
      const userId = username ?? null;
      const payload = {
  orderId,
  userId,
  totalAmount: totalKWD,
  total: amount,
  totalKWD,
  customer: username,
  paymentMethod: method,
  promoCode: promoCode?.trim()?.toUpperCase() || null,
  discountPercent: promoDiscountPercent,
  address: addressData, // ✅ FIX
  items: cart,
};


      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Unknown server error");
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
      await sendOrder(`COD-${Date.now()}`, totalKWD, "COD");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      alert("An error occurred while placing your order: " + errorMessage);
    }
  };

  const updateQuantity = (idx: number, nextQty: number) => {
    if (nextQty < 1) return;
    const updated = cart.map((it, i) => (i === idx ? { ...it, quantity: nextQty } : it));
    setCart(updated);
    saveCartForUser(updated);
  };

  // --------------------------
  // Render
  // --------------------------

  if (loading || username === undefined) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header cartItemCount={cartItemCount} />
        <main className="flex-grow p-6 max-w-4xl mx-auto">
          <Spinner />
        </main>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header cartItemCount={cartItemCount} />
        <main className="flex-grow flex flex-col justify-center items-center p-6">
          <p className="mb-4 text-lg text-center">
            Please{" "}
            <Link href="/signup" className="text-blue-600 underline">
              Sign up
            </Link>{" "}
            or log in to view your cart.
          </p>
          <Link href="/signup">
            <Button>Go to Sign Up</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
      }}
    >
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header cartItemCount={cartItemCount} />

        <main className="flex-grow p-6 max-w-4xl mx-auto box-border">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold">Your Cart</h1>
            <Link href="/">
              <Button variant="outline" className="hover:bg-muted bg-transparent">
                Continue Shopping
              </Button>
            </Link>
          </header>

          {cart.length === 0 ? (
            <p className="text-muted-foreground">Your cart is empty.</p>
          ) : (
            <>
              <ul className="space-y-4 mb-8">
                {cart.map((item, idx) => {
                  const extras = describeExtras(item);
                  const perItemTotal = itemTotalKWD(item);
                  const isSelected = selectedIdx === idx;
                  const displayName = getDisplayName(item);
                  const uniqImages = getUniqueImagesForItem(item);
                  const itemKey =
                    (item as any).id || `${displayName}-${item.size || "N/A"}-${item.quality || "N/A"}-${idx}`;

                  return (
                    <li
                      key={itemKey}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted p-4 rounded-lg shadow-sm"
                    >
                      <div className="flex items-start gap-4 w-full sm:w-auto">
                        <ImageBlock
                          item={item}
                          uniqImages={uniqImages}
                          isSelected={isSelected}
                          onToggleSelect={() => setSelectedIdx((prev) => (prev === idx ? null : idx))}
                        />

                        <div className="pt-1">
                          <p className="font-semibold text-lg leading-tight break-words max-w-[18rem] sm:max-w-[28rem]">
                            {displayName}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {item.size || "N/A"}, {item.quality || "N/A"}
                          </p>

                          {extras.length > 0 && (
                            <ul className="mt-2 text-sm text-foreground/80 list-disc pl-5 space-y-1">
                              {extras.map((line, i) => (
                                <li key={i}>{line}</li>
                              ))}
                            </ul>
                          )}

                          <p className="font-semibold mt-2">
                            KD {(itemTotalKWD(item) / (item.quantity || 1)).toFixed(3)} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start sm:items-center gap-4 justify-between w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-background rounded px-2 py-1 border border-border">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(idx, (item.quantity || 1) - 1)}
                            className="px-2 py-1 text-lg select-none"
                          >
                            −
                          </button>
                          <div className="px-3">{item.quantity || 1}</div>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(idx, (item.quantity || 1) + 1)}
                            className="px-2 py-1 text-lg select-none"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold">KD {perItemTotal.toFixed(3)}</div>
                          <div className="mt-2 flex gap-2">
                            <Button
                              variant="outline"
                              className="py-1 px-3 text-sm hover:bg-red-50 text-red-600 border-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="text-xl font-semibold">
                  Total: KD {totalKWD.toFixed(3)}{" "}
                  {promoDiscountPercent > 0 && <span className="text-sm text-green-600">(Discount applied)</span>}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full sm:w-56 border border-border rounded px-4 py-2 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={handleApplyPromo} className="py-2 px-6 w-full sm:w-auto">
                    Apply
                  </Button>
                </div>
              </div>

              {promoError && <p className="text-red-500 mb-4">{promoError}</p>}
              {promoDiscountPercent > 0 && (
                <p className="text-green-600 mb-6 font-medium">Promo applied: {promoDiscountPercent}% off</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-muted p-6 rounded-lg shadow-md">
                <div>
                  <label htmlFor="country" className="block mb-2 font-semibold text-foreground">
                    Country
                  </label>
                  <select
                    id="country"
                    className="w-full bg-muted-foreground/20 cursor-not-allowed px-4 py-2 rounded border border-border text-foreground"
                    disabled
                  >
                    <option>Kuwait</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="state" className="block mb-2 font-semibold text-foreground">
                    State
                  </label>
                  <select
                    id="state"
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Al Asimah</option>
                    <option>Hawalli</option>
                    <option>Farwaniya</option>
                    <option>Mubarak Al-Kabeer</option>
                    <option>Ahmadi</option>
                    <option>Jahra</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="firstName" className="block mb-2 font-semibold text-foreground">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={addressData.firstName}
                    onChange={(e) => setAddressData({ ...addressData, firstName: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block mb-2 font-semibold text-foreground">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={addressData.lastName}
                    onChange={(e) => setAddressData({ ...addressData, lastName: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block mb-2 font-semibold text-foreground">
                    Phone (e.g. 98765432)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Phone number"
                    value={addressData.phone}
                    onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="street" className="block mb-2 font-semibold text-foreground">
                    Street address, apartment, suite, floor, etc
                  </label>
                  <input
                    id="street"
                    type="text"
                    placeholder="Street address"
                    value={addressData.street}
                    onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block mb-2 font-semibold text-foreground">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="City"
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="postal" className="block mb-2 font-semibold text-foreground">
                    Postal Code (optional)
                  </label>
                  <input
                    id="postal"
                    type="text"
                    placeholder="Postal Code"
                    value={addressData.postal}
                    onChange={(e) => setAddressData({ ...addressData, postal: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {formError && <p className="text-red-500 mb-6 font-semibold">{formError}</p>}

              <div className="max-w-2xl mx-auto w-full space-y-4">
                <div className="w-full bg-background p-4 rounded-lg border border-border">
                  <div className="mb-3 w-full">
                    <div className="w-full bg-card p-2 rounded-md shadow-sm">
                      <PayPalButtons
                        style={{
                          layout: "vertical",
                          tagline: false,
                          height: 48,
                        }}
                        createOrder={(data, actions) => {
                          if (!actions?.order) throw new Error("PayPal actions.order is undefined");
                          return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                              {
                                amount: {
                                  currency_code: "USD",
                                  value: totalUSD,
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          try {
                            if (!actions?.order) throw new Error("PayPal actions.order is undefined");
                            const details = await actions.order.capture();
                            if (!validateForm()) return;
                            const amountStr = details.purchase_units?.[0]?.amount?.value;
                            if (!amountStr) throw new Error("Payment amount not found");
                            const amountNum = Number.parseFloat(amountStr);
                            await sendOrder(details.id || "", amountNum, "PayPal");
                          } catch (err) {
                            const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
                            alert("PayPal payment failed or was canceled: " + errorMessage);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-border" />
                    <div className="text-sm text-muted-foreground px-2">or</div>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <Button
                    onClick={handleCOD}
                    className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition"
                  >
                    Cash on Delivery (COD)
                  </Button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </PayPalScriptProvider>
  );
}
