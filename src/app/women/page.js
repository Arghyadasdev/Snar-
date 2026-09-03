import ProductGrid from "@/components/ProductGrid";
import { listProductsByCategory } from "@/lib/data/products";

export const metadata = {
  title: "Women's Collection — SNAR",
  description: "Premium performance sportswear for women.",
};

export default async function WomenPage() {
  const products = await listProductsByCategory("women");

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Performance Sportswear</div>
        <h1 className="shop-title">Women&apos;s <em>Collection</em></h1>
      </div>
      <ProductGrid products={products} emptyMessage="Women's collection coming soon." />
    </div>
  );
}
