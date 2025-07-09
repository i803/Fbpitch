"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/ui/button";
import { BarChart2, Mail, Edit2, Trash2 } from "lucide-react";

// --- League & Patch Mappings ---
const LEAGUES = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Champions League",
  "Europa League",
  "Saudi Pro League",
  "AFC Champions League",
  "International",
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


export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", image: "", shortsImage: "",
    category: "NEW ARRIVALS", league: "", patches: [], showShorts: false,
  });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) router.push("/admin/login");
    else fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    }
  };

  const uploadImage = async (file) => {
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!preset || !cloud) return alert("Missing Cloudinary creds");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/upload`, { method: "POST", body: fd });
    return (await res.json()).secure_url;
  };

  const handleAddOrUpdate = async () => {
    const { name, price, image, shortsImage, category, league, patches, showShorts } = newProduct;
    if (!name || !price || !image || !category || !league) return;
    setLoading(true);

    const body = {
      name,
      price: parseFloat(price),
      image,
      shortsImage,
      category,
      league,
      patches,
      showShorts,
      ...(editId && { id: editId }),
    };

    const res = await fetch("/api/products", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setNewProduct({
        name: "", price: "", image: "", shortsImage: "",
        category: "NEW ARRIVALS", league: "", patches: [], showShorts: false,
      });
      setEditId(null);
      fetchProducts();
    } else alert("Error saving product");

    setLoading(false);
  };

  const startEdit = (prod) => {
    setNewProduct({ ...prod, price: prod.price.toString() });
    setEditId(prod._id);
  };

  const deleteProd = async (id) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-800">
      <Sidebar />

      <main className="flex-grow p-8 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-3 text-indigo-600 hover:opacity-80">
            <img src="/fbpitch-logo.png" className="h-12 w-12" />
            <h1 className="text-4xl font-extrabold uppercase">Fbpitch Admin</h1>
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={() => router.push("/admin/analytics")} variant="secondary" className="flex items-center gap-2">
  <BarChart2 size={16} />
  <span>Analytics</span>
</Button>
<Button
    onClick={() => router.push("/admin/contact-messages")}
    className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
  >
    <Mail size={16} />
    <span>Messages</span>
  </Button>
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
              Logout
            </Button>
          </div>
        </header>

        {/* Add Product Form */}
        <section className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 px-4 py-1 rounded-bl-xl text-white uppercase tracking-wide">
            {editId ? "Edit Product" : "Add New Product"}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Name" value={newProduct.name} onChange={(v) => setNewProduct((p) => ({ ...p, name: v }))} />
            <Input label="Price (KWD)" type="number" value={newProduct.price} onChange={(v) => setNewProduct((p) => ({ ...p, price: v }))} />
            <Select label="Category" value={newProduct.category} options={["NEW ARRIVALS", "SPECIAL KITS", "RETRO", "NATIONAL TEAM", "KITS FOR KIDS"]} onChange={(v) => setNewProduct((p) => ({ ...p, category: v }))} />
            <Select label="League" value={newProduct.league} options={LEAGUES} onChange={(v) => setNewProduct((p) => ({ ...p, league: v, patches: [] }))} />

            {!!newProduct.league && (
              <div className="md:col-span-2">
                <span className="font-medium">Patches:</span>
                <div className="flex flex-wrap gap-3 mt-1">
                  {PATCHES[newProduct.league]?.map((patch) => (
                    <label key={patch} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.patches.includes(patch)}
                        onChange={() => {
                          setNewProduct((p) => ({
                            ...p,
                            patches: p.patches.includes(patch)
                              ? p.patches.filter((pt) => pt !== patch)
                              : [...p.patches, patch],
                          }));
                        }}
                      />
                      {patch}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="col-span-1 md:col-span-2">
              <label className="block font-medium mb-1">Show Shorts?</label>
              <input
                type="checkbox"
                checked={newProduct.showShorts}
                onChange={(e) => setNewProduct((p) => ({ ...p, showShorts: e.target.checked }))}
              />
            </div>

            <ImageUpload label="Jersey Image" onUpload={(url) => setNewProduct((p) => ({ ...p, image: url }))} current={newProduct.image} />
            {newProduct.showShorts && (
              <ImageUpload label="Shorts Image" onUpload={(url) => setNewProduct((p) => ({ ...p, shortsImage: url }))} current={newProduct.shortsImage} />
            )}
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setNewProduct({ name: "", price: "", image: "", shortsImage: "", category: "NEW ARRIVALS", league: "", patches: [], showShorts: false });
              setEditId(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdate} disabled={loading}>
              {loading ? "Saving..." : editId ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </section>

        {/* Product Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div key={prod._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition flex flex-col justify-between">
              <img src={prod.image} alt={prod.name} className="h-36 w-full object-cover rounded" />
              <div className="mt-4 flex-grow">
                <h3 className="text-lg font-semibold">{prod.name}</h3>
                <p className="text-indigo-600 font-bold">KD {prod.price.toFixed(3)}</p>
                <p className="text-sm text-gray-500">{prod.category}</p>
                {prod.league && <p className="text-sm">League: {prod.league}</p>}
                {prod.showShorts && <p className="text-sm text-green-600">✓ Shorts included</p>}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
  variant="outline"
  size="sm"
  onClick={() => startEdit(prod)}
  className="flex items-center gap-1"
>
  <Edit2 size={14} />
  <span>Edit</span>
</Button>
                <Button
  size="sm"
  onClick={() => deleteProd(prod._id)}
  className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
>
  <Trash2 size={14} />
  <span>Delete</span>
</Button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

// --- UI Components ---
function Input({ label, ...props }) {
  return (
    <label className="flex flex-col">
      <span className="font-medium mb-1">{label}</span>
      <input className="border p-2 rounded focus:ring-2 focus:ring-indigo-400" {...props} />
    </label>
  );
}

function Select({ label, options, ...props }) {
  return (
    <label className="flex flex-col">
      <span className="font-medium mb-1">{label}</span>
      <select className="border p-2 rounded focus:ring-2 focus:ring-indigo-400" {...props}>
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function ImageUpload({ label, onUpload, current }) {
  return (
    <div className="flex flex-col">
      <span className="font-medium mb-1">{label}</span>
      <input type="file" accept="image/*" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = await uploadCloudinary(file);
          onUpload(url);
        }
      }} />
      {current && <img src={current} alt={label} className="mt-2 h-24 w-full object-contain rounded" />}
    </div>
  );
}

async function uploadCloudinary(file) {
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/upload`, { method: "POST", body: fd });
  const json = await res.json();
  return json.secure_url;
}
