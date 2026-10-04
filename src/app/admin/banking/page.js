import Link from "next/link";
import { listBankAccountsAdmin } from "@/lib/actions/banking";

export const metadata = { title: "Admin · Banking — SNAR" };

export default async function BankingPage() {
  const accounts = await listBankAccountsAdmin();
  const total = accounts.reduce((sum, a) => sum + a.current_balance, 0);

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin</div>
          <h1 className="shop-title">Banking</h1>
        </div>
        <Link href="/admin/banking/new" className="btn-primary">NEW ACCOUNT</Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">TOTAL BALANCE ACROSS ACCOUNTS</div>
          <div className="admin-kpi-num">₹{total.toLocaleString()}</div>
        </div>
      </div>

      <div className="admin-table">
        {accounts.length === 0 && <p className="empty-state">No accounts set up yet.</p>}
        {accounts.map((a) => (
          <div key={a.id} className="admin-table-row admin-table-row-cat">
            <div>
              <Link href={`/admin/banking/${a.id}`} className="admin-table-name">{a.name}</Link>
              <div className="order-item-meta">{a.account_type}{a.bank_name ? ` · ${a.bank_name}` : ""}{a.account_number ? ` · ****${a.account_number.slice(-4)}` : ""}</div>
            </div>
            <div className="admin-table-cat">₹{a.current_balance.toLocaleString()}</div>
            <div className="admin-table-actions">
              <Link href={`/admin/banking/${a.id}/edit`}>Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
