import { NextResponse } from "next/server";
import { connectToDB } from "../../../../lib/mongoose";
import { Product } from "../../../../models/Product";
import jwt from "jsonwebtoken";

export async function PUT(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET); 

    await connectToDB();
    const updates = await request.json();

    await Product.findByIdAndUpdate(params.id, updates);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized or Server error" }, { status: 401 });
  }
}
