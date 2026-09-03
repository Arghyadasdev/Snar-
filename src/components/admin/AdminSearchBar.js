export default function AdminSearchBar({ action, placeholder, query, exportHref }) {
  return (
    <div style={{ display: "flex", gap: ".8rem", alignItems: "center", marginBottom: "1.4rem", flexWrap: "wrap" }}>
      <form action={action} style={{ flex: 1, minWidth: "200px" }}>
        <input
          className="auth-input"
          name="q"
          defaultValue={query}
          placeholder={placeholder}
          style={{ padding: ".6rem .9rem" }}
        />
      </form>
      {exportHref && (
        <a href={exportHref} className="btn-outline" style={{ padding: ".6rem 1.2rem", flexShrink: 0 }}>
          Export CSV
        </a>
      )}
    </div>
  );
}
