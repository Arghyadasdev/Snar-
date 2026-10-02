import { listSkusAdmin, updateSkuFields } from "@/lib/actions/admin-sku";
import AdminSearchBar from "@/components/admin/AdminSearchBar";

export const metadata = { title: "Admin · SKU — SNAR" };

export default async function AdminSkuPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const products = await listSkusAdmin(query);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">SKU</h1>
        <p className="shop-sub">SKU, HSN code, and GST rate per product — used on tax invoices. Leave GST rate blank to use the store default (Admin → Settings).</p>
      </div>

      <AdminSearchBar action="/admin/sku" placeholder="Search by name, SKU, or HSN…" query={query} />

      <div className="admin-table">
        {products.length === 0 && <p className="empty-state">No products found.</p>}
        {products.map((p) => (
          <div key={p.id} className="admin-table-row" style={{ gridTemplateColumns: "48px 1fr auto" }}>
            <img src={p.image_url} alt={p.name} className="admin-table-img" loading="lazy" />
            <div className="admin-table-name">
              {p.name}
              {!p.is_active && <span className="order-status order-status-cancelled" style={{ marginLeft: ".5rem" }}>hidden</span>}
            </div>
            <form action={updateSkuFields} style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              <input type="hidden" name="id" value={p.id} />
              <input className="auth-input" name="sku" defaultValue={p.sku || ""} placeholder="SKU" style={{ width: "140px", padding: ".4rem .6rem" }} />
              <input className="auth-input" name="hsnCode" defaultValue={p.hsn_code || ""} placeholder="HSN" style={{ width: "90px", padding: ".4rem .6rem" }} />
              <input className="auth-input" name="gstRate" type="number" step="0.1" defaultValue={p.gst_rate ?? ""} placeholder="GST %" style={{ width: "80px", padding: ".4rem .6rem" }} />
              <button type="submit" className="btn-outline" style={{ padding: ".4rem .9rem" }}>Save</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
