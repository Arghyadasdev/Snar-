import Link from "next/link";
import { listCustomersAdmin } from "@/lib/actions/admin-customers";
import { getCurrentUser } from "@/lib/auth/dal";
import RoleSelect from "./role-select";
import ResetPasswordButton from "./reset-password-button";
import CustomerFilters from "./customer-filters";
import StatusSelect from "./status-select";
import SegmentBadge from "./segment-badge";

export const metadata = { title: "Admin · Customers — SNAR" };

export default async function AdminCustomersPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const status = params?.status || "";
  const segment = params?.segment || "";
  const [customers, currentUser] = await Promise.all([
    listCustomersAdmin(query, status, segment),
    getCurrentUser(),
  ]);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Customers</h1>
      </div>

      <CustomerFilters query={query} status={status} segment={segment} />

      <div className="admin-table">
        {customers.length === 0 && <p className="empty-state">No customers found.</p>}
        {customers.map((c) => (
          <div key={c.id} className="admin-table-row admin-table-row-cat">
            <div>
              <Link href={`/admin/customers/${c.id}`} className="admin-table-name">{c.full_name || "—"}</Link>
              <SegmentBadge segment={c.segment} />
            </div>
            <div className="admin-table-cat">{c.email}</div>
            <div style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
              <StatusSelect customerId={c.id} status={c.status} />
              <RoleSelect customerId={c.id} role={c.role} isSelf={c.id === currentUser?.id} />
              <ResetPasswordButton customerId={c.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
