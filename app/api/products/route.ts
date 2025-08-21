import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Product, ProductInput } from "@/lib/models/Product"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const products = await db.collection<Product>("products").find({}).toArray()

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProductInput = await request.json()
    const db = await getDatabase()

    const product: Product = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Product>("products").insertOne(product)

    return NextResponse.json({
      message: "Product created successfully",
      productId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
