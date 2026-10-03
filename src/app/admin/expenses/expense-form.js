"use client";

import { useActionState } from "react";

const PAYMENT_METHODS = ["bank_transfer", "cash", "card", "upi", "cheque", "other"];

export default function ExpenseForm({ action, categories, vendors, expense }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "560px" }} encType="multipart/form-data">
      {expense && <input type="hidden" name="id" value={expense.id} />}
      {expense?.receipt_url && <input type="hidden" name="existingReceiptUrl" value={expense.receipt_url} />}

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="expenseDate">Date</label>
          <input className="auth-input" id="expenseDate" name="expenseDate" type="date" defaultValue={expense?.expense_date || new Date().toISOString().slice(0, 10)} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="paymentMethod">Payment Method</label>
          <select className="auth-input" id="paymentMethod" name="paymentMethod" defaultValue={expense?.payment_method || "bank_transfer"}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>

      <label className="auth-label" htmlFor="categoryId">Category</label>
      <select className="auth-input" id="categoryId" name="categoryId" defaultValue={expense?.category_id || ""}>
        <option value="">Uncategorized</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <label className="auth-label" htmlFor="vendorId">Vendor</label>
      <select className="auth-input" id="vendorId" name="vendorId" defaultValue={expense?.vendor_id || ""}>
        <option value="">None</option>
        {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="amount">Amount (₹)</label>
          <input className="auth-input" id="amount" name="amount" type="number" step="0.01" defaultValue={expense?.amount} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="taxAmount">Tax Amount (₹)</label>
          <input className="auth-input" id="taxAmount" name="taxAmount" type="number" step="0.01" defaultValue={expense?.tax_amount ?? 0} />
        </div>
      </div>

      <label className="auth-label" htmlFor="referenceNumber">Reference / Bill Number</label>
      <input className="auth-input" id="referenceNumber" name="referenceNumber" defaultValue={expense?.reference_number} />

      <label className="auth-label" htmlFor="description">Description</label>
      <textarea className="auth-input" id="description" name="description" rows={2} defaultValue={expense?.description} />

      <label className="auth-label" htmlFor="receiptFile">Receipt (image or PDF)</label>
      <input className="auth-input" id="receiptFile" name="receiptFile" type="file" accept="image/*,application/pdf" />
      {expense?.receipt_url && (
        <p style={{ fontSize: ".8rem", marginTop: ".3rem" }}>
          <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">Current receipt</a> — upload a new file to replace it.
        </p>
      )}

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : expense ? "Save Changes" : "Record Expense"}
      </button>
    </form>
  );
}
