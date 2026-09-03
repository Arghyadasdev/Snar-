export default function Loading() {
  return (
    <div className="skeleton-page">
      <div className="skeleton-detail-grid">
        <div className="skeleton skeleton-detail-img" />
        <div>
          <div className="skeleton skeleton-eyebrow" />
          <div className="skeleton skeleton-detail-line" style={{ width: "70%", height: "32px" }} />
          <div className="skeleton skeleton-detail-line" style={{ width: "30%" }} />
          <div className="skeleton skeleton-detail-line" style={{ width: "90%" }} />
          <div className="skeleton skeleton-detail-line" style={{ width: "80%" }} />
          <div className="skeleton" style={{ width: "180px", height: "44px", marginTop: "1.5rem" }} />
        </div>
      </div>
    </div>
  );
}
