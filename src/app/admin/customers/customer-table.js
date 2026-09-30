"use client";

import { useState } from "react";
import Link from "next/link";
import { bulkSetCustomerStatus, bulkAddCustomerTag } from "@/lib/actions/admin-customers";
import RoleSelect from "./role-select";
import ResetPasswordButton from "./reset-password-button";
import StatusSelect from "./status-select";
import SegmentBadge from "./segment-badge";

export default function CustomerTable({ customers, allTags, currentUserId, filterQuery }) {
  const [selected, setSelected] = useState(new Set());

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === customers.length ? new Set() : new Set(customers.map((c) => c.id))));
  };

  const ids = [...selected].join(",");
  const exportHref = `/admin/customers/export?${filterQuery}&ids=${encodeURIComponent(ids)}`;

  return (
    <>
      {selected.size > 0 && (
        <div className="admin-bulk-bar" style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem", padding: ".8rem 1rem", background: "var(--a-panel)", border: "1px solid var(--a-border)" }}>
          <span>{selected.size} selected</span>

          <form action={bulkSetCustomerStatus} style={{ display: "flex", gap: ".5rem" }}>
            <input type="hidden" name="ids" value={ids} />
            <select name="status" className="auth-input" style={{ padding: ".4rem .6rem", width: "auto" }} defaultValue="">
              <option value="" disabled>Set status…</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="blocked">blocked</option>
            </select>
            <button type="submit" className="btn-outline" style={{ padding: ".4rem .9rem" }}>Apply</button>
          </form>

          <form action={bulkAddCustomerTag} style={{ display: "flex", gap: ".5rem" }}>
            <input type="hidden" name="ids" value={ids} />
            <select name="tagId" className="auth-input" style={{ padding: ".4rem .6rem", width: "auto" }} defaultValue="">
              <option value="" disabled>Add tag…</option>
              {allTags.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button type="submit" className="btn-outline" style={{ padding: ".4rem .9rem" }}>Apply</button>
          </form>

          <a href={exportHref} className="btn-outline" style={{ padding: ".4rem .9rem" }}>Export Selected</a>
          <button type="button" className="admin-delete-btn" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      <div className="admin-table">
        {customers.length === 0 && <p className="empty-state">No customers found.</p>}
        {customers.length > 0 && (
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".8rem", color: "var(--a-muted)", marginBottom: ".4rem" }}>
            <input type="checkbox" checked={selected.size === customers.length} onChange={toggleAll} />
            Select all
          </label>
        )}
        {customers.map((c) => (
          <div key={c.id} className="admin-table-row admin-table-row-cat" style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
            <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
            <div style={{ flex: 1 }}>
              <Link href={`/admin/customers/${c.id}`} className="admin-table-name">{c.full_name || "—"}</Link>
              <SegmentBadge segment={c.segment} />
            </div>
            <div className="admin-table-cat">{c.email}</div>
            <div style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
              <StatusSelect customerId={c.id} status={c.status} />
              <RoleSelect customerId={c.id} role={c.role} isSelf={c.id === currentUserId} />
              <ResetPasswordButton customerId={c.id} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
