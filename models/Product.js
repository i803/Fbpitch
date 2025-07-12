import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  shortsImage: { type: String }, // ✅
  longSleevesImage: { type: String }, // ✅
  categories: {
  type: [String],
  enum: ["NEW ARRIVALS", "SPECIAL KITS", "RETRO", "NATIONAL TEAM", "KITS FOR KIDS"],
  default: ["NEW ARRIVALS"],
},

  league: { type: String },
  patches: [{ type: String }],
  showShorts: { type: Boolean, default: false },
  showLongSleeves: { type: Boolean, default: false },
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
