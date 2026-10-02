import Link from "next/link";
import { listInvoicesAdmin } from "@/lib/actions/admin-invoices";
import AdminSearchBar from "@/components/admin/AdminSearchBar";

export const metadata = { title: "Admin · Invoices — SNAR" };

export default async function AdminInvoicesPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const invoices = await listInvoicesAdmin(query);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Invoices</h1>
        <p className="shop-sub">Every GST tax invoice generated after payment, newest first.</p>
      </div>

      <AdminSearchBar action="/admin/invoices" placeholder="Search by invoice number or customer…" query={query} />

      <div className="admin-table">
        {invoices.length === 0 && <p className="empty-state">No invoices generated yet.</p>}
        {invoices.map((inv) => (
          <div key={inv.id} className="admin-table-row admin-table-row-cat">
            <div>
              <Link href={`/admin/orders/${inv.id}`} className="admin-table-name">{inv.invoice_number}</Link>
              <div className="order-item-meta">{inv.shipping_name} · {new Date(inv.invoice_date).toLocaleDateString()}</div>
            </div>
            <div className="admin-table-cat">
              ₹{Number(inv.total).toFixed(2)} · {inv.gst_type === "intra" ? "CGST+SGST" : "IGST"} ₹{Number(inv.tax_amount).toFixed(2)}
            </div>
            <div className="admin-table-actions">
              <a href={`/api/invoices/${inv.id}`}>Download</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
