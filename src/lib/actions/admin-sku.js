"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";

export async function listSkusAdmin(search = "") {
  await requireAdmin();
  const admin = createAdminClient();

  let query = admin
    .from("products")
    .select("id, name, image_url, sku, hsn_code, gst_rate, stock, is_active")
    .order("name", { ascending: true });

  if (search.trim()) {
    query = query.or(`name.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%,hsn_code.ilike.%${search.trim()}%`);
  }

  const { data } = await query;
  return data || [];
}

export async function updateSkuFields(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const sku = formData.get("sku")?.toString().trim() || null;
  const hsnCode = formData.get("hsnCode")?.toString().trim() || null;
  const gstRateRaw = formData.get("gstRate")?.toString().trim();
  const gstRate = gstRateRaw ? Number(gstRateRaw) : null;

  const admin = createAdminClient();
  const { error } = await admin.from("products").update({ sku, hsn_code: hsnCode, gst_rate: gstRate }).eq("id", id);
  if (error) return { error: error.message.includes("duplicate") ? "That SKU is already used by another product." : error.message };

  await logAdminActivity({ admin: admin_, action: "product_sku_updated", entityType: "product", entityId: id, metadata: { sku, hsn_code: hsnCode } });

  revalidatePath("/admin/sku");
  revalidatePath("/admin/products");
}
