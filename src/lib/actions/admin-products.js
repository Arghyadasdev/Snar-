"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadProductImage } from "@/lib/cloudinary";
import { logAdminActivity } from "@/lib/actions/admin-activity";

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

// Raw tree, not a flattened label list — the product form renders Main
// Category and Sub-category as two separate, cascading selects.
export async function listCategoriesAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("id, name, parent_id")
    .order("name");
  return data || [];
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// "S, M:1100, L:1200:5, XL::0" — size alone uses the product's base price
// and overall stock; "size:price" overrides price; "size:price:stock" also
// caps that size's own stock (0 = shows as sold out on the product page).
// Either field can be left blank (e.g. "M::5" = base price, 5 in stock).
function parseSizes(raw) {
  return (raw || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [sizePart, pricePart, stockPart] = entry.split(":");
      const size = sizePart?.trim();
      const price = pricePart?.trim() ? Number(pricePart.trim()) : null;
      const stock = stockPart?.trim() ? Number(stockPart.trim()) : null;
      return {
        size,
        price: Number.isFinite(price) ? price : null,
        stock: Number.isFinite(stock) ? stock : null,
      };
    })
    .filter((s) => s.size);
}

function parseSpecifications(raw) {
  return (raw || "")
    .split("\n")
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return null;
      const label = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      return label && value ? { label, value } : null;
    })
    .filter(Boolean);
}

// One multi-select file input covers both the cover photo and the gallery:
// the first file picked becomes the product's main image, any further ones
// go straight into product_images.
async function uploadProductPhotos(formData) {
  const files = formData.getAll("imageFiles").filter((f) => f instanceof File && f.size > 0);
  const urls = await Promise.all(files.map((file) => uploadProductImage(file)));
  return { coverUrl: urls[0] || null, galleryUrls: urls.slice(1) };
}

async function appendGalleryImages(admin, productId, urls) {
  if (urls.length === 0) return;
  const { data: existing } = await admin
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextSortOrder = (existing?.sort_order ?? -1) + 1;
  await admin.from("product_images").insert(
    urls.map((image_url) => ({ product_id: productId, image_url, sort_order: nextSortOrder++ }))
  );
}

function readProductForm(formData, coverUrl) {
  const sizesRaw = formData.get("sizes")?.toString() || "";
  const specsRaw = formData.get("specifications")?.toString() || "";

  const imageUrl = coverUrl || formData.get("imageUrl")?.toString().trim() || "";

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
    sizes: parseSizes(sizesRaw),
    specifications: parseSpecifications(specsRaw),
    sku: formData.get("sku")?.toString().trim() || null,
    hsn_code: formData.get("hsnCode")?.toString().trim() || null,
  };
}

export async function createProduct(prevState, formData) {
  const admin_ = await requireAdmin();
  const { coverUrl, galleryUrls } = await uploadProductPhotos(formData);
  const fields = readProductForm(formData, coverUrl);

  if (!fields.name || !fields.price || !fields.category_id || !fields.image_url) {
    return { error: "Name, price, category, and at least one photo (upload or URL) are required." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .insert({ ...fields, slug: slugify(fields.name) })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await appendGalleryImages(admin, data.id, galleryUrls);
  await logAdminActivity({ admin: admin_, action: "product_created", entityType: "product", entityId: data.id, metadata: { name: fields.name, price: fields.price } });

  revalidatePath("/admin/products");
  revalidatePath("/collections");
  redirect("/admin/products");
}

export async function updateProduct(prevState, formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const { coverUrl, galleryUrls } = await uploadProductPhotos(formData);
  const fields = readProductForm(formData, coverUrl);

  if (!fields.name || !fields.price || !fields.category_id || !fields.image_url) {
    return { error: "Name, price, category, and at least one photo (upload or URL) are required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("products").update(fields).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await appendGalleryImages(admin, id, galleryUrls);
  await logAdminActivity({ admin: admin_, action: "product_updated", entityType: "product", entityId: id, metadata: { name: fields.name, price: fields.price } });

  revalidatePath("/admin/products");
  revalidatePath("/collections");
  redirect("/admin/products");
}

export async function deleteProduct(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();

  const admin = createAdminClient();
  await admin.from("products").delete().eq("id", id);
  await logAdminActivity({ admin: admin_, action: "product_deleted", entityType: "product", entityId: id });

  revalidatePath("/admin/products");
  revalidatePath("/collections");
}
