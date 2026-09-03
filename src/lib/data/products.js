import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export async function listCategories() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id")
    .is("parent_id", null)
    .order("name");
  return data || [];
}

export async function listSubcategories(parentSlug) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name, parent:categories!parent_id(slug)")
    .eq("parent.slug", parentSlug)
    .order("name");
  return (data || []).filter((c) => c.parent?.slug === parentSlug);
}

export async function getCategoryBySlug(slug) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id, parent:categories!parent_id(slug, name)")
    .eq("slug", slug)
    .single();
  return data || null;
}

export async function listProductsByCategory(categorySlug) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, price, compare_at_price, image_url, category:categories!inner(slug, name)")
    .eq("categories.slug", categorySlug)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return data || [];
}

// For a parent category (e.g. "Sportswear"): products in the parent itself
// plus products in any of its sub-categories.
export async function listProductsByCategoryTree(categorySlug) {
  const supabase = createPublicClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();
  if (!category) return [];

  const { data: children } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", category.id);

  const categoryIds = [category.id, ...(children || []).map((c) => c.id)];

  const { data } = await supabase
    .from("products")
    .select("id, slug, name, price, compare_at_price, image_url, category:categories(slug, name)")
    .in("category_id", categoryIds)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function listAllProducts() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, price, compare_at_price, image_url, category:categories(slug, name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getProductImages(productId) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("product_images")
    .select("id, image_url")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getProductBySlug(slug) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, price, compare_at_price, image_url, sizes, stock, category:categories(slug, name)"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data || null;
}
