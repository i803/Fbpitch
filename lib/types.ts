export interface ProductImage {
  url: string;
  width?: number;
  height?: number;
}

export interface Product {
  _id: string;
  name: string;
  price: number;

  // legacy single image (may still be present)
  image?: string;

  // normalized gallery (used in products/[id] page)
  images?: ProductImage[];

  // explicit variant assets
  shortsImage?: string;
  longSleevesImage?: string;

  categories?: string[];
  league?: string;
  patches?: string[];
  showShorts?: boolean;
  showLongSleeves?: boolean;
  tags?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * CartItem: updated to reflect the fields produced by products/[id]/page.tsx
 */
export interface CartItem {
  id: string;

  // link back to product if available
  productId?: string;
  productName: string;

  // price fields
  price: number; // final price per item (before quantity)
  basePrice?: number; // original product.price (optional)

  // images
  image: string; // primary image (legacy single URL)
  images?: string[]; // ordered images for cart carousel (preferred)
  shortsImage?: string;
  longSleevesImage?: string;

  // product/options
  size?: string;
  quality?: string;
  sleeve?: string | null;

  // extras
  patches?: string[];
  customName?: string;
  instagram?: string;
  addShorts?: boolean;

  // quantity
  quantity: number;
}

export interface User {
  _id: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  promoCode?: string; // ✅ added
  discountPercent?: number; // ✅ added
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    email?: string; // optional
  };
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export interface FormSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}
