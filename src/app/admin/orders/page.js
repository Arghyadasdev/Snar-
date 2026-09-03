import Link from "next/link";
import { listAllOrdersAdmin } from "@/lib/actions/admin-orders";
import OrderStatusSelect from "./order-status-select";
import AdminSearchBar from "@/components/admin/AdminSearchBar";

export const metadata = { title: "Admin · Orders — SNAR" };

export default async function AdminOrdersPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const orders = await listAllOrdersAdmin(query);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Orders</h1>
      </div>

      <AdminSearchBar action="/admin/orders" placeholder="Search orders by customer name…" query={query} exportHref="/admin/orders/export" />

      <div className="admin-table">
        {orders.length === 0 && <p className="empty-state">No orders found.</p>}
        {orders.map((o) => (
          <div key={o.id} className="admin-table-row">
            <Link href={`/admin/orders/${o.id}`} className="admin-table-name">#{o.id.slice(0, 8)} — {o.shipping_name}</Link>
            <div className="admin-table-cat">{new Date(o.created_at).toLocaleDateString()}</div>
            <div className="admin-table-price">₹{Number(o.total).toFixed(2)}</div>
            <OrderStatusSelect orderId={o.id} status={o.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
