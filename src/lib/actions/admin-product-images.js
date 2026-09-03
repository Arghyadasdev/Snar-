"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadProductImage } from "@/lib/cloudinary";

export async function listProductImagesAdmin(productId) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("product_images")
    .select("id, image_url, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function addProductImage(prevState, formData) {
  await requireAdmin();
  const productId = formData.get("productId")?.toString();
  const file = formData.get("imageFile");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo to upload." };
  }

  const imageUrl = await uploadProductImage(file);

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await admin.from("product_images").insert({
    product_id: productId,
    image_url: imageUrl,
    sort_order: (existing?.sort_order ?? -1) + 1,
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: "Photo added." };
}

export async function deleteProductImage(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const productId = formData.get("productId")?.toString();

  const admin = createAdminClient();
  await admin.from("product_images").delete().eq("id", id);

  revalidatePath(`/admin/products/${productId}/edit`);
}
