"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logCustomerActivity } from "@/lib/actions/customer-activity";
import { logAdminActivity } from "@/lib/actions/admin-activity";

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
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").update({ status }).eq("id", id).select("user_id, status").single();

  if (order && (status === "delivered" || status === "cancelled")) {
    await logCustomerActivity({
      userId: order.user_id,
      orderId: id,
      type: status === "delivered" ? "order_delivered" : "order_cancelled",
    });
  }

  await logAdminActivity({ admin: admin_, action: "order_status_changed", entityType: "order", entityId: id, metadata: { status } });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
