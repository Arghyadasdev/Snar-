export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="skeleton-product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-product-card">
          <div className="skeleton skeleton-product-img" />
          <div className="skeleton skeleton-product-line w60" />
          <div className="skeleton skeleton-product-line w40" />
        </div>
      ))}
    </div>
  );
}
