// app/api/admin-login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";

const COOKIE_NAME = "admin_token";
const TOKEN_MAX_AGE = 60 * 60 * 24; // 1 day in seconds

/**
 * POST - attempt admin login
 * Supports:
 *  - env-based admin credentials (ADMIN_USERNAME + ADMIN_PASSWORD)
 *  - DB-based admin user (role === "admin") with bcrypt password
 *
 * Response:
 *  - sets an httpOnly cookie (admin_token)
 *  - returns { success: true, token, user: { id, email, username, role } }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").toString().trim();
    const password = (body.password || "").toString();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("Missing JWT_SECRET in env");
      return NextResponse.json(
        { success: false, error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // 1) Check env admin credentials first (convenient for a single admin account)
    if (
      process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD &&
      email === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ isAdmin: true, source: "env" }, JWT_SECRET, {
        expiresIn: "1d",
      });

      const response = NextResponse.json({
        success: true,
        token,
        user: {
          id: null,
          email: process.env.ADMIN_USERNAME,
          username: (process.env.ADMIN_USERNAME || "").split("@")[0],
          role: "admin",
        },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: TOKEN_MAX_AGE,
      });

      return response;
    }

    // 2) Fallback: check DB for an admin user and verify bcrypt password
    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() }).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Ensure role is admin
    if ((user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: not an admin" },
        { status: 403 }
      );
    }

    // bcrypt compare - if your DB user uses bcrypt (your scripts use bcryptjs)
    const hashed = (user as any).password;
    const ok = await bcrypt.compare(password, hashed);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = jwt.sign({ isAdmin: true, id: String((user as any)._id) }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const safeUser = {
      id: String((user as any)._id),
      email: (user as any).email,
      username: (user as any).username,
      role: (user as any).role,
    };

    const response = NextResponse.json({
      success: true,
      token,
      user: safeUser,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: TOKEN_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/**
 * GET - helpful endpoint so a browser nav to /api/admin-login doesn't throw a 405
 * (avoid noisy 405s in browser console). Returns a short info message.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "POST to this endpoint with { email, password } to log in as admin.",
  });
}
