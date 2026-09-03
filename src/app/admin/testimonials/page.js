import Link from "next/link";
import { listTestimonialsAdmin, deleteTestimonial } from "@/lib/actions/admin-testimonials";

export const metadata = { title: "Admin · Testimonials — SNAR" };

export default async function AdminTestimonialsPage() {
  const testimonials = await listTestimonialsAdmin();

  return (
    <div className="shop-page">
      <div className="shop-header admin-header-row">
        <div>
          <div className="shop-eyebrow">Admin</div>
          <h1 className="shop-title">Testimonials</h1>
        </div>
        <Link href="/admin/testimonials/new" className="btn-primary">NEW TESTIMONIAL</Link>
      </div>

      <div className="admin-table">
        {testimonials.map((t) => (
          <div key={t.id} className="admin-table-row admin-table-row-cat">
            <div className="admin-table-name">
              {t.name}
              {!t.is_active && <span className="order-status order-status-cancelled" style={{ marginLeft: ".5rem" }}>hidden</span>}
            </div>
            <div className="admin-table-cat">{t.role} · {t.location}</div>
            <div className="admin-table-actions">
              <Link href={`/admin/testimonials/${t.id}/edit`}>Edit</Link>
              <form action={deleteTestimonial}>
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="admin-delete-btn">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
