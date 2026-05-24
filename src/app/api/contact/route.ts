import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { getUser } from "../../lib/getUser";

type ContactMessageRow = {
  id: number;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

function isMissingContactMessageTable(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021" || error.code === "P2022") {
      return true;
    }
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("contactmessage") &&
    (
      message.includes("does not exist") ||
      message.includes("relation") ||
      message.includes("column") ||
      message.includes("unknown column") ||
      message.includes("p2021") ||
      message.includes("p2022")
    )
  );
}

export async function GET() {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.$queryRaw<ContactMessageRow[]>`
      SELECT
        "id",
        "name",
        "email",
        "message",
        "isRead",
        "createdAt"
      FROM "ContactMessage"
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json(messages);
  } catch (error) {
    if (isMissingContactMessageTable(error)) {
      return NextResponse.json([]);
    }

    console.error("GET CONTACT MESSAGES ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const [contactMessage] = await prisma.$queryRaw<ContactMessageRow[]>`
      INSERT INTO "ContactMessage" ("name", "email", "message")
      VALUES (${name}, ${email}, ${message})
      RETURNING "id", "name", "email", "message", "isRead", "createdAt"
    `;

    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: contactMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isMissingContactMessageTable(error)) {
      return NextResponse.json(
        { error: "Contact inbox is not ready yet. Please run database migrations." },
        { status: 503 }
      );
    }

    console.error("CREATE CONTACT MESSAGE ERROR:", error);
    const message = error instanceof Error ? error.message : "Server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}