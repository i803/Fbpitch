import mongoose, { Schema, Document, Model } from "mongoose";
import type { Order as OrderType, CartItem } from "@/lib/types";

export interface OrderDocument extends Omit<OrderType, "_id">, Document {}

const CartItemSchema = new Schema<CartItem>(
  {
    id: { type: String, required: true },
    productId: String,
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    basePrice: Number,
    image: String,
    images: [String],
    shortsImage: String,
    longSleevesImage: String,
    size: String,
    quality: String,
    sleeve: String,
    patches: [String],
    customName: String,
    instagram: String,
    addShorts: Boolean,
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    userId: { type: String, required: true },
    items: { type: [CartItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    paymentMethod: { type: String, required: true },
  },
  { timestamps: true }
);

export const Order: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>("Order", OrderSchema);
