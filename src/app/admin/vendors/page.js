import Link from "next/link";
import { listVendorsAdmin, deleteVendor } from "@/lib/actions/vendors";
import AdminSearchBar from "@/components/admin/AdminSearchBar";

export const metadata = { title: "Admin · Vendors — SNAR" };

export default async function VendorsPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const vendors = await listVendorsAdmin(query);

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin · Expenses</div>
          <h1 className="shop-title">Vendors</h1>
        </div>
        <Link href="/admin/vendors/new" className="btn-primary">NEW VENDOR</Link>
      </div>

      <AdminSearchBar action="/admin/vendors" placeholder="Search by name or email…" query={query} />

      <div className="admin-table">
        {vendors.length === 0 && <p className="empty-state">No vendors yet.</p>}
        {vendors.map((v) => (
          <div key={v.id} className="admin-table-row admin-table-row-cat">
            <div className="admin-table-name">{v.name}</div>
            <div className="admin-table-cat">{v.email || v.phone || "—"}</div>
            <div className="admin-table-actions">
              <Link href={`/admin/vendors/${v.id}/edit`}>Edit</Link>
              <form action={deleteVendor}>
                <input type="hidden" name="id" value={v.id} />
                <button type="submit" className="admin-delete-btn">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
