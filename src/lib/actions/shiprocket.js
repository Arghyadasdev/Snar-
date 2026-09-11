"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { createShiprocketOrder, trackShiprocketShipment } from "@/lib/shiprocket";

// Credentials can be set from Admin -> Settings instead of env vars +
// redeploy. Empty columns mean "not set from the UI"; lib/shiprocket.js
// falls back to SHIPROCKET_EMAIL/PASSWORD/PICKUP_LOCATION when undefined.
async function getShiprocketCredentials(admin) {
  const { data } = await admin
    .from("site_settings")
    .select("shiprocket_email, shiprocket_password, shiprocket_pickup_location")
    .eq("id", 1)
    .single();

  return {
    email: data?.shiprocket_email || undefined,
    password: data?.shiprocket_password || undefined,
    pickupLocation: data?.shiprocket_pickup_location || undefined,
  };
}

// Creates the shipment in Shiprocket for a paid order and stores the
// reference back on the order row. Safe to re-run: Shiprocket treats a
// repeat call with the same order_id as an update, not a duplicate. Never
// throws — failures are recorded on the order as shiprocket_status so a
// missing/invalid API credential can't break order placement or admin use.
// Called automatically right after checkout (see verifyAndPlaceOrder in
// lib/actions/razorpay.js) and manually via the admin retry button.
export async function syncOrderToShiprocket(orderId) {
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order) return;

  const { data: items } = await admin
    .from("order_items")
    .select("id, product_id, product_name, unit_price, quantity")
    .eq("order_id", orderId);

  const { data: profile } = await admin.from("profiles").select("email").eq("id", order.user_id).single();
  const credentials = await getShiprocketCredentials(admin);

  try {
    const result = await createShiprocketOrder({
      ...order,
      customerEmail: profile?.email,
      items: items || [],
    }, credentials);

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
}

export async function createShiprocketShipment(formData) {
  await requireAdmin();
  const orderId = formData.get("id")?.toString();
  await syncOrderToShiprocket(orderId);
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

  const credentials = await getShiprocketCredentials(admin);

  try {
    const result = await trackShiprocketShipment(order.shiprocket_shipment_id, credentials);
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
