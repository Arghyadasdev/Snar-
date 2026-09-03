import Link from "next/link";
import { listAllOrdersAdmin } from "@/lib/actions/admin-orders";
import OrderStatusSelect from "./order-status-select";

export const metadata = { title: "Admin · Orders — SNAR" };

export default async function AdminOrdersPage() {
  const orders = await listAllOrdersAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Orders</h1>
      </div>

      <div className="admin-table">
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
