import Link from "next/link";
import { requireUser, getCurrentProfile } from "@/lib/auth/dal";
import { logout } from "@/lib/actions/auth";

export const metadata = { title: "My Account — SNAR" };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const profile = await getCurrentProfile();

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-eyebrow">My Account</div>
        <h1 className="shop-title">{profile?.full_name || "Athlete"}</h1>
        <p className="shop-sub">{user.email}</p>
      </div>

      <div className="account-links">
        <Link href="/account/orders" className="account-link-card">
          <span>Order History</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
        </Link>
        {profile?.role === "admin" && (
          <Link href="/admin" className="account-link-card">
            <span>Admin Dashboard</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
          </Link>
        )}
      </div>

      <form action={logout}>
        <button className="btn-outline" type="submit">Log Out</button>
      </form>
    </div>
  );
}
