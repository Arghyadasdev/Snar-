"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listLeadsAdmin(search = "", status = "") {
  await requireAdmin();
  const admin = createAdminClient();
  let query = admin.from("leads").select("*").order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.or(`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return data || [];
}

export async function getLeadAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("leads").select("*").eq("id", id).single();
  return data;
}

export async function listAdminUsersForAssignment() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id, full_name, email").eq("role", "admin");
  return data || [];
}

function readForm(formData) {
  return {
    name: formData.get("name")?.toString().trim(),
    email: formData.get("email")?.toString().trim() || null,
    phone: formData.get("phone")?.toString().trim() || null,
    status: formData.get("status")?.toString() || "new",
    notes: formData.get("notes")?.toString().trim() || null,
    assigned_admin_id: formData.get("assignedAdminId")?.toString() || null,
  };
}

export async function createLead(prevState, formData) {
  await requireAdmin();
  const fields = readForm(formData);
  if (!fields.name) return { error: "Name is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("leads").insert(fields);
  if (error) return { error: error.message };

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

export async function updateLead(prevState, formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const fields = readForm(formData);
  if (!fields.name) return { error: "Name is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("leads").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

export async function updateLeadStatus(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  const admin = createAdminClient();
  await admin.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", id);

  revalidatePath("/admin/leads");
}

export async function deleteLead(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
}
