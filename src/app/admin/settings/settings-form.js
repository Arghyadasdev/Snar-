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

      <h3 style={{ marginTop: "1.6rem", marginBottom: ".4rem" }}>GST / Invoicing</h3>
      <p className="shop-sub" style={{ marginBottom: ".8rem" }}>
        Used on every order&apos;s tax invoice (Admin → Orders → Download Invoice).
      </p>

      <label className="auth-label" htmlFor="sellerBusinessName">Business Name</label>
      <input className="auth-input" id="sellerBusinessName" name="sellerBusinessName" defaultValue={settings.seller_business_name} placeholder="SNAR Activewear" />

      <label className="auth-label" htmlFor="sellerAddress">Business Address</label>
      <input className="auth-input" id="sellerAddress" name="sellerAddress" defaultValue={settings.seller_address} />

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="sellerState">Business State</label>
          <input className="auth-input" id="sellerState" name="sellerState" defaultValue={settings.seller_state} placeholder="West Bengal" />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="gstRatePercent">GST Rate (%)</label>
          <input className="auth-input" id="gstRatePercent" name="gstRatePercent" type="number" step="0.1" defaultValue={settings.gst_rate_percent} />
        </div>
      </div>

      <div className="form-row-2">
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="sellerGstin">GSTIN</label>
          <input className="auth-input" id="sellerGstin" name="sellerGstin" defaultValue={settings.seller_gstin} placeholder="19ABCDE1234F1Z5" />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="sellerPan">PAN</label>
          <input className="auth-input" id="sellerPan" name="sellerPan" defaultValue={settings.seller_pan} placeholder="ABCDE1234F" />
        </div>
      </div>

      {state?.error && <p className="auth-error">{state.error}</p>}
      {state?.success && <p className="auth-success">{state.success}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
