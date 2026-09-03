import { listFaqsAdmin, createFaq } from "@/lib/actions/admin-faqs";
import FaqRow from "./faq-row";

export const metadata = { title: "Admin · FAQs — SNAR" };

export default async function AdminFaqsPage() {
  const faqs = await listFaqsAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Help Page FAQs</h1>
      </div>

      <form action={createFaq} className="auth-card" style={{ maxWidth: "680px", marginBottom: "1.5rem" }}>
        <label className="auth-label" htmlFor="new-q">New Question</label>
        <input className="auth-input" id="new-q" name="question" required />
        <label className="auth-label" htmlFor="new-a">Answer</label>
        <textarea className="auth-input" id="new-a" name="answer" rows={2} required />
        <button type="submit" className="auth-btn" style={{ marginTop: "1rem" }}>Add FAQ</button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: ".8rem" }}>
        {faqs.map((faq) => (
          <FaqRow key={faq.id} faq={faq} />
        ))}
      </div>
    </div>
  );
}
