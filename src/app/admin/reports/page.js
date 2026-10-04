import { getProfitAndLoss } from "@/lib/actions/reports";

export const metadata = { title: "Admin · Reports — SNAR" };

export default async function ReportsPage({ searchParams }) {
  const params = await searchParams;
  const from = params?.from || "";
  const to = params?.to || "";
  const pl = await getProfitAndLoss(from, to);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Reports</h1>
        <p className="shop-sub">Profit &amp; Loss — paid order revenue vs. paid expenses. Not a full balance sheet: this app doesn&apos;t track assets, liabilities, or inventory valuation.</p>
      </div>

      <form action="/admin/reports" style={{ display: "flex", gap: ".8rem", alignItems: "center", marginBottom: "1.4rem", flexWrap: "wrap" }}>
        <input className="auth-input" type="date" name="from" defaultValue={from} style={{ padding: ".6rem .9rem", width: "auto" }} />
        <span className="order-item-meta">to</span>
        <input className="auth-input" type="date" name="to" defaultValue={to} style={{ padding: ".6rem .9rem", width: "auto" }} />
        <button type="submit" className="btn-outline" style={{ padding: ".6rem 1.2rem" }}>Apply</button>
      </form>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">REVENUE ({pl.orderCount} ORDERS)</div>
          <div className="admin-kpi-num">₹{pl.revenue.toLocaleString()}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">EXPENSES ({pl.expenseCount} PAID)</div>
          <div className="admin-kpi-num">₹{pl.totalExpenses.toLocaleString()}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">NET PROFIT</div>
          <div className="admin-kpi-num" style={{ color: pl.netProfit >= 0 ? "#2E9E5B" : "#E4584C" }}>₹{pl.netProfit.toLocaleString()}</div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-title">EXPENSES BY CATEGORY</div>
        {pl.expensesByCategory.length === 0 ? (
          <p className="empty-state">No paid expenses in this range.</p>
        ) : (
          <div className="admin-ranked-list">
            {pl.expensesByCategory.map((c) => (
              <div key={c.name} className="admin-ranked-row">
                <span className="admin-ranked-name">{c.name}</span>
                <span className="admin-ranked-value">₹{c.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
