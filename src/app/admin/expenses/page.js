import Link from "next/link";
import { listExpensesAdmin, getExpenseTotals } from "@/lib/actions/expenses";
import { listExpenseCategoriesAdmin } from "@/lib/actions/expense-categories";

export const metadata = { title: "Admin · Expenses — SNAR" };

const STATUS_CSS = { draft: "pending", submitted: "processing", approved: "shipped", rejected: "cancelled", paid: "delivered" };

export default async function ExpensesPage({ searchParams }) {
  const params = await searchParams;
  const status = params?.status || "";
  const categoryId = params?.category || "";
  const from = params?.from || "";
  const to = params?.to || "";

  const [expenses, totals, categories] = await Promise.all([
    listExpensesAdmin({ status, categoryId, from, to }),
    getExpenseTotals(from, to),
    listExpenseCategoriesAdmin(),
  ]);

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin</div>
          <h1 className="shop-title">Expenses</h1>
        </div>
        <Link href="/admin/expenses/new" className="btn-primary">RECORD EXPENSE</Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">TOTAL EXPENSES</div>
          <div className="admin-kpi-num">₹{totals.grandTotal.toLocaleString()}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">PENDING APPROVAL</div>
          <div className="admin-kpi-num">₹{totals.pendingApproval.toLocaleString()}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">PAID</div>
          <div className="admin-kpi-num">₹{totals.paid.toLocaleString()}</div>
        </div>
      </div>

      <form action="/admin/expenses" style={{ display: "flex", gap: ".8rem", alignItems: "center", marginBottom: "1.4rem", flexWrap: "wrap" }}>
        <select name="status" defaultValue={status} className="auth-input" style={{ padding: ".6rem .9rem", width: "auto" }}>
          <option value="">All statuses</option>
          {Object.keys(STATUS_CSS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="category" defaultValue={categoryId} className="auth-input" style={{ padding: ".6rem .9rem", width: "auto" }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="auth-input" type="date" name="from" defaultValue={from} style={{ padding: ".6rem .9rem", width: "auto" }} />
        <input className="auth-input" type="date" name="to" defaultValue={to} style={{ padding: ".6rem .9rem", width: "auto" }} />
        <button type="submit" className="btn-outline" style={{ padding: ".6rem 1.2rem" }}>Filter</button>
        {totals.byCategory.length > 0 && (
          <span className="order-item-meta" style={{ marginLeft: "auto" }}>
            Top category: {totals.byCategory[0].name} (₹{totals.byCategory[0].total.toLocaleString()})
          </span>
        )}
      </form>

      <div className="admin-table">
        {expenses.length === 0 && <p className="empty-state">No expenses found.</p>}
        {expenses.map((e) => (
          <div key={e.id} className="admin-table-row admin-table-row-cat">
            <div>
              <Link href={`/admin/expenses/${e.id}`} className="admin-table-name">
                {e.category?.name || "Uncategorized"} {e.vendor?.name ? `— ${e.vendor.name}` : ""}
              </Link>
              <div className="order-item-meta">{new Date(e.expense_date).toLocaleDateString()} · {e.description || "—"}</div>
            </div>
            <div className="admin-table-cat">₹{Number(e.total_amount).toFixed(2)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
              <span className={`order-status order-status-${STATUS_CSS[e.status]}`}>{e.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
