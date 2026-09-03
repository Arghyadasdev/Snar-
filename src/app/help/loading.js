export default function Loading() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "9.5rem 1.5rem 5rem" }}>
      <div className="skeleton" style={{ width: "160px", height: "36px", marginBottom: "2rem" }} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ width: "100%", height: "56px", marginBottom: ".8rem", borderRadius: "10px" }} />
      ))}
    </div>
  );
}
