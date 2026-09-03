import ProductGridSkeleton from "@/components/ProductGridSkeleton";

export default function Loading() {
  return (
    <div className="skeleton-page">
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-title" />
      <ProductGridSkeleton />
    </div>
  );
}
