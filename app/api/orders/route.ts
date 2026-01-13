import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Order } from "@/lib/models/Order";
import type { Order as OrderType, CartItem } from "@/lib/types";
import { Types } from "mongoose";
import { sendAdminOrderNotification } from "@/lib/mailer";
import { appendOrderToGoogleSheets } from "@/lib/googleSheets";

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
    firstName?: string;
    lastName?: string;
    phone?: string;
    postal?: string;
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

  if (minAmount) query.totalAmount = { $gte: Number(minAmount) };
  if (customer) query["shippingAddress.name"] = { $regex: customer, $options: "i" };

  return query;
}

// -------------------------
// GET: fetch orders
// -------------------------
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = buildQuery(searchParams);
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean<OrderType[]>().exec();
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

    if (!body || !Array.isArray(body.items) || body.items.length === 0)
      return NextResponse.json({ error: "items (non-empty array) is required" }, { status: 400 });

    if (body.total === undefined && body.totalAmount === undefined)
      return NextResponse.json({ error: "total or totalAmount is required" }, { status: 400 });

    await dbConnect();

    const shippingAddress = {
      street: body.address?.street ?? "",
      city: body.address?.city ?? "",
      state: body.address?.state ?? "",
      zipCode: body.address?.zipCode ?? "",
      country: body.address?.country ?? "",
      email: body.address?.email ?? "",
      name: body.address?.name ?? "",
      firstName: body.address?.firstName ?? "",
      lastName: body.address?.lastName ?? "",
      phone: body.address?.phone ?? "",
      postal: body.address?.postal ?? "",
    };

    const totalAmount = Number(body.totalAmount ?? body.total ?? 0);
    const discountPercent = Number(body.discountPercent ?? 0);
    const promoCode = body.promoCode?.trim()?.length ? body.promoCode.trim().toUpperCase() : undefined;

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

    // Send admin email
    try {
      await sendAdminOrderNotification(orderId, { ...orderDoc, customerName: body.customer || shippingAddress.name || "Customer" });
    } catch (notifErr) {
      console.error("⚠️ Failed to send admin email:", notifErr);
    }

    // Append order to Google Sheets
    try {
      const sheetRows = body.items.map((item: CartItem) => ({
        _id: orderId,
        customerName: shippingAddress.name || body.customer || "",
        paymentMethod: body.paymentMethod,
        promoCode,
        discount: discountPercent,
        name: item.productName ?? "Unknown Product",
        size: item.size ?? "",
        quality: item.quality ?? "",
        sleeve: item.sleeve ?? "",
        patch: Array.isArray(item.patches) && item.patches.length > 0 ? item.patches[0] : "",
        customName: item.customName ?? "",
        instagram: item.instagram ?? "",
        shortsAdded: item.categories?.includes("shorts") ?? false,
        price: item.price ?? 0,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal: shippingAddress.postal,
        country: shippingAddress.country,
      }));

      await appendOrderToGoogleSheets({ items: sheetRows });
    } catch (sheetErr) {
      console.error("⚠️ Failed to append order to Google Sheets:", sheetErr);
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

    if (!orderId || !Types.ObjectId.isValid(orderId))
      return NextResponse.json({ error: "Invalid or missing orderId" }, { status: 400 });

    await dbConnect();
    const deleted = await Order.findByIdAndDelete(orderId).lean<OrderType>().exec();

    if (!deleted) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Order deleted successfully", orderId });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
