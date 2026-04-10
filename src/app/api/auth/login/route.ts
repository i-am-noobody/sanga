import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { signToken } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: admin.id.toString(),
      email: admin.email,
      role: "admin",
    });

    const response = NextResponse.json({ message: "Login successful", token });

    const sameSite: "strict" | "lax" | "none" =
      process.env.NODE_ENV === "production" ? "strict" : "lax";

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // If you call API from a different origin, set sameSite to 'none' and secure=true in production.
      sameSite,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    response.cookies.set("token", token, cookieOptions);

    return response;
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}