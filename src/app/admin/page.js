import Link from "next/link";
import { getAdminStats } from "@/lib/actions/admin-stats";
import { requireAdmin } from "@/lib/auth/dal";
import SalesChart from "@/components/admin/SalesChart";
import StatusDonut from "@/components/admin/StatusDonut";
import RefreshButton from "@/components/admin/RefreshButton";

export const metadata = { title: "Admin — SNAR" };

const RANGES = [
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
];

const SEGMENT_COLOR = {
  vip: "#FFC107",
  regular: "#00C4D4",
  new: "#4CD964",
  inactive: "#8B9CFF",
};

const KPI_STYLE = {
  revenue: { bg: "#6D5DFB", icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v12M9 9h4.5a2.5 2.5 0 0 1 0 5H9" /></> },
  orders: { bg: "#FF9F40", icon: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></> },
  aov: { bg: "#00B894", icon: <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></> },
  customers: { bg: "#4D8CFF", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></> },
  newCustomers: { bg: "#FF6B9D", icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></> },
};

function formatKpiValue(kpi) {
  if (kpi.format === "currency") return `₹${Math.round(kpi.value).toLocaleString()}`;
  return Math.round(kpi.value).toLocaleString();
}

function DeltaBadge({ delta }) {
  const up = delta >= 0;
  return (
    <span className={`admin-kpi-delta ${up ? "up" : "down"}`}>
      {up ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}% <span className="admin-kpi-delta-sub">vs Last Period</span>
    </span>
  );
}

function formatDate(d) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminDashboard({ searchParams }) {
  const params = await searchParams;
  const rangeDays = params?.range ? Number(params.range) : 7;
  const [stats, profile] = await Promise.all([getAdminStats(rangeDays), requireAdmin()]);

  return (
    <>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Dashboard</div>
          <p className="admin-page-welcome">Welcome back, {profile.full_name || profile.email} 👋</p>
        </div>
        <div className="admin-header-actions">
          <div className="admin-date-range">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {formatDate(stats.rangeStart)} – {formatDate(stats.rangeEnd)}
          </div>
          <div className="admin-range-tabs">
            {RANGES.map((r) => (
              <Link key={r.days} href={`/admin?range=${r.days}`} className={`admin-range-tab${stats.rangeDays === r.days ? " active" : ""}`}>
                {r.label}
              </Link>
            ))}
          </div>
          <RefreshButton />
        </div>
      </div>

      <div className="admin-kpi-grid">
        {stats.kpis.map((kpi) => (
          <div key={kpi.key} className="admin-kpi-card">
            <div className="admin-kpi-icon" style={{ background: KPI_STYLE[kpi.key].bg }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {KPI_STYLE[kpi.key].icon}
              </svg>
            </div>
            <div className="admin-kpi-label">{kpi.label.toUpperCase()}</div>
            <div className="admin-kpi-num">{formatKpiValue(kpi)}</div>
            <DeltaBadge delta={kpi.delta} />
          </div>
        ))}
      </div>

      <div className="admin-breakdown-row">
        <div className="admin-breakdown-box confirmed">
          <div className="admin-breakdown-label">CONFIRMED</div>
          <div className="admin-breakdown-value">₹{Math.round(stats.valueBreakdown.confirmed.total).toLocaleString()}</div>
          <div className="admin-breakdown-sub">{stats.valueBreakdown.confirmed.count} confirmed sales</div>
        </div>
        <div className="admin-breakdown-box pending">
          <div className="admin-breakdown-label">PENDING</div>
          <div className="admin-breakdown-value">₹{Math.round(stats.valueBreakdown.pending.total).toLocaleString()}</div>
          <div className="admin-breakdown-sub">{stats.valueBreakdown.pending.count} orders waiting</div>
        </div>
        <div className="admin-breakdown-box cancelled">
          <div className="admin-breakdown-label">CANCELLED</div>
          <div className="admin-breakdown-value">₹{Math.round(stats.valueBreakdown.cancelled.total).toLocaleString()}</div>
          <div className="admin-breakdown-sub">{stats.valueBreakdown.cancelled.count} orders, never counted</div>
        </div>
      </div>

      <div className="admin-secondary-row">
        {stats.secondaryCounts.map((c) => (
          <div key={c.label} className="admin-secondary-card">
            <div className="admin-secondary-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3" /></svg>
            </div>
            <div>
              <div className="admin-secondary-label">{c.label}</div>
              <div className="admin-secondary-num">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dash-grid-3">
        <div className="admin-panel">
          <div className="admin-panel-title">REVENUE OVERVIEW</div>
          <SalesChart data={stats.salesOverview} />
        </div>

        <div className="admin-panel">
          <div className="admin-panel-title">TOP 5 STATES BY REVENUE</div>
          {stats.topStates.length === 0 ? (
            <p className="empty-state">No state revenue data yet.</p>
          ) : (
            <div className="admin-ranked-list">
              {stats.topStates.map((s) => (
                <div key={s.name} className="admin-ranked-row">
                  <span className="admin-ranked-name">{s.name}</span>
                  <span className="admin-ranked-value">₹{Math.round(s.total).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-title">TOP 5 CITIES BY REVENUE</div>
          {stats.topCities.length === 0 ? (
            <p className="empty-state">No city revenue data yet.</p>
          ) : (
            <div className="admin-ranked-list">
              {stats.topCities.map((c) => (
                <div key={c.name} className="admin-ranked-row">
                  <span className="admin-ranked-name">{c.name}</span>
                  <span className="admin-ranked-value">₹{Math.round(c.total).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-dash-grid-3">
        <div className="admin-panel">
          <div className="admin-panel-title">CUSTOMER SEGMENTS</div>
          <StatusDonut breakdown={stats.segmentBreakdown} colorMap={SEGMENT_COLOR} />
        </div>

        <div className="admin-panel">
          <div className="admin-panel-title">REFUND OVERVIEW</div>
          <div className="admin-refund-grid">
            <div className="admin-refund-tile">
              <div className="admin-refund-icon" style={{ background: "#6D5DFB" }}>₹</div>
              <div>
                <div className="admin-refund-label">Total Refunded</div>
                <div className="admin-refund-value">₹{Math.round(stats.refundOverview.totalRefunded).toLocaleString()}</div>
              </div>
            </div>
            <div className="admin-refund-tile">
              <div className="admin-refund-icon" style={{ background: "#FFC107" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <div>
                <div className="admin-refund-label">Pending Returns</div>
                <div className="admin-refund-value">{stats.refundOverview.pendingCount}</div>
              </div>
            </div>
            <div className="admin-refund-tile">
              <div className="admin-refund-icon" style={{ background: "#00B894" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <div className="admin-refund-label">Refunds Released</div>
                <div className="admin-refund-value">{stats.refundOverview.releasedCount}</div>
              </div>
            </div>
            <div className="admin-refund-tile">
              <div className="admin-refund-icon" style={{ background: "#FF6B9D" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /></svg>
              </div>
              <div>
                <div className="admin-refund-label">Success Rate</div>
                <div className="admin-refund-value">{stats.refundOverview.successRate.toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-title">GROWTH OVERVIEW</div>
          {stats.growthList.map((g) => (
            <div key={g.label} className="admin-growth-row">
              <Link href={g.href} className="admin-growth-label">{g.label}</Link>
              <div className="admin-growth-right">
                <span className="admin-growth-num">{g.value}</span>
                <DeltaBadge delta={g.delta} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-dash-grid">
        <div className="admin-panel">
          <div className="admin-panel-title-row">
            <div className="admin-panel-title">TOP CUSTOMERS</div>
            <Link href="/admin/customers" className="admin-panel-link">View All Customers →</Link>
          </div>
          {stats.topCustomers.length === 0 ? (
            <p className="empty-state">No paid orders yet.</p>
          ) : (
            <div className="admin-top-products">
              {stats.topCustomers.map((c) => (
                <Link key={c.id} href={`/admin/customers/${c.id}`} className="admin-top-product-row">
                  <div className="admin-top-product-name">{c.name}</div>
                  <div className="admin-top-product-meta">₹{c.totalSpent.toLocaleString()} · {c.totalOrders} orders</div>
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
      </div>
    </>
  );
}
