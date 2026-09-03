export default function Loading() {
  return (
    <div>
      <div className="admin-kpi-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="admin-kpi-card">
            <div className="skeleton" style={{ width: "60%", height: "10px", marginBottom: ".8rem" }} />
            <div className="skeleton" style={{ width: "80%", height: "26px" }} />
          </div>
        ))}
      </div>
      <div className="admin-dash-grid">
        <div className="admin-panel">
          <div className="skeleton" style={{ width: "160px", height: "10px", marginBottom: "1rem" }} />
          <div className="skeleton" style={{ width: "100%", height: "220px" }} />
        </div>
        <div className="admin-panel">
          <div className="skeleton" style={{ width: "120px", height: "10px", marginBottom: "1rem" }} />
          <div className="skeleton" style={{ width: "100%", height: "150px", borderRadius: "50%", maxWidth: "150px" }} />
        </div>
      </div>
    </div>
  );
}
