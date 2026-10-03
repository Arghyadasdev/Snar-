"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";

export async function listRecurringExpensesAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("recurring_expenses")
    .select("*, category:expense_categories(name), vendor:vendors(name)")
    .order("next_run_date");
  return data || [];
}

export async function getRecurringExpenseAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("recurring_expenses").select("*").eq("id", id).single();
  return data;
}

function readForm(formData) {
  return {
    category_id: formData.get("categoryId")?.toString() || null,
    vendor_id: formData.get("vendorId")?.toString() || null,
    amount: Number(formData.get("amount")) || 0,
    description: formData.get("description")?.toString().trim() || "",
    payment_method: formData.get("paymentMethod")?.toString() || "bank_transfer",
    frequency: formData.get("frequency")?.toString() || "monthly",
    next_run_date: formData.get("nextRunDate")?.toString() || new Date().toISOString().slice(0, 10),
    is_active: formData.get("isActive") === "on",
  };
}

export async function createRecurringExpense(prevState, formData) {
  const admin_ = await requireAdmin();
  const fields = readForm(formData);
  if (!fields.amount) return { error: "Amount is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("recurring_expenses").insert(fields);
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "recurring_expense_created", entityType: "recurring_expense", entityId: "new", metadata: { amount: fields.amount, frequency: fields.frequency } });
  revalidatePath("/admin/recurring-expenses");
  redirect("/admin/recurring-expenses");
}

export async function updateRecurringExpense(prevState, formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const fields = readForm(formData);
  if (!fields.amount) return { error: "Amount is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("recurring_expenses").update(fields).eq("id", id);
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "recurring_expense_updated", entityType: "recurring_expense", entityId: id });
  revalidatePath("/admin/recurring-expenses");
  redirect("/admin/recurring-expenses");
}

export async function deleteRecurringExpense(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("recurring_expenses").delete().eq("id", id);
  await logAdminActivity({ admin: admin_, action: "recurring_expense_deleted", entityType: "recurring_expense", entityId: id });
  revalidatePath("/admin/recurring-expenses");
}

function advance(dateStr, frequency) {
  const d = new Date(dateStr);
  if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

// No cron in this app — this runs on demand (button on the Recurring page)
// rather than on a schedule. Creates one draft expense per due template and
// rolls next_run_date forward.
export async function generateDueRecurringExpenses() {
  const admin_ = await requireAdmin();
  const admin = createAdminClient();

  const today = new Date().toISOString().slice(0, 10);
  const { data: due } = await admin
    .from("recurring_expenses")
    .select("*")
    .eq("is_active", true)
    .lte("next_run_date", today);

  let created = 0;
  for (const r of due || []) {
    await admin.from("expenses").insert({
      expense_date: r.next_run_date,
      category_id: r.category_id,
      vendor_id: r.vendor_id,
      amount: r.amount,
      tax_amount: 0,
      total_amount: r.amount,
      payment_method: r.payment_method,
      description: r.description ? `${r.description} (recurring)` : "Recurring expense",
      status: "draft",
      created_by: admin_.id,
    });
    await admin.from("recurring_expenses").update({ next_run_date: advance(r.next_run_date, r.frequency) }).eq("id", r.id);
    created += 1;
  }

  if (created > 0) {
    await logAdminActivity({ admin: admin_, action: "recurring_expenses_generated", entityType: "recurring_expense", entityId: "batch", metadata: { count: created } });
  }

  revalidatePath("/admin/recurring-expenses");
  revalidatePath("/admin/expenses");
  return { created };
}
