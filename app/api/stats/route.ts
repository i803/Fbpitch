import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Get total counts
    const totalProducts = await db.collection("products").countDocuments()
    const totalUsers = await db.collection("users").countDocuments()
    const totalOrders = await db.collection("orders").countDocuments()

    // Get recent products (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentProducts = await db.collection("products").countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    // Get total revenue
    const revenueResult = await db
      .collection("orders")
      .aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])
      .toArray()

    const totalRevenue = revenueResult[0]?.total || 0

    return NextResponse.json({
      totalProducts,
      totalUsers,
      totalOrders,
      recentProducts,
      totalRevenue,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
