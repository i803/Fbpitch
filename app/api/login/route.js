import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongoose";
import User from "../../../models/User";

export async function POST(request) {
  try {
    await connectToDB();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Temporary token generation, replace with JWT or secure auth later
    const token = `${user._id}-${new Date().getTime()}`;

    return NextResponse.json(
      { message: "Login successful", token, username: user.username },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
