import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongoose";
import Order from "../../../models/Order";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const headerToken = request.headers.get("authorization")?.replace("Bearer ", "");
    const token = headerToken;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET);

    await connectToDB();

    const filters = {};
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const minAmountRaw = url.searchParams.get("minAmount");
    const customer = url.searchParams.get("customer");

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    if (minAmountRaw) {
      const minAmount = parseFloat(minAmountRaw);
      if (!isNaN(minAmount)) {
        filters.amount = { $gte: minAmount };
      }
    }

    if (customer) {
      filters.customer = { $regex: customer, $options: "i" };
    }

    // Fetch orders matching filters, sorted by date descending
    const orders = await Order.find(filters).sort({ createdAt: -1 }).lean();

    // Format response, including products/items in each order
    const formatted = orders.map((order) => ({
      _id: order._id.toString(),
      customer: order.customer,
      amount: order.amount,
      createdAt: order.createdAt,
      products: order.products || order.items || [],
    }));

    return NextResponse.json({ orders: formatted });
  } catch (err) {
    console.error("[GET Orders] Error:", err);
    return NextResponse.json({ error: "Unauthorized or Server error" }, { status: 401 });
  }
}
