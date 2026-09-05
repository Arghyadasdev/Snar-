"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listReviewsAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("reviews")
    .select("id, customer_name, rating, review_text, is_approved, created_at, product:products(name, slug)")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function addAdminReview(prevState, formData) {
  await requireAdmin();
  const productId = formData.get("productId")?.toString();
  const customerName = formData.get("customerName")?.toString().trim();
  const rating = Number(formData.get("rating"));
  const reviewText = formData.get("reviewText")?.toString().trim() || "";

  if (!productId || !customerName || !rating || rating < 1 || rating > 5) {
    return { error: "Product, name, and a rating (1-5) are required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("reviews").insert({
    product_id: productId,
    customer_name: customerName,
    rating,
    review_text: reviewText,
    is_approved: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}

export async function toggleReviewApproval(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const nextApproved = formData.get("nextApproved") === "true";

  const admin = createAdminClient();
  await admin.from("reviews").update({ is_approved: nextApproved }).eq("id", id);
  revalidatePath("/admin/reviews");
}

export async function deleteReviewAdmin(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/reviews");
}
