import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User, { IUser } from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // Accept either email or username as identifier (frontend currently sends email)
    const rawEmail: string | undefined = body.email;
    const rawUsername: string | undefined = body.username;
    const password: string | undefined = body.password;

    if ((!rawEmail && !rawUsername) || !password) {
      return NextResponse.json(
        { success: false, message: "Email/username and password are required" },
        { status: 400 }
      );
    }

    const email = rawEmail?.toString().trim().toLowerCase();
    const username = rawUsername?.toString().trim();

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("Missing JWT_SECRET");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    await dbConnect();

    // Find by email (preferred) or username
    const user = (await User.findOne(
      email ? { email } : { username }
    ).lean()) as IUser | null;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare bcrypt hashes
    const isMatch = await bcrypt.compare(password, (user as any).password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT
    const token = jwt.sign(
      { id: String(user._id), role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Build response and set secure HTTP-only cookie for SSR/API use
    const res = NextResponse.json({
      success: true,
      token,
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
