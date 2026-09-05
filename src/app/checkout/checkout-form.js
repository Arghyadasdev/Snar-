"use client";

import { useState } from "react";
import Script from "next/script";
import { createRazorpayOrder, verifyAndPlaceOrder } from "@/lib/actions/razorpay";

export default function CheckoutForm() {
  const [scriptReady, setScriptReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({
    name: "", phone: "", address: "", city: "", state: "", zip: "", couponCode: "",
  });

  function update(key) {
    return (e) => setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!scriptReady) {
      setError("Payment gateway still loading — try again in a moment.");
      return;
    }

    setPending(true);

    const shipping = {
      name: fields.name.trim(),
      phone: fields.phone.trim(),
      address: fields.address.trim(),
      city: fields.city.trim(),
      state: fields.state.trim(),
      zip: fields.zip.trim(),
    };
    const couponCode = fields.couponCode.trim();

    const orderResult = await createRazorpayOrder(shipping, couponCode);
    if (orderResult.error) {
      setError(orderResult.error);
      setPending(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: orderResult.keyId,
      amount: orderResult.amount,
      currency: orderResult.currency,
      order_id: orderResult.razorpayOrderId,
      name: "SNAR",
      description: "Order payment",
      prefill: { name: shipping.name, contact: shipping.phone },
      theme: { color: "#00C4D4" },
      handler: async (response) => {
        const result = await verifyAndPlaceOrder({
          shipping,
          couponCode,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });

        if (result.error) {
          setError(result.error);
          setPending(false);
          return;
        }

        window.location.href = result.whatsappUrl;
      },
      modal: {
        ondismiss: () => setPending(false),
      },
    });

    razorpay.on("payment.failed", (response) => {
      setError(`Payment failed: ${response.error.description}`);
      setPending(false);
    });

    razorpay.open();
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <form className="cart-items" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="order-shipping-title">Shipping Details</div>

        <label className="auth-label" htmlFor="name">Full Name</label>
        <input className="auth-input" id="name" value={fields.name} onChange={update("name")} required />

        <label className="auth-label" htmlFor="phone">Phone</label>
        <input className="auth-input" id="phone" value={fields.phone} onChange={update("phone")} required />

        <label className="auth-label" htmlFor="address">Address</label>
        <input className="auth-input" id="address" value={fields.address} onChange={update("address")} required />

        <div className="form-row-3">
          <div>
            <label className="auth-label" htmlFor="city">City</label>
            <input className="auth-input" id="city" value={fields.city} onChange={update("city")} required />
          </div>
          <div>
            <label className="auth-label" htmlFor="state">State</label>
            <input className="auth-input" id="state" value={fields.state} onChange={update("state")} required />
          </div>
          <div>
            <label className="auth-label" htmlFor="zip">ZIP</label>
            <input className="auth-input" id="zip" value={fields.zip} onChange={update("zip")} required />
          </div>
        </div>

        <label className="auth-label" htmlFor="couponCode">Coupon Code (optional)</label>
        <input
          className="auth-input"
          id="couponCode"
          value={fields.couponCode}
          onChange={update("couponCode")}
          placeholder="e.g. WELCOME10"
          style={{ textTransform: "uppercase" }}
        />

        {error && <p className="auth-error">{error}</p>}

        <button className="btn-primary" type="submit" disabled={pending} style={{ justifyContent: "center", marginTop: ".5rem" }}>
          {pending ? "Processing…" : "PAY & PLACE ORDER"}
        </button>
      </form>
    </>
  );
}
