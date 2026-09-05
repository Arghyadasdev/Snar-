"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listAllOrdersAdmin(search = "") {
  await requireAdmin();
  const admin = createAdminClient();
  let query = admin
    .from("orders")
    .select("id, status, total, created_at, shipping_name")
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.ilike("shipping_name", `%${search.trim()}%`);
  }

  const { data } = await query;
  return data || [];
}

export async function getOrderAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", id).single();
  if (!order) return null;
  const { data: items } = await admin
    .from("order_items")
    .select("id, product_name, unit_price, quantity, size, color_name")
    .eq("order_id", id);
  return { ...order, items: items || [] };
}

export async function updateOrderStatus(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  const admin = createAdminClient();
  await admin.from("orders").update({ status }).eq("id", id);

  revalidatePath("/admin/orders");
}
