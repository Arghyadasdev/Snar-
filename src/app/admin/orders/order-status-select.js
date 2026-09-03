"use client";

import { updateOrderStatus } from "@/lib/actions/admin-orders";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderStatusSelect({ orderId, status }) {
  return (
    <form action={updateOrderStatus} className="admin-table-actions">
      <input type="hidden" name="id" value={orderId} />
      <select
        name="status"
        defaultValue={status}
        className="auth-input"
        style={{ padding: ".4rem .6rem", width: "auto" }}
        onChange={(e) => e.target.form.requestSubmit()}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </form>
  );
}
