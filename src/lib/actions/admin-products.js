"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadProductImage } from "@/lib/cloudinary";

export async function listAllProductsAdmin(search = "") {
  await requireAdmin();
  const admin = createAdminClient();
  let query = admin
    .from("products")
    .select("id, slug, name, price, image_url, is_active, category:categories(name)")
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data } = await query;
  return data || [];
}

export async function getProductAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("products").select("*").eq("id", id).single();
  return data;
}

export async function listCategoriesAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("id, name, parent:categories!parent_id(name)")
    .order("name");
  return (data || []).map((c) => ({
    id: c.id,
    name: c.parent ? `${c.parent.name} / ${c.name}` : c.name,
  }));
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function readProductForm(formData) {
  const sizesRaw = formData.get("sizes")?.toString() || "";

  let imageUrl = formData.get("imageUrl")?.toString().trim() || "";
  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await uploadProductImage(imageFile);
  }

  return {
    name: formData.get("name")?.toString().trim(),
    description: formData.get("description")?.toString().trim() || "",
    price: Number(formData.get("price")),
    compare_at_price: formData.get("compareAtPrice")
      ? Number(formData.get("compareAtPrice"))
      : null,
    category_id: formData.get("categoryId")?.toString(),
    image_url: imageUrl,
    stock: Number(formData.get("stock")) || 0,
    is_active: formData.get("isActive") === "on",
    sizes: sizesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export async function createProduct(prevState, formData) {
  await requireAdmin();
  const fields = await readProductForm(formData);

  if (!fields.name || !fields.price || !fields.category_id || !fields.image_url) {
    return { error: "Name, price, category, and an image (upload or URL) are required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("products").insert({
    ...fields,
    slug: slugify(fields.name),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/collections");
  redirect("/admin/products");
}

export async function updateProduct(prevState, formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const fields = await readProductForm(formData);

  if (!fields.name || !fields.price || !fields.category_id || !fields.image_url) {
    return { error: "Name, price, category, and an image (upload or URL) are required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("products").update(fields).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/collections");
  redirect("/admin/products");
}

export async function deleteProduct(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();

  const admin = createAdminClient();
  await admin.from("products").delete().eq("id", id);

  revalidatePath("/admin/products");
  revalidatePath("/collections");
}
