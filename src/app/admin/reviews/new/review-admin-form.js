"use client";

import { useActionState } from "react";

export default function ReviewAdminForm({ action, products }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "480px" }}>
      <label className="auth-label" htmlFor="productId">Product</label>
      <select className="auth-input" id="productId" name="productId" defaultValue="" required>
        <option value="" disabled>Select product</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <label className="auth-label" htmlFor="customerName">Customer Name</label>
      <input className="auth-input" id="customerName" name="customerName" required />

      <label className="auth-label" htmlFor="rating">Rating (1-5)</label>
      <input className="auth-input" id="rating" name="rating" type="number" min="1" max="5" defaultValue="5" required />

      <label className="auth-label" htmlFor="reviewText">Review Text</label>
      <textarea className="auth-input" id="reviewText" name="reviewText" rows={3} />

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add Review"}
      </button>
    </form>
  );
}
