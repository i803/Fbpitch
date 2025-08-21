import { NextRequest, NextResponse } from "next/server";
import { sendAdminOrderNotification } from "@/lib/mailer";

export async function GET(req: NextRequest) {
  try {
    // Fake order data for testing
    const testOrderId = "TEST123";
    const testOrder = {
      totalAmount: 59.99,
      shippingAddress: { name: "John Doe" },
      userId: "guest123",
      items: [
        { name: "Red Jersey", quantity: 2, price: 15.0 },
        { name: "Blue Shorts", quantity: 1, price: 29.99 },
      ],
    };

    await sendAdminOrderNotification(testOrderId, testOrder);

    return NextResponse.json({
      success: true,
      message: "Test admin email sent! Check your inbox.",
    });
  } catch (error) {
    console.error("❌ Error sending test admin email:", error);
    return NextResponse.json(
      { error: "Failed to send test admin email" },
      { status: 500 }
    );
  }
}
