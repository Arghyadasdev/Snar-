"use client";

import { useActionState } from "react";
import { createReturnRequest } from "@/lib/actions/returns";

const STATUS_LABEL = {
  requested: "Return requested — awaiting review",
  approved: "Return approved — refund processing",
  rejected: "Return request rejected",
  refunded: "Refunded",
};

export default function ReturnRequestForm({ orderId, existingReturn }) {
  const [state, action, pending] = useActionState(createReturnRequest, undefined);

  if (existingReturn) {
    return <p className={`order-status order-status-${existingReturn.status === "refunded" ? "delivered" : "pending"}`}>{STATUS_LABEL[existingReturn.status]}</p>;
  }

  return (
    <form action={action}>
      <input type="hidden" name="orderId" value={orderId} />
      <textarea className="auth-input" name="reason" rows={2} placeholder="Reason for return…" required />
      {state?.error && <p className="auth-error">{state.error}</p>}
      {state?.success && <p className="auth-success">{state.success}</p>}
      <button className="btn-outline" type="submit" disabled={pending} style={{ marginTop: ".5rem" }}>
        {pending ? "Submitting…" : "Request Return"}
      </button>
    </form>
  );
}
