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
  const files = formData.getAll("imageFile").filter((f) => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { error: "Choose at least one photo to upload." };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextSortOrder = (existing?.sort_order ?? -1) + 1;
  const imageUrls = await Promise.all(files.map((file) => uploadProductImage(file)));

  const { error } = await admin.from("product_images").insert(
    imageUrls.map((imageUrl) => ({
      product_id: productId,
      image_url: imageUrl,
      sort_order: nextSortOrder++,
    }))
  );

  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: `${files.length} photo${files.length === 1 ? "" : "s"} added.` };
}

export async function deleteProductImage(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const productId = formData.get("productId")?.toString();

  const admin = createAdminClient();
  await admin.from("product_images").delete().eq("id", id);

  revalidatePath(`/admin/products/${productId}/edit`);
}
