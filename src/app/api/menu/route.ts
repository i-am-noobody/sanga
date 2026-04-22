import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";
import { getUser } from "../../lib/getUser";

function isUnknownSubcategoryArgument(error: unknown): boolean {
  return error instanceof Error && error.message.includes("Unknown argument `subcategory`");
}

function isMissingSubcategoryColumn(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("subcategory") &&
    (message.includes("does not exist") ||
      message.includes("unknown column") ||
      message.includes("p2022"))
  );
}

function shouldRetryWithoutSubcategory(error: unknown): boolean {
  return isUnknownSubcategoryArgument(error) || isMissingSubcategoryColumn(error);
}

// ✅ GET all menu items (public)
export async function GET() {
  try {
    let items;

    try {
      items = await prisma.menuItem.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (findError) {
      if (!isMissingSubcategoryColumn(findError)) {
        throw findError;
      }

      const fallbackItems = await prisma.menuItem.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true,
          category: true,
          isAvailable: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      items = fallbackItems.map((item) => ({
        ...item,
        subcategory: null,
      }));
    }

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

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { name, price, imageUrl, category, subcategory, description } = body;

    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedImageUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";
    const normalizedCategory = typeof category === "string" ? category.trim() : "";
    const normalizedSubcategory =
      typeof subcategory === "string" && subcategory.trim().length > 0
        ? subcategory.trim()
        : null;

    // ✅ Validation
    if (!normalizedName || !price || !normalizedImageUrl || !normalizedCategory) {
      return NextResponse.json(
        { error: "Name, price, image, and category are required" },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return NextResponse.json(
        { error: "Price must be a number" },
        { status: 400 }
      );
    }

    const createData = {
      name: normalizedName,
      description,
      price: numericPrice,
      imageUrl: normalizedImageUrl,
      category: normalizedCategory,
    };

    let item;

    try {
      item = await prisma.menuItem.create({
        data: {
          ...createData,
          subcategory: normalizedSubcategory,
        },
      });
    } catch (createError) {
      if (!shouldRetryWithoutSubcategory(createError)) {
        throw createError;
      }

      // Backward compatibility: some environments still use a Prisma client without subcategory.
      item = await prisma.menuItem.create({ data: createData });
    }

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