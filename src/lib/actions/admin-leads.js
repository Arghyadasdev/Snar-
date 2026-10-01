"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";

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

export async function getLeadStats() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("leads").select("status");
  const leads = data || [];
  const converted = leads.filter((l) => l.status === "converted").length;
  return {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted,
    conversionRate: leads.length > 0 ? (converted / leads.length) * 100 : 0,
  };
}

// Best-effort: if a lead's email matches an existing account, link them so
// admins can see which customer a lead turned into.
async function findMatchingCustomerId(admin, email) {
  if (!email) return null;
  const { data } = await admin.from("profiles").select("id").ilike("email", email).limit(1).maybeSingle();
  return data?.id || null;
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
  const admin_ = await requireAdmin();
  const fields = readForm(formData);
  if (!fields.name) return { error: "Name is required." };

  const admin = createAdminClient();
  const { data, error } = await admin.from("leads").insert(fields).select("id").single();
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "lead_created", entityType: "lead", entityId: data.id, metadata: { name: fields.name } });

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

export async function updateLead(prevState, formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const fields = readForm(formData);
  if (!fields.name) return { error: "Name is required." };

  const admin = createAdminClient();
  const updates = { ...fields, updated_at: new Date().toISOString() };
  if (fields.status === "converted") {
    const { data: existing } = await admin.from("leads").select("converted_customer_id").eq("id", id).single();
    if (!existing?.converted_customer_id) {
      updates.converted_customer_id = await findMatchingCustomerId(admin, fields.email);
    }
  }

  const { error } = await admin.from("leads").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "lead_updated", entityType: "lead", entityId: id, metadata: { status: fields.status } });

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

export async function updateLeadStatus(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  const admin = createAdminClient();
  const updates = { status, updated_at: new Date().toISOString() };
  if (status === "converted") {
    const { data: lead } = await admin.from("leads").select("email, converted_customer_id").eq("id", id).single();
    if (lead && !lead.converted_customer_id) {
      updates.converted_customer_id = await findMatchingCustomerId(admin, lead.email);
    }
  }
  await admin.from("leads").update(updates).eq("id", id);
  await logAdminActivity({ admin: admin_, action: "lead_status_changed", entityType: "lead", entityId: id, metadata: { status } });

  revalidatePath("/admin/leads");
}

export async function deleteLead(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("leads").delete().eq("id", id);
  await logAdminActivity({ admin: admin_, action: "lead_deleted", entityType: "lead", entityId: id });
  revalidatePath("/admin/leads");
}
