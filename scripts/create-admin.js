// scripts/create-admin.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // still loads your DB URI

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

// ✅ hard-coded admin credentials
const ADMIN_EMAIL = "fbpitch25@gmail.com";
const ADMIN_PASSWORD = "Kenver@67";
const ADMIN_USERNAME = "admin"; // your requested username

if (!MONGODB_URI) {
  console.error("MONGODB_URI not set in env.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isEmailVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function run() {
  await mongoose.connect(MONGODB_URI, {});

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log("⚠️ Admin user already exists:", existing.email);
    await mongoose.disconnect();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, salt);

  const user = new User({
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    password: hashed,
    role: "admin",
    isEmailVerified: true,
  });

  await user.save();
  console.log("✅ Admin user created:", { email: ADMIN_EMAIL, username: ADMIN_USERNAME });
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error creating admin:", err);
  process.exit(1);
});
