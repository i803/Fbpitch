import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: {
    type: String,
    enum: ["NEW ARRIVALS", "SPECIAL KITS", "RETRO", "NATIONAL TEAM", "KITS FOR KIDS"],
    required: true,
    default: "NEW ARRIVALS",
  },
});

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
