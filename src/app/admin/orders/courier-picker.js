"use client";

import { useEffect, useState } from "react";
import { getAvailableCouriersForOrder, assignAwb } from "@/lib/actions/shiprocket";

export default function CourierPicker({ orderId }) {
  const [couriers, setCouriers] = useState(null);

  useEffect(() => {
    getAvailableCouriersForOrder(orderId).then(setCouriers);
  }, [orderId]);

  return (
    <form action={assignAwb} style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="id" value={orderId} />
      {couriers === null ? (
        <span className="order-item-meta">Checking available couriers…</span>
      ) : couriers.length > 0 ? (
        <select name="courierId" className="auth-input" style={{ padding: ".4rem .6rem", width: "auto" }} defaultValue="">
          <option value="">Auto-assign (recommended)</option>
          {couriers.map((c) => (
            <option key={c.courier_company_id} value={c.courier_company_id}>
              {c.courier_name} — ₹{Math.round(c.rate)} · {c.etd}
            </option>
          ))}
        </select>
      ) : (
        <span className="order-item-meta">No pickup pincode set (Admin → Settings) — will auto-assign.</span>
      )}
      <button type="submit" className="btn-primary">Assign AWB</button>
    </form>
  );
}
