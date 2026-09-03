import { listCustomersAdmin } from "@/lib/actions/admin-customers";
import { getCurrentUser } from "@/lib/auth/dal";
import RoleSelect from "./role-select";
import ResetPasswordButton from "./reset-password-button";
import AdminSearchBar from "@/components/admin/AdminSearchBar";

export const metadata = { title: "Admin · Customers — SNAR" };

export default async function AdminCustomersPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const [customers, currentUser] = await Promise.all([listCustomersAdmin(query), getCurrentUser()]);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Customers</h1>
      </div>

      <AdminSearchBar action="/admin/customers" placeholder="Search by name or email…" query={query} />

      <div className="admin-table">
        {customers.length === 0 && <p className="empty-state">No customers found.</p>}
        {customers.map((c) => (
          <div key={c.id} className="admin-table-row admin-table-row-cat">
            <div className="admin-table-name">{c.full_name || "—"}</div>
            <div className="admin-table-cat">{c.email}</div>
            <div style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
              <RoleSelect customerId={c.id} role={c.role} isSelf={c.id === currentUser?.id} />
              <ResetPasswordButton customerId={c.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
