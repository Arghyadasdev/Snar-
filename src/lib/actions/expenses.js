"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";
import { uploadReceiptFile } from "@/lib/cloudinary";

export async function listExpensesAdmin(filters = {}) {
  await requireAdmin();
  const admin = createAdminClient();

  let query = admin
    .from("expenses")
    .select("id, expense_date, category_id, vendor_id, amount, tax_amount, total_amount, payment_method, status, receipt_url, description, category:expense_categories(name), vendor:vendors(name)")
    .order("expense_date", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.vendorId) query = query.eq("vendor_id", filters.vendorId);
  if (filters.from) query = query.gte("expense_date", filters.from);
  if (filters.to) query = query.lte("expense_date", filters.to);

  const { data } = await query;
  return data || [];
}

export async function getExpenseAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("expenses")
    .select("*, category:expense_categories(name), vendor:vendors(name), creator:profiles!expenses_created_by_fkey(full_name, email), approver:profiles!expenses_approved_by_fkey(full_name, email)")
    .eq("id", id)
    .single();
  return data;
}

async function readForm(formData) {
  const amount = Number(formData.get("amount")) || 0;
  const taxAmount = Number(formData.get("taxAmount")) || 0;

  let receiptUrl = formData.get("existingReceiptUrl")?.toString() || null;
  const receiptFile = formData.get("receiptFile");
  if (receiptFile instanceof File && receiptFile.size > 0) {
    receiptUrl = await uploadReceiptFile(receiptFile);
  }

  return {
    expense_date: formData.get("expenseDate")?.toString() || new Date().toISOString().slice(0, 10),
    category_id: formData.get("categoryId")?.toString() || null,
    vendor_id: formData.get("vendorId")?.toString() || null,
    amount,
    tax_amount: taxAmount,
    total_amount: amount + taxAmount,
    payment_method: formData.get("paymentMethod")?.toString() || "bank_transfer",
    reference_number: formData.get("referenceNumber")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    receipt_url: receiptUrl,
  };
}

export async function createExpense(prevState, formData) {
  const admin_ = await requireAdmin();
  const fields = await readForm(formData);
  if (!fields.amount) return { error: "Amount is required." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("expenses")
    .insert({ ...fields, created_by: admin_.id, status: "draft" })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "expense_created", entityType: "expense", entityId: data.id, metadata: { amount: fields.total_amount } });
  revalidatePath("/admin/expenses");
  redirect(`/admin/expenses/${data.id}`);
}

export async function updateExpense(prevState, formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const fields = await readForm(formData);
  if (!fields.amount) return { error: "Amount is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("expenses").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "expense_updated", entityType: "expense", entityId: id, metadata: { amount: fields.total_amount } });
  revalidatePath("/admin/expenses");
  redirect(`/admin/expenses/${id}`);
}

export async function deleteExpense(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("expenses").delete().eq("id", id);
  await logAdminActivity({ admin: admin_, action: "expense_deleted", entityType: "expense", entityId: id });
  revalidatePath("/admin/expenses");
  redirect("/admin/expenses");
}

async function setExpenseStatus(id, status, admin_, extra = {}) {
  const admin = createAdminClient();
  await admin.from("expenses").update({ status, updated_at: new Date().toISOString(), ...extra }).eq("id", id);
  await logAdminActivity({ admin: admin_, action: "expense_status_changed", entityType: "expense", entityId: id, metadata: { status } });
  revalidatePath("/admin/expenses");
  revalidatePath(`/admin/expenses/${id}`);
}

export async function submitExpense(formData) {
  const admin_ = await requireAdmin();
  await setExpenseStatus(formData.get("id")?.toString(), "submitted", admin_);
}

export async function approveExpense(formData) {
  const admin_ = await requireAdmin();
  await setExpenseStatus(formData.get("id")?.toString(), "approved", admin_, {
    approved_by: admin_.id,
    approved_at: new Date().toISOString(),
  });
}

export async function rejectExpense(formData) {
  const admin_ = await requireAdmin();
  await setExpenseStatus(formData.get("id")?.toString(), "rejected", admin_);
}

export async function markExpensePaid(formData) {
  const admin_ = await requireAdmin();
  await setExpenseStatus(formData.get("id")?.toString(), "paid", admin_);
}

// Total spend per category within a date range, for the Expenses overview.
export async function getExpenseTotals(from, to) {
  await requireAdmin();
  const admin = createAdminClient();

  let query = admin.from("expenses").select("total_amount, status, category:expense_categories(name)");
  if (from) query = query.gte("expense_date", from);
  if (to) query = query.lte("expense_date", to);

  const { data } = await query;
  const rows = data || [];

  const grandTotal = rows.reduce((sum, r) => sum + Number(r.total_amount), 0);
  const pendingApproval = rows.filter((r) => r.status === "submitted").reduce((s, r) => s + Number(r.total_amount), 0);
  const paid = rows.filter((r) => r.status === "paid").reduce((s, r) => s + Number(r.total_amount), 0);

  const byCategory = new Map();
  for (const r of rows) {
    const name = r.category?.name || "Uncategorized";
    byCategory.set(name, (byCategory.get(name) || 0) + Number(r.total_amount));
  }

  return {
    grandTotal,
    pendingApproval,
    paid,
    byCategory: [...byCategory.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total),
  };
}
