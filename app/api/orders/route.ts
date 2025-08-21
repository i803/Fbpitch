import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Order } from "@/lib/models/Order";
import type { Order as OrderType } from "@/lib/types";
import { Types } from "mongoose";
import {
  sendAdminOrderNotification,
  sendCustomerOrderReceipt,
} from "@/lib/mailer";

// -------------------------
// Helpers
// -------------------------
function buildQuery(params: URLSearchParams) {
  const query: Record<string, unknown> = {};

  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  const minAmount = params.get("minAmount");
  const customer = params.get("customer");

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) (query.createdAt as any).$gte = new Date(startDate);
    if (endDate) (query.createdAt as any).$lte = new Date(endDate);
  }

  if (minAmount) {
    query.totalAmount = { $gte: Number(minAmount) };
  }

  if (customer) {
    query["shippingAddress.street"] = { $regex: customer, $options: "i" };
  }

  return query;
}

// -------------------------
// GET: fetch orders (with filters)
// -------------------------
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = buildQuery(searchParams);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean<OrderType[]>()
      .exec();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// -------------------------
// POST: create new order
// -------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "items (non-empty array) is required" },
        { status: 400 }
      );
    }

    if (body.totalAmount === undefined) {
      return NextResponse.json(
        { error: "totalAmount is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const orderDoc: Partial<OrderType> = {
      userId: body.userId,
      items: body.items,
      totalAmount: body.totalAmount,
      paymentMethod: body.paymentMethod,
      status: "pending",
      shippingAddress: body.shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newOrder = await Order.create(orderDoc);

    const orderId = (newOrder._id as Types.ObjectId).toString();

    try {
      await sendAdminOrderNotification(orderId, body);
      await sendCustomerOrderReceipt(orderId, body);
    } catch (notifErr) {
      console.error("⚠️ Failed to send emails:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// -------------------------
// DELETE: remove order
// -------------------------
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { error: "Invalid or missing orderId" },
        { status: 400 }
      );
    }

    await dbConnect();
    const deleted = await Order.findByIdAndDelete(orderId)
      .lean<OrderType>()
      .exec();

    if (!deleted) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
      orderId,
    });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
