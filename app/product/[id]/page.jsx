"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const found = data.products.find((p) => p._id === id || String(p.id) === id);

        if (found) setProduct(found);
        else {
          alert("Product not found");
          router.push("/");
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        alert("Error loading product");
        router.push("/");
      }
    }

    fetchProduct();
  }, [id, router]);

  const validateInputs = () => {
    if (!size) return "Please select a size.";
    if (!quality) return "Please select a quality.";
    if (!sleeve) return "Please select a sleeve length.";
    if (!instagram.trim() || !instagram.startsWith("@"))
      return "Please enter a valid Instagram handle starting with @.";
    return null;
  };

  const calculatePrice = () => {
    let extra = 0;
    if (sleeve === "Long Sleeve") extra += 0.5;
    if (patch !== "N/A") extra += 0.5;
    if (customName.trim()) extra += 1;
    if (quality === "Player Version") extra += 1;
    if (addShorts) extra += 2; // shorts cost 2 KWD

    return (Number(product.price) + extra).toFixed(3);
  };

  const addToCart = () => {
    const error = validateInputs();
    if (error) return alert(error);

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      alert("Please log in to add items to your cart.");
      router.push("/login");
      return;
    }

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
    };

    const cartKey = `cart-${loggedInUser}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    cart.push(newItem);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    router.push("/cart");
  };

  if (!product) return null;

  const availablePatches = product.patches || [];
  const sizes = ["S", "M", "L", "XL", "2XL"];

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <img src={product.image} alt={product.name} className="w-full h-56 object-cover mb-6 rounded-md" />

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Size *</label>
        <div className="flex gap-3 flex-wrap">
          {sizes.map((s) => (
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

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Quality *</label>
        <select
          className="border rounded-md w-full p-2"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
        >
          <option value="">Select</option>
          <option value="Fan Version">Fan Version</option>
          <option value="Player Version">Player Version +1 KWD</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Sleeve Length *</label>
        <select
          className="border rounded-md w-full p-2"
          value={sleeve}
          onChange={(e) => setSleeve(e.target.value)}
        >
          <option value="">Select</option>
          <option value="Short Sleeve">Short Sleeve</option>
          <option value="Long Sleeve">Long Sleeve +500 fils</option>
        </select>
      </div>

      {availablePatches.length > 0 && (
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Patch (Optional)</label>
          <select
            className="border rounded-md w-full p-2"
            value={patch}
            onChange={(e) => setPatch(e.target.value)}
          >
            <option value="N/A">N/A</option>
            {availablePatches.map((patchOption, idx) => (
              <option key={idx} value={patchOption}>
                {patchOption} +500 fils
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Custom Name & Number (Optional) +1KWD</label>
        <input
          type="text"
          className="border rounded-md w-full p-2"
          placeholder="Enter Name/Number"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
        />
      </div>

      {product.showShorts && (
        <div className="mb-6 flex items-center gap-2">
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

      <div className="mb-6">
        <label className="block mb-1 font-semibold">Instagram Handle *</label>
        <input
          type="text"
          className="border rounded-md w-full p-2"
          placeholder="@yourhandle"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
      </div>

      <button
        onClick={addToCart}
        className="bg-black text-white w-full py-3 rounded-md font-semibold hover:bg-gray-800 transition"
      >
        Add to Cart - KD {calculatePrice()}
      </button>
    </div>
  );
}
