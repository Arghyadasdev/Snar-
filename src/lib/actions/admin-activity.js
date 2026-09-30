"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

// Best-effort — a logging failure should never break the action it's
// logging. Call with the admin profile already in hand (most admin actions
// call requireAdmin() first anyway) to avoid a second auth round-trip.
export async function logAdminActivity({ admin, action, entityType, entityId, metadata = {} }) {
  try {
    const supabase = createAdminClient();
    await supabase.from("admin_activity_log").insert({
      admin_id: admin?.id || null,
      admin_email: admin?.email || null,
      action,
      entity_type: entityType,
      entity_id: entityId?.toString(),
      metadata,
    });
  } catch (err) {
    console.error("Failed to log admin activity:", err.message);
  }
}

export async function listAdminActivity(limit = 100) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}
