"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Men / Women / Accessories / Collections are the fixed main categories
// seeded by supabase/fix-gender-categories.sql — locked from here so the
// site nav always has something to point at.
const PROTECTED_ROOT_SLUGS = ["men", "women", "accessories", "collections"];

async function isProtectedRoot(admin, id) {
  const { data } = await admin.from("categories").select("slug, parent_id").eq("id", id).maybeSingle();
  return !!data && data.parent_id === null && PROTECTED_ROOT_SLUGS.includes(data.slug);
}

async function isValidRootParent(admin, parentId) {
  if (!parentId) return false;
  const { data } = await admin.from("categories").select("slug, parent_id").eq("id", parentId).maybeSingle();
  return !!data && data.parent_id === null && PROTECTED_ROOT_SLUGS.includes(data.slug);
}

export async function listAllCategoriesAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("id, slug, name, parent_id")
    .order("name");
  const categories = data || [];
  // A self-referencing embed (categories!parent_id(name)) resolves to each
  // row's CHILDREN in PostgREST, not its parent — looking up the parent by
  // id ourselves avoids that ambiguity entirely.
  const byId = Object.fromEntries(categories.map((c) => [c.id, c]));
  return categories.map((c) => ({ ...c, parent: c.parent_id ? byId[c.parent_id] || null : null }));
}

export async function getCategoryAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("categories").select("*").eq("id", id).single();
  return data;
}

export async function createCategory(prevState, formData) {
  const admin_ = await requireAdmin();
  const name = formData.get("name")?.toString().trim();
  const parentId = formData.get("parentId")?.toString() || null;

  if (!name) {
    return { error: "Category name is required." };
  }

  const admin = createAdminClient();

  if (!(await isValidRootParent(admin, parentId))) {
    return { error: "Choose Men, Women, Accessories or Collections as the main category." };
  }

  const { data, error } = await admin
    .from("categories")
    .insert({ name, slug: slugify(name), parent_id: parentId })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await logAdminActivity({ admin: admin_, action: "category_created", entityType: "category", entityId: data.id, metadata: { name } });

  revalidatePath("/admin/categories");
  revalidatePath("/collections");
  redirect("/admin/categories");
}

export async function updateCategory(prevState, formData) {
  const admin_ = await requireAdmin();
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

  if (await isProtectedRoot(admin, id)) {
    return { error: "Men, Women, Accessories and Collections are fixed and can't be edited." };
  }
  if (!(await isValidRootParent(admin, parentId))) {
    return { error: "Choose Men, Women, Accessories or Collections as the main category." };
  }

  const { error } = await admin
    .from("categories")
    .update({ name, parent_id: parentId })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logAdminActivity({ admin: admin_, action: "category_updated", entityType: "category", entityId: id, metadata: { name } });

  revalidatePath("/admin/categories");
  revalidatePath("/collections");
  redirect("/admin/categories");
}

export async function deleteCategory(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();

  const admin = createAdminClient();

  if (await isProtectedRoot(admin, id)) return;

  await admin.from("categories").delete().eq("id", id);
  await logAdminActivity({ admin: admin_, action: "category_deleted", entityType: "category", entityId: id });

  revalidatePath("/admin/categories");
  revalidatePath("/collections");
}
