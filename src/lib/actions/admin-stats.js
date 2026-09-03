"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUS_ORDER = ["pending", "processing", "shipped", "delivered", "cancelled"];
const LOW_STOCK_THRESHOLD = 10;

export async function getAdminStats(rangeDays = 7) {
  await requireAdmin();
  const admin = createAdminClient();
  const days = [7, 30, 90].includes(Number(rangeDays)) ? Number(rangeDays) : 7;

  const [{ count: productCount }, { count: customerCount }, { data: orders }, { data: orderItems }, { data: lowStock }] =
    await Promise.all([
      admin.from("products").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin
        .from("orders")
        .select("id, status, total, shipping_name, created_at")
        .order("created_at", { ascending: false }),
      admin.from("order_items").select("product_name, quantity, unit_price"),
      admin
        .from("products")
        .select("id, name, stock, image_url")
        .lte("stock", LOW_STOCK_THRESHOLD)
        .eq("is_active", true)
        .order("stock", { ascending: true })
        .limit(10),
    ]);

  const allOrders = orders || [];
  const revenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingCount = allOrders.filter((o) => o.status === "pending").length;
  const avgOrderValue = allOrders.length > 0 ? revenue / allOrders.length : 0;

  const statusBreakdown = STATUS_ORDER.map((status) => ({
    status,
    count: allOrders.filter((o) => o.status === status).length,
  }));

  // oldest -> newest, over the selected range
  const rangeDates = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });
  const salesOverview = rangeDates.map((day) => ({
    day,
    total: allOrders
      .filter((o) => o.created_at.slice(0, 10) === day)
      .reduce((sum, o) => sum + Number(o.total), 0),
  }));

  const recentOrders = allOrders.slice(0, 5);

  const productTotals = new Map();
  for (const item of orderItems || []) {
    const entry = productTotals.get(item.product_name) || { name: item.product_name, qty: 0, revenue: 0 };
    entry.qty += item.quantity;
    entry.revenue += item.quantity * Number(item.unit_price);
    productTotals.set(item.product_name, entry);
  }
  const topProducts = [...productTotals.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  return {
    productCount: productCount || 0,
    orderCount: allOrders.length,
    customerCount: customerCount || 0,
    pendingCount,
    revenue,
    avgOrderValue,
    statusBreakdown,
    salesOverview,
    recentOrders,
    topProducts,
    lowStock: lowStock || [],
    rangeDays: days,
  };
}
