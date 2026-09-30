import "server-only";
import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

export async function refundRazorpayPayment(paymentId, amount) {
  const razorpay = getRazorpayClient();
  return razorpay.payments.refund(paymentId, { amount: Math.round(amount * 100) });
}
