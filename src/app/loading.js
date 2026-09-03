import ProductGridSkeleton from "@/components/ProductGridSkeleton";

export default function Loading() {
  return (
    <div>
      <div className="skeleton" style={{ height: "70vh", minHeight: "480px", borderRadius: 0 }} />
      <div className="skeleton-page" style={{ paddingTop: "3rem" }}>
        <div className="skeleton skeleton-eyebrow" />
        <div className="skeleton skeleton-title" />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem", marginBottom: "3rem" }}>
          <div className="skeleton" style={{ height: "260px" }} />
          <div className="skeleton" style={{ height: "260px" }} />
          <div className="skeleton" style={{ height: "260px" }} />
        </div>
        <div className="skeleton skeleton-eyebrow" />
        <div className="skeleton skeleton-title" />
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}
