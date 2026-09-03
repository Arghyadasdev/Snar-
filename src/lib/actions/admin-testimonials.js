"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listTestimonialsAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("testimonials").select("*").order("sort_order", { ascending: true });
  return data || [];
}

export async function getTestimonialAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("testimonials").select("*").eq("id", id).single();
  return data;
}

function readForm(formData) {
  return {
    quote: formData.get("quote")?.toString().trim(),
    name: formData.get("name")?.toString().trim(),
    role: formData.get("role")?.toString().trim() || "",
    location: formData.get("location")?.toString().trim() || "",
    initials: formData.get("initials")?.toString().trim() || "",
    rating: Number(formData.get("rating")) || 5,
    product: formData.get("product")?.toString().trim() || "",
    sort_order: Number(formData.get("sortOrder")) || 0,
    is_active: formData.get("isActive") === "on",
  };
}

export async function createTestimonial(prevState, formData) {
  await requireAdmin();
  const fields = readForm(formData);
  if (!fields.quote || !fields.name) return { error: "Quote and name are required." };

  const admin = createAdminClient();
  const { error } = await admin.from("testimonials").insert(fields);
  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials");
}

export async function updateTestimonial(prevState, formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const fields = readForm(formData);
  if (!fields.quote || !fields.name) return { error: "Quote and name are required." };

  const admin = createAdminClient();
  const { error } = await admin.from("testimonials").update(fields).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("testimonials").delete().eq("id", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
