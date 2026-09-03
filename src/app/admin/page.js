import Link from "next/link";
import { getAdminStats } from "@/lib/actions/admin-stats";
import SalesChart from "@/components/admin/SalesChart";
import StatusDonut from "@/components/admin/StatusDonut";

export const metadata = { title: "Admin — SNAR" };

const RANGES = [
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
];

export default async function AdminDashboard({ searchParams }) {
  const params = await searchParams;
  const rangeDays = params?.range ? Number(params.range) : 7;
  const stats = await getAdminStats(rangeDays);

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
          <div className="admin-kpi-label">AVG ORDER VALUE</div>
          <div className="admin-kpi-num">₹{stats.avgOrderValue.toFixed(0)}</div>
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
          <div className="admin-panel-title-row">
            <div className="admin-panel-title">SALES OVERVIEW — LAST {stats.rangeDays} DAYS</div>
            <div className="admin-range-tabs">
              {RANGES.map((r) => (
                <Link
                  key={r.days}
                  href={`/admin?range=${r.days}`}
                  className={`admin-range-tab${stats.rangeDays === r.days ? " active" : ""}`}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
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

      <div className="admin-panel" style={{ marginBottom: "1rem" }}>
        <div className="admin-panel-title-row">
          <div className="admin-panel-title">LOW STOCK ({stats.lowStock.length})</div>
          <Link href="/admin/products" className="admin-panel-link">Manage Products →</Link>
        </div>
        {stats.lowStock.length === 0 ? (
          <p className="empty-state">Nothing running low.</p>
        ) : (
          <div className="admin-recent-table">
            {stats.lowStock.map((p) => (
              <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="admin-recent-row" style={{ gridTemplateColumns: "1fr 100px" }}>
                <span>{p.name}</span>
                <span style={{ color: p.stock === 0 ? "#FF6B6B" : "#FFC107", fontWeight: 700, textAlign: "right" }}>
                  {p.stock} left
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
