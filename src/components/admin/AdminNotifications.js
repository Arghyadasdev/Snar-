"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getAdminNotifications } from "@/lib/actions/admin-notifications";

export default function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    getAdminNotifications().then(setItems);
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const total = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <div className="admin-notif-wrap" ref={ref}>
      <button type="button" className="admin-notif-bell" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {total > 0 && <span className="admin-notif-badge">{total > 9 ? "9+" : total}</span>}
      </button>

      {open && (
        <div className="admin-notif-dropdown">
          {items.length === 0 && <p className="admin-palette-hint">Nothing needs attention.</p>}
          {items.map((item) => (
            <Link key={item.key} href={item.href} className="admin-notif-row" onClick={() => setOpen(false)}>
              <span>{item.label}</span>
              <span className="admin-notif-count">{item.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
