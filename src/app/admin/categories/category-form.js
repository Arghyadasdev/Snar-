"use client";

import { useActionState } from "react";

export default function CategoryForm({ action, categories, category }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const otherCategories = categories.filter((c) => c.id !== category?.id);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "480px" }}>
      {category && <input type="hidden" name="id" value={category.id} />}

      <label className="auth-label" htmlFor="name">Name</label>
      <input className="auth-input" id="name" name="name" defaultValue={category?.name} required />

      <label className="auth-label" htmlFor="parentId">Parent Category (optional)</label>
      <select className="auth-input" id="parentId" name="parentId" defaultValue={category?.parent_id || ""}>
        <option value="">None — top-level category</option>
        {otherCategories.map((c) => (
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
