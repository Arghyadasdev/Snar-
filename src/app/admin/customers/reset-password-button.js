"use client";

import { useState, useActionState } from "react";
import { resetCustomerPassword } from "@/lib/actions/admin-customers";

export default function ResetPasswordButton({ customerId }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(resetCustomerPassword, undefined);

  if (!open) {
    return (
      <button type="button" className="btn-outline" style={{ padding: ".4rem .9rem" }} onClick={() => setOpen(true)}>
        Reset Password
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
      <input type="hidden" name="id" value={customerId} />
      <input
        className="auth-input"
        name="newPassword"
        type="password"
        placeholder="New password"
        minLength={8}
        required
        style={{ width: "160px", padding: ".4rem .6rem" }}
      />
      <button type="submit" className="btn-outline" style={{ padding: ".4rem .9rem" }} disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
      {state?.success && <span style={{ color: "#4CD964", fontSize: ".78rem" }}>{state.success}</span>}
      {state?.error && <span className="auth-error" style={{ margin: 0 }}>{state.error}</span>}
    </form>
  );
}
