"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeSegment } from "@/lib/customer-segment";

export async function listCustomersAdmin(search = "", status = "", segment = "") {
  await requireAdmin();
  const admin = createAdminClient();
  let query = admin
    .from("profiles")
    .select("id, email, full_name, role, status, created_at")
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data: customers } = await query;
  if (!customers || customers.length === 0) return [];

  const { data: stats } = await admin
    .from("customer_order_stats")
    .select("*")
    .in("customer_id", customers.map((c) => c.id));

  const statsById = new Map((stats || []).map((s) => [s.customer_id, s]));

  const withSegment = customers.map((c) => {
    const s = statsById.get(c.id) || {};
    return {
      ...c,
      total_orders: s.total_orders || 0,
      total_spent: s.total_spent || 0,
      last_order_at: s.last_order_at || null,
      segment: computeSegment({ createdAt: c.created_at, ...s }),
    };
  });

  return segment ? withSegment.filter((c) => c.segment === segment) : withSegment;
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

export async function setCustomerStatus(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  const admin = createAdminClient();
  await admin.from("profiles").update({ status }).eq("id", id);

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
}

export async function getCustomerDetailAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: profile } = await admin.from("profiles").select("*").eq("id", id).single();
  if (!profile) return null;

  const [{ data: statsRow }, { data: orders }, { data: activities }, { data: notes }, { data: tagLinks }] = await Promise.all([
    admin.from("customer_order_stats").select("*").eq("customer_id", id).maybeSingle(),
    admin.from("orders").select("id, status, total, payment_status, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    admin.from("customer_activities").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    admin
      .from("customer_notes")
      .select("id, note, created_at, author:profiles!customer_notes_created_by_fkey(full_name, email)")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    admin.from("customer_tags").select("tag_id, tags(id, name)").eq("customer_id", id),
  ]);

  const stats = statsRow || { total_orders: 0, total_spent: 0, last_order_at: null };

  return {
    profile,
    stats,
    segment: computeSegment({ createdAt: profile.created_at, ...stats }),
    orders: orders || [],
    activities: activities || [],
    notes: notes || [],
    tags: (tagLinks || []).map((t) => t.tags).filter(Boolean),
  };
}

export async function addCustomerNote(prevState, formData) {
  const admin_ = await requireAdmin();
  const customerId = formData.get("customerId")?.toString();
  const note = formData.get("note")?.toString().trim();

  if (!note) return { error: "Note can't be empty." };

  const admin = createAdminClient();
  const { error } = await admin.from("customer_notes").insert({
    customer_id: customerId,
    note,
    created_by: admin_.id,
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/customers/${customerId}`);
  return { success: "Note added." };
}

export async function addCustomerTag(formData) {
  await requireAdmin();
  const customerId = formData.get("customerId")?.toString();
  const tagId = formData.get("tagId")?.toString();
  if (!tagId) return;

  const admin = createAdminClient();
  await admin.from("customer_tags").insert({ customer_id: customerId, tag_id: tagId });

  revalidatePath(`/admin/customers/${customerId}`);
}

export async function removeCustomerTag(formData) {
  await requireAdmin();
  const customerId = formData.get("customerId")?.toString();
  const tagId = formData.get("tagId")?.toString();

  const admin = createAdminClient();
  await admin.from("customer_tags").delete().eq("customer_id", customerId).eq("tag_id", tagId);

  revalidatePath(`/admin/customers/${customerId}`);
}
