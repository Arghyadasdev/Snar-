"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";

export async function listExpenseCategoriesAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("expense_categories").select("*").order("name");
  return data || [];
}

export async function getExpenseCategoryAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("expense_categories").select("*").eq("id", id).single();
  return data;
}

export async function createExpenseCategory(prevState, formData) {
  const admin_ = await requireAdmin();
  const name = formData.get("name")?.toString().trim();
  if (!name) return { error: "Category name is required." };

  const admin = createAdminClient();
  const { data, error } = await admin.from("expense_categories").insert({ name }).select("id").single();
  if (error) return { error: error.message.includes("duplicate") ? "That category already exists." : error.message };

  await logAdminActivity({ admin: admin_, action: "expense_category_created", entityType: "expense_category", entityId: data.id, metadata: { name } });
  revalidatePath("/admin/expense-categories");
  redirect("/admin/expense-categories");
}

export async function updateExpenseCategory(prevState, formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  const isActive = formData.get("isActive") === "on";
  if (!name) return { error: "Category name is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("expense_categories").update({ name, is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "expense_category_updated", entityType: "expense_category", entityId: id, metadata: { name, isActive } });
  revalidatePath("/admin/expense-categories");
  redirect("/admin/expense-categories");
}

export async function deleteExpenseCategory(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("expense_categories").delete().eq("id", id);
  await logAdminActivity({ admin: admin_, action: "expense_category_deleted", entityType: "expense_category", entityId: id });
  revalidatePath("/admin/expense-categories");
}
