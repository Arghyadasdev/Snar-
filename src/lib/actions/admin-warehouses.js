"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";

export async function listWarehousesAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("warehouses").select("*").order("created_at", { ascending: true });
  return data || [];
}

export async function getWarehouseAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("warehouses").select("*").eq("id", id).single();
  return data;
}

// The warehouse Shiprocket ships from. For now: the first active one —
// single-warehouse scope, so there's exactly one in practice.
export async function getActiveWarehouse() {
  const admin = createAdminClient();
  const { data } = await admin.from("warehouses").select("*").eq("is_active", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
  return data;
}

function readForm(formData) {
  return {
    name: formData.get("name")?.toString().trim(),
    address_line1: formData.get("addressLine1")?.toString().trim(),
    city: formData.get("city")?.toString().trim(),
    state: formData.get("state")?.toString().trim(),
    pincode: formData.get("pincode")?.toString().trim(),
    phone: formData.get("phone")?.toString().trim() || "",
    is_active: formData.get("isActive") === "on",
  };
}

export async function createWarehouse(prevState, formData) {
  const admin_ = await requireAdmin();
  const fields = readForm(formData);
  if (!fields.name || !fields.address_line1 || !fields.city || !fields.state || !fields.pincode) {
    return { error: "Name, address, city, state, and pincode are required." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("warehouses").insert(fields).select("id").single();
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "warehouse_created", entityType: "warehouse", entityId: data.id, metadata: { name: fields.name } });

  revalidatePath("/admin/warehouses");
  return { success: "Warehouse added." };
}

export async function updateWarehouse(prevState, formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const fields = readForm(formData);
  if (!fields.name || !fields.address_line1 || !fields.city || !fields.state || !fields.pincode) {
    return { error: "Name, address, city, state, and pincode are required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("warehouses").update(fields).eq("id", id);
  if (error) return { error: error.message };

  await logAdminActivity({ admin: admin_, action: "warehouse_updated", entityType: "warehouse", entityId: id, metadata: { name: fields.name } });

  revalidatePath("/admin/warehouses");
  return { success: "Warehouse saved." };
}

export async function deleteWarehouse(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("warehouses").delete().eq("id", id);
  await logAdminActivity({ admin: admin_, action: "warehouse_deleted", entityType: "warehouse", entityId: id });
  revalidatePath("/admin/warehouses");
}
