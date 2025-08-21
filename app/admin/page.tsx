"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart2, Mail, Edit2, SearchIcon, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { AuthGuard } from "@/components/auth-guard"
import type { Product, FormInputProps, FormSelectProps } from "@/lib/types"

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
] as const

const PATCHES: Record<string, string[]> = {
  "Premier League": ["Champions League", "FA Cup", "Community Shield"],
  "La Liga": ["Champions League", "Copa del Rey"],
  "Serie A": ["Champions League", "Coppa Italia"],
  Bundesliga: ["Champions League", "DFB Pokal"],
  "Ligue 1": ["Champions League", "Coupe de France"],
  "Champions League": ["UEFA Starball"],
  "Europa League": ["Europa Patch"],
  "Saudi Pro League": ["AFC Champions League"],
  "AFC Champions League": ["ACL Patch"],
  International: ["World Cup", "EURO", "AFCON"],
}

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
]

interface NewProductState {
  name: string
  price: string
  image: string
  shortsImage: string
  longSleevesImage: string
  categories: string[]
  league: string
  patches: string[]
  showShorts: boolean
  showLongSleeves: boolean
  tags: string[]
}

function AdminPageContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [cartItemCount, setCartItemCount] = useState(0)
  const [newProduct, setNewProduct] = useState<NewProductState>({
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
  })

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingShortsImage, setUploadingShortsImage] = useState(false)
  const [uploadingLongSleevesImage, setUploadingLongSleevesImage] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const savedCartCount = localStorage.getItem("cartItemCount")
    if (savedCartCount) {
      setCartItemCount(Number.parseInt(savedCartCount))
    }

    const initializeAdmin = async () => {
      // Prefer the standard "token" key (set by /api/login), fallback to older keys if present.
        const token = localStorage.getItem("token") || localStorage.getItem("adminToken") || localStorage.getItem("userToken");


      if (!token) {
        router.replace("/login") // Fixed redirect to /login instead of /admin/login
        return
      }

      try {
        const res = await fetch("/api/verify-admin", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        const data = await res.json()
        if (!data.success) throw new Error()

        await fetchProducts()
      } catch {
        router.replace("/login") // Fixed redirect to /login instead of /admin/login
      }
    }

    initializeAdmin()
  }, [router])

  const handleDelete = async (productId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?")
    if (!confirmDelete) return

    setDeletingProductId(productId)

    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" })

      if (!res.ok) throw new Error("Failed to delete")

      setProducts((prev) => prev.filter((p) => p._id !== productId))
    } catch (err) {
      console.error("Delete error:", err)
      alert("Failed to delete product.")
    } finally {
      setDeletingProductId(null)
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products")
      if (!res.ok) throw new Error("Failed to fetch")
      const { products } = await res.json()
      setProducts(products)
    } catch (err) {
      console.error(err)
      router.push("/admin/login")
    }
  }

  async function uploadToCloudinary(file: File): Promise<string> {
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    if (!preset || !cloudName) {
      console.error("Missing Cloudinary environment variables")
      alert("Image upload config missing. Please contact developer.")
      throw new Error("Cloudinary config missing")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", preset)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) throw new Error("Failed to upload image")

    const data = await res.json()
    return data.secure_url
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const url = await uploadToCloudinary(file)
      setNewProduct((p) => ({ ...p, image: url }))
    } catch (err) {
      alert("Image upload failed.")
      console.error(err)
    }
    setUploadingImage(false)
  }

  async function handleShortsImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingShortsImage(true)
    try {
      const url = await uploadToCloudinary(file)
      setNewProduct((p) => ({ ...p, shortsImage: url }))
    } catch (err) {
      alert("Shorts image upload failed.")
      console.error(err)
    }
    setUploadingShortsImage(false)
  }

  async function handleLongSleevesImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLongSleevesImage(true)
    try {
      const url = await uploadToCloudinary(file)
      setNewProduct((p) => ({ ...p, longSleevesImage: url }))
    } catch (err) {
      alert("Long sleeves image upload failed.")
      console.error(err)
    }
    setUploadingLongSleevesImage(false)
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
    } = newProduct

    if (!name || !price || !image || !categories.length || !league) return alert("Please fill all required fields.")

    setLoading(true)

    const body = {
  name,
  price: Number.parseFloat(price),
  // normalize single image -> images[]
  images: image
    ? [
        {
          url: image,
          // admin doesn't currently produce width/height/public_id from Cloudinary here;
          // backend can fill those in if/when available.
        },
      ]
    : [],
  // also keep legacy image fields for compatibility (optional)
  image: image || "",
  shortsImage: typeof shortsImage === "string" ? shortsImage : "",
  longSleevesImage: typeof longSleevesImage === "string" ? longSleevesImage : "",
  categories,
  league,
  patches: Array.isArray(patches) ? patches : [],
  showShorts: !!showShorts,
  showLongSleeves: !!showLongSleeves,
  tags: Array.isArray(tags) ? tags : [],
  ...(editId ? { id: editId } : {}),
}

    const res = await fetch("/api/products", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setLoading(false)

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
      })
      setEditId(null)
      fetchProducts()
      setSearchTerm("")
    } else {
      alert("Error saving product.")
    }
  }

  function startEdit(prod: Product) {
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
    })
    setEditId(prod._id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleAddTagFromDropdown(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedTag = e.target.value
    if (selectedTag && !newProduct.tags.includes(selectedTag)) {
      setNewProduct((p) => ({
        ...p,
        tags: [...p.tags, selectedTag],
      }))
    }
    e.target.value = ""
  }

  function handleRemoveTag(tagToRemove: string) {
    setNewProduct((p) => ({
      ...p,
      tags: p.tags.filter((t) => t !== tagToRemove),
    }))
  }

  const filteredProducts = products.filter((prod) => prod.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCategoryChange = (cat: string) => {
    setNewProduct((p) => ({
      ...p,
      categories: p.categories.includes(cat) ? p.categories.filter((c) => c !== cat) : [...p.categories, cat],
    }))
  }

  const handlePatchChange = (patch: string) => {
    setNewProduct((p) => ({
      ...p,
      patches: p.patches.includes(patch) ? p.patches.filter((x) => x !== patch) : [...p.patches, patch],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} />
      <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto space-y-10 w-full">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 md:gap-0">
          <Link href="/" className="flex items-center gap-3 text-primary hover:opacity-80">
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase truncate max-w-full">Fbpitch Admin</h1>
          </Link>
          <div className="flex flex-wrap gap-3 justify-end">
            <Button
              variant="secondary"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={() => router.push("/admin/analytics")}
            >
              <BarChart2 size={16} />
              Analytics
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
              onClick={() => router.push("/admin/contact-messages")}
            >
              <Mail size={16} />
              Messages
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
              onClick={() => {
                localStorage.removeItem("adminToken")
                router.push("/login")
              }}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Add/Edit Product Form */}
        <section className="bg-card p-6 md:p-8 rounded-xl shadow-md max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center md:text-left">
            {editId ? "Edit Product" : "Add New Product"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Name"
              value={newProduct.name}
              onChange={(v: string) => setNewProduct((p) => ({ ...p, name: v }))}
              required
            />
            <Input
              label="Price (KWD)"
              type="number"
              value={newProduct.price}
              onChange={(v: string) => setNewProduct((p) => ({ ...p, price: v }))}
              required
              min="0"
              step="0.001"
            />

            {/* Jersey Image Upload */}
            <div className="flex flex-col">
              <label htmlFor="jersey-image" className="font-medium mb-1">
                Jersey Image <span className="text-red-600">*</span>
              </label>
              <input
                id="jersey-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="border border-border rounded-md p-2 cursor-pointer bg-background"
              />
              {uploadingImage && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
              {newProduct.image && !uploadingImage && (
                <img
                  src={newProduct.image || "/placeholder.svg"}
                  alt="Jersey"
                  className="mt-2 h-32 w-32 object-contain rounded border border-border mx-auto sm:mx-0"
                />
              )}
            </div>

            {/* Long Sleeves Image Upload */}
            <div className="flex flex-col">
              <label htmlFor="long-sleeves-image" className="font-medium mb-1">
                Long Sleeves Image (optional)
              </label>
              <input
                id="long-sleeves-image"
                type="file"
                accept="image/*"
                onChange={handleLongSleevesImageUpload}
                disabled={uploadingLongSleevesImage}
                className="border border-border rounded-md p-2 cursor-pointer bg-background"
              />
              {uploadingLongSleevesImage && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
              {newProduct.longSleevesImage && !uploadingLongSleevesImage && (
                <img
                  src={newProduct.longSleevesImage || "/placeholder.svg"}
                  alt="Long Sleeves"
                  className="mt-2 h-32 w-32 object-contain rounded border border-border mx-auto sm:mx-0"
                />
              )}
            </div>

            {/* Shorts Image Upload */}
            <div className="flex flex-col">
              <label htmlFor="shorts-image" className="font-medium mb-1">
                Shorts Image (optional)
              </label>
              <input
                id="shorts-image"
                type="file"
                accept="image/*"
                onChange={handleShortsImageUpload}
                disabled={uploadingShortsImage}
                className="border border-border rounded-md p-2 cursor-pointer bg-background"
              />
              {uploadingShortsImage && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
              {newProduct.shortsImage && !uploadingShortsImage && (
                <img
                  src={newProduct.shortsImage || "/placeholder.svg"}
                  alt="Shorts"
                  className="mt-2 h-32 w-32 object-contain rounded border border-border mx-auto sm:mx-0"
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
                      onChange={() => handleCategoryChange(cat)}
                      className="cursor-pointer"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <Select
              label="League"
              options={LEAGUES as unknown as string[]}
              value={newProduct.league}
              onChange={(v: string) => setNewProduct((p) => ({ ...p, league: v, patches: [] }))}
              required
            />

            {/* Patches checkboxes, shown only if league selected */}
            {!!newProduct.league && PATCHES[newProduct.league] && (
              <div className="col-span-full">
                <div className="font-medium mb-2">Patches</div>
                <div className="flex flex-wrap gap-4">
                  {PATCHES[newProduct.league].map((patch: string) => (
                    <label key={patch} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newProduct.patches.includes(patch)}
                        onChange={() => handlePatchChange(patch)}
                        className="cursor-pointer"
                      />
                      <span>{patch}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tags dropdown input */}
            <div className="col-span-full">
              <label htmlFor="tags-select" className="font-medium mb-2">
                Tags
              </label>

              {/* Selected tags as pills */}
              <div className="flex flex-wrap gap-2 mb-2">
                {newProduct.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-primary-foreground hover:text-primary-foreground/70 font-bold"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Dropdown to add tags */}
              <select
                id="tags-select"
                className="border border-border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
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

          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-transparent"
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
                })
                setEditId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleAddOrUpdate}
              disabled={loading || uploadingImage || uploadingShortsImage || uploadingLongSleevesImage}
            >
              {loading ? "Saving..." : editId ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </section>

        {/* Search bar above products grid */}
        <section className="max-w-4xl mx-auto">
          <label htmlFor="search" className="sr-only">
            Search Jerseys
          </label>
          <div className="relative w-full max-w-md mx-auto mb-6">
            <input
              id="search"
              type="search"
              placeholder="Search jerseys by name..."
              className="w-full border border-border rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </section>

        {/* Products Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => (
              <motion.div
                key={prod._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.25 }}
                className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col"
              >
                <img
                  src={prod.image || "/placeholder.svg"}
                  alt={prod.name}
                  className="h-44 w-full object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold truncate">{prod.name}</h3>
                <p className="text-foreground">KWD {prod.price.toFixed(3)}</p>
                <p className="text-sm text-muted-foreground mt-2 truncate">League: {prod.league || "N/A"}</p>
                <p className="text-sm text-muted-foreground truncate">
                  Categories: {Array.isArray(prod.categories) ? prod.categories.join(", ") : ""}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  Tags: {Array.isArray(prod.tags) && prod.tags.length ? prod.tags.join(", ") : "None"}
                </p>

                <div className="mt-auto flex gap-2 pt-4 border-t border-border flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 whitespace-nowrap bg-transparent"
                    onClick={() => startEdit(prod)}
                  >
                    <Edit2 size={14} /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(prod._id)}
                    disabled={deletingProductId === prod._id}
                    className="flex items-center gap-1 whitespace-nowrap"
                  >
                    {deletingProductId === prod._id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-muted-foreground col-span-full">
              No jerseys found matching &quot;{searchTerm}&quot;.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  ...props
}: FormInputProps & { type?: string; required?: boolean; min?: string; step?: string }) {
  return (
    <label className="flex flex-col gap-1 w-full">
      <span className="font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
        required={required}
        {...props}
      />
    </label>
  )
}

function Select({ label, options, value, onChange, required = false }: FormSelectProps & { required?: boolean }) {
  return (
    <label className="flex flex-col gap-1 w-full">
      <span className="font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <select
        className="border border-border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin={true}>
      <AdminPageContent />
    </AuthGuard>
  )
}
