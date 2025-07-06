import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongodb";

export async function GET() {
  const db = await connectToDB();
  const collections = await db.listCollections().toArray();
  return NextResponse.json({ collections });
}
