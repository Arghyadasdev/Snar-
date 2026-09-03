export default function Loading() {
  return (
    <div className="skeleton-page">
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-title" />
      <div className="order-detail-grid">
        <div className="order-items-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="order-item-row">
              <div className="skeleton" style={{ width: "60%", height: "14px" }} />
              <div className="skeleton" style={{ width: "60px", height: "14px" }} />
            </div>
          ))}
        </div>
        <div className="order-shipping-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: "80%", height: "12px", marginBottom: ".6rem" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
