"use client";

import { useActionState } from "react";

const PAYMENT_METHODS = ["bank_transfer", "cash", "card", "upi", "cheque", "other"];
const FREQUENCIES = ["weekly", "monthly", "yearly"];

export default function RecurringExpenseForm({ action, categories, vendors, recurring }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "520px" }}>
      {recurring && <input type="hidden" name="id" value={recurring.id} />}

      <label className="auth-label" htmlFor="categoryId">Category</label>
      <select className="auth-input" id="categoryId" name="categoryId" defaultValue={recurring?.category_id || ""}>
        <option value="">Uncategorized</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <label className="auth-label" htmlFor="vendorId">Vendor</label>
      <select className="auth-input" id="vendorId" name="vendorId" defaultValue={recurring?.vendor_id || ""}>
        <option value="">None</option>
        {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="amount">Amount (₹)</label>
          <input className="auth-input" id="amount" name="amount" type="number" step="0.01" defaultValue={recurring?.amount} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="paymentMethod">Payment Method</label>
          <select className="auth-input" id="paymentMethod" name="paymentMethod" defaultValue={recurring?.payment_method || "bank_transfer"}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="frequency">Frequency</label>
          <select className="auth-input" id="frequency" name="frequency" defaultValue={recurring?.frequency || "monthly"}>
            {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="nextRunDate">Next Due Date</label>
          <input className="auth-input" id="nextRunDate" name="nextRunDate" type="date" defaultValue={recurring?.next_run_date || new Date().toISOString().slice(0, 10)} required />
        </div>
      </div>

      <label className="auth-label" htmlFor="description">Description</label>
      <textarea className="auth-input" id="description" name="description" rows={2} defaultValue={recurring?.description} />

      <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".5rem" }}>
        <input type="checkbox" name="isActive" defaultChecked={recurring ? recurring.is_active : true} />
        Active
      </label>

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : recurring ? "Save Changes" : "Create Recurring Expense"}
      </button>
    </form>
  );
}
