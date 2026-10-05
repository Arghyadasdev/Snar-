"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";
import { ilikePattern } from "@/lib/supabase/filters";

export async function listVendorsAdmin(search = "") {
  await requireAdmin();
  const admin = createAdminClient();
  let query = admin.from("vendors").select("*").order("name");
  if (search.trim()) {
    const pattern = ilikePattern(search.trim());
    query = query.or(`name.ilike.${pattern},email.ilike.${pattern}`);
  }
  const { data } = await query;
  return data || [];
}

export async function getVendorAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("vendors").select("*").eq("id", id).single();
  return data;
}

function readForm(formData) {
  return {
    name: formData.get("name")?.toString().trim(),
    contact_name: formData.get("contactName")?.toString().trim() || "",
    email: formData.get("email")?.toString().trim() || "",
    phone: formData.get("phone")?.toString().trim() || "",
    address: formData.get("address")?.toString().trim() || "",
    gstin: formData.get("gstin")?.toString().trim() || "",
    notes: formData.get("notes")?.toString().trim() || "",
  };
}

export async function createVendor(prevState, formData) {
  const admin_ = await requireAdmin();
  const fields = readForm(formData);
  if (!fields.name) return { error: "Vendor name is required." };

  const admin = createAdminClient();
  const { data, error } = await admin.from("vendors").insert(fields).select("id").single();
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "vendor_created", entityType: "vendor", entityId: data.id, metadata: { name: fields.name } });
  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}

export async function updateVendor(prevState, formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const fields = readForm(formData);
  if (!fields.name) return { error: "Vendor name is required." };

  const admin = createAdminClient();
  const { error } = await admin.from("vendors").update(fields).eq("id", id);
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "vendor_updated", entityType: "vendor", entityId: id, metadata: { name: fields.name } });
  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}

export async function deleteVendor(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("vendors").delete().eq("id", id);
  await logAdminActivity({ admin: admin_, action: "vendor_deleted", entityType: "vendor", entityId: id });
  revalidatePath("/admin/vendors");
}
