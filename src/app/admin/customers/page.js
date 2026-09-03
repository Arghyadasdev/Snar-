import { listCustomersAdmin } from "@/lib/actions/admin-customers";
import { getCurrentUser } from "@/lib/auth/dal";
import RoleSelect from "./role-select";

export const metadata = { title: "Admin · Customers — SNAR" };

export default async function AdminCustomersPage() {
  const [customers, currentUser] = await Promise.all([listCustomersAdmin(), getCurrentUser()]);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Customers</h1>
      </div>

      <div className="admin-table">
        {customers.map((c) => (
          <div key={c.id} className="admin-table-row admin-table-row-cat">
            <div className="admin-table-name">{c.full_name || "—"}</div>
            <div className="admin-table-cat">{c.email}</div>
            <RoleSelect customerId={c.id} role={c.role} isSelf={c.id === currentUser?.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
