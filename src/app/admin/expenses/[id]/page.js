import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getExpenseAdmin,
  deleteExpense,
  submitExpense,
  approveExpense,
  rejectExpense,
  markExpensePaid,
} from "@/lib/actions/expenses";

export const metadata = { title: "Admin · Expense — SNAR" };

const STATUS_CSS = { draft: "pending", submitted: "processing", approved: "shipped", rejected: "cancelled", paid: "delivered" };

export default async function ExpenseDetailPage({ params }) {
  const { id } = await params;
  const expense = await getExpenseAdmin(id);
  if (!expense) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin · Expense</div>
        <h1 className="shop-title">
          {expense.category?.name || "Uncategorized"}
          <span className={`order-status order-status-${STATUS_CSS[expense.status]}`} style={{ marginLeft: "1rem" }}>{expense.status}</span>
        </h1>
        <p className="shop-sub">{new Date(expense.expense_date).toLocaleDateString()}{expense.vendor?.name ? ` · ${expense.vendor.name}` : ""}</p>
      </div>

      <div className="order-detail-grid">
        <div className="order-items-list">
          <div className="order-item-row"><div>Amount</div><div>₹{Number(expense.amount).toFixed(2)}</div></div>
          <div className="order-item-row"><div>Tax</div><div>₹{Number(expense.tax_amount).toFixed(2)}</div></div>
          <div className="order-item-row order-total-row"><div>Total</div><div>₹{Number(expense.total_amount).toFixed(2)}</div></div>
          <div className="order-item-row"><div>Payment Method</div><div>{expense.payment_method.replace("_", " ")}</div></div>
          {expense.reference_number && <div className="order-item-row"><div>Reference</div><div>{expense.reference_number}</div></div>}
          {expense.description && <div className="order-item-row"><div>Description</div><div>{expense.description}</div></div>}
          {expense.receipt_url && (
            <div className="order-item-row">
              <div>Receipt</div>
              <div><a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">View</a></div>
            </div>
          )}
        </div>

        <div className="order-shipping-card">
          <div className="order-shipping-title">Audit</div>
          <p>Created by: {expense.creator?.full_name || expense.creator?.email || "—"}</p>
          {expense.approved_by && (
            <p>Approved by: {expense.approver?.full_name || expense.approver?.email} on {new Date(expense.approved_at).toLocaleDateString()}</p>
          )}

          <div className="order-shipping-title" style={{ marginTop: "1.4rem" }}>Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
            <Link href={`/admin/expenses/${expense.id}/edit`} className="btn-outline" style={{ padding: ".5rem 1rem", textAlign: "center" }}>Edit</Link>

            {expense.status === "draft" && (
              <form action={submitExpense}>
                <input type="hidden" name="id" value={expense.id} />
                <button type="submit" className="btn-primary" style={{ width: "100%" }}>Submit for Approval</button>
              </form>
            )}

            {expense.status === "submitted" && (
              <>
                <form action={approveExpense}>
                  <input type="hidden" name="id" value={expense.id} />
                  <button type="submit" className="btn-primary" style={{ width: "100%" }}>Approve</button>
                </form>
                <form action={rejectExpense}>
                  <input type="hidden" name="id" value={expense.id} />
                  <button type="submit" className="admin-delete-btn" style={{ width: "100%" }}>Reject</button>
                </form>
              </>
            )}

            {expense.status === "approved" && (
              <form action={markExpensePaid}>
                <input type="hidden" name="id" value={expense.id} />
                <button type="submit" className="btn-primary" style={{ width: "100%" }}>Mark as Paid</button>
              </form>
            )}

            <form action={deleteExpense}>
              <input type="hidden" name="id" value={expense.id} />
              <button type="submit" className="admin-delete-btn" style={{ width: "100%" }}>Delete</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
