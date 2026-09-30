"use client";

import { usePathname } from "next/navigation";
import { titleForPath } from "./nav";
import AdminCommandPalette from "./AdminCommandPalette";
import AdminNotifications from "./AdminNotifications";

export default function AdminTopbar({ name, email }) {
  const pathname = usePathname();
  const initials = (name || email || "A").trim().slice(0, 1).toUpperCase();

  return (
    <header className="admin-topbar">
      <h1 className="admin-topbar-title">{titleForPath(pathname)}</h1>
      <AdminCommandPalette />
      <div className="admin-topbar-right">
        <AdminNotifications />
        <div className="admin-avatar">{initials}</div>
        <div className="admin-topbar-who">
          <div className="admin-topbar-name">{name || "Admin"}</div>
          <div className="admin-topbar-role">{email}</div>
        </div>
      </div>
    </header>
  );
}
