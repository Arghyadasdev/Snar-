"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";

export async function listBankAccountsAdmin() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: accounts }, { data: balances }] = await Promise.all([
    admin.from("bank_accounts").select("*").order("created_at", { ascending: true }),
    admin.from("bank_account_balances").select("*"),
  ]);

  const balanceById = new Map((balances || []).map((b) => [b.account_id, Number(b.current_balance)]));
  return (accounts || []).map((a) => ({ ...a, current_balance: balanceById.get(a.id) ?? Number(a.opening_balance) }));
}

export async function getBankAccountAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: account } = await admin.from("bank_accounts").select("*").eq("id", id).single();
  if (!account) return null;

  const { data: balanceRow } = await admin.from("bank_account_balances").select("current_balance").eq("account_id", id).maybeSingle();
  const { data: transactions } = await admin
    .from("bank_transactions")
    .select("*")
    .eq("account_id", id)
    .order("txn_date", { ascending: false })
    .order("created_at", { ascending: false });

  return {
    ...account,
    current_balance: balanceRow ? Number(balanceRow.current_balance) : Number(account.opening_balance),
    transactions: transactions || [],
  };
}

function readAccountForm(formData) {
  return {
    name: formData.get("name")?.toString().trim(),
    account_type: formData.get("accountType")?.toString() || "bank",
    bank_name: formData.get("bankName")?.toString().trim() || "",
    account_number: formData.get("accountNumber")?.toString().trim() || "",
    ifsc_code: formData.get("ifscCode")?.toString().trim() || "",
    opening_balance: Number(formData.get("openingBalance")) || 0,
  };
}

export async function createBankAccount(prevState, formData) {
  const admin_ = await requireAdmin();
  const fields = readAccountForm(formData);
  if (!fields.name) return { error: "Account name is required." };

  const admin = createAdminClient();
  const { data, error } = await admin.from("bank_accounts").insert(fields).select("id").single();
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "bank_account_created", entityType: "bank_account", entityId: data.id, metadata: { name: fields.name } });
  revalidatePath("/admin/banking");
  redirect("/admin/banking");
}

export async function updateBankAccount(prevState, formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const fields = readAccountForm(formData);
  if (!fields.name) return { error: "Account name is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("bank_accounts").update(fields).eq("id", id);
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "bank_account_updated", entityType: "bank_account", entityId: id, metadata: { name: fields.name } });
  revalidatePath("/admin/banking");
  redirect("/admin/banking");
}

export async function deleteBankAccount(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("bank_accounts").delete().eq("id", id);
  await logAdminActivity({ admin: admin_, action: "bank_account_deleted", entityType: "bank_account", entityId: id });
  revalidatePath("/admin/banking");
  redirect("/admin/banking");
}

export async function addTransaction(formData) {
  const admin_ = await requireAdmin();
  const accountId = formData.get("accountId")?.toString();
  const amount = Number(formData.get("amount")) || 0;
  if (!amount) return;

  const admin = createAdminClient();
  await admin.from("bank_transactions").insert({
    account_id: accountId,
    txn_date: formData.get("txnDate")?.toString() || new Date().toISOString().slice(0, 10),
    type: formData.get("type")?.toString() || "debit",
    amount,
    description: formData.get("description")?.toString().trim() || "",
    reference_number: formData.get("referenceNumber")?.toString().trim() || "",
    created_by: admin_.id,
  });

  await logAdminActivity({ admin: admin_, action: "bank_transaction_added", entityType: "bank_account", entityId: accountId, metadata: { amount } });
  revalidatePath(`/admin/banking/${accountId}`);
  revalidatePath("/admin/banking");
}

export async function toggleReconciled(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const accountId = formData.get("accountId")?.toString();
  const reconciled = formData.get("reconciled") === "true";

  const admin = createAdminClient();
  await admin.from("bank_transactions").update({ reconciled: !reconciled }).eq("id", id);
  revalidatePath(`/admin/banking/${accountId}`);
}

export async function deleteTransaction(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const accountId = formData.get("accountId")?.toString();

  const admin = createAdminClient();
  await admin.from("bank_transactions").delete().eq("id", id);
  await logAdminActivity({ admin: admin_, action: "bank_transaction_deleted", entityType: "bank_account", entityId: accountId });
  revalidatePath(`/admin/banking/${accountId}`);
  revalidatePath("/admin/banking");
}
