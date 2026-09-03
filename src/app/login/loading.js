export default function Loading() {
  return (
    <div className="skeleton-page">
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-title" />
      <div className="auth-card" style={{ maxWidth: "460px" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: "100%", height: "40px", marginBottom: "1rem" }} />
        ))}
        <div className="skeleton" style={{ width: "100%", height: "44px", marginTop: ".6rem" }} />
      </div>
    </div>
  );
}
