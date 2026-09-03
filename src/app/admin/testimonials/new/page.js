import { createTestimonial } from "@/lib/actions/admin-testimonials";
import TestimonialForm from "../testimonial-form";

export const metadata = { title: "New Testimonial — SNAR Admin" };

export default function NewTestimonialPage() {
  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">New Testimonial</h1>
      </div>
      <TestimonialForm action={createTestimonial} />
    </div>
  );
}
