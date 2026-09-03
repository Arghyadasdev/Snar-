import Link from "next/link";
import { listAllProductsAdmin, deleteProduct } from "@/lib/actions/admin-products";
import AdminSearchBar from "@/components/admin/AdminSearchBar";

export const metadata = { title: "Admin · Products — SNAR" };

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const products = await listAllProductsAdmin(query);

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin</div>
          <h1 className="shop-title">Products</h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary">NEW PRODUCT</Link>
      </div>

      <AdminSearchBar action="/admin/products" placeholder="Search products by name…" query={query} exportHref="/admin/products/export" />

      <div className="admin-table">
        {products.length === 0 && <p className="empty-state">No products found.</p>}
        {products.map((p) => (
          <div key={p.id} className="admin-table-row">
            <img src={p.image_url} alt={p.name} className="admin-table-img" loading="lazy" />
            <div className="admin-table-name">
              {p.name}
              {!p.is_active && <span className="order-status order-status-cancelled" style={{ marginLeft: ".5rem" }}>hidden</span>}
            </div>
            <div className="admin-table-cat">{p.category?.name}</div>
            <div className="admin-table-price">₹{Number(p.price).toFixed(2)}</div>
            <div className="admin-table-actions">
              <Link href={`/admin/products/${p.id}/edit`}>Edit</Link>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="admin-delete-btn">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
