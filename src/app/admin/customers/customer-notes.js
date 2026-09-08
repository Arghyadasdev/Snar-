"use client";

import { useActionState } from "react";
import { addCustomerNote } from "@/lib/actions/admin-customers";

export default function CustomerNotes({ customerId, notes }) {
  const [state, formAction, pending] = useActionState(addCustomerNote, undefined);

  return (
    <div>
      <form action={formAction} style={{ display: "flex", gap: ".6rem", marginBottom: "1rem" }}>
        <input type="hidden" name="customerId" value={customerId} />
        <input className="auth-input" name="note" placeholder="Add an internal note…" required style={{ flex: 1 }} />
        <button type="submit" className="btn-outline" style={{ padding: ".6rem 1.2rem" }} disabled={pending}>
          {pending ? "Saving…" : "Add"}
        </button>
      </form>
      {state?.error && <p className="auth-error">{state.error}</p>}

      {notes.length === 0 && <p className="empty-state">No notes yet.</p>}
      {notes.map((n) => (
        <div key={n.id} style={{ padding: ".7rem 0", borderBottom: "1px solid var(--border)" }}>
          <p style={{ margin: 0 }}>{n.note}</p>
          <p style={{ margin: ".3rem 0 0", fontSize: ".75rem", color: "var(--muted)" }}>
            {n.author?.full_name || n.author?.email || "Unknown"} · {new Date(n.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
