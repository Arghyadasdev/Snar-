"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeSegment } from "@/lib/customer-segment";

const STATUS_ORDER = ["pending", "processing", "shipped", "delivered", "cancelled"];
const LOW_STOCK_THRESHOLD = 10;

export async function getAdminStats(rangeDays = 7) {
  await requireAdmin();
  const admin = createAdminClient();
  const days = [7, 30, 90].includes(Number(rangeDays)) ? Number(rangeDays) : 7;

  const [{ count: productCount }, { data: profiles }, { data: orders }, { data: orderItems }, { data: lowStock }, { data: customerStats }] =
    await Promise.all([
      admin.from("products").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id, full_name, email, created_at"),
      admin
        .from("orders")
        .select("id, status, total, shipping_name, created_at, payment_status")
        .order("created_at", { ascending: false }),
      admin.from("order_items").select("product_name, quantity, unit_price"),
      admin
        .from("products")
        .select("id, name, stock, image_url")
        .lte("stock", LOW_STOCK_THRESHOLD)
        .eq("is_active", true)
        .order("stock", { ascending: true })
        .limit(10),
      admin.from("customer_order_stats").select("*"),
    ]);

  const allProfiles = profiles || [];
  const customerCount = allProfiles.length;
  const statsByCustomer = new Map((customerStats || []).map((s) => [s.customer_id, s]));

  const allOrders = orders || [];
  const paidOrders = allOrders.filter((o) => o.payment_status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingCount = allOrders.filter((o) => o.status === "pending").length;
  const avgOrderValue = paidOrders.length > 0 ? revenue / paidOrders.length : 0;

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
    total: paidOrders
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

  const newCustomersOverview = rangeDates.map((day) => ({
    day,
    total: allProfiles.filter((p) => p.created_at.slice(0, 10) === day).length,
  }));
  const newCustomerCount = newCustomersOverview.reduce((sum, d) => sum + d.total, 0);

  const segments = allProfiles.map((p) =>
    computeSegment({ createdAt: p.created_at, ...(statsByCustomer.get(p.id) || {}) })
  );
  const SEGMENT_ORDER = ["vip", "regular", "new", "inactive"];
  const segmentBreakdown = SEGMENT_ORDER.map((segment) => ({
    status: segment,
    count: segments.filter((s) => s === segment).length,
  }));

  const profileById = new Map(allProfiles.map((p) => [p.id, p]));
  const topCustomers = (customerStats || [])
    .filter((s) => Number(s.total_spent) > 0)
    .sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
    .slice(0, 5)
    .map((s) => ({
      id: s.customer_id,
      name: profileById.get(s.customer_id)?.full_name || profileById.get(s.customer_id)?.email || "—",
      totalSpent: Number(s.total_spent),
      totalOrders: s.total_orders,
    }));

  return {
    productCount: productCount || 0,
    orderCount: allOrders.length,
    customerCount: customerCount || 0,
    newCustomerCount,
    pendingCount,
    revenue,
    avgOrderValue,
    statusBreakdown,
    salesOverview,
    newCustomersOverview,
    segmentBreakdown,
    topCustomers,
    recentOrders,
    topProducts,
    lowStock: lowStock || [],
    rangeDays: days,
  };
}
