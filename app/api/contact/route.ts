// app/api/contact/route.ts
import dbConnect from "@/lib/dbConnect";
import ContactMessage from "@/lib/models/ContactMessage";
import { NextResponse } from "next/server";

interface ContactMessageBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// POST - save a new contact message
export async function POST(req: Request) {
  try {
    await dbConnect();
    const data: ContactMessageBody = await req.json();

    const { name, email, subject, message } = data;
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const newMessage = new ContactMessage({ name, email, subject, message });
    await newMessage.save();

    return NextResponse.json({
      success: true,
      message: "Message saved successfully",
    });
  } catch (err) {
    console.error("Error saving contact message:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save message" },
      { status: 500 }
    );
  }
}

// GET - fetch all messages
export async function GET() {
  try {
    await dbConnect();
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, messages });
  } catch (err) {
    console.error("Error fetching contact messages:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// DELETE - delete a message by ID (passed as query param ?id=)
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Message ID is required" },
        { status: 400 }
      );
    }

    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting contact message:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
