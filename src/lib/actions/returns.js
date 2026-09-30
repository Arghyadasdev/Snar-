"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser, requireAdmin } from "@/lib/auth/dal";
import { refundRazorpayPayment } from "@/lib/razorpay";
import { logAdminActivity } from "@/lib/actions/admin-activity";

export async function createReturnRequest(prevState, formData) {
  const orderId = formData.get("orderId")?.toString();
  const reason = formData.get("reason")?.toString().trim();
  if (!reason) return { error: "Please tell us why you're returning this order." };

  const user = await requireUser(`/account/orders/${orderId}`);
  const supabase = await createClient();

  const { data: order } = await supabase.from("orders").select("id, status").eq("id", orderId).eq("user_id", user.id).single();
  if (!order) return { error: "Order not found." };
  if (order.status !== "delivered") return { error: "Only delivered orders can be returned." };

  const { data: existing } = await supabase.from("return_requests").select("id").eq("order_id", orderId).maybeSingle();
  if (existing) return { error: "A return request already exists for this order." };

  const { error } = await supabase.from("return_requests").insert({ order_id: orderId, user_id: user.id, reason });
  if (error) return { error: error.message };

  revalidatePath(`/account/orders/${orderId}`);
  return { success: "Return request submitted." };
}

export async function getReturnForOrder(orderId) {
  const supabase = await createClient();
  const { data } = await supabase.from("return_requests").select("*").eq("order_id", orderId).maybeSingle();
  return data;
}

export async function listReturnsAdmin(status = "") {
  await requireAdmin();
  const admin = createAdminClient();
  let query = admin
    .from("return_requests")
    .select("*, order:orders(id, total, shipping_name, razorpay_payment_id)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data } = await query;
  return data || [];
}

// Approve = trigger a full refund via Razorpay and mark the order cancelled.
// If the refund call fails (e.g. already refunded upstream, network issue),
// the request is left at 'approved' so admin can retry rather than silently
// losing the approval.
export async function approveReturn(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();

  const { data: ret } = await admin
    .from("return_requests")
    .select("*, order:orders(id, total, razorpay_payment_id)")
    .eq("id", id)
    .single();
  if (!ret) return;

  try {
    const refund = await refundRazorpayPayment(ret.order.razorpay_payment_id, ret.order.total);
    await admin
      .from("return_requests")
      .update({
        status: "refunded",
        refund_amount: ret.order.total,
        razorpay_refund_id: refund.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    await admin.from("orders").update({ status: "cancelled" }).eq("id", ret.order_id);
    await logAdminActivity({
      admin: admin_,
      action: "return_refunded",
      entityType: "return_request",
      entityId: id,
      metadata: { order_id: ret.order_id, refund_amount: ret.order.total, razorpay_refund_id: refund.id },
    });
  } catch (err) {
    console.error("Refund failed:", err?.error?.description || err.message);
    await admin.from("return_requests").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", id);
  }

  revalidatePath("/admin/returns");
}

export async function rejectReturn(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("return_requests").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", id);
  await logAdminActivity({ admin: admin_, action: "return_rejected", entityType: "return_request", entityId: id });
  revalidatePath("/admin/returns");
}
