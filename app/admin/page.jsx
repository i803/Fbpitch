"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/ui/button";
import { BarChart2, Mail, Edit2, Trash2 } from "lucide-react";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "NEW ARRIVALS",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      console.log("[AdminPage] No token, redirecting to login...");
      router.push("/admin/login");
    } else {
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("[AdminPage] Failed to fetch products:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!preset || !cloud) {
      alert("Cloudinary credentials missing.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setNewProduct((prev) => ({ ...prev, image: data.secure_url }));
      } else {
        alert("Image upload failed");
      }
    } catch {
      alert("Error uploading image");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image || !newProduct.category) return;
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          image: newProduct.image,
          category: newProduct.category,
        }),
      });

      if (res.ok) {
        setNewProduct({ name: "", price: "", image: "", category: "NEW ARRIVALS" });
        fetchProducts();
      } else {
        alert("Failed to add product");
      }
    } catch {
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
      else alert("Failed to delete product");
    } catch {
      alert("Error deleting product");
    }
  };

  const handleEditProduct = (product) => {
    const updatedName = prompt("Update product name:", product.name);
    const updatedPrice = prompt("Update price in KWD:", product.price);

    if (!updatedName || !updatedPrice) return;

    fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: product._id,
        name: updatedName,
        price: parseFloat(updatedPrice),
      }),
    })
      .then((res) => {
        if (res.ok) fetchProducts();
        else alert("Failed to update product");
      })
      .catch(() => alert("Error updating product"));
  };

  const isFormValid = newProduct.name && newProduct.price && newProduct.image;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <Sidebar />
      <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80">
            <img src="/fbpitch-logo.png" alt="Fbpitch Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-3xl font-extrabold uppercase text-indigo-600 font-poppins">Fbpitch (Admin)</h1>
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={() => router.push("/admin/analytics")} className="flex items-center gap-2">
              <BarChart2 size={18} />
              Analytics
            </Button>

            {/* New Button to view contact messages */}
            <Button
              onClick={() => router.push("/admin/contact-messages")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail size={18} />
              View Contact Messages
            </Button>

            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
              Logout
            </Button>
          </div>
        </header>

        {/* ADD PRODUCT */}
        <section className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Add New Product</h2>
          <div className="space-y-4">
            <input
              className="border p-3 w-full"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              className="border p-3 w-full"
              placeholder="Price in KWD"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <select
              className="border p-3 w-full"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            >
              <option value="NEW ARRIVALS">NEW ARRIVALS</option>
              <option value="SPECIAL KITS">SPECIAL KITS</option>
              <option value="RETRO">RETRO</option>
              <option value="NATIONAL TEAM">NATIONAL TEAM</option>
              <option value="KITS FOR KIDS">KITS FOR KIDS</option>
            </select>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {newProduct.image && <img src={newProduct.image} alt="Preview" className="h-24 mt-2" />}
            <Button
              onClick={handleAddProduct}
              className="w-full bg-black text-white hover:bg-gray-800"
              disabled={!isFormValid || loading}
            >
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </section>

        {/* MANAGE PRODUCTS */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Manage Products</h2>
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            products.map((product) => (
              <div
                key={product._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between border p-4 rounded mb-4 gap-4"
              >
                <div className="flex items-center gap-4">
                  <img src={product.image} alt={product.name} className="h-20 w-20 object-cover" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">{product.name}</h3>
                    <p>KD {Number(product.price).toFixed(3)}</p>
                    {product.category && (
                      <p className="text-sm text-gray-500">Category: {product.category}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Button onClick={() => handleEditProduct(product)} variant="outline" className="flex items-center gap-2">
                    <Edit2 size={16} />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleRemoveProduct(product._id)}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
