"use client";

import { updateFaq, deleteFaq } from "@/lib/actions/admin-faqs";

export default function FaqRow({ faq }) {
  return (
    <form action={updateFaq} className="auth-card" style={{ maxWidth: "680px", padding: "1.2rem 1.4rem" }}>
      <input type="hidden" name="id" value={faq.id} />

      <label className="auth-label" htmlFor={`q-${faq.id}`}>Question</label>
      <input className="auth-input" id={`q-${faq.id}`} name="question" defaultValue={faq.question} />

      <label className="auth-label" htmlFor={`a-${faq.id}`}>Answer</label>
      <textarea className="auth-input" id={`a-${faq.id}`} name="answer" rows={2} defaultValue={faq.answer} />

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: ".7rem" }}>
        <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: ".4rem", margin: 0 }}>
          <input type="checkbox" name="isActive" defaultChecked={faq.is_active} /> active
        </label>
        <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: ".4rem", margin: 0 }}>
          order
          <input className="auth-input" name="sortOrder" type="number" defaultValue={faq.sort_order} style={{ width: "60px" }} />
        </label>
        <button type="submit" className="btn-outline" style={{ padding: ".5rem 1rem" }}>Save</button>
        <button type="submit" formAction={deleteFaq} className="admin-delete-btn">Delete</button>
      </div>
    </form>
  );
}
