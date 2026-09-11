"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { createShiprocketOrder, trackShiprocketShipment } from "@/lib/shiprocket";

// Creates the shipment in Shiprocket for a paid order and stores the
// reference back on the order row. Safe to re-run: Shiprocket treats a
// repeat call with the same order_id as an update, not a duplicate.
export async function createShiprocketShipment(formData) {
  await requireAdmin();
  const orderId = formData.get("id")?.toString();
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order) return;

  const { data: items } = await admin
    .from("order_items")
    .select("id, product_id, product_name, unit_price, quantity")
    .eq("order_id", orderId);

  const { data: profile } = await admin.from("profiles").select("email").eq("id", order.user_id).single();

  try {
    const result = await createShiprocketOrder({
      ...order,
      customerEmail: profile?.email,
      items: items || [],
    });

    await admin
      .from("orders")
      .update({
        shiprocket_order_id: result.order_id?.toString() ?? null,
        shiprocket_shipment_id: result.shipment_id?.toString() ?? null,
        shiprocket_status: result.status || "created",
      })
      .eq("id", orderId);
  } catch (err) {
    console.error("Shiprocket order creation failed:", err.message);
    await admin.from("orders").update({ shiprocket_status: `error: ${err.message}` }).eq("id", orderId);
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

// Pulls live status from Shiprocket on demand — for before the webhook is
// wired up, or if a push was missed.
export async function refreshShiprocketTracking(formData) {
  await requireAdmin();
  const orderId = formData.get("id")?.toString();
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("shiprocket_shipment_id").eq("id", orderId).single();
  if (!order?.shiprocket_shipment_id) return;

  try {
    const result = await trackShiprocketShipment(order.shiprocket_shipment_id);
    const track = result?.tracking_data?.shipment_track?.[0];

    await admin
      .from("orders")
      .update({
        awb_code: track?.awb_code || undefined,
        courier_name: track?.courier_name || undefined,
        shiprocket_status: track?.current_status || undefined,
      })
      .eq("id", orderId);
  } catch (err) {
    console.error("Shiprocket tracking refresh failed:", err.message);
  }

  revalidatePath(`/admin/orders/${orderId}`);
}
