import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongoose";
import User from "../../../models/User";

export async function POST(request) {
  try {
    await connectToDB();

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Both username and password are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this username." },
        { status: 404 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    const token = `${user._id}-${Date.now()}`;

    return NextResponse.json(
      {
        success: true,
        message: "Welcome back! You’re now logged in.",
        token,
        username: user.username,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
