import { listInventoryAdmin, updateProductStock } from "@/lib/actions/admin-inventory";
import { updateVariantStock } from "@/lib/actions/admin-variants";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import StockInput from "./stock-input";

export const metadata = { title: "Admin · Inventory — SNAR" };

export default async function AdminInventoryPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const products = await listInventoryAdmin(query);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Inventory</h1>
        <p className="shop-sub">Stock across all products, lowest first. Variant stock (by color) shown underneath when a product has colors.</p>
      </div>

      <AdminSearchBar action="/admin/inventory" placeholder="Search products…" query={query} />

      <div className="admin-table">
        {products.length === 0 && <p className="empty-state">No products found.</p>}
        {products.map((p) => (
          <div key={p.id}>
            <div className="admin-table-row" style={{ gridTemplateColumns: "48px 1fr auto" }}>
              <img src={p.image_url} alt={p.name} className="admin-table-img" loading="lazy" />
              <div className="admin-table-name">
                {p.name}
                {!p.is_active && <span className="order-status order-status-cancelled" style={{ marginLeft: ".5rem" }}>hidden</span>}
              </div>
              <StockInput action={updateProductStock} hiddenFields={{ id: p.id }} stock={p.stock} />
            </div>

            {p.variants?.length > 0 && (
              <div style={{ marginLeft: "3.5rem", marginBottom: ".6rem" }}>
                {p.variants.map((v) => (
                  <div key={v.id} className="order-item-row" style={{ padding: ".4rem 0" }}>
                    <div className="order-item-meta">{v.color_name}</div>
                    <StockInput action={updateVariantStock} hiddenFields={{ id: v.id, productId: p.id }} stock={v.stock} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
