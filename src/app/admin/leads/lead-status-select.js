"use client";

import { updateLeadStatus } from "@/lib/actions/admin-leads";

export default function LeadStatusSelect({ leadId, status }) {
  return (
    <form action={updateLeadStatus}>
      <input type="hidden" name="id" value={leadId} />
      <select
        name="status"
        defaultValue={status}
        className="auth-input"
        style={{ padding: ".4rem .6rem", width: "auto" }}
        onChange={(e) => e.target.form.requestSubmit()}
      >
        <option value="new">new</option>
        <option value="contacted">contacted</option>
        <option value="converted">converted</option>
      </select>
    </form>
  );
}
