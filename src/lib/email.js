import "server-only";
import { Resend } from "resend";

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// Best-effort — never throws. Missing/invalid RESEND_API_KEY just skips
// sending; callers shouldn't let email failure block order placement.
export async function sendOrderConfirmationEmail({ order, items, toEmail }) {
  const resend = getResendClient();
  if (!resend || !toEmail) return;

  const rows = items
    .map((i) => `<tr><td style="padding:6px 0">${i.product_name} (Size ${i.size || "—"}) × ${i.quantity}</td><td style="padding:6px 0;text-align:right">₹${(i.unit_price * i.quantity).toFixed(2)}</td></tr>`)
    .join("");

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "SNAR <orders@resend.dev>",
      to: toEmail,
      subject: `Order Confirmed — #${order.id.slice(0, 8)}`,
      html: `
        <h2>Thanks for your order, ${order.shipping_name}!</h2>
        <p>Order #${order.id.slice(0, 8)} is confirmed and being processed.</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p style="margin-top:12px"><strong>Total: ₹${Number(order.total).toFixed(2)}</strong></p>
        <p>Shipping to: ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}</p>
      `,
    });
  } catch (err) {
    console.error("Order confirmation email failed:", err.message);
  }
}
