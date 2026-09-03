export default function Loading() {
  return (
    <div className="skeleton-page">
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-title" />
      <div className="account-links">
        <div className="skeleton" style={{ width: "100%", height: "56px" }} />
        <div className="skeleton" style={{ width: "100%", height: "56px" }} />
      </div>
      <div className="auth-card" style={{ maxWidth: "420px" }}>
        <div className="skeleton" style={{ width: "100%", height: "38px", marginBottom: "1rem" }} />
        <div className="skeleton" style={{ width: "100%", height: "38px", marginBottom: "1rem" }} />
        <div className="skeleton" style={{ width: "100%", height: "44px" }} />
      </div>
    </div>
  );
}
