import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongoose";
import User from "../../../models/User";

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    await connectToDB();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    return NextResponse.json(
      { success: true, message: "Signup successful", username: newUser.username },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
