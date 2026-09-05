"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/dal";

export async function listOrders() {
  const user = await requireUser("/account/orders");
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getOrder(orderId) {
  await requireUser("/account/orders");
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order) return null;
  const { data: items } = await supabase
    .from("order_items")
    .select("id, product_name, unit_price, quantity, size")
    .eq("order_id", orderId);
  return { ...order, items: items || [] };
}
