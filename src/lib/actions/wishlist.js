"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function isProductWishlisted(productId) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  return !!data;
}

export async function listWishlist() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("wishlist_items")
    .select("product:products(id, slug, name, price, compare_at_price, image_url, category:categories(slug, name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data || []).map((w) => w.product).filter(Boolean);
}

// Called directly from a client component (not a <form>), so it takes a
// plain arg rather than FormData. Returns the new membership state, or null
// if the caller isn't logged in (the client redirects to /login itself —
// redirect() thrown from here would race a caller-side .catch()).
export async function toggleWishlist(productId) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlist_items").delete().eq("id", existing.id);
    revalidatePath("/account/wishlist");
    return false;
  }

  await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
  revalidatePath("/account/wishlist");
  return true;
}
