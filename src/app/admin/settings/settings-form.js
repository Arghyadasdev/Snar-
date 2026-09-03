"use client";

import { useActionState } from "react";
import { updateSettings } from "@/lib/actions/admin-settings";

export default function SettingsForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateSettings, undefined);

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "520px" }}>
      <label className="auth-label" htmlFor="whatsappNumber">WhatsApp Number (with country code, no +)</label>
      <input className="auth-input" id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsapp_number} placeholder="919875607634" />

      <label className="auth-label" htmlFor="instagramUrl">Instagram URL</label>
      <input className="auth-input" id="instagramUrl" name="instagramUrl" defaultValue={settings.instagram_url} />

      <label className="auth-label" htmlFor="facebookUrl">Facebook URL</label>
      <input className="auth-input" id="facebookUrl" name="facebookUrl" defaultValue={settings.facebook_url} />

      <label className="auth-label" htmlFor="contactEmail">Contact Email</label>
      <input className="auth-input" id="contactEmail" name="contactEmail" defaultValue={settings.contact_email} />

      <label className="auth-label" htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</label>
      <input className="auth-input" id="freeShippingThreshold" name="freeShippingThreshold" type="number" defaultValue={settings.free_shipping_threshold} />

      {state?.error && <p className="auth-error">{state.error}</p>}
      {state?.success && <p className="auth-success">{state.success}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
