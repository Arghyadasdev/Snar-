"use client";

import { useActionState } from "react";

export default function WarehouseForm({ action, warehouse }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "480px" }}>
      {warehouse && <input type="hidden" name="id" value={warehouse.id} />}

      <label className="auth-label" htmlFor="name">Name (must match Shiprocket pickup nickname)</label>
      <input className="auth-input" id="name" name="name" defaultValue={warehouse?.name} placeholder="Primary Warehouse" required />

      <label className="auth-label" htmlFor="addressLine1">Address</label>
      <input className="auth-input" id="addressLine1" name="addressLine1" defaultValue={warehouse?.address_line1} required />

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="city">City</label>
          <input className="auth-input" id="city" name="city" defaultValue={warehouse?.city} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="state">State</label>
          <input className="auth-input" id="state" name="state" defaultValue={warehouse?.state} required />
        </div>
      </div>

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="pincode">Pincode</label>
          <input className="auth-input" id="pincode" name="pincode" defaultValue={warehouse?.pincode} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="phone">Phone</label>
          <input className="auth-input" id="phone" name="phone" defaultValue={warehouse?.phone} />
        </div>
      </div>

      <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
        <input type="checkbox" name="isActive" defaultChecked={warehouse ? warehouse.is_active : true} />
        Active (used for Shiprocket pickup)
      </label>

      {state?.error && <p className="auth-error">{state.error}</p>}
      {state?.success && <p className="auth-success">{state.success}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : warehouse ? "Save Changes" : "Add Warehouse"}
      </button>
    </form>
  );
}
