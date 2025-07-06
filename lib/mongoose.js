import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define the MONGODB_URI environment variable.");
}

// Global caching to prevent multiple connections in serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => {
      console.log("[mongoose] Connected to DB");
      return m;
    }).catch((err) => {
      console.error("[mongoose] Connection Error:", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
