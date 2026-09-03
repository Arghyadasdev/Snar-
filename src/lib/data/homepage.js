import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export async function getActiveBanners() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getActiveMarqueeItems() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("marquee_items")
    .select("id, text")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data || [];
}
