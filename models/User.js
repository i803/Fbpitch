import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true }, // trim whitespace
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true }); // adds createdAt and updatedAt timestamps

export default mongoose.models.User || mongoose.model("User", UserSchema);
