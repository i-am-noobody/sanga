import jwt from "jsonwebtoken";
import { UserPayload } from "@/types/user";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: UserPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
  } catch {
    return null;
  }
}