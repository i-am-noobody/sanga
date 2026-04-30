import AdminDashboard from "@/components/admin/AdminDashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../lib/auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return <AdminDashboard />;
}
