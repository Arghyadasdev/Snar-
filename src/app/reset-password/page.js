import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import ChangePasswordForm from "@/app/account/change-password-form";

export const metadata = { title: "Reset Password — SNAR" };

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Link Expired</h1>
          <p style={{ marginBottom: "1rem" }}>This reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="auth-btn" style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}>
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div style={{ maxWidth: "420px", width: "100%" }}>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
