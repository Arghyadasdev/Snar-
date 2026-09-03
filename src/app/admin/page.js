import Link from "next/link";
import { getAdminStats } from "@/lib/actions/admin-stats";
import SalesChart from "@/components/admin/SalesChart";
import StatusDonut from "@/components/admin/StatusDonut";

export const metadata = { title: "Admin — SNAR" };

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <>
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">TOTAL REVENUE</div>
          <div className="admin-kpi-num">₹{stats.revenue.toLocaleString()}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">TOTAL ORDERS</div>
          <div className="admin-kpi-num">{stats.orderCount}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">TOTAL CUSTOMERS</div>
          <div className="admin-kpi-num">{stats.customerCount}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">PENDING ORDERS</div>
          <div className="admin-kpi-num">{stats.pendingCount}</div>
        </div>
      </div>

      <div className="admin-dash-grid">
        <div className="admin-panel">
          <div className="admin-panel-title">SALES OVERVIEW — LAST 7 DAYS</div>
          <SalesChart data={stats.salesOverview} />
        </div>

        <div className="admin-panel">
          <div className="admin-panel-title">ORDER STATUS</div>
          <StatusDonut breakdown={stats.statusBreakdown} />
        </div>
      </div>

      <div className="admin-dash-grid">
        <div className="admin-panel">
          <div className="admin-panel-title-row">
            <div className="admin-panel-title">RECENT ORDERS</div>
            <Link href="/admin/orders" className="admin-panel-link">View All Orders →</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="empty-state">No orders yet.</p>
          ) : (
            <div className="admin-recent-table">
              {stats.recentOrders.map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="admin-recent-row">
                  <span className="admin-recent-id">#{o.id.slice(0, 8)}</span>
                  <span>{o.shipping_name}</span>
                  <span className="admin-recent-date">{new Date(o.created_at).toLocaleDateString()}</span>
                  <span className="admin-recent-amount">₹{Number(o.total).toLocaleString()}</span>
                  <span className={`order-status order-status-${o.status}`}>{o.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-title">TOP SELLING PRODUCTS</div>
          {stats.topProducts.length === 0 ? (
            <p className="empty-state">No sales yet.</p>
          ) : (
            <div className="admin-top-products">
              {stats.topProducts.map((p) => (
                <div key={p.name} className="admin-top-product-row">
                  <div className="admin-top-product-name">{p.name}</div>
                  <div className="admin-top-product-meta">₹{p.revenue.toLocaleString()} · {p.qty} sold</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
