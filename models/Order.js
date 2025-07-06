import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  customer: String,
  amount: Number,
  items: Array,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
