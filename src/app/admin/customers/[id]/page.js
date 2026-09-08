import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerDetailAdmin } from "@/lib/actions/admin-customers";
import { listTagsAdmin } from "@/lib/actions/admin-tags";
import StatusSelect from "../status-select";
import SegmentBadge from "../segment-badge";
import CustomerNotes from "../customer-notes";
import CustomerTags from "../customer-tags";

export const metadata = { title: "Admin · Customer — SNAR" };

const ACTIVITY_LABELS = {
  customer_registered: "Customer registered",
  order_placed: "Order placed",
  payment_completed: "Payment completed",
  order_delivered: "Order delivered",
  order_cancelled: "Order cancelled",
};

export default async function AdminCustomerDetailPage({ params }) {
  const { id } = await params;
  const [detail, allTags] = await Promise.all([getCustomerDetailAdmin(id), listTagsAdmin()]);
  if (!detail) notFound();

  const { profile, stats, segment, orders, activities, notes, tags } = detail;

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin · Customer</div>
        <h1 className="shop-title">{profile.full_name || "—"}</h1>
        <p className="shop-sub">{profile.email}</p>
      </div>

      <div className="order-detail-grid">
        <div className="order-items-list" style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
          <div>
            <div className="order-shipping-title">Orders</div>
            {orders.length === 0 && <p className="empty-state">No orders yet.</p>}
            {orders.map((o) => (
              <div key={o.id} className="order-item-row">
                <div>
                  <Link href={`/admin/orders/${o.id}`} className="order-item-name">
                    Order #{o.id.slice(0, 8)}
                  </Link>
                  <div className="order-item-meta">{new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                  <span className={`order-status order-status-${o.status}`}>{o.status}</span>
                  <div className="order-item-price">₹{Number(o.total).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="order-shipping-title">Activity</div>
            {activities.length === 0 && <p className="empty-state">No activity yet.</p>}
            {activities.map((a) => (
              <div key={a.id} className="order-item-row">
                <div>{ACTIVITY_LABELS[a.activity_type] || a.activity_type}</div>
                <div className="order-item-meta">{new Date(a.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="order-shipping-title">Notes</div>
            <CustomerNotes customerId={profile.id} notes={notes} />
          </div>
        </div>

        <div className="order-shipping-card">
          <div className="order-shipping-title">Overview</div>
          <p>Status</p>
          <StatusSelect customerId={profile.id} status={profile.status} />
          <p style={{ marginTop: ".8rem" }}>Segment</p>
          <SegmentBadge segment={segment} />
          {!segment && <p style={{ fontSize: ".8rem", color: "var(--muted)" }}>—</p>}

          <div className="order-shipping-title" style={{ marginTop: "1.4rem" }}>Financial</div>
          <p>Total Orders: {stats.total_orders}</p>
          <p>Total Spent: ₹{Number(stats.total_spent).toFixed(2)}</p>
          <p>Last Order: {stats.last_order_at ? new Date(stats.last_order_at).toLocaleDateString() : "—"}</p>

          <div className="order-shipping-title" style={{ marginTop: "1.4rem" }}>Tags</div>
          <CustomerTags customerId={profile.id} tags={tags} allTags={allTags} />
        </div>
      </div>
    </div>
  );
}
