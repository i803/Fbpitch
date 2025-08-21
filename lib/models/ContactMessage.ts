import mongoose, { Schema, model, models } from "mongoose";

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

// This ensures we don't overwrite the model if it already exists
const ContactMessage = models.ContactMessage || model("ContactMessage", ContactMessageSchema);

export default ContactMessage;
