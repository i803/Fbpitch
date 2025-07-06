import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
  const { username, password } = await request.json();

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ success: false, message: "Invalid Credentials" }, { status: 401 });
  }

  // Generate JWT with 1 day expiration
  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: "1d" });

  return NextResponse.json({ success: true, token }, { status: 200 });
}
