// lib/types.ts

export interface ProductImage {
  url: string
  width?: number
  height?: number
}

export interface Product {
  _id: string
  name: string
  price: number

  // legacy single image (may still be present)
  image?: string

  // normalized gallery (used in products/[id] page)
  images?: ProductImage[]

  // explicit variant assets
  shortsImage?: string
  longSleevesImage?: string

  categories?: string[]
  league?: string
  patches?: string[]
  showShorts?: boolean
  showLongSleeves?: boolean
  tags?: string[]

  createdAt?: Date
  updatedAt?: Date
}

/**
 * CartItem: updated to reflect the fields produced by products/[id]/page.tsx
 *
 * Important fields used across your app:
 * - productId / productName: identify product & label in cart
 * - image: legacy single primary image (string) — still useful for compatibility
 * - images: ordered array of images to show in the cart carousel (string[])
 * - sleeve: "Long Sleeve" | "Short Sleeve" | "" | null
 * - addShorts: boolean flag indicating user ticked matching shorts
 * - patches: array of strings (selected badges/patches)
 * - customName / instagram: user-provided strings
 * - basePrice: product.price at time of adding (useful for audit)
 */
export interface CartItem {
  id: string

  // link back to product if available
  productId?: string
  productName: string

  // price fields
  price: number        // final price per item (before quantity)
  basePrice?: number   // original product.price (optional)

  // images
  image: string        // primary image (legacy single URL)
  images?: string[]    // ordered images for cart carousel (preferred)
  shortsImage?: string
  longSleevesImage?: string

  // product/options
  size?: string
  quality?: string
  sleeve?: string | null

  // extras
  patches?: string[]
  customName?: string
  instagram?: string
  addShorts?: boolean

  // quantity
  quantity: number
}

export interface User {
  _id: string
  email: string
  password: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  _id: string
  userId: string
  items: CartItem[]
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
}

export interface FormInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export interface FormSelectProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}
