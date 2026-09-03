"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";

export default function LoginForm({ next }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="auth-page">
      <form className="auth-card" action={action}>
        <div className="auth-eyebrow">Welcome back</div>
        <h1 className="auth-title">Log In</h1>

        <input type="hidden" name="next" value={next} />

        <label className="auth-label" htmlFor="email">Email</label>
        <input className="auth-input" id="email" name="email" type="email" required autoComplete="email" />

        <label className="auth-label" htmlFor="password">Password</label>
        <input className="auth-input" id="password" name="password" type="password" required autoComplete="current-password" />

        {state?.error && <p className="auth-error">{state.error}</p>}

        <button className="auth-btn" type="submit" disabled={pending}>
          {pending ? "Logging in…" : "Log In"}
        </button>

        <p className="auth-switch">
          New to SNAR? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}
