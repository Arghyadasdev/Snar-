"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listTagsAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("tags").select("*").order("name");
  return data || [];
}

export async function createTag(prevState, formData) {
  await requireAdmin();
  const name = formData.get("name")?.toString().trim();
  if (!name) return { error: "Tag name is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("tags").insert({ name });
  if (error) {
    return { error: error.message.includes("duplicate") ? "That tag already exists." : error.message };
  }

  revalidatePath("/admin/customers", "layout");
  return { success: `Tag "${name}" created.` };
}

export async function deleteTag(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("tags").delete().eq("id", id);
  revalidatePath("/admin/customers", "layout");
}
