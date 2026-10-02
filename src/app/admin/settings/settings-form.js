"use client";

import { useActionState } from "react";
import Link from "next/link";
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

      <h3 style={{ marginTop: "1.6rem", marginBottom: ".4rem" }}>Shiprocket</h3>
      <p className="shop-sub" style={{ marginBottom: ".8rem" }}>
        Used to create shipments when an order is paid. Leave blank to keep using the SHIPROCKET_* env vars instead.
      </p>

      <label className="auth-label" htmlFor="shiprocketEmail">Shiprocket Account Email</label>
      <input className="auth-input" id="shiprocketEmail" name="shiprocketEmail" defaultValue={settings.shiprocket_email} placeholder="ops@yourstore.com" />

      <label className="auth-label" htmlFor="shiprocketPassword">
        Shiprocket Password {settings.shiprocket_password ? "(already set — leave blank to keep it)" : ""}
      </label>
      <input className="auth-input" id="shiprocketPassword" name="shiprocketPassword" type="password" placeholder={settings.shiprocket_password ? "••••••••" : ""} />

      <p className="shop-sub">
        Pickup location is managed as a <Link href="/admin/warehouses">Warehouse</Link> now, not here.
      </p>

      {state?.error && <p className="auth-error">{state.error}</p>}
      {state?.success && <p className="auth-success">{state.success}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
