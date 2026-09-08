"use client";

import { useActionState } from "react";

export default function LeadForm({ action, lead, admins }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "560px" }}>
      {lead && <input type="hidden" name="id" value={lead.id} />}

      <label className="auth-label" htmlFor="name">Name</label>
      <input className="auth-input" id="name" name="name" defaultValue={lead?.name} required />

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="email">Email</label>
          <input className="auth-input" id="email" name="email" type="email" defaultValue={lead?.email} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="phone">Phone</label>
          <input className="auth-input" id="phone" name="phone" defaultValue={lead?.phone} />
        </div>
      </div>

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="status">Status</label>
          <select className="auth-input" id="status" name="status" defaultValue={lead?.status || "new"}>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="assignedAdminId">Assigned To</label>
          <select className="auth-input" id="assignedAdminId" name="assignedAdminId" defaultValue={lead?.assigned_admin_id || ""}>
            <option value="">Unassigned</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="auth-label" htmlFor="notes">Notes</label>
      <textarea className="auth-input" id="notes" name="notes" rows={3} defaultValue={lead?.notes} />

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : lead ? "Save Changes" : "Create Lead"}
      </button>
    </form>
  );
}
