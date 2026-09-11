import { createAdminClient } from "@/lib/supabase/admin";

// Shiprocket calls this on every shipment status change (AWB assigned,
// picked up, out for delivery, delivered, RTO, ...). Configure the same
// URL + secret in Shiprocket → Settings → API → Webhook, sent back as the
// `x-api-key` header.
const STATUS_MAP = {
  "AWB ASSIGNED": "processing",
  "PICKUP SCHEDULED": "processing",
  "PICKED UP": "shipped",
  "IN TRANSIT": "shipped",
  "OUT FOR DELIVERY": "shipped",
  DELIVERED: "delivered",
  CANCELED: "cancelled",
  CANCELLED: "cancelled",
  RTO: "cancelled",
};

export async function POST(request) {
  const key = request.headers.get("x-api-key");
  if (!process.env.SHIPROCKET_WEBHOOK_TOKEN || key !== process.env.SHIPROCKET_WEBHOOK_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return new Response("Bad Request", { status: 400 });

  const externalOrderId = body.channel_order_id;
  const shiprocketOrderId = (body.sr_order_id ?? body.order_id)?.toString();
  if (!externalOrderId && !shiprocketOrderId) {
    return new Response("No order reference", { status: 400 });
  }

  const rawStatus = (body.current_status || body.shipment_status || "").toString().toUpperCase();

  const update = {
    awb_code: body.awb || undefined,
    courier_name: body.courier_name || undefined,
    shiprocket_status: rawStatus || undefined,
    status: STATUS_MAP[rawStatus] || undefined,
  };

  const admin = createAdminClient();
  const query = admin.from("orders").update(update);
  await (externalOrderId ? query.eq("id", externalOrderId) : query.eq("shiprocket_order_id", shiprocketOrderId));

  return Response.json({ received: true });
}
