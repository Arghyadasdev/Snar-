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
    .limit(1);
  return data?.[0] || null;
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

  const { data: categoryRows } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .limit(1);
  const category = categoryRows?.[0];
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
      "id, slug, name, description, price, compare_at_price, image_url, sizes, stock, specifications, category:categories(slug, name)"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .limit(1);
  return data?.[0] || null;
}

export async function getProductReviews(productId) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, review_text, created_at")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const reviews = data || [];
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  return { reviews, average, count };
}
