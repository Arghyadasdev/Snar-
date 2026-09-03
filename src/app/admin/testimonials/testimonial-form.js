"use client";

import { useActionState } from "react";

export default function TestimonialForm({ action, testimonial }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "560px" }}>
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}

      <label className="auth-label" htmlFor="quote">Quote</label>
      <textarea className="auth-input" id="quote" name="quote" rows={3} defaultValue={testimonial?.quote} required />

      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="name">Name</label>
          <input className="auth-input" id="name" name="name" defaultValue={testimonial?.name} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="initials">Initials</label>
          <input className="auth-input" id="initials" name="initials" defaultValue={testimonial?.initials} maxLength={3} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="role">Role</label>
          <input className="auth-input" id="role" name="role" defaultValue={testimonial?.role} placeholder="Marathon Runner" />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="location">Location</label>
          <input className="auth-input" id="location" name="location" defaultValue={testimonial?.location} placeholder="Mumbai" />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="product">Product</label>
          <input className="auth-input" id="product" name="product" defaultValue={testimonial?.product} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="rating">Rating (1–5)</label>
          <input className="auth-input" id="rating" name="rating" type="number" min={1} max={5} defaultValue={testimonial?.rating ?? 5} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="sortOrder">Sort Order</label>
          <input className="auth-input" id="sortOrder" name="sortOrder" type="number" defaultValue={testimonial?.sort_order ?? 0} />
        </div>
      </div>

      <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".5rem" }}>
        <input type="checkbox" name="isActive" defaultChecked={testimonial ? testimonial.is_active : true} />
        Active (visible on homepage)
      </label>

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : testimonial ? "Save Changes" : "Create Testimonial"}
      </button>
    </form>
  );
}
