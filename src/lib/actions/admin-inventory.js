"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity } from "@/lib/actions/admin-activity";

export async function listInventoryAdmin(search = "") {
  await requireAdmin();
  const admin = createAdminClient();

  let query = admin
    .from("products")
    .select("id, name, slug, image_url, stock, is_active, variants:product_variants(id, color_name, stock)")
    .order("stock", { ascending: true });

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data } = await query;
  return data || [];
}

export async function updateProductStock(formData) {
  const admin_ = await requireAdmin();
  const id = formData.get("id")?.toString();
  const stock = Number(formData.get("stock")) || 0;

  const admin = createAdminClient();
  await admin.from("products").update({ stock }).eq("id", id);
  await logAdminActivity({ admin: admin_, action: "product_stock_updated", entityType: "product", entityId: id, metadata: { stock } });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}
