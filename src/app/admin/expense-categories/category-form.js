"use client";

import { useActionState } from "react";

export default function ExpenseCategoryForm({ action, category }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "420px" }}>
      {category && <input type="hidden" name="id" value={category.id} />}

      <label className="auth-label" htmlFor="name">Name</label>
      <input className="auth-input" id="name" name="name" defaultValue={category?.name} required />

      {category && (
        <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".5rem" }}>
          <input type="checkbox" name="isActive" defaultChecked={category.is_active} />
          Active
        </label>
      )}

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : category ? "Save Changes" : "Create Category"}
      </button>
    </form>
  );
}
