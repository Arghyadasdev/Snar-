import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

const DEFAULTS = {
  whatsapp_number: "919875607634",
  instagram_url: "https://www.instagram.com/snarindia?igsh=MTBsanM0OGgydXJyYw%3D%3D&utm_source=qr",
  facebook_url: "https://www.facebook.com/share/1Ku37nYEQW/?mibextid=wwXIfr",
  contact_email: "info@snar.co.in",
  free_shipping_threshold: 999,
};

export async function getSiteSettings() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return data || DEFAULTS;
}

export async function getActiveTestimonials() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getSiteStats() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_stats").select("slot, num, label");
  return data || [];
}

export async function getActiveFaqs() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data || [];
}
