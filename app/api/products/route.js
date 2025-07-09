import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongoose";
import { Product } from "../../../models/Product";

export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find().lean();

    const formatted = products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      price: p.price,
      image: p.image,
      shortsImage: p.shortsImage || null, // ✅ include shortsImage
      category: p.category || "NEW ARRIVALS",
      league: p.league || null,
      patches: p.patches || [],
      showShorts: p.showShorts || false,
    }));

    return NextResponse.json({ products: formatted });
  } catch (err) {
    console.error("[GET] Error fetching products:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDB();
    const {
      name,
      price,
      image,
      shortsImage, // ✅ accept shortsImage
      category,
      league,
      patches,
      showShorts,
    } = await request.json();

    if (!name || !price || !image || !category) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await Product.create({
      name,
      price,
      image,
      shortsImage: shortsImage || null, // ✅ save it
      category,
      league: league || null,
      patches: patches || [],
      showShorts: showShorts || false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST] Error creating product:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectToDB();
    const {
      id,
      name,
      price,
      category,
      league,
      patches,
      showShorts,
      shortsImage, // ✅ allow update
    } = await request.json();

    if (!id || !name || !price || !category) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await Product.findByIdAndUpdate(id, {
      name,
      price,
      category,
      league: league || null,
      patches: patches || [],
      showShorts: showShorts || false,
      shortsImage: shortsImage || null, // ✅ update if provided
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT] Error updating product:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing product ID" },
        { status: 400 }
      );
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE] Error deleting product:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
