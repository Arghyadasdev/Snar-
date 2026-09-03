"use client";

import { useActionState } from "react";
import { changeMyPassword } from "@/lib/actions/auth";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeMyPassword, undefined);

  return (
    <form action={formAction} className="auth-card" style={{ maxWidth: "420px", marginBottom: "2rem" }}>
      <div className="order-shipping-title">Change Password</div>

      <label className="auth-label" htmlFor="newPassword">New Password</label>
      <input className="auth-input" id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />

      <label className="auth-label" htmlFor="confirmPassword">Confirm New Password</label>
      <input className="auth-input" id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />

      {state?.error && <p className="auth-error">{state.error}</p>}
      {state?.success && <p className="auth-success">{state.success}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
