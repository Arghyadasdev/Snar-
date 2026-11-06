"use client";

import { useActionState } from "react";

// The site's main navigation (Men / Women / Accessories / Collections) is
// fixed — these 4 top-level categories are seeded once and can't be
// renamed, re-parented, or deleted from here. Everything else is a
// customizable sub-category that must live under one of them.
const isProtectedRoot = (c) => !c.parent_id;

export default function CategoryForm({ action, categories, category }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const roots = categories.filter((c) => c.parent_id === null);
  const editingRoot = category && isProtectedRoot(category);

  if (editingRoot) {
    return (
      <div className="auth-card" style={{ maxWidth: "480px" }}>
        <label className="auth-label">Name</label>
        <input className="auth-input" value={category.name} disabled />
        <p style={{ color: "var(--muted, #999)", fontSize: ".85rem", marginTop: ".75rem" }}>
          Men, Women, Accessories and Collections are the site&apos;s fixed main categories —
          they can&apos;t be renamed or moved. Add sub-categories under them instead.
        </p>
      </div>
    );
  }

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "480px" }}>
      {category && <input type="hidden" name="id" value={category.id} />}

      <label className="auth-label" htmlFor="name">Name</label>
      <input className="auth-input" id="name" name="name" defaultValue={category?.name} required />

      <label className="auth-label" htmlFor="parentId">Main Category</label>
      <select className="auth-input" id="parentId" name="parentId" defaultValue={category?.parent_id || ""} required>
        <option value="" disabled>Choose Men, Women, Accessories or Collections</option>
        {roots.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : category ? "Save Changes" : "Create Category"}
      </button>
    </form>
  );
}
