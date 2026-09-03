"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listAllCategoriesAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("id, slug, name, parent_id, parent:categories!parent_id(name)")
    .order("name");
  return data || [];
}

export async function getCategoryAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("categories").select("*").eq("id", id).single();
  return data;
}

export async function createCategory(prevState, formData) {
  await requireAdmin();
  const name = formData.get("name")?.toString().trim();
  const parentId = formData.get("parentId")?.toString() || null;

  if (!name) {
    return { error: "Category name is required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("categories").insert({
    name,
    slug: slugify(name),
    parent_id: parentId || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/collections");
  redirect("/admin/categories");
}

export async function updateCategory(prevState, formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  const parentId = formData.get("parentId")?.toString() || null;

  if (!name) {
    return { error: "Category name is required." };
  }
  if (parentId === id) {
    return { error: "A category cannot be its own parent." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("categories")
    .update({ name, parent_id: parentId || null })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/collections");
  redirect("/admin/categories");
}

export async function deleteCategory(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();

  const admin = createAdminClient();
  await admin.from("categories").delete().eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/collections");
}
