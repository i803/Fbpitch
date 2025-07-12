import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongoose";
import { Product } from "../../../models/Product";

// GET all products
export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find().lean();

    const formatted = products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      price: p.price,
      image: p.image,
      shortsImage: typeof p.shortsImage === "string" ? p.shortsImage : p.shortsImage?.secure_url || null,
      longSleevesImage: typeof p.longSleevesImage === "string" ? p.longSleevesImage : p.longSleevesImage?.secure_url || null, // ✅
      categories: Array.isArray(p.categories) ? p.categories : [p.categories || "NEW ARRIVALS"],
      league: p.league || null,
      patches: Array.isArray(p.patches) ? p.patches : [],
      showShorts: !!p.showShorts,
      showLongSleeves: !!p.showLongSleeves,
    }));

    return NextResponse.json({ products: formatted });
  } catch (err) {
    console.error("[GET] Failed to fetch products:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST a new product
export async function POST(request) {
  try {
    await connectToDB();
    const {
      name,
      price,
      image,
      shortsImage,
      longSleevesImage, // ✅
      categories,
      league,
      patches,
      showShorts,
      showLongSleeves,
    } = await request.json();

    if (!name || !price || !image || !Array.isArray(categories) || categories.length === 0 || !league) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await Product.create({
      name,
      price,
      image,
      shortsImage: typeof shortsImage === "string" ? shortsImage : shortsImage?.secure_url || null,
      longSleevesImage: typeof longSleevesImage === "string" ? longSleevesImage : longSleevesImage?.secure_url || null, // ✅
      categories,
      league,
      patches: Array.isArray(patches) ? patches : [],
      showShorts: !!showShorts,
      showLongSleeves: !!showLongSleeves,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST] Failed to create product:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT (update) a product
export async function PUT(request) {
  try {
    await connectToDB();
    const {
      id,
      name,
      price,
      image,
      shortsImage,
      longSleevesImage, // ✅
      categories,
      league,
      patches,
      showShorts,
      showLongSleeves,
    } = await request.json();

    if (!id || !name || !price || !image || !Array.isArray(categories) || categories.length === 0 || !league) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await Product.findByIdAndUpdate(id, {
      name,
      price,
      image,
      shortsImage: typeof shortsImage === "string" ? shortsImage : shortsImage?.secure_url || null,
      longSleevesImage: typeof longSleevesImage === "string" ? longSleevesImage : longSleevesImage?.secure_url || null, // ✅
      categories,
      league,
      patches: Array.isArray(patches) ? patches : [],
      showShorts: !!showShorts,
      showLongSleeves: !!showLongSleeves,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT] Failed to update product:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE a product
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
    console.error("[DELETE] Failed to delete product:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
