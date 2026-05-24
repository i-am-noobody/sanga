import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getUser } from "../../../lib/getUser";

const menuItemSafeSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  category: true,
  isAvailable: true,
  createdAt: true,
} as const;

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

async function findMenuItemByIdResilient(id: number) {
  try {
    return await prisma.menuItem.findUnique({
      where: { id },
    });
  } catch (readError) {
    if (!isMissingSubcategoryColumn(readError)) {
      throw readError;
    }

    const fallbackItem = await prisma.menuItem.findUnique({
      where: { id },
      select: menuItemSafeSelect,
    });

    if (!fallbackItem) {
      return null;
    }

    return {
      ...fallbackItem,
      subcategory: null,
    };
  }
}

// ✅ UPDATE menu item
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const updatePayload = { ...body };
    if (typeof body?.category === "string") {
      updatePayload.category = body.category.trim();
    }
    if (typeof body?.subcategory === "string") {
      updatePayload.subcategory = body.subcategory.trim() || null;
    }

    const itemId = Number(id);
    const existingItem = await findMenuItemByIdResilient(itemId);

    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    let updatedItem;

    try {
      updatedItem = await prisma.menuItem.update({
        where: { id: itemId },
        data: updatePayload,
      });
    } catch (updateError) {
      if (!shouldRetryWithoutSubcategory(updateError)) {
        throw updateError;
      }

      const fallbackPayload: Record<string, unknown> = { ...updatePayload };
      delete fallbackPayload.subcategory;

      // Backward compatibility: retry without subcategory and avoid selecting missing column.
      const fallbackUpdatedItem = await prisma.menuItem.update({
        where: { id: itemId },
        data: fallbackPayload,
        select: menuItemSafeSelect,
      });

      updatedItem = {
        ...fallbackUpdatedItem,
        subcategory: null,
      };
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("UPDATE MENU ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Server error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ✅ DELETE menu item
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const itemId = Number(id);
    const existingItem = await findMenuItemByIdResilient(itemId);

    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MENU ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Server error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}