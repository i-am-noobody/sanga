import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getUser } from "../../../lib/getUser";

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

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: Number(id) },
      data: body,
    });

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

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    await prisma.menuItem.delete({
      where: { id: Number(id) },
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