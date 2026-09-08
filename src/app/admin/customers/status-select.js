"use client";

import { setCustomerStatus } from "@/lib/actions/admin-customers";

export default function StatusSelect({ customerId, status }) {
  return (
    <form action={setCustomerStatus}>
      <input type="hidden" name="id" value={customerId} />
      <select
        name="status"
        defaultValue={status}
        className="auth-input"
        style={{ padding: ".4rem .6rem", width: "auto" }}
        onChange={(e) => e.target.form.requestSubmit()}
      >
        <option value="active">active</option>
        <option value="inactive">inactive</option>
        <option value="blocked">blocked</option>
      </select>
    </form>
  );
}
