import Link from "next/link";
import { listOrders } from "@/lib/data/orders";

export const metadata = { title: "Order History — SNAR" };

export default async function OrdersPage() {
  const orders = await listOrders();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">My Account</div>
        <h1 className="shop-title">Order History</h1>
      </div>

      {orders.length === 0 ? (
        <p className="empty-state">You haven&apos;t placed any orders yet. <Link href="/collections">Start shopping</Link>.</p>
      ) : (
        <div className="orders-table">
          {orders.map((o) => (
            <Link key={o.id} href={`/account/orders/${o.id}`} className="order-row">
              <span className="order-id">#{o.id.slice(0, 8)}</span>
              <span className="order-date">{new Date(o.created_at).toLocaleDateString()}</span>
              <span className={`order-status order-status-${o.status}`}>{o.status}</span>
              <span className="order-total">₹{Number(o.total).toFixed(2)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
