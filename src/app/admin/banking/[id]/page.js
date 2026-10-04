import { notFound } from "next/navigation";
import { getBankAccountAdmin, addTransaction, toggleReconciled, deleteTransaction } from "@/lib/actions/banking";

export const metadata = { title: "Admin · Account — SNAR" };

export default async function BankAccountDetailPage({ params }) {
  const { id } = await params;
  const account = await getBankAccountAdmin(id);
  if (!account) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin · Banking</div>
        <h1 className="shop-title">{account.name}</h1>
        <p className="shop-sub">{account.account_type}{account.bank_name ? ` · ${account.bank_name}` : ""} · Balance: ₹{account.current_balance.toLocaleString()}</p>
      </div>

      <div className="order-detail-grid">
        <div className="order-items-list">
          <div className="order-shipping-title">Transactions</div>
          {account.transactions.length === 0 && <p className="empty-state">No transactions yet.</p>}
          {account.transactions.map((t) => (
            <div key={t.id} className="order-item-row">
              <div>
                <div className="order-item-name">
                  {t.description || "—"} {t.reconciled && <span className="order-status order-status-delivered" style={{ marginLeft: ".5rem" }}>reconciled</span>}
                </div>
                <div className="order-item-meta">{new Date(t.txn_date).toLocaleDateString()}{t.reference_number ? ` · Ref: ${t.reference_number}` : ""}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
                <div className="order-item-price" style={{ color: t.type === "credit" ? "#2E9E5B" : "#E4584C" }}>
                  {t.type === "credit" ? "+" : "−"}₹{Number(t.amount).toFixed(2)}
                </div>
                <form action={toggleReconciled}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="accountId" value={account.id} />
                  <input type="hidden" name="reconciled" value={String(t.reconciled)} />
                  <button type="submit" className="btn-outline" style={{ padding: ".3rem .7rem", fontSize: ".75rem" }}>
                    {t.reconciled ? "Unreconcile" : "Reconcile"}
                  </button>
                </form>
                <form action={deleteTransaction}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="accountId" value={account.id} />
                  <button type="submit" className="admin-delete-btn">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <div className="order-shipping-card">
          <div className="order-shipping-title">Add Transaction</div>
          <form action={addTransaction} style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
            <input type="hidden" name="accountId" value={account.id} />

            <label className="auth-label" htmlFor="txnDate">Date</label>
            <input className="auth-input" id="txnDate" name="txnDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />

            <label className="auth-label" htmlFor="type">Type</label>
            <select className="auth-input" id="type" name="type" defaultValue="debit">
              <option value="credit">Credit (money in)</option>
              <option value="debit">Debit (money out)</option>
            </select>

            <label className="auth-label" htmlFor="amount">Amount (₹)</label>
            <input className="auth-input" id="amount" name="amount" type="number" step="0.01" required />

            <label className="auth-label" htmlFor="description">Description</label>
            <input className="auth-input" id="description" name="description" />

            <label className="auth-label" htmlFor="referenceNumber">Reference</label>
            <input className="auth-input" id="referenceNumber" name="referenceNumber" />

            <button type="submit" className="auth-btn">Add Transaction</button>
          </form>
        </div>
      </div>
    </div>
  );
}
