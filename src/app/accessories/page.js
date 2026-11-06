import ProductGrid from "@/components/ProductGrid";
import { listProductsByCategoryTree } from "@/lib/data/products";

export const metadata = {
  title: "Accessories — SNAR",
  description: "Premium sportswear accessories.",
};

export default async function AccessoriesPage() {
  const products = await listProductsByCategoryTree("accessories");

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">Complete Your Kit</div>
        <h1 className="shop-title"><em>Accessories</em></h1>
      </div>
      <ProductGrid products={products} emptyMessage="Accessories coming soon." />
    </div>
  );
}
