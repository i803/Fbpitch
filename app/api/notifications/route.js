import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb"; // make sure you have this utility

// ✅ Notification Schema
const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, default: "info" }, // "info", "order", "warning", etc.
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite during hot reloads
const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

// ✅ GET: fetch all notifications (latest first)
export async function GET() {
  try {
    await dbConnect();
    const notifications = await Notification.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("GET /notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// ✅ POST: create a new notification
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const notification = new Notification({
      message: body.message,
      type: body.type || "info",
    });

    await notification.save();
    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error("POST /notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    );
  }
}
