"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

const LOW_STOCK_THRESHOLD = 10;

// Computed live from existing tables rather than a stored/read-tracked
// notifications table — these are all "things needing attention right now,"
// not a feed, so there's nothing to mark read.
export async function getAdminNotifications() {
  await requireAdmin();
  const admin = createAdminClient();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ count: newOrders }, { count: lowStock }, { count: pendingReturns }, { count: shiprocketErrors }] =
    await Promise.all([
      admin.from("orders").select("id", { count: "exact", head: true }).gte("created_at", since24h),
      admin.from("products").select("id", { count: "exact", head: true }).lte("stock", LOW_STOCK_THRESHOLD).eq("is_active", true),
      admin.from("return_requests").select("id", { count: "exact", head: true }).eq("status", "requested"),
      admin.from("orders").select("id", { count: "exact", head: true }).ilike("shiprocket_status", "error:%"),
    ]);

  const items = [
    { key: "orders", count: newOrders || 0, label: "New orders (24h)", href: "/admin/orders" },
    { key: "stock", count: lowStock || 0, label: "Products low on stock", href: "/admin/products" },
    { key: "returns", count: pendingReturns || 0, label: "Return requests awaiting review", href: "/admin/returns" },
    { key: "shiprocket", count: shiprocketErrors || 0, label: "Orders failing Shiprocket sync", href: "/admin/orders" },
  ].filter((item) => item.count > 0);

  return items;
}
