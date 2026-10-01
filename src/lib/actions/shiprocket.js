"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createShiprocketOrder,
  trackShiprocketShipment,
  assignShiprocketAWB,
  requestShiprocketPickup,
  generateShiprocketLabel,
  generateShiprocketInvoice,
  generateShiprocketManifest,
  getServiceableCouriers,
  cancelShiprocketOrder,
} from "@/lib/shiprocket";
import { logAdminActivity } from "@/lib/actions/admin-activity";

// Credentials can be set from Admin -> Settings instead of env vars +
// redeploy. Empty columns mean "not set from the UI"; lib/shiprocket.js
// falls back to SHIPROCKET_EMAIL/PASSWORD/PICKUP_LOCATION when undefined.
async function getShiprocketCredentials(admin) {
  const { data } = await admin
    .from("site_settings")
    .select("shiprocket_email, shiprocket_password, shiprocket_pickup_location, shiprocket_pickup_pincode")
    .eq("id", 1)
    .single();

  return {
    email: data?.shiprocket_email || undefined,
    password: data?.shiprocket_password || undefined,
    pickupLocation: data?.shiprocket_pickup_location || undefined,
    pickupPincode: data?.shiprocket_pickup_pincode || undefined,
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
  const admin_ = await requireAdmin();
  const orderId = formData.get("id")?.toString();
  await syncOrderToShiprocket(orderId);
  await logAdminActivity({ admin: admin_, action: "shiprocket_shipment_synced", entityType: "order", entityId: orderId });
  revalidatePath(`/admin/orders/${orderId}`);
}

// Couriers that can actually deliver to this order's pincode, for the
// manual courier picker. Falls back to an empty list (UI then just offers
// "Auto-assign") if the pickup pincode isn't configured yet or the call
// fails for any reason.
export async function getAvailableCouriersForOrder(orderId) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("shipping_zip").eq("id", orderId).single();
  if (!order) return [];

  const credentials = await getShiprocketCredentials(admin);
  if (!credentials.pickupPincode) return [];

  try {
    const result = await getServiceableCouriers({
      pickupPincode: credentials.pickupPincode,
      deliveryPincode: order.shipping_zip,
      weight: Number(process.env.SHIPROCKET_DEFAULT_ITEM_WEIGHT_KG || 0.3),
    }, credentials);

    return result?.data?.available_courier_companies || [];
  } catch (err) {
    console.error("Shiprocket serviceability check failed:", err.message);
    return [];
  }
}

// Assigns a courier + AWB — the step that turns a created Shiprocket order
// into an actual trackable shipment. Without this, "Create Shiprocket
// Shipment" alone leaves the order sitting unassigned in Shiprocket forever.
// courierId is optional — omit it to let Shiprocket auto-pick.
export async function assignAwb(formData) {
  const admin_ = await requireAdmin();
  const orderId = formData.get("id")?.toString();
  const courierId = formData.get("courierId")?.toString() || undefined;
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("shiprocket_shipment_id").eq("id", orderId).single();
  if (!order?.shiprocket_shipment_id) return;

  const credentials = await getShiprocketCredentials(admin);

  try {
    const result = await assignShiprocketAWB(order.shiprocket_shipment_id, credentials, courierId);
    const data = result?.response?.data || result;

    await admin
      .from("orders")
      .update({
        awb_code: data?.awb_code?.toString() || undefined,
        courier_name: data?.courier_name || undefined,
        shiprocket_status: "AWB Assigned",
      })
      .eq("id", orderId);
    await logAdminActivity({ admin: admin_, action: "shiprocket_awb_assigned", entityType: "order", entityId: orderId, metadata: { courier_id: courierId || "auto" } });
  } catch (err) {
    console.error("Shiprocket AWB assignment failed:", err.message);
    await admin.from("orders").update({ shiprocket_status: `error: ${err.message}` }).eq("id", orderId);
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

// Schedules courier pickup. Only meaningful once an AWB is assigned.
export async function requestPickup(formData) {
  const admin_ = await requireAdmin();
  const orderId = formData.get("id")?.toString();
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("shiprocket_shipment_id").eq("id", orderId).single();
  if (!order?.shiprocket_shipment_id) return;

  const credentials = await getShiprocketCredentials(admin);

  try {
    const result = await requestShiprocketPickup(order.shiprocket_shipment_id, credentials);
    const data = result?.response || result;

    await admin
      .from("orders")
      .update({
        shiprocket_pickup_status: data?.pickup_status?.toString() || data?.pickup_scheduled_date || "requested",
      })
      .eq("id", orderId);
    await logAdminActivity({ admin: admin_, action: "shiprocket_pickup_requested", entityType: "order", entityId: orderId });
  } catch (err) {
    console.error("Shiprocket pickup request failed:", err.message);
    await admin.from("orders").update({ shiprocket_pickup_status: `error: ${err.message}` }).eq("id", orderId);
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function generateLabel(formData) {
  const admin_ = await requireAdmin();
  const orderId = formData.get("id")?.toString();
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("shiprocket_shipment_id").eq("id", orderId).single();
  if (!order?.shiprocket_shipment_id) return;

  const credentials = await getShiprocketCredentials(admin);

  try {
    const result = await generateShiprocketLabel(order.shiprocket_shipment_id, credentials);
    if (result?.label_url) {
      await admin.from("orders").update({ shiprocket_label_url: result.label_url }).eq("id", orderId);
      await logAdminActivity({ admin: admin_, action: "shiprocket_label_generated", entityType: "order", entityId: orderId });
    }
  } catch (err) {
    console.error("Shiprocket label generation failed:", err.message);
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function generateInvoice(formData) {
  const admin_ = await requireAdmin();
  const orderId = formData.get("id")?.toString();
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("shiprocket_order_id").eq("id", orderId).single();
  if (!order?.shiprocket_order_id) return;

  const credentials = await getShiprocketCredentials(admin);

  try {
    const result = await generateShiprocketInvoice(order.shiprocket_order_id, credentials);
    if (result?.invoice_url) {
      await admin.from("orders").update({ shiprocket_invoice_url: result.invoice_url }).eq("id", orderId);
      await logAdminActivity({ admin: admin_, action: "shiprocket_invoice_generated", entityType: "order", entityId: orderId });
    }
  } catch (err) {
    console.error("Shiprocket invoice generation failed:", err.message);
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function generateManifest(formData) {
  const admin_ = await requireAdmin();
  const orderId = formData.get("id")?.toString();
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("shiprocket_shipment_id").eq("id", orderId).single();
  if (!order?.shiprocket_shipment_id) return;

  const credentials = await getShiprocketCredentials(admin);

  try {
    const result = await generateShiprocketManifest(order.shiprocket_shipment_id, credentials);
    if (result?.manifest_url) {
      await admin.from("orders").update({ shiprocket_manifest_url: result.manifest_url }).eq("id", orderId);
      await logAdminActivity({ admin: admin_, action: "shiprocket_manifest_generated", entityType: "order", entityId: orderId });
    }
  } catch (err) {
    console.error("Shiprocket manifest generation failed:", err.message);
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

// Cancels the shipment in Shiprocket. Does not change our own order status
// (admin still controls that via the Status dropdown) so a cancelled
// shipment doesn't silently relabel a return/dispute as "cancelled".
export async function cancelShipment(formData) {
  const admin_ = await requireAdmin();
  const orderId = formData.get("id")?.toString();
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("shiprocket_order_id").eq("id", orderId).single();
  if (!order?.shiprocket_order_id) return;

  const credentials = await getShiprocketCredentials(admin);

  try {
    await cancelShiprocketOrder(order.shiprocket_order_id, credentials);
    await admin.from("orders").update({ shiprocket_status: "Cancelled" }).eq("id", orderId);
    await logAdminActivity({ admin: admin_, action: "shipment_cancelled", entityType: "order", entityId: orderId });
  } catch (err) {
    console.error("Shiprocket cancellation failed:", err.message);
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
