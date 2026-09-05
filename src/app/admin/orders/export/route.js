import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

function toCsvCell(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id, status, total, discount_amount, coupon_code, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_zip, created_at, payment_status, razorpay_payment_id")
    .order("created_at", { ascending: false });

  const header = ["Order ID", "Date", "Status", "Customer", "Phone", "Address", "City", "State", "ZIP", "Coupon", "Discount", "Total", "Payment Status", "Razorpay Payment ID"];
  const rows = (data || []).map((o) => [
    o.id,
    new Date(o.created_at).toISOString().slice(0, 10),
    o.status,
    o.shipping_name,
    o.shipping_phone,
    o.shipping_address,
    o.shipping_city,
    o.shipping_state,
    o.shipping_zip,
    o.coupon_code || "",
    o.discount_amount,
    o.total,
    o.payment_status || "",
    o.razorpay_payment_id || "",
  ]);

  const csv = [header, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
