import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Product } from "@/lib/models/Product";
import { ObjectId } from "mongodb";

/**
 * API route for GET / PUT / DELETE a single product by id
 * Normalizes `images` (array) and `patches` (array) so frontend always gets:
 *   product.images: { url, width?, height? }[]
 *   product.patches: string[]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const product = await db.collection<Product>("products").findOne({
      _id: new ObjectId(params.id),
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Normalize images: prefer product.images (array), fallback to legacy fields
    const images =
      Array.isArray((product as any).images) && (product as any).images.length > 0
        ? (product as any).images.map((img: any) =>
            typeof img === "string" ? { url: img } : { url: img.url ?? img.path ?? "", width: img.width, height: img.height }
          )
        : (product as any).image
        ? [{ url: (product as any).image }]
        : [];

    const normalized = {
      ...product,
      images,
      patches: Array.isArray((product as any).patches) ? (product as any).patches : [],
    };

    return NextResponse.json({ product: normalized });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    // Normalize incoming images (support body.images[] or body.image string)
    const images =
      Array.isArray(body.images) && body.images.length > 0
        ? body.images.map((img: any) => (typeof img === "string" ? { url: img } : { url: img.url ?? img.path ?? "", width: img.width, height: img.height }))
        : body.image
        ? [{ url: body.image }]
        : [];

    const normalizedBody = {
      ...body,
      images,
      patches: Array.isArray(body.patches) ? body.patches : [],
      showShorts: !!body.showShorts,
      showLongSleeves: !!body.showLongSleeves,
      updatedAt: new Date(),
    };

    const result = await db.collection<Product>("products").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: normalizedBody }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();

    const result = await db.collection<Product>("products").deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
