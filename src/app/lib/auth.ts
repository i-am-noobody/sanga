import jwt from "jsonwebtoken";
import { UserPayload } from "@/types/user";

function getJwtSecret(): string | null {
  const secret = process.env.JWT_SECRET;
  return typeof secret === "string" && secret.trim().length > 0 ? secret : null;
}

export function signToken(payload: UserPayload) {
  const secret = getJwtSecret();

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    const secret = getJwtSecret();

    if (!secret) {
      return null;
    }

    return jwt.verify(token, secret) as UserPayload;
  } catch {
    return null;
  }
}