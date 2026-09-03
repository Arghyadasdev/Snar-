"use client";

import { useActionState } from "react";
import { createCoupon } from "@/lib/actions/admin-coupons";

export default function CouponForm() {
  const [state, formAction, pending] = useActionState(createCoupon, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "480px", marginBottom: "2rem" }}>
      <label className="auth-label" htmlFor="code">Code</label>
      <input className="auth-input" id="code" name="code" style={{ textTransform: "uppercase" }} placeholder="WELCOME10" required />

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="discountType">Type</label>
          <select className="auth-input" id="discountType" name="discountType" defaultValue="percent">
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off (₹)</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="discountValue">Value</label>
          <input className="auth-input" id="discountValue" name="discountValue" type="number" step="0.01" required />
        </div>
      </div>

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="minOrderAmount">Min Order Amount (₹)</label>
          <input className="auth-input" id="minOrderAmount" name="minOrderAmount" type="number" step="0.01" defaultValue={0} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="maxUses">Max Uses (blank = unlimited)</label>
          <input className="auth-input" id="maxUses" name="maxUses" type="number" />
        </div>
      </div>

      <label className="auth-label" htmlFor="expiresAt">Expires (blank = never)</label>
      <input className="auth-input" id="expiresAt" name="expiresAt" type="date" />

      <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".5rem" }}>
        <input type="checkbox" name="isActive" defaultChecked />
        Active
      </label>

      {state?.error && <p className="auth-error">{state.error}</p>}
      {state?.success && <p className="auth-success">{state.success}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create Coupon"}
      </button>
    </form>
  );
}
