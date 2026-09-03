import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import {
  getCategoryBySlug,
  listProductsByCategory,
  listProductsByCategoryTree,
  listSubcategories,
} from "@/lib/data/products";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? `${category.name} — SNAR` : "Category — SNAR" };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const isParent = !category.parent_id;
  const [products, subcategories] = await Promise.all([
    isParent ? listProductsByCategoryTree(slug) : listProductsByCategory(slug),
    isParent ? listSubcategories(slug) : Promise.resolve([]),
  ]);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">
          {category.parent ? (
            <Link href={`/category/${category.parent.slug}`}>{category.parent.name}</Link>
          ) : (
            "Shop by Type"
          )}
        </div>
        <h1 className="shop-title"><em>{category.name}</em></h1>
      </div>

      {subcategories.length > 0 && (
        <div className="category-filter-bar">
          {subcategories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="category-chip">
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <ProductGrid products={products} emptyMessage={`No ${category.name} yet — check back soon.`} />
    </div>
  );
}
