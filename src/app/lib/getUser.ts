import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const user = await verifyToken(token);
    console.log(user)
    return user;
  } catch {
    return null;
  }
}