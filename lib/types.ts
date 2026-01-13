export interface ProductImage {
  url: string;
  width?: number;
  height?: number;
}

export interface Product {
  _id: string;
  name: string;
  price: number;

  image?: string;
  images?: ProductImage[];

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

export interface CartItem {
  id: string;
  productId?: string;
  productName: string;
  price: number;
  basePrice?: number;

  image: string;
  images?: string[];
  shortsImage?: string;
  longSleevesImage?: string;

  size?: string;
  quality?: string;
  sleeve?: string | null;

  patches?: string[];
  customName?: string;
  instagram?: string;
  addShorts?: boolean;

  quantity: number;
  categories?: string[];
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
  promoCode?: string;
  discountPercent?: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";

  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    name?: string;
  };

  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

// -------------------------
// Google Sheets Interfaces
// -------------------------
export interface SheetItem {
  _id: string; // Order ID
  customerName: string;
  paymentMethod: string;
  promoCode?: string;
  discount?: number;
  name: string; // Product Name
  size?: string;
  quality?: string;
  sleeve?: string;
  patch?: string;
  customName?: string;
  instagram?: string;
  shortsAdded?: boolean;
  price: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postal?: string;
  country?: string;
}

export interface SheetsOrder {
  items: SheetItem[];
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
