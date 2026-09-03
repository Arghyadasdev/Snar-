"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listCustomersAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function setCustomerRole(formData) {
  const currentAdmin = await requireAdmin();
  const id = formData.get("id")?.toString();
  const role = formData.get("role")?.toString();

  if (id === currentAdmin.id && role !== "admin") {
    return; // don't let an admin demote themselves and get locked out
  }

  const admin = createAdminClient();
  await admin.from("profiles").update({ role }).eq("id", id);

  revalidatePath("/admin/customers");
}

export async function resetCustomerPassword(prevState, formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const newPassword = formData.get("newPassword")?.toString();

  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password: newPassword });
  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset." };
}
