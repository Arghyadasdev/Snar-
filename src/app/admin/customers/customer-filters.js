export default function CustomerFilters({ query, status, segment }) {
  return (
    <form action="/admin/customers" style={{ display: "flex", gap: ".8rem", alignItems: "center", marginBottom: "1.4rem", flexWrap: "wrap" }}>
      <input
        className="auth-input"
        name="q"
        defaultValue={query}
        placeholder="Search by name or email…"
        style={{ padding: ".6rem .9rem", flex: 1, minWidth: "200px" }}
      />
      <select className="auth-input" name="status" defaultValue={status} style={{ padding: ".6rem .9rem", width: "auto" }}>
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="blocked">Blocked</option>
      </select>
      <select className="auth-input" name="segment" defaultValue={segment} style={{ padding: ".6rem .9rem", width: "auto" }}>
        <option value="">All segments</option>
        <option value="vip">VIP</option>
        <option value="regular">Regular</option>
        <option value="new">New</option>
        <option value="inactive">Inactive</option>
      </select>
      <button type="submit" className="btn-outline" style={{ padding: ".6rem 1.2rem" }}>Filter</button>
    </form>
  );
}
