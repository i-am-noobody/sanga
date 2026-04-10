import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  // Authentication is handled by middleware, so this page assumes user is admin
  return <AdminDashboard />;
}
