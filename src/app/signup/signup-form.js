"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";

export default function SignupForm({ next }) {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="auth-page">
      <form className="auth-card" action={action}>
        <div className="auth-eyebrow">Join SNAR</div>
        <h1 className="auth-title">Create Account</h1>

        <input type="hidden" name="next" value={next} />

        <label className="auth-label" htmlFor="name">Full Name</label>
        <input className="auth-input" id="name" name="name" type="text" required autoComplete="name" />

        <label className="auth-label" htmlFor="email">Email</label>
        <input className="auth-input" id="email" name="email" type="email" required autoComplete="email" />

        <label className="auth-label" htmlFor="password">Password</label>
        <input className="auth-input" id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />

        {state?.error && <p className="auth-error">{state.error}</p>}
        {state?.success && <p className="auth-success">{state.success}</p>}

        <button className="auth-btn" type="submit" disabled={pending}>
          {pending ? "Creating account…" : "Sign Up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
        </p>
      </form>
    </div>
  );
}
