import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { signToken } from "../../../lib/auth";
import { isRecoverableAuthDatabaseError } from "../../../lib/auth-db";

const DEV_FALLBACK_EMAIL = process.env.DEV_ADMIN_EMAIL?.trim().toLowerCase() || "admin@sanga.local";
const DEV_FALLBACK_PASSWORD = process.env.DEV_ADMIN_PASSWORD || "sanga-admin";

function buildAuthResponse(email: string) {
  const token = signToken({
    id: "0",
    email,
    role: "admin",
  });

  const response = NextResponse.json({ message: "Login successful", token });

  const sameSite: "strict" | "lax" | "none" =
    process.env.NODE_ENV === "production" ? "strict" : "lax";

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export async function POST(req: Request) {
  let requestBody: { email?: unknown; password?: unknown } | null = null;

  try {
    requestBody = await req.json();
    const email = requestBody?.email;
    const password = String(requestBody?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
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

    return buildAuthResponse(admin.email);
  } catch (error) {
    const normalizedEmail = String(requestBody?.email ?? "").trim().toLowerCase();
    const password = String(requestBody?.password ?? "");

    if (isRecoverableAuthDatabaseError(error)) {
      if (
        process.env.NODE_ENV !== "production" &&
        normalizedEmail === DEV_FALLBACK_EMAIL &&
        password === DEV_FALLBACK_PASSWORD
      ) {
        console.warn("LOGIN ERROR: using local auth fallback while database is unavailable");
        return buildAuthResponse(DEV_FALLBACK_EMAIL);
      }

      console.warn("LOGIN ERROR: authentication database is unavailable");

      return NextResponse.json(
        { error: "Authentication service is temporarily unavailable" },
        { status: 503 }
      );
    }

    console.error("LOGIN ERROR:", error);

    if (error instanceof Error && error.message.includes("JWT_SECRET is not configured")) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}