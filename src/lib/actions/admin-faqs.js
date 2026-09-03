"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listFaqsAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("faqs").select("*").order("sort_order", { ascending: true });
  return data || [];
}

export async function createFaq(formData) {
  await requireAdmin();
  const question = formData.get("question")?.toString().trim();
  const answer = formData.get("answer")?.toString().trim();
  if (!question || !answer) return;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("faqs")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await admin.from("faqs").insert({ question, answer, sort_order: (existing?.sort_order || 0) + 1 });

  revalidatePath("/admin/faqs");
  revalidatePath("/help");
}

export async function updateFaq(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const question = formData.get("question")?.toString().trim();
  const answer = formData.get("answer")?.toString().trim();
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  const isActive = formData.get("isActive") === "on";

  const admin = createAdminClient();
  await admin.from("faqs").update({ question, answer, sort_order: sortOrder, is_active: isActive }).eq("id", id);

  revalidatePath("/admin/faqs");
  revalidatePath("/help");
}

export async function deleteFaq(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("faqs").delete().eq("id", id);
  revalidatePath("/admin/faqs");
  revalidatePath("/help");
}
