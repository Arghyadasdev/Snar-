export default function Loading() {
  return (
    <div>
      <div className="skeleton" style={{ width: "200px", height: "30px", marginBottom: "1.6rem" }} />
      <div className="auth-card" style={{ maxWidth: "480px" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: "100%", height: "38px", marginBottom: "1rem" }} />
        ))}
        <div className="skeleton" style={{ width: "140px", height: "40px", marginTop: ".6rem" }} />
      </div>
    </div>
  );
}
