"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions/auth";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <div className="auth-page">
      <form className="auth-card" action={action}>
        <div className="auth-eyebrow">Reset your password</div>
        <h1 className="auth-title">Forgot Password</h1>

        <label className="auth-label" htmlFor="email">Email</label>
        <input className="auth-input" id="email" name="email" type="email" required autoComplete="email" />

        {state?.error && <p className="auth-error">{state.error}</p>}
        {state?.success && <p className="auth-success">{state.success}</p>}

        <button className="auth-btn" type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
