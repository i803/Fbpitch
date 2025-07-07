import { connectToDB } from "../../../lib/mongoose";
import ContactMessage from "../../../models/ContactMessage";

export async function GET() {
  try {
    await connectToDB();
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();

    return new Response(JSON.stringify({ success: true, messages }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ success: false, message: "Message ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectToDB();
    await ContactMessage.findByIdAndDelete(id);

    return new Response(JSON.stringify({ success: true, message: "Message deleted" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
