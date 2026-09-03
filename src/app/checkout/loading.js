export default function Loading() {
  return (
    <div className="skeleton-page">
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-title" />
      <div className="cart-layout">
        <div className="auth-card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: "100%", height: "38px", marginBottom: "1rem" }} />
          ))}
        </div>
        <div className="cart-summary">
          <div className="skeleton" style={{ width: "60%", height: "12px", marginBottom: "1rem" }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: "100%", height: "14px", marginBottom: ".8rem" }} />
          ))}
          <div className="skeleton" style={{ width: "100%", height: "44px", marginTop: "1rem" }} />
        </div>
      </div>
    </div>
  );
}
