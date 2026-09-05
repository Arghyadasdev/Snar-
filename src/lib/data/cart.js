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
    .select(
      "id, quantity, size, variant_id, product:products(id, slug, name, price, image_url, stock), variant:product_variants(id, color_name, image_url, stock)"
    )
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
  const variantId = formData.get("variantId")?.toString() || null;
  const redirectTo = formData.get("redirectTo")?.toString() || "/cart";

  const user = await requireUser(redirectTo);
  const supabase = await createClient();

  let stock;
  if (variantId) {
    const { data: variant } = await supabase.from("product_variants").select("stock").eq("id", variantId).limit(1);
    stock = variant?.[0]?.stock ?? 0;
  } else {
    const { data: product } = await supabase.from("products").select("stock").eq("id", productId).limit(1);
    stock = product?.[0]?.stock ?? 0;
  }

  let existingQuery = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("size", size);
  existingQuery = variantId ? existingQuery.eq("variant_id", variantId) : existingQuery.is("variant_id", null);
  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    const nextQuantity = Math.min(existing.quantity + 1, stock);
    if (nextQuantity > 0) {
      await supabase
        .from("cart_items")
        .update({ quantity: nextQuantity })
        .eq("id", existing.id);
    }
  } else if (stock > 0) {
    await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, size, variant_id: variantId, quantity: 1 });
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
    const { data: item } = await supabase
      .from("cart_items")
      .select("product_id, variant_id")
      .eq("id", id)
      .limit(1);

    let stock;
    if (item?.[0]?.variant_id) {
      const { data: variant } = await supabase.from("product_variants").select("stock").eq("id", item[0].variant_id).limit(1);
      stock = variant?.[0]?.stock ?? quantity;
    } else {
      const { data: product } = await supabase.from("products").select("stock").eq("id", item?.[0]?.product_id).limit(1);
      stock = product?.[0]?.stock ?? quantity;
    }

    await supabase.from("cart_items").update({ quantity: Math.min(quantity, stock) }).eq("id", id);
  }

  revalidatePath("/cart");
}

export async function removeCartItem(formData) {
  const id = formData.get("id")?.toString();
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("id", id);
  revalidatePath("/cart");
}
