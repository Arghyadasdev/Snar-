"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/dal";
import { getSiteSettings } from "@/lib/data/site-settings";
import { buildWhatsappOrderLink } from "@/lib/whatsapp";

export async function placeOrder(prevState, formData) {
  const user = await requireUser("/checkout");
  const supabase = await createClient();

  const shipping = {
    name: formData.get("name")?.toString().trim(),
    address: formData.get("address")?.toString().trim(),
    city: formData.get("city")?.toString().trim(),
    state: formData.get("state")?.toString().trim(),
    zip: formData.get("zip")?.toString().trim(),
    phone: formData.get("phone")?.toString().trim(),
  };

  for (const [key, value] of Object.entries(shipping)) {
    if (!value) {
      return { error: `Please fill in your ${key}.` };
    }
  }

  const couponCode = formData.get("couponCode")?.toString().trim() || null;

  const { data: orderId, error } = await supabase.rpc("place_order", {
    p_shipping: shipping,
    p_coupon_code: couponCode,
  });

  if (error) {
    if (error.message.includes("Cart is empty")) return { error: "Your cart is empty." };
    if (error.message.includes("coupon") || error.message.includes("Coupon") || error.message.includes("minimum amount")) {
      return { error: error.message };
    }
    return { error: "Could not place order. Please try again." };
  }

  const [{ data: orderItems }, settings] = await Promise.all([
    supabase.from("order_items").select("product_name, unit_price, quantity, size").eq("order_id", orderId),
    getSiteSettings(),
  ]);

  const items = orderItems || [];
  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const whatsappUrl = buildWhatsappOrderLink(
    settings.whatsapp_number,
    items.map((i) => ({ name: i.product_name, size: i.size, quantity: i.quantity, price: i.unit_price })),
    total
  );

  redirect(whatsappUrl);
}

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
