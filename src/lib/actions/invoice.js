"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { currentFinancialYear, computeGst } from "@/lib/invoice";

// Best-effort, like the Shiprocket sync and confirmation email it runs
// alongside — never throws, so a GST config gap can't block order
// placement. Idempotent: skips orders that already have an invoice number.
export async function generateInvoiceForOrder(orderId) {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, total, shipping_state, invoice_number")
    .eq("id", orderId)
    .single();
  if (!order || order.invoice_number) return;

  try {
    const { data: settings } = await admin
      .from("site_settings")
      .select("seller_state, gst_rate_percent")
      .eq("id", 1)
      .single();

    const gst = computeGst({
      total: Number(order.total),
      sellerState: settings?.seller_state,
      customerState: order.shipping_state,
      gstRatePercent: settings?.gst_rate_percent,
    });

    const fy = currentFinancialYear();
    const { data: seq, error: seqError } = await admin.rpc("next_invoice_number", { p_fy: fy });
    if (seqError) throw seqError;

    const invoiceNumber = `INV/${fy}/${String(seq).padStart(6, "0")}`;

    await admin
      .from("orders")
      .update({
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString(),
        gst_type: gst.gstType,
        gst_rate: gst.gstRate,
        taxable_amount: gst.taxableAmount,
        tax_amount: gst.taxAmount,
        cgst_amount: gst.cgstAmount,
        sgst_amount: gst.sgstAmount,
        igst_amount: gst.igstAmount,
      })
      .eq("id", orderId);
  } catch (err) {
    console.error("Invoice generation failed:", err.message);
  }
}
