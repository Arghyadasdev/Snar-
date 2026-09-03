import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getActiveBanners() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getActiveMarqueeItems() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("marquee_items")
    .select("id, text")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data || [];
}
