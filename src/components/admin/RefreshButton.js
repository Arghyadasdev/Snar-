"use client";

import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  return (
    <button type="button" className="admin-refresh-btn" onClick={() => router.refresh()}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><polyline points="21 3 21 8 16 8" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><polyline points="3 21 3 16 8 16" />
      </svg>
      Refresh
    </button>
  );
}
