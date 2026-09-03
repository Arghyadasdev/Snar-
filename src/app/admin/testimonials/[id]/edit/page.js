import { notFound } from "next/navigation";
import { getTestimonialAdmin, updateTestimonial } from "@/lib/actions/admin-testimonials";
import TestimonialForm from "../../testimonial-form";

export const metadata = { title: "Edit Testimonial — SNAR Admin" };

export default async function EditTestimonialPage({ params }) {
  const { id } = await params;
  const testimonial = await getTestimonialAdmin(id);
  if (!testimonial) notFound();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Admin</div>
        <h1 className="shop-title">Edit Testimonial</h1>
      </div>
      <TestimonialForm action={updateTestimonial} testimonial={testimonial} />
    </div>
  );
}
