import Link from "next/link";
import { listWarehousesAdmin, deleteWarehouse } from "@/lib/actions/admin-warehouses";

export const metadata = { title: "Admin · Warehouses — SNAR" };

export default async function AdminWarehousesPage() {
  const warehouses = await listWarehousesAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin</div>
          <h1 className="shop-title">Warehouses</h1>
          <p className="shop-sub">The active warehouse is where Shiprocket picks up every shipment from. Its name must exactly match a pickup address nickname already saved in your Shiprocket account.</p>
        </div>
        <Link href="/admin/warehouses/new" className="btn-primary">NEW WAREHOUSE</Link>
      </div>

      <div className="admin-table">
        {warehouses.length === 0 && <p className="empty-state">No warehouse set up yet. Add one so Shiprocket knows where to pick up from.</p>}
        {warehouses.map((w) => (
          <div key={w.id} className="admin-table-row admin-table-row-cat">
            <div className="admin-table-name">
              {w.name}
              {!w.is_active && <span className="order-status order-status-cancelled" style={{ marginLeft: ".5rem" }}>inactive</span>}
            </div>
            <div className="admin-table-cat">{w.city}, {w.state} {w.pincode}</div>
            <div className="admin-table-actions">
              <Link href={`/admin/warehouses/${w.id}/edit`}>Edit</Link>
              <form action={deleteWarehouse}>
                <input type="hidden" name="id" value={w.id} />
                <button type="submit" className="admin-delete-btn">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
