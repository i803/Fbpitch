"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function ProductDetails({ params }) {
  const { id } = params;
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [quality, setQuality] = useState("");
  const [sleeve, setSleeve] = useState("");
  const [patch, setPatch] = useState("N/A");
  const [customName, setCustomName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [addShorts, setAddShorts] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        const found = data.products.find((p) => p._id === id);

        if (found) setProduct(found);
        else {
          alert("Product not found");
          router.push("/");
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        alert("Error loading product");
        router.push("/");
      } finally {
        setLoadingProduct(false);
      }
    }

    fetchProduct();
  }, [id, router]);

  // Detect if this product is in "KITS FOR KIDS" category
  const isKidsKit = product?.categories?.includes("KITS FOR KIDS");

  // Sizes for adults and kids
  const adultSizes = ["S", "M", "L", "XL", "2XL"];
  const kidsSizes = [
  { label: "16 (3-4 years)", value: "16" },
  { label: "18 (4-5 years)", value: "18" },
  { label: "20 (5-6 years)", value: "20" },
  { label: "22 (7-8 years)", value: "22" },
  { label: "24 (9-10 years)", value: "24" },
  { label: "26 (11-12 years)", value: "26" },
  { label: "28 (12-13 years)", value: "28" },
];


  // Available patches array (safe fallback)
  const availablePatches = Array.isArray(product?.patches) ? product.patches : [];

  // Validation for adults
  const validateInputs = () => {
    if (!size) return "Please select a size.";
    if (!quality) return "Please select a quality.";
    if (product?.showLongSleeves && !sleeve) return "Please select a sleeve length.";
    if (!instagram.trim() || !instagram.trim().startsWith("@"))
      return "Please enter a valid Instagram handle starting with @.";
    if (/\s/.test(instagram.trim()))
      return "Instagram handle cannot contain spaces.";
    return null;
  };

  // Validation for kids kits (simpler)
  const validateKidsInputs = () => {
    if (!size) return "Please select a size.";
    if (!instagram.trim() || !instagram.trim().startsWith("@"))
      return "Please enter a valid Instagram handle starting with @.";
    if (/\s/.test(instagram.trim()))
      return "Instagram handle cannot contain spaces.";
    return null;
  };

  // Calculate price for adults
  const calculatePrice = () => {
    if (!product) return "0.000";
    let extra = 0;
    if (sleeve === "Long Sleeve") extra += 0.5;
    if (patch !== "N/A") extra += 0.5;
    if (customName.trim()) extra += 1;
    if (quality === "Player Version") extra += 1;
    if (addShorts) extra += 2;
    return (Number(product.price) + extra).toFixed(3);
  };

  // Fixed price for kids kits
  const kidsPrice = 8.5;

  // Add to cart for adults
  const addToCart = () => {
    const error = validateInputs();
    if (error) return alert(error);

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      alert("Please log in to add items to your cart.");
      router.push("/login");
      return;
    }

    setAddingToCart(true);

    const newItem = {
      ...product,
      size,
      quality,
      sleeve,
      patch,
      customName,
      instagram,
      addShorts,
      price: Number(calculatePrice()),
      image: product.image,
      longSleevesImage: product.longSleevesImage || null,
      shortsImage: product.shortsImage || null,
    };

    const cartKey = `cart-${loggedInUser}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    cart.push(newItem);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setAddingToCart(false);
    router.push("/cart");
  };

  // Add to cart for kids kits
  const addToCartKids = () => {
    const error = validateKidsInputs();
    if (error) return alert(error);

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      alert("Please log in to add items to your cart.");
      router.push("/login");
      return;
    }

    setAddingToCart(true);

    const basePrice = kidsPrice;
    const extraForCustomName = customName.trim() ? 1 : 0;

    const newItem = {
      ...product,
      size,
      quality: "Kids",
      sleeve: null,
      patch: null,
      customName: customName.trim(),
      instagram,
      addShorts: false,
      price: basePrice + extraForCustomName,
      image: product.image,
      longSleevesImage: null,
      shortsImage: null,
    };

    const cartKey = `cart-${loggedInUser}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    cart.push(newItem);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setAddingToCart(false);
    router.push("/cart");
  };

  if (loadingProduct) return <p className="text-center mt-10">Loading product...</p>;
  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 flex flex-col md:flex-row gap-10">
      {/* Image Gallery */}
      <div className="w-full md:w-1/2">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={10}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-lg border !pb-8"
        >
          {product.image && (
            <SwiperSlide>
              <img
                src={product.image}
                alt="Short Sleeve"
                className="w-full h-full object-contain rounded-md"
              />
            </SwiperSlide>
          )}
          {product.longSleevesImage && (
            <SwiperSlide>
              <img
                src={product.longSleevesImage}
                alt="Long Sleeve"
                className="w-full h-full object-contain rounded-md"
              />
            </SwiperSlide>
          )}
          {product.shortsImage && (
            <SwiperSlide>
              <img
                src={product.shortsImage}
                alt="Shorts"
                className="w-full h-full object-contain rounded-md"
              />
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* Product Details */}
      <div className="w-full md:w-1/2 space-y-6">
        <h1 className="text-3xl font-bold">{product.name}</h1>

        {isKidsKit ? (
          <>
            {/* Kids Size Selector (Dropdown) */}
            <div>
              <label className="block mb-1 font-semibold">Kids Size *</label>
              <select
  value={size}
  onChange={(e) => setSize(e.target.value)}
  className="w-full border rounded-md p-2"
>
  <option value="">Select size</option>
  {kidsSizes.map(({ label, value }) => (
    <option key={value} value={value}>
      {label}
    </option>
  ))}
</select>

            </div>

            {/* Custom Name & Number (Optional) +1 KWD */}
            <div>
              <label className="block mb-1 font-semibold">
                Custom Name & Number (Optional) +1 KWD
              </label>
              <input
                type="text"
                placeholder="Enter Name/Number"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>

            {/* Instagram Handle */}
            <div>
              <label className="block mb-1 font-semibold">Instagram Handle *</label>
              <input
                type="text"
                placeholder="@yourhandle"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>

            {/* Fixed Price & Add to Cart */}
            <div className="pt-4 border-t">
              <p className="mb-3 text-lg font-semibold">
                KD {(kidsPrice + (customName.trim() ? 1 : 0)).toFixed(3)}
              </p>
              <button
                onClick={addToCartKids}
                disabled={addingToCart}
                className={`w-full py-3 rounded-md font-semibold transition ${
                  addingToCart ? "bg-gray-600 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Adult Sizes */}
            <div>
              <label className="block mb-1 font-semibold">Size *</label>
              <div className="flex gap-3 flex-wrap">
                {adultSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-full border font-semibold transition-colors ${
                      size === s
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div>
              <label className="block mb-1 font-semibold">Quality *</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="">Select</option>
                <option value="Fan Version">Fan Version</option>
                <option value="Player Version">Player Version +1 KWD</option>
              </select>
            </div>

            {/* Sleeve */}
            {product.showLongSleeves && (
              <div>
                <label className="block mb-1 font-semibold">Sleeve Length *</label>
                <select
                  value={sleeve}
                  onChange={(e) => setSleeve(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select</option>
                  <option value="Short Sleeve">Short Sleeve</option>
                  <option value="Long Sleeve">Long Sleeve +500 fils</option>
                </select>
              </div>
            )}

            {/* Patch */}
            {availablePatches.length > 0 && (
              <div>
                <label className="block mb-1 font-semibold">Patch (Optional)</label>
                <select
                  value={patch}
                  onChange={(e) => setPatch(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="N/A">N/A</option>
                  {availablePatches.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p} +500 fils
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Name */}
            <div>
              <label className="block mb-1 font-semibold">Custom Name & Number (Optional) +1 KWD</label>
              <input
                type="text"
                placeholder="Enter Name/Number"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>

            {/* Shorts */}
            {product.showShorts && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addShorts"
                  checked={addShorts}
                  onChange={(e) => setAddShorts(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="addShorts" className="font-semibold">
                  Add Matching Shorts +2 KWD
                </label>
              </div>
            )}

            {/* Instagram */}
            <div>
              <label className="block mb-1 font-semibold">Instagram Handle *</label>
              <input
                type="text"
                placeholder="@yourhandle"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>

            {/* Price & Add to Cart */}
            <div className="pt-4 border-t">
              <p className="mb-3 text-lg font-semibold">KD {calculatePrice()}</p>
              <button
                onClick={addToCart}
                disabled={addingToCart}
                className={`w-full py-3 rounded-md font-semibold transition ${
                  addingToCart ? "bg-gray-600 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
