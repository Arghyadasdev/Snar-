import Link from "next/link";
import { listReviewsAdmin, toggleReviewApproval, deleteReviewAdmin } from "@/lib/actions/admin-reviews";

export const metadata = { title: "Admin · Reviews — SNAR" };

export default async function AdminReviewsPage() {
  const reviews = await listReviewsAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin</div>
          <h1 className="shop-title">Reviews</h1>
        </div>
        <Link href="/admin/reviews/new" className="btn-primary">ADD REVIEW</Link>
      </div>

      <div className="admin-table">
        {reviews.map((r) => (
          <div key={r.id} className="admin-table-row admin-table-row-cat">
            <div className="admin-table-name">
              {r.customer_name} · {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
              {!r.is_approved && <span className="order-status order-status-cancelled" style={{ marginLeft: ".5rem" }}>hidden</span>}
              <div style={{ fontSize: ".85rem", color: "var(--muted, #999)" }}>{r.review_text}</div>
            </div>
            <div className="admin-table-cat">{r.product?.name || "(deleted product)"}</div>
            <div className="admin-table-actions">
              <form action={toggleReviewApproval}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="nextApproved" value={(!r.is_approved).toString()} />
                <button type="submit" className="admin-delete-btn" style={{ color: r.is_approved ? "inherit" : "#00c4d4" }}>
                  {r.is_approved ? "Hide" : "Approve"}
                </button>
              </form>
              <form action={deleteReviewAdmin}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="admin-delete-btn">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p style={{ color: "var(--muted, #999)" }}>No reviews yet.</p>}
      </div>
    </div>
  );
}
