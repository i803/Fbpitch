import dbConnect from "@/lib/dbConnect"
import ContactMessage from "@/lib/models/ContactMessage"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    await dbConnect() // connect via Mongoose
    const messages = await ContactMessage.find().sort({ createdAt: -1 })
    return NextResponse.json(messages)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()
    const data = await req.json()
    const message = new ContactMessage(data)
    await message.save()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Failed to save message" }, { status: 500 })
  }
}
