import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { isRecoverableAuthDatabaseError } from "../../../lib/auth-db";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { email: record.email },
      data: { password: hashed },
    });

    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    if (isRecoverableAuthDatabaseError(error)) {
      return NextResponse.json(
        { error: "Authentication service is temporarily unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}