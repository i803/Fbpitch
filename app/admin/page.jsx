"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/ui/button";
import { BarChart2, Mail, Edit2, Trash2 } from "lucide-react";

const LEAGUES = [
  "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1",
  "Champions League", "Europa League", "Saudi Pro League", "AFC Champions League", "International",
];

const PATCHES = {
  "Premier League": ["Champions League", "FA Cup", "Community Shield"],
  "La Liga": ["Champions League", "Copa del Rey"],
  "Serie A": ["Champions League", "Coppa Italia"],
  "Bundesliga": ["Champions League", "DFB Pokal"],
  "Ligue 1": ["Champions League", "Coupe de France"],
  "Champions League": ["UEFA Starball"],
  "Europa League": ["Europa Patch"],
  "Saudi Pro League": ["AFC Champions League"],
  "AFC Champions League": ["ACL Patch"],
  "International": ["World Cup", "EURO", "AFCON"],
};

const AVAILABLE_TAGS = [
  "Limited Edition",
  "Best Seller",
  "New Arrival",
  "Clearance",
  "Exclusive",
  "Kids",
  "Retro",
  "National Team",
  "Special Kit",
];

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    shortsImage: "",
    longSleevesImage: "",
    categories: [],
    league: "",
    patches: [],
    showShorts: false,
    showLongSleeves: false,
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingShortsImage, setUploadingShortsImage] = useState(false);
  const [uploadingLongSleevesImage, setUploadingLongSleevesImage] = useState(false);
  const [editId, setEditId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) return router.push("/admin/login");
    fetchProducts();
  }, [router]);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch");
      const { products } = await res.json();
      setProducts(products);
    } catch (err) {
      console.error(err);
      router.push("/admin/login");
    }
  }

  async function uploadToCloudinary(file) {
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!preset || !cloudName) {
      alert("Cloudinary config missing.");
      throw new Error("Cloudinary config missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload image");

    const data = await res.json();
    return data.secure_url;
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setNewProduct((p) => ({ ...p, image: url }));
    } catch (err) {
      alert("Image upload failed.");
      console.error(err);
    }
    setUploadingImage(false);
  }

  async function handleShortsImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingShortsImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setNewProduct((p) => ({ ...p, shortsImage: url }));
    } catch (err) {
      alert("Shorts image upload failed.");
      console.error(err);
    }
    setUploadingShortsImage(false);
  }

  async function handleLongSleevesImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLongSleevesImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setNewProduct((p) => ({ ...p, longSleevesImage: url }));
    } catch (err) {
      alert("Long sleeves image upload failed.");
      console.error(err);
    }
    setUploadingLongSleevesImage(false);
  }

  async function handleAddOrUpdate() {
    const {
      name,
      price,
      image,
      shortsImage,
      longSleevesImage,
      categories,
      league,
      patches,
      showShorts,
      showLongSleeves,
      tags,
    } = newProduct;

    if (!name || !price || !image || !categories.length || !league)
      return alert("Please fill all required fields.");

    setLoading(true);

    const body = {
      name,
      price: parseFloat(price),
      image,
      shortsImage: typeof shortsImage === "string" ? shortsImage : "",
      longSleevesImage: typeof longSleevesImage === "string" ? longSleevesImage : "",
      categories,
      league,
      patches: Array.isArray(patches) ? patches : [],
      showShorts: !!showShorts,
      showLongSleeves: !!showLongSleeves,
      tags: Array.isArray(tags) ? tags : [],
      ...(editId ? { id: editId } : {}),
    };

    const res = await fetch("/api/products", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      setNewProduct({
        name: "",
        price: "",
        image: "",
        shortsImage: "",
        longSleevesImage: "",
        categories: [],
        league: "",
        patches: [],
        showShorts: false,
        showLongSleeves: false,
        tags: [],
      });
      setEditId(null);
      fetchProducts();
    } else {
      alert("Error saving product.");
    }
  }

  function startEdit(prod) {
    setNewProduct({
      name: prod.name || "",
      price: prod.price?.toString() || "",
      image: prod.image || "",
      shortsImage: prod.shortsImage || "",
      longSleevesImage: prod.longSleevesImage || "",
      categories: Array.isArray(prod.categories) ? prod.categories : [],
      league: prod.league || "",
      patches: Array.isArray(prod.patches) ? prod.patches : [],
      showShorts: !!prod.showShorts,
      showLongSleeves: !!prod.showLongSleeves,
      tags: Array.isArray(prod.tags) ? prod.tags : [],
    });
    setEditId(prod._id);
  }

  // ====== TAGS input handlers with dropdown =======

  function handleAddTagFromDropdown(e) {
    const selectedTag = e.target.value;
    if (selectedTag && !newProduct.tags.includes(selectedTag)) {
      setNewProduct((p) => ({
        ...p,
        tags: [...p.tags, selectedTag],
      }));
    }
    // Reset dropdown to default option after selection
    e.target.value = "";
  }

  function handleRemoveTag(tagToRemove) {
    setNewProduct((p) => ({
      ...p,
      tags: p.tags.filter((t) => t !== tagToRemove),
    }));
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-grow p-8 max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-3 text-indigo-600 hover:opacity-80">
            <img src="/fbpitch-logo.png" alt="Logo" className="h-12 w-12" />
            <h1 className="text-4xl font-extrabold uppercase">Fbpitch Admin</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => router.push("/admin/analytics")}
            >
              <BarChart2 size={16} />
              Analytics
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              onClick={() => router.push("/admin/contact-messages")}
            >
              <Mail size={16} />
              Messages
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                localStorage.removeItem("adminToken");
                router.push("/admin/login");
              }}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Add/Edit Product Form */}
        <section className="bg-white p-8 rounded-xl shadow-md max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">{editId ? "Edit Product" : "Add New Product"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Name"
              value={newProduct.name}
              onChange={(v) => setNewProduct((p) => ({ ...p, name: v }))}
              required
            />
            <Input
              label="Price (KWD)"
              type="number"
              value={newProduct.price}
              onChange={(v) => setNewProduct((p) => ({ ...p, price: v }))}
              required
              min="0"
              step="0.001"
            />

            {/* Jersey Image Upload */}
            <div className="flex flex-col">
              <label className="font-medium mb-1">
                Jersey Image <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="border border-gray-300 rounded-md p-2 cursor-pointer"
              />
              {uploadingImage && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              {newProduct.image && !uploadingImage && (
                <img
                  src={newProduct.image}
                  alt="Jersey Image"
                  className="mt-2 h-32 w-32 object-contain rounded border border-gray-300"
                />
              )}
            </div>

            {/* Long Sleeves Image Upload */}
            <div className="flex flex-col">
              <label className="font-medium mb-1">Long Sleeves Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLongSleevesImageUpload}
                disabled={uploadingLongSleevesImage}
                className="border border-gray-300 rounded-md p-2 cursor-pointer"
              />
              {uploadingLongSleevesImage && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              {newProduct.longSleevesImage && !uploadingLongSleevesImage && (
                <img
                  src={newProduct.longSleevesImage}
                  alt="Long Sleeves"
                  className="mt-2 h-32 w-32 object-contain rounded border border-gray-300"
                />
              )}
            </div>

            {/* Shorts Image Upload */}
            <div className="flex flex-col">
              <label className="font-medium mb-1">Shorts Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleShortsImageUpload}
                disabled={uploadingShortsImage}
                className="border border-gray-300 rounded-md p-2 cursor-pointer"
              />
              {uploadingShortsImage && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              {newProduct.shortsImage && !uploadingShortsImage && (
                <img
                  src={newProduct.shortsImage}
                  alt="Shorts Image"
                  className="mt-2 h-32 w-32 object-contain rounded border border-gray-300"
                />
              )}
            </div>

            {/* Multi-category checkboxes */}
            <div className="col-span-full">
              <div className="font-medium mb-2">Categories</div>
              <div className="flex flex-wrap gap-4">
                {["NEW ARRIVALS", "SPECIAL KITS", "RETRO", "NATIONAL TEAM", "KITS FOR KIDS"].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newProduct.categories.includes(cat)}
                      onChange={() =>
                        setNewProduct((p) => ({
                          ...p,
                          categories: p.categories.includes(cat)
                            ? p.categories.filter((c) => c !== cat)
                            : [...p.categories, cat],
                        }))
                      }
                      className="cursor-pointer"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <Select
              label="League"
              options={LEAGUES}
              value={newProduct.league}
              onChange={(v) => setNewProduct((p) => ({ ...p, league: v, patches: [] }))}
              required
            />

            {/* Patches checkboxes, shown only if league selected */}
            {!!newProduct.league && (
              <div className="col-span-full">
                <div className="font-medium mb-2">Patches</div>
                <div className="flex flex-wrap gap-4">
                  {PATCHES[newProduct.league]?.map((patch) => (
                    <label
                      key={patch}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={newProduct.patches.includes(patch)}
                        onChange={() =>
                          setNewProduct((p) => ({
                            ...p,
                            patches: p.patches.includes(patch)
                              ? p.patches.filter((x) => x !== patch)
                              : [...p.patches, patch],
                          }))
                        }
                        className="cursor-pointer"
                      />
                      {patch}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tags dropdown input */}
            <div className="col-span-full">
              <label className="font-medium mb-2">Tags</label>

              {/* Selected tags as pills */}
              <div className="flex flex-wrap gap-2 mb-2">
                {newProduct.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-white hover:text-indigo-300 font-bold"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Dropdown to add tags */}
              <select
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                onChange={handleAddTagFromDropdown}
                value=""
                aria-label="Select tag to add"
              >
                <option value="" disabled>
                  Select a tag to add
                </option>
                {AVAILABLE_TAGS.filter((tag) => !newProduct.tags.includes(tag)).map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Show Shorts checkbox */}
            <label className="col-span-full flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newProduct.showShorts}
                onChange={(e) => setNewProduct((p) => ({ ...p, showShorts: e.target.checked }))}
                className="cursor-pointer"
              />
              Show Shorts?
            </label>

            {/* Show Long Sleeves checkbox */}
            <label className="col-span-full flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newProduct.showLongSleeves}
                onChange={(e) => setNewProduct((p) => ({ ...p, showLongSleeves: e.target.checked }))}
                className="cursor-pointer"
              />
              Show Long Sleeves?
            </label>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setNewProduct({
                  name: "",
                  price: "",
                  image: "",
                  shortsImage: "",
                  longSleevesImage: "",
                  categories: [],
                  league: "",
                  patches: [],
                  showShorts: false,
                  showLongSleeves: false,
                  tags: [],
                });
                setEditId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddOrUpdate}
              disabled={loading || uploadingImage || uploadingShortsImage || uploadingLongSleevesImage}
            >
              {loading ? "Saving..." : editId ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </section>

        {/* Products Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((prod) => (
            <div
              key={prod._id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col"
            >
              <img
                src={prod.image}
                alt={prod.name}
                className="h-44 w-full object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold">{prod.name}</h3>
              <p className="text-gray-700">KWD {prod.price.toFixed(3)}</p>
              <p className="text-sm text-gray-500 mt-2">League: {prod.league || "N/A"}</p>
              <p className="text-sm text-gray-500">
                Categories: {Array.isArray(prod.categories) ? prod.categories.join(", ") : ""}
              </p>
              <p className="text-sm text-gray-500">
                Tags: {Array.isArray(prod.tags) && prod.tags.length ? prod.tags.join(", ") : "None"}
              </p>

              <div className="mt-auto flex gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => startEdit(prod)}
                >
                  <Edit2 size={14} /> Edit
                </Button>
                {/* Add Delete button and other controls if needed */}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false, ...props }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        required={required}
        {...props}
      />
    </label>
  );
}

function Select({ label, options, value, onChange, required = false }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <select
        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
