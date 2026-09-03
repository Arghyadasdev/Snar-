import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { listAllProducts, listCategories } from "@/lib/data/products";

export const metadata = {
  title: "Collections — SNAR",
  description: "All SNAR collections.",
};

export default async function CollectionsPage() {
  const [products, categories] = await Promise.all([listAllProducts(), listCategories()]);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Curated Drops</div>
        <h1 className="shop-title">All <em>Collections</em></h1>
      </div>

      {categories.length > 0 && (
        <div className="category-filter-bar">
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="category-chip">
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <ProductGrid products={products} emptyMessage="No products yet — check back soon." />
    </div>
  );
}
