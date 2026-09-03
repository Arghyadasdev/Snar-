"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/dal";

export async function getCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("cart_items")
    .select("id, quantity, size, product:products(id, slug, name, price, image_url, stock)")
    .order("created_at", { ascending: true });

  return data || [];
}

export async function getCartCount() {
  const items = await getCart();
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export async function addToCart(formData) {
  const productId = formData.get("productId")?.toString();
  const size = formData.get("size")?.toString() || "";
  const redirectTo = formData.get("redirectTo")?.toString() || "/cart";

  const user = await requireUser(redirectTo);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("size", size)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, size, quantity: 1 });
  }

  revalidatePath("/cart");
  redirect("/cart");
}

export async function updateCartItem(formData) {
  const id = formData.get("id")?.toString();
  const quantity = Number(formData.get("quantity"));

  const supabase = await createClient();
  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", id);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", id);
  }

  revalidatePath("/cart");
}

export async function removeCartItem(formData) {
  const id = formData.get("id")?.toString();
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("id", id);
  revalidatePath("/cart");
}
