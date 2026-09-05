"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadProductImage } from "@/lib/cloudinary";

export async function listVariantsAdmin(productId) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("product_variants")
    .select("id, color_name, image_url, stock, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function addVariant(prevState, formData) {
  await requireAdmin();
  const productId = formData.get("productId")?.toString();
  const colorName = formData.get("colorName")?.toString().trim();
  const stock = Number(formData.get("stock")) || 0;
  const file = formData.get("imageFile");

  if (!colorName) return { error: "Color name is required." };
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo for this color." };

  const imageUrl = await uploadProductImage(file);

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("product_variants")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await admin.from("product_variants").insert({
    product_id: productId,
    color_name: colorName,
    image_url: imageUrl,
    stock,
    sort_order: (existing?.sort_order ?? -1) + 1,
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: "Color variant added." };
}

export async function updateVariantStock(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const productId = formData.get("productId")?.toString();
  const stock = Number(formData.get("stock")) || 0;

  const admin = createAdminClient();
  await admin.from("product_variants").update({ stock }).eq("id", id);
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function deleteVariant(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const productId = formData.get("productId")?.toString();

  const admin = createAdminClient();
  await admin.from("product_variants").delete().eq("id", id);
  revalidatePath(`/admin/products/${productId}/edit`);
}
