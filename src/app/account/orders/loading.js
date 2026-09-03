export default function Loading() {
  return (
    <div className="skeleton-page">
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-title" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton skeleton-avatar" style={{ width: "64px", height: "64px" }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: "50%", height: "14px", marginBottom: ".5rem" }} />
            <div className="skeleton" style={{ width: "30%", height: "12px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
