"use client";

import { setCustomerRole } from "@/lib/actions/admin-customers";

export default function RoleSelect({ customerId, role, isSelf }) {
  return (
    <form action={setCustomerRole} className="admin-table-actions">
      <input type="hidden" name="id" value={customerId} />
      <select
        name="role"
        defaultValue={role}
        disabled={isSelf}
        className="auth-input"
        style={{ padding: ".4rem .6rem", width: "auto" }}
        onChange={(e) => e.target.form.requestSubmit()}
      >
        <option value="customer">customer</option>
        <option value="admin">admin</option>
      </select>
    </form>
  );
}
