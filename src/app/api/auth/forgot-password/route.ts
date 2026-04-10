import { prisma } from "../../../lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_URL}/reset-password/${token}`;

    await sendEmail(email, "Reset Password", resetLink);

    return NextResponse.json({ message: "Reset email sent" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Server error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}