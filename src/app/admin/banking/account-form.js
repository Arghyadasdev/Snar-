"use client";

import { useActionState } from "react";

const TYPES = ["bank", "cash", "wallet"];

export default function BankAccountForm({ action, account }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "460px" }}>
      {account && <input type="hidden" name="id" value={account.id} />}

      <label className="auth-label" htmlFor="name">Account Name</label>
      <input className="auth-input" id="name" name="name" defaultValue={account?.name} placeholder="Primary Current Account" required />

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="accountType">Type</label>
          <select className="auth-input" id="accountType" name="accountType" defaultValue={account?.account_type || "bank"}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="openingBalance">Opening Balance (₹)</label>
          <input className="auth-input" id="openingBalance" name="openingBalance" type="number" step="0.01" defaultValue={account?.opening_balance ?? 0} />
        </div>
      </div>

      <label className="auth-label" htmlFor="bankName">Bank Name</label>
      <input className="auth-input" id="bankName" name="bankName" defaultValue={account?.bank_name} />

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="accountNumber">Account Number</label>
          <input className="auth-input" id="accountNumber" name="accountNumber" defaultValue={account?.account_number} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="ifscCode">IFSC Code</label>
          <input className="auth-input" id="ifscCode" name="ifscCode" defaultValue={account?.ifsc_code} />
        </div>
      </div>

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : account ? "Save Changes" : "Add Account"}
      </button>
    </form>
  );
}
