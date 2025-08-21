import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User, { IUser } from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUsername: string | undefined = body.username;
    const rawEmail: string | undefined = body.email;
    const rawPassword: string | undefined = body.password;

    if (!rawUsername || !rawEmail || !rawPassword) {
      return NextResponse.json(
        { success: false, message: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    const username = rawUsername.trim();
    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword;

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("Missing JWT_SECRET");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    await dbConnect();

    // Optional pre-checks (still keep unique indexes for race conditions)
    const existingEmail = await User.findOne({ email }).select("_id");
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Email is already registered" },
        { status: 400 }
      );
    }

    const existingUsername = await User.findOne({ username }).select("_id");
    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: "Username is already taken" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = (await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
      isEmailVerified: false,
    })) as IUser;

    const token = jwt.sign(
      { id: String(newUser._id), role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: String(newUser._id),
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });

    // Set cookie for immediate session
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    // Handle duplicate key race condition (E11000)
    if (error?.code === 11000) {
      const dupField = Object.keys(error.keyPattern || {})[0];
      const msg =
        dupField === "email"
          ? "Email is already registered"
          : dupField === "username"
          ? "Username is already taken"
          : "Duplicate value";
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
