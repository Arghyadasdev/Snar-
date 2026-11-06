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

// A self-referencing embed (categories!parent_id(...)) resolves to each
// row's CHILDREN in PostgREST, not its parent — these two queries avoid
// that ambiguity by looking the parent up separately.
export async function listSubcategories(parentSlug) {
  const supabase = createPublicClient();
  const { data: parentRows } = await supabase.from("categories").select("id").eq("slug", parentSlug).limit(1);
  const parent = parentRows?.[0];
  if (!parent) return [];

  const { data } = await supabase
    .from("categories")
    .select("id, slug, name")
    .eq("parent_id", parent.id)
    .order("name");
  return data || [];
}

export async function getCategoryBySlug(slug) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id")
    .eq("slug", slug)
    .limit(1);
  const category = data?.[0];
  if (!category) return null;
  if (!category.parent_id) return { ...category, parent: null };

  const { data: parentRows } = await supabase
    .from("categories")
    .select("slug, name")
    .eq("id", category.parent_id)
    .limit(1);
  return { ...category, parent: parentRows?.[0] || null };
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
  const { data, error } = await supabase
    .from("product_images")
    .select("id, image_url, variant_id")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) console.error("getProductImages failed:", error.message);
  return data || [];
}

export async function getProductVariants(productId) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("product_variants")
    .select("id, color_name, image_url, stock")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getProductBySlug(slug) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, price, compare_at_price, image_url, sizes, stock, sku, specifications, category_id, category:categories(slug, name)"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .limit(1);
  return data?.[0] || null;
}

export async function getRelatedProducts(categoryId, excludeProductId, limit = 6) {
  const supabase = createPublicClient();
  const { data: sameCategory } = await supabase
    .from("products")
    .select("id, slug, name, price, compare_at_price, image_url, category:categories(slug, name)")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", excludeProductId)
    .limit(limit);

  const related = sameCategory || [];
  if (related.length >= limit) return related;

  // Category too thin to fill the row — backfill with other active products.
  const excludeIds = [excludeProductId, ...related.map((p) => p.id)];
  const { data: rest } = await supabase
    .from("products")
    .select("id, slug, name, price, compare_at_price, image_url, category:categories(slug, name)")
    .eq("is_active", true)
    .not("id", "in", `(${excludeIds.join(",")})`)
    .limit(limit - related.length);

  return [...related, ...(rest || [])];
}

export async function searchProducts(query) {
  const q = query?.trim();
  if (!q) return [];

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, price, compare_at_price, image_url, category:categories(slug, name)")
    .eq("is_active", true)
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    .order("created_at", { ascending: false });

  return data || [];
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
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  return { reviews, average, count, breakdown };
}
