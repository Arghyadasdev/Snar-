export default function Loading() {
  return (
    <div>
      <div className="skeleton" style={{ width: "220px", height: "30px", marginBottom: "1.6rem" }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton skeleton-avatar" />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: "40%", height: "14px", marginBottom: ".5rem" }} />
            <div className="skeleton" style={{ width: "25%", height: "12px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
