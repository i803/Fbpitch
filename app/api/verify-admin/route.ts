// app/api/verify-admin/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, message: "Missing token" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return NextResponse.json({ success: false, message: "Missing token" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as any;

    // Accept either role:'admin' or legacy isAdmin flag
    const isAdminToken = decoded?.role === "admin" || decoded?.isAdmin === true;
    if (!isAdminToken) {
      return NextResponse.json({ success: false, message: "Not an admin" }, { status: 403 });
    }

    // Optionally, return a small user object for the frontend
    return NextResponse.json({
      success: true,
      user: {
        id: decoded?.id ?? null,
        role: decoded?.role ?? (decoded?.isAdmin ? "admin" : "user"),
      },
    });
  } catch (err) {
    console.error("verify-admin error:", err);
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
  }
}
