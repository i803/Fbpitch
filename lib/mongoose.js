import mongoose from "mongoose";

export async function connectToDB() {
  try {
    if (mongoose.connection.readyState === 1) return;

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[mongoose] Connected to DB");
  } catch (err) {
    console.error("[mongoose] Connection Error:", err);
  }
}
