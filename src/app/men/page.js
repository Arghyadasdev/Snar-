import ProductGrid from "@/components/ProductGrid";
import { listProductsByCategory } from "@/lib/data/products";

export const metadata = {
  title: "Men's Collection — SNAR",
  description: "Premium performance sportswear for men.",
};

export default async function MenPage() {
  const products = await listProductsByCategory("men");

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Performance Sportswear</div>
        <h1 className="shop-title">Men&apos;s <em>Collection</em></h1>
      </div>
      <ProductGrid products={products} emptyMessage="Men's collection coming soon." />
    </div>
  );
}
