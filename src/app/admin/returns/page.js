import Link from "next/link";
import { listReturnsAdmin, approveReturn, rejectReturn } from "@/lib/actions/returns";

export const metadata = { title: "Admin · Returns — SNAR" };

export default async function AdminReturnsPage() {
  const returns = await listReturnsAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Returns</h1>
      </div>

      <div className="admin-table">
        {returns.length === 0 && <p className="empty-state">No return requests.</p>}
        {returns.map((r) => (
          <div key={r.id} className="admin-table-row admin-table-row-cat">
            <div>
              <Link href={`/admin/orders/${r.order_id}`} className="admin-table-name">
                Order #{r.order_id.slice(0, 8)} — {r.order?.shipping_name}
              </Link>
              <div className="order-item-meta">{r.reason}</div>
            </div>
            <div className="admin-table-cat">
              <span className={`order-status order-status-${r.status === "refunded" ? "delivered" : r.status === "rejected" ? "cancelled" : "pending"}`}>
                {r.status}
              </span>
              {" · ₹"}{Number(r.order?.total || 0).toFixed(2)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {r.status === "requested" && (
                <>
                  <form action={approveReturn}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="btn-outline" style={{ padding: ".4rem .9rem" }}>Approve &amp; Refund</button>
                  </form>
                  <form action={rejectReturn}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="admin-delete-btn">Reject</button>
                  </form>
                </>
              )}
              {r.status === "approved" && (
                <form action={approveReturn}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="btn-outline" style={{ padding: ".4rem .9rem" }}>Retry Refund</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
