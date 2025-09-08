// app/api/products/route.js
import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Product, ProductInput } from "@/lib/models/Product"
import { ObjectId } from "mongodb"

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

/**
 * PUT /api/products
 * Expects JSON body with an `id` field (the product _id to update) and other fields to set.
 * This matches your frontend which sends `{ id: editId, ... }`.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body?.id ?? body?._id

    if (!id) {
      return NextResponse.json({ error: "Missing product id in request body" }, { status: 400 })
    }

    // Build filter: prefer ObjectId if id is a valid 24-char hex string, otherwise fall back to string id.
    let filter: any
    try {
      filter = { _id: new ObjectId(id) }
    } catch (e) {
      // Not a valid ObjectId - try matching by string id
      filter = { _id: id }
    }

    // Remove id/_id from update payload
    const updatePayload = { ...body }
    delete updatePayload.id
    delete updatePayload._id

    // Always update updatedAt
    updatePayload.updatedAt = new Date()

    const db = await getDatabase()
    const result = await db.collection<Product>("products").updateOne(filter, { $set: updatePayload })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product updated successfully" })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
