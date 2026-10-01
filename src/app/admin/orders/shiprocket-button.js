"use client";

import {
  createShiprocketShipment,
  refreshShiprocketTracking,
  assignAwb,
  requestPickup,
  generateLabel,
  generateInvoice,
  generateManifest,
  cancelShipment,
} from "@/lib/actions/shiprocket";

const ACTIONS = {
  create: createShiprocketShipment,
  refresh: refreshShiprocketTracking,
  assignAwb,
  requestPickup,
  generateLabel,
  generateInvoice,
  generateManifest,
  cancelShipment,
};

export default function ShiprocketButton({ orderId, label, action = "create", danger = false }) {
  return (
    <form action={ACTIONS[action]}>
      <input type="hidden" name="id" value={orderId} />
      <button type="submit" className={danger ? "admin-delete-btn" : "btn-primary"}>
        {label}
      </button>
    </form>
  );
}
