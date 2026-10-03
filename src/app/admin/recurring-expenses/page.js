import Link from "next/link";
import { listRecurringExpensesAdmin, deleteRecurringExpense } from "@/lib/actions/recurring-expenses";
import GenerateDueButton from "./generate-due-button";

export const metadata = { title: "Admin · Recurring Expenses — SNAR" };

export default async function RecurringExpensesPage() {
  const items = await listRecurringExpensesAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin · Expenses</div>
          <h1 className="shop-title">Recurring</h1>
          <p className="shop-sub">Templates that create a draft expense when due. No cron here — click Generate Due Now, or it runs whenever this page is opened on/after the due date.</p>
        </div>
        <Link href="/admin/recurring-expenses/new" className="btn-primary">NEW RECURRING</Link>
      </div>

      <div style={{ marginBottom: "1.4rem" }}>
        <GenerateDueButton />
      </div>

      <div className="admin-table">
        {items.length === 0 && <p className="empty-state">No recurring expenses set up.</p>}
        {items.map((r) => (
          <div key={r.id} className="admin-table-row admin-table-row-cat">
            <div>
              <div className="admin-table-name">
                {r.category?.name || "Uncategorized"} {r.vendor?.name ? `— ${r.vendor.name}` : ""}
                {!r.is_active && <span className="order-status order-status-cancelled" style={{ marginLeft: ".5rem" }}>inactive</span>}
              </div>
              <div className="order-item-meta">{r.frequency} · next: {new Date(r.next_run_date).toLocaleDateString()}</div>
            </div>
            <div className="admin-table-cat">₹{Number(r.amount).toFixed(2)}</div>
            <div className="admin-table-actions">
              <Link href={`/admin/recurring-expenses/${r.id}/edit`}>Edit</Link>
              <form action={deleteRecurringExpense}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="admin-delete-btn">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
