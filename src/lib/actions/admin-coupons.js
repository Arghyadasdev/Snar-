"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listCouponsAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("coupons").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function createCoupon(prevState, formData) {
  await requireAdmin();

  const code = formData.get("code")?.toString().trim().toUpperCase();
  const discountType = formData.get("discountType")?.toString();
  const discountValue = Number(formData.get("discountValue"));
  const minOrderAmount = Number(formData.get("minOrderAmount")) || 0;
  const maxUsesRaw = formData.get("maxUses")?.toString().trim();
  const expiresAtRaw = formData.get("expiresAt")?.toString().trim();

  if (!code || !discountValue) {
    return { error: "Code and discount value are required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("coupons").insert({
    code,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_amount: minOrderAmount,
    max_uses: maxUsesRaw ? Number(maxUsesRaw) : null,
    expires_at: expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null,
    is_active: formData.get("isActive") === "on",
  });

  if (error) {
    return { error: error.message.includes("duplicate") ? "That coupon code already exists." : error.message };
  }

  revalidatePath("/admin/coupons");
  return { success: `Coupon ${code} created.` };
}

export async function toggleCoupon(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const isActive = formData.get("isActive") === "true";

  const admin = createAdminClient();
  await admin.from("coupons").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("coupons").delete().eq("id", id);
  revalidatePath("/admin/coupons");
}
