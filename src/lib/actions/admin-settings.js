"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_SETTINGS = {
  whatsapp_number: "919875607634",
  instagram_url: "https://www.instagram.com/snarindia",
  facebook_url: "https://www.facebook.com",
  contact_email: "info@snar.co.in",
  free_shipping_threshold: 999,
};

export async function getSettingsAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("site_settings").select("*").eq("id", 1).single();
  return data || DEFAULT_SETTINGS;
}

export async function updateSettings(prevState, formData) {
  await requireAdmin();

  const fields = {
    whatsapp_number: formData.get("whatsappNumber")?.toString().trim(),
    instagram_url: formData.get("instagramUrl")?.toString().trim(),
    facebook_url: formData.get("facebookUrl")?.toString().trim(),
    contact_email: formData.get("contactEmail")?.toString().trim(),
    free_shipping_threshold: Number(formData.get("freeShippingThreshold")) || 0,
  };

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert({ id: 1, ...fields });
  if (error) return { error: error.message };

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
