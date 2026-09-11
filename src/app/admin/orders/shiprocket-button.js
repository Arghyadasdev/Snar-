"use client";

import { createShiprocketShipment, refreshShiprocketTracking } from "@/lib/actions/shiprocket";

const ACTIONS = {
  create: createShiprocketShipment,
  refresh: refreshShiprocketTracking,
};

export default function ShiprocketButton({ orderId, label, action = "create" }) {
  return (
    <form action={ACTIONS[action]}>
      <input type="hidden" name="id" value={orderId} />
      <button type="submit" className="btn-primary">
        {label}
      </button>
    </form>
  );
}
