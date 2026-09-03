"use client";

import { updateMarqueeItem, deleteMarqueeItem } from "@/lib/actions/admin-homepage";

export default function MarqueeRow({ item }) {
  return (
    <form action={updateMarqueeItem} className="marquee-admin-row">
      <input type="hidden" name="id" value={item.id} />
      <input className="auth-input" name="text" defaultValue={item.text} style={{ flex: 1 }} />
      <input className="auth-input" name="sortOrder" type="number" defaultValue={item.sort_order} style={{ width: "70px" }} />
      <label className="marquee-admin-active">
        <input type="checkbox" name="isActive" defaultChecked={item.is_active} /> active
      </label>
      <button type="submit" className="btn-outline" style={{ padding: ".5rem 1rem" }}>Save</button>
      <button
        type="submit"
        formAction={deleteMarqueeItem}
        className="admin-delete-btn"
        style={{ marginLeft: ".5rem" }}
      >
        Delete
      </button>
    </form>
  );
}
