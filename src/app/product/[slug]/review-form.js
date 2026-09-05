"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/lib/actions/reviews";

export default function ReviewForm({ productId, slug, existing }) {
  const [state, formAction, pending] = useActionState(submitReview, undefined);
  const [rating, setRating] = useState(existing?.rating || 0);

  if (state?.success) {
    return <p className="auth-success">Thanks! Your review is live.</p>;
  }

  return (
    <form action={formAction} className="auth-card" style={{ maxWidth: "480px", marginTop: "1rem" }}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      <label className="auth-label">Your Rating</label>
      <div style={{ display: "flex", gap: ".25rem" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star`}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: n <= rating ? "#ffb300" : "#555", padding: 0 }}
          >
            ★
          </button>
        ))}
      </div>

      <label className="auth-label" htmlFor="reviewText">Your Review</label>
      <textarea
        className="auth-input"
        id="reviewText"
        name="reviewText"
        rows={3}
        defaultValue={existing?.review_text}
        placeholder="How was the fit, fabric, quality?"
      />

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Submitting…" : existing ? "Update Review" : "Submit Review"}
      </button>
    </form>
  );
}
