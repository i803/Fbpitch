import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: {
    type: String,
    enum: ["NEW ARRIVALS", "SPECIAL KITS", "RETRO", "NATIONAL TEAM", "KITS FOR KIDS"],
    default: "NEW ARRIVALS",
  },
  league: { type: String }, // NEW
  patches: [{ type: String }], // NEW
  showShorts: { type: Boolean, default: false }, // NEW
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
