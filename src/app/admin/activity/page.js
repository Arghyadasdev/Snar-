import { listAdminActivity } from "@/lib/actions/admin-activity";

export const metadata = { title: "Admin · Activity Log — SNAR" };

const ACTION_LABELS = {
  order_status_changed: "changed order status to",
  return_refunded: "approved a refund for return",
  return_rejected: "rejected return",
  customer_status_changed: "set customer status to",
  customer_role_changed: "set customer role to",
  shipment_cancelled: "cancelled Shiprocket shipment for order",
};

function describe(entry) {
  const label = ACTION_LABELS[entry.action] || entry.action;
  const value = entry.metadata?.status || entry.metadata?.role || "";
  return `${label}${value ? ` "${value}"` : ""}`;
}

export default async function AdminActivityPage() {
  const entries = await listAdminActivity();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Activity Log</h1>
        <p className="shop-sub">Order status changes, refunds, customer status/role changes, and shipment cancellations.</p>
      </div>

      <div className="admin-table">
        {entries.length === 0 && <p className="empty-state">No activity recorded yet.</p>}
        {entries.map((e) => (
          <div key={e.id} className="admin-table-row admin-table-row-cat">
            <div>
              <div className="admin-table-name">{e.admin_email || "Unknown admin"}</div>
              <div className="order-item-meta">
                {describe(e)} · {e.entity_type} {e.entity_id ? `#${e.entity_id.slice(0, 8)}` : ""}
              </div>
            </div>
            <div className="admin-table-cat">{new Date(e.created_at).toLocaleString()}</div>
            <div />
          </div>
        ))}
      </div>
    </div>
  );
}
