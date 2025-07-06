import { connectToDB } from "../../../lib/mongoose";

export async function GET() {
  try {
    await connectToDB();
    return new Response(JSON.stringify({ success: true, message: "Connected to MongoDB!" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
