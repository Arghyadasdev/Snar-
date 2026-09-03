"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUS_ORDER = ["pending", "processing", "shipped", "delivered", "cancelled"];

export async function getAdminStats() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ count: productCount }, { count: customerCount }, { data: orders }, { data: orderItems }] =
    await Promise.all([
      admin.from("products").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin
        .from("orders")
        .select("id, status, total, shipping_name, created_at")
        .order("created_at", { ascending: false }),
      admin.from("order_items").select("product_name, quantity, unit_price"),
    ]);

  const allOrders = orders || [];
  const revenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingCount = allOrders.filter((o) => o.status === "pending").length;

  const statusBreakdown = STATUS_ORDER.map((status) => ({
    status,
    count: allOrders.filter((o) => o.status === status).length,
  }));

  // last 7 days, oldest -> newest
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const salesOverview = days.map((day) => ({
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
    statusBreakdown,
    salesOverview,
    recentOrders,
    topProducts,
  };
}
