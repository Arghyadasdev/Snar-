export default function Loading() {
  return (
    <div>
      <div className="skeleton" style={{ width: "180px", height: "30px", marginBottom: "1.6rem" }} />
      <div className="auth-card" style={{ maxWidth: "520px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: "100%", height: "38px", marginBottom: "1rem" }} />
        ))}
      </div>
    </div>
  );
}
