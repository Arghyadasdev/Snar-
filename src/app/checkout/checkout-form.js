"use client";

import { useActionState } from "react";
import { placeOrder } from "@/lib/data/orders";

export default function CheckoutForm() {
  const [state, action, pending] = useActionState(placeOrder, undefined);

  return (
    <form className="cart-items" action={action} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="order-shipping-title">Shipping Details</div>

      <label className="auth-label" htmlFor="name">Full Name</label>
      <input className="auth-input" id="name" name="name" required />

      <label className="auth-label" htmlFor="phone">Phone</label>
      <input className="auth-input" id="phone" name="phone" required />

      <label className="auth-label" htmlFor="address">Address</label>
      <input className="auth-input" id="address" name="address" required />

      <div className="form-row-3">
        <div>
          <label className="auth-label" htmlFor="city">City</label>
          <input className="auth-input" id="city" name="city" required />
        </div>
        <div>
          <label className="auth-label" htmlFor="state">State</label>
          <input className="auth-input" id="state" name="state" required />
        </div>
        <div>
          <label className="auth-label" htmlFor="zip">ZIP</label>
          <input className="auth-input" id="zip" name="zip" required />
        </div>
      </div>

      <label className="auth-label" htmlFor="couponCode">Coupon Code (optional)</label>
      <input className="auth-input" id="couponCode" name="couponCode" placeholder="e.g. WELCOME10" style={{ textTransform: "uppercase" }} />

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="btn-primary" type="submit" disabled={pending} style={{ justifyContent: "center", marginTop: ".5rem" }}>
        {pending ? "Placing order…" : "PLACE ORDER"}
      </button>
    </form>
  );
}
