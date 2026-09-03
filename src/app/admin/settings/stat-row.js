"use client";

import { updateSiteStat } from "@/lib/actions/admin-settings";

export default function StatRow({ stat }) {
  return (
    <form action={updateSiteStat} className="marquee-admin-row">
      <input type="hidden" name="slot" value={stat.slot} />
      <span className="admin-table-cat" style={{ width: "110px", textTransform: "capitalize" }}>{stat.slot}</span>
      <input className="auth-input" name="num" defaultValue={stat.num} style={{ width: "100px" }} />
      <input className="auth-input" name="label" defaultValue={stat.label} style={{ flex: 1 }} />
      <button type="submit" className="btn-outline" style={{ padding: ".5rem 1rem" }}>Save</button>
    </form>
  );
}
