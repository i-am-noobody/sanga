import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";
import { getUser } from "../../lib/getUser";

// ✅ GET all menu items (public)
export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET MENU ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// ✅ CREATE menu item (admin only)
export async function POST(req: Request) {
  try {
    const user = await getUser(); // ✅ FIXED

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { name, price, imageUrl, category, description } = body;

    // ✅ Validation
    if (!name || !price || !imageUrl || !category) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    if (isNaN(Number(price))) {
      return NextResponse.json(
        { error: "Price must be a number" },
        { status: 400 }
      );
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl,
        category,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("CREATE MENU ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Server error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}