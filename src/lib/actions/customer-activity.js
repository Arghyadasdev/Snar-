import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function logCustomerActivity({ userId, orderId = null, type, metadata = {} }) {
  try {
    const admin = createAdminClient();
    await admin.from("customer_activities").insert({
      user_id: userId,
      order_id: orderId,
      activity_type: type,
      metadata,
    });
  } catch (err) {
    console.error("logCustomerActivity failed:", err.message);
  }
}
