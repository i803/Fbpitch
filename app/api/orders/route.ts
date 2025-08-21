// app/api/orders/route.ts
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Order } from "@/lib/models/Order";
import type { Order as OrderType, CartItem } from "@/lib/types";
import { Types } from "mongoose";
import { sendAdminOrderNotification } from "@/lib/mailer";

// -------------------------
// POST body interface
// -------------------------
interface CreateOrderBody {
  userId: string;
  items: CartItem[];
  total?: number;
  totalAmount?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    email?: string;
    name?: string;
  };
  paymentMethod: string;
  promoCode?: string;
  discountPercent?: number;
  customer?: string;
}

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
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// -------------------------
// POST: create new order
// -------------------------
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderBody = await request.json();

    // Validation
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "items (non-empty array) is required" }, { status: 400 });
    }

    if (body.total === undefined && body.totalAmount === undefined) {
      return NextResponse.json({ error: "total or totalAmount is required" }, { status: 400 });
    }

    await dbConnect();

    // Ensure shippingAddress has all fields
    const shippingAddress = {
      street: body.address?.street ?? "",
      city: body.address?.city ?? "",
      state: body.address?.state ?? "",
      zipCode: body.address?.zipCode ?? "",
      country: body.address?.country ?? "",
      email: body.address?.email,
      name: body.address?.name,
    };

    const totalAmount = Number(body.totalAmount ?? body.total ?? 0);
    const discountPercent = Number(body.discountPercent ?? 0);
    const promoCode = body.promoCode?.trim()?.length ? body.promoCode.trim().toUpperCase() : undefined;

    // Create order document
    const orderDoc: Partial<OrderType> = {
      userId: body.userId,
      items: body.items,
      totalAmount,
      paymentMethod: body.paymentMethod,
      status: "pending",
      shippingAddress,
      promoCode,
      discountPercent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newOrder = await Order.create(orderDoc);
    const orderId = (newOrder._id as Types.ObjectId).toString();

    // Send admin email only
    const emailPayload = { ...orderDoc, customerName: body.customer || shippingAddress.name || "Customer" };
    try {
      await sendAdminOrderNotification(orderId, emailPayload);
    } catch (notifErr) {
      console.error("⚠️ Failed to send admin email:", notifErr);
    }

    return NextResponse.json({ success: true, message: "Order created successfully", orderId });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid or missing orderId" }, { status: 400 });
    }

    await dbConnect();
    const deleted = await Order.findByIdAndDelete(orderId).lean<OrderType>().exec();

    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order deleted successfully", orderId });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
