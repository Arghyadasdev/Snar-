"use client";

import { useActionState } from "react";
import { addCustomerTag, removeCustomerTag } from "@/lib/actions/admin-customers";
import { createTag } from "@/lib/actions/admin-tags";

export default function CustomerTags({ customerId, tags, allTags }) {
  const [state, createTagAction, pending] = useActionState(createTag, undefined);
  const assignedIds = new Set(tags.map((t) => t.id));
  const available = allTags.filter((t) => !assignedIds.has(t.id));

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginBottom: "1rem" }}>
        {tags.length === 0 && <p className="empty-state" style={{ padding: 0 }}>No tags yet.</p>}
        {tags.map((t) => (
          <form key={t.id} action={removeCustomerTag} style={{ display: "inline-flex" }}>
            <input type="hidden" name="customerId" value={customerId} />
            <input type="hidden" name="tagId" value={t.id} />
            <button type="submit" className="order-status order-status-processing" style={{ border: "none", cursor: "pointer" }}>
              {t.name} ×
            </button>
          </form>
        ))}
      </div>

      {available.length > 0 && (
        <form action={addCustomerTag} style={{ display: "flex", gap: ".6rem", marginBottom: ".8rem" }}>
          <input type="hidden" name="customerId" value={customerId} />
          <select name="tagId" className="auth-input" style={{ width: "auto" }} required>
            {available.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-outline" style={{ padding: ".5rem 1rem" }}>Assign Tag</button>
        </form>
      )}

      <form action={createTagAction} style={{ display: "flex", gap: ".6rem" }}>
        <input className="auth-input" name="name" placeholder="New tag name…" style={{ width: "200px" }} required />
        <button type="submit" className="btn-outline" style={{ padding: ".5rem 1rem" }} disabled={pending}>
          {pending ? "Creating…" : "Create Tag"}
        </button>
        {state?.error && <span className="auth-error" style={{ margin: 0 }}>{state.error}</span>}
      </form>
    </div>
  );
}
