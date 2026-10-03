"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateDueRecurringExpenses } from "@/lib/actions/recurring-expenses";

export default function GenerateDueButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);
  const router = useRouter();

  function onClick() {
    startTransition(async () => {
      const result = await generateDueRecurringExpenses();
      setMessage(result.created > 0 ? `Created ${result.created} draft expense${result.created === 1 ? "" : "s"}.` : "Nothing due yet.");
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
      <button type="button" className="btn-outline" onClick={onClick} disabled={pending} style={{ padding: ".6rem 1.2rem" }}>
        {pending ? "Checking…" : "Generate Due Now"}
      </button>
      {message && <span className="order-item-meta">{message}</span>}
    </div>
  );
}
