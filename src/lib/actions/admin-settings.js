"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";

const DEFAULT_SETTINGS = {
  whatsapp_number: "919875607634",
  instagram_url: "https://www.instagram.com/snarindia",
  facebook_url: "https://www.facebook.com",
  contact_email: "info@snar.co.in",
  free_shipping_threshold: 999,
  shiprocket_email: "",
  shiprocket_password: "",
};

export async function getSettingsAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("site_settings").select("*").eq("id", 1).single();
  return data || DEFAULT_SETTINGS;
}

export async function updateSettings(prevState, formData) {
  const admin_ = await requireAdmin();

  const fields = {
    whatsapp_number: formData.get("whatsappNumber")?.toString().trim(),
    instagram_url: formData.get("instagramUrl")?.toString().trim(),
    facebook_url: formData.get("facebookUrl")?.toString().trim(),
    contact_email: formData.get("contactEmail")?.toString().trim(),
    free_shipping_threshold: Number(formData.get("freeShippingThreshold")) || 0,
    shiprocket_email: formData.get("shiprocketEmail")?.toString().trim(),
  };

  // Only touch the stored password when a new one is typed — the field is
  // never pre-filled with the existing secret, so a blank submit means
  // "keep what's already saved," not "clear it."
  const shiprocketPassword = formData.get("shiprocketPassword")?.toString().trim();
  if (shiprocketPassword) fields.shiprocket_password = shiprocketPassword;

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert({ id: 1, ...fields });
  if (error) return { error: error.message };

  // Never log the password itself — only that it changed.
  await logAdminActivity({
    admin: admin_,
    action: "settings_updated",
    entityType: "site_settings",
    entityId: "1",
    metadata: { ...fields, shiprocket_password: shiprocketPassword ? "changed" : undefined },
  });

  revalidatePath("/", "layout");
  return { success: "Settings saved." };
}

export async function listSiteStatsAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("site_stats").select("*").order("slot");
  return data || [];
}

export async function updateSiteStat(formData) {
  await requireAdmin();
  const slot = formData.get("slot")?.toString();
  const num = formData.get("num")?.toString().trim();
  const label = formData.get("label")?.toString().trim();

  const admin = createAdminClient();
  await admin.from("site_stats").update({ num, label }).eq("slot", slot);

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
