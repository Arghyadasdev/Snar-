"use client";

import { useActionState } from "react";

export default function VendorForm({ action, vendor }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "480px" }}>
      {vendor && <input type="hidden" name="id" value={vendor.id} />}

      <label className="auth-label" htmlFor="name">Vendor Name</label>
      <input className="auth-input" id="name" name="name" defaultValue={vendor?.name} required />

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="contactName">Contact Person</label>
          <input className="auth-input" id="contactName" name="contactName" defaultValue={vendor?.contact_name} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="phone">Phone</label>
          <input className="auth-input" id="phone" name="phone" defaultValue={vendor?.phone} />
        </div>
      </div>

      <label className="auth-label" htmlFor="email">Email</label>
      <input className="auth-input" id="email" name="email" type="email" defaultValue={vendor?.email} />

      <label className="auth-label" htmlFor="address">Address</label>
      <input className="auth-input" id="address" name="address" defaultValue={vendor?.address} />

      <label className="auth-label" htmlFor="gstin">GSTIN</label>
      <input className="auth-input" id="gstin" name="gstin" defaultValue={vendor?.gstin} />

      <label className="auth-label" htmlFor="notes">Notes</label>
      <textarea className="auth-input" id="notes" name="notes" rows={2} defaultValue={vendor?.notes} />

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : vendor ? "Save Changes" : "Add Vendor"}
      </button>
    </form>
  );
}
