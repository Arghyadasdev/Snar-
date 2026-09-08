import Link from "next/link";
import { listLeadsAdmin, deleteLead } from "@/lib/actions/admin-leads";
import LeadStatusSelect from "./lead-status-select";
import AdminSearchBar from "@/components/admin/AdminSearchBar";

export const metadata = { title: "Admin · Leads — SNAR" };

export default async function AdminLeadsPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const leads = await listLeadsAdmin(query);

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin</div>
          <h1 className="shop-title">Leads</h1>
        </div>
        <Link href="/admin/leads/new" className="btn-primary">NEW LEAD</Link>
      </div>

      <AdminSearchBar action="/admin/leads" placeholder="Search by name, email, or phone…" query={query} />

      <div className="admin-table">
        {leads.length === 0 && <p className="empty-state">No leads yet.</p>}
        {leads.map((l) => (
          <div key={l.id} className="admin-table-row admin-table-row-cat">
            <div className="admin-table-name">{l.name}</div>
            <div className="admin-table-cat">{l.email || l.phone || "—"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <LeadStatusSelect leadId={l.id} status={l.status} />
              <Link href={`/admin/leads/${l.id}/edit`}>Edit</Link>
              <form action={deleteLead}>
                <input type="hidden" name="id" value={l.id} />
                <button type="submit" className="admin-delete-btn">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
