import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phone: String,
    street: String,
    city: String,
    postal: String,
    state: String,
  },
  { _id: false }
);

const ItemSchema = new mongoose.Schema(
  {
    name: String,
    size: String,
    quality: String,
    price: Number,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customer: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  promoCode: { type: String, default: null },
  discountPercent: { type: Number, default: 0 },
  address: { type: AddressSchema, required: true },
  phone: { type: String, required: true },
  items: { type: [ItemSchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
