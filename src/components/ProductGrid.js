import ProductCard from "./ProductCard";

export default function ProductGrid({ products, emptyMessage = "No products found." }) {
  if (!products || products.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
