import { requireAdmin } from "@/lib/auth/dal";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default async function AdminLayout({ children }) {
  const profile = await requireAdmin();

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar name={profile.full_name} email={profile.email} />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
