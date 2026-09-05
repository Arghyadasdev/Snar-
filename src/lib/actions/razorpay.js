"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/dal";
import { getRazorpayClient, verifyRazorpaySignature } from "@/lib/razorpay";
import { buildWhatsappOrderLink } from "@/lib/whatsapp";
import { getSiteSettings } from "@/lib/data/site-settings";

function validateShipping(shipping) {
  for (const [key, value] of Object.entries(shipping)) {
    if (!value || !value.toString().trim()) {
      return `Please fill in your ${key}.`;
    }
  }
  return null;
}

// Step 1: validate shipping + coupon, compute the real total server-side,
// and create a Razorpay order for that amount. Never trust a client-sent amount.
export async function createRazorpayOrder(shipping, couponCode) {
  await requireUser("/checkout");

  const shippingError = validateShipping(shipping);
  if (shippingError) return { error: shippingError };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("preview_cart_total", {
    p_coupon_code: couponCode || null,
  });

  if (error) {
    return { error: error.message.includes("Cart is empty") ? "Your cart is empty." : error.message };
  }

  const { subtotal, discount, total } = data[0];
  if (total <= 0) {
    return { error: "Order total must be greater than zero." };
  }

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: Math.round(total * 100), // paise
    currency: "INR",
    receipt: `snar_${Date.now()}`,
  });

  return {
    razorpayOrderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    subtotal,
    discount,
    total,
  };
}

// Step 2: verify the payment signature server-side, then create the DB
// order. Only reached after Razorpay confirms payment succeeded.
export async function verifyAndPlaceOrder({ shipping, couponCode, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  await requireUser("/checkout");

  const valid = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!valid) {
    return { error: "Payment verification failed. If money was deducted, contact support." };
  }

  const supabase = await createClient();
  const { data: orderId, error } = await supabase.rpc("place_paid_order", {
    p_shipping: shipping,
    p_coupon_code: couponCode || null,
    p_razorpay_order_id: razorpayOrderId,
    p_razorpay_payment_id: razorpayPaymentId,
  });

  if (error) {
    return { error: "Payment succeeded but we couldn't save your order. Contact support with your payment ID: " + razorpayPaymentId };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, unit_price, quantity, size")
    .eq("order_id", orderId);

  const settings = await getSiteSettings();
  const total = (items || []).reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const whatsappUrl = buildWhatsappOrderLink(
    settings.whatsapp_number,
    (items || []).map((i) => ({ name: i.product_name, size: i.size, quantity: i.quantity, price: i.unit_price })),
    total
  );

  return { orderId, whatsappUrl };
}
