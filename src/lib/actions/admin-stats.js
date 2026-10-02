"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeSegment } from "@/lib/customer-segment";

const STATUS_ORDER = ["pending", "processing", "shipped", "delivered", "cancelled"];
const LOW_STOCK_THRESHOLD = 10;

function pctDelta(current, previous) {
  if (previous > 0) return ((current - previous) / previous) * 100;
  return current > 0 ? 100 : 0;
}

function inWindow(dateStr, startMs, endMs) {
  const t = new Date(dateStr).getTime();
  return t >= startMs && t < endMs;
}

export async function getAdminStats(rangeDays = 7) {
  await requireAdmin();
  const admin = createAdminClient();
  const days = [7, 30, 90].includes(Number(rangeDays)) ? Number(rangeDays) : 7;

  const [
    { count: productCount },
    { count: categoryCount },
    { data: profiles },
    { data: orders },
    { data: orderItems },
    { data: lowStock },
    { data: customerStats },
    { data: coupons },
    { data: reviews },
    { data: leads },
    { data: returnRequests },
  ] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }),
    admin.from("categories").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id, full_name, email, created_at"),
    admin
      .from("orders")
      .select("id, status, total, shipping_name, shipping_state, shipping_city, created_at, payment_status")
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
    admin.from("coupons").select("id, is_active"),
    admin.from("reviews").select("id, created_at"),
    admin.from("leads").select("id, created_at"),
    admin.from("return_requests").select("status, refund_amount, created_at"),
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

  // ---- Period-over-period KPIs (current window vs the equal-length window before it) ----
  const now = Date.now();
  const rangeStartMs = now - days * 86400000;
  const prevStartMs = now - 2 * days * 86400000;

  const curPaid = paidOrders.filter((o) => inWindow(o.created_at, rangeStartMs, now));
  const prevPaid = paidOrders.filter((o) => inWindow(o.created_at, prevStartMs, rangeStartMs));
  const curRevenue = curPaid.reduce((sum, o) => sum + Number(o.total), 0);
  const prevRevenue = prevPaid.reduce((sum, o) => sum + Number(o.total), 0);
  const curAov = curPaid.length > 0 ? curRevenue / curPaid.length : 0;
  const prevAov = prevPaid.length > 0 ? prevRevenue / prevPaid.length : 0;

  const customersAsOf = (cutoffMs) => allProfiles.filter((p) => new Date(p.created_at).getTime() < cutoffMs).length;
  const curCustomerTotal = customersAsOf(now);
  const prevCustomerTotal = customersAsOf(rangeStartMs);

  const curNewCustomers = allProfiles.filter((p) => inWindow(p.created_at, rangeStartMs, now)).length;
  const prevNewCustomers = allProfiles.filter((p) => inWindow(p.created_at, prevStartMs, rangeStartMs)).length;

  const kpis = [
    { key: "revenue", label: "Total Revenue", value: curRevenue, format: "currency", delta: pctDelta(curRevenue, prevRevenue) },
    { key: "orders", label: "Total Orders", value: curPaid.length, format: "number", delta: pctDelta(curPaid.length, prevPaid.length) },
    { key: "aov", label: "Avg Order Value", value: curAov, format: "currency", delta: pctDelta(curAov, prevAov) },
    { key: "customers", label: "Total Customers", value: curCustomerTotal, format: "number", delta: pctDelta(curCustomerTotal, prevCustomerTotal) },
    { key: "newCustomers", label: `New Customers (${days}D)`, value: curNewCustomers, format: "number", delta: pctDelta(curNewCustomers, prevNewCustomers) },
  ];

  // ---- Value breakdown: confirmed / pending / cancelled, within the range ----
  const curRangeOrders = allOrders.filter((o) => inWindow(o.created_at, rangeStartMs, now));
  const pendingOrders = curRangeOrders.filter((o) => o.status === "pending");
  const cancelledOrders = curRangeOrders.filter((o) => o.status === "cancelled");
  const valueBreakdown = {
    confirmed: { total: curRevenue, count: curPaid.length },
    pending: { total: pendingOrders.reduce((s, o) => s + Number(o.total), 0), count: pendingOrders.length },
    cancelled: { total: cancelledOrders.reduce((s, o) => s + Number(o.total), 0), count: cancelledOrders.length },
  };

  // ---- Top states / cities by revenue, within the range ----
  function topBy(field) {
    const totals = new Map();
    for (const o of curPaid) {
      const key = o[field]?.trim();
      if (!key) continue;
      totals.set(key, (totals.get(key) || 0) + Number(o.total));
    }
    return [...totals.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }
  const topStates = topBy("shipping_state");
  const topCities = topBy("shipping_city");

  // ---- Secondary counts ----
  const secondaryCounts = [
    { label: "Total Products", value: productCount || 0 },
    { label: "Total Categories", value: categoryCount || 0 },
    { label: "Pending Orders", value: pendingCount },
    { label: "Active Coupons", value: (coupons || []).filter((c) => c.is_active).length },
    { label: "New Leads", value: (leads || []).filter((l) => inWindow(l.created_at, rangeStartMs, now)).length },
  ];

  // ---- Refund overview (stand-in for a single-seller store's "payouts") ----
  const allReturns = returnRequests || [];
  const refunded = allReturns.filter((r) => r.status === "refunded");
  const rejected = allReturns.filter((r) => r.status === "rejected");
  const pendingReturns = allReturns.filter((r) => r.status === "requested" || r.status === "approved");
  const decided = refunded.length + rejected.length;
  const refundOverview = {
    totalRefunded: refunded.reduce((s, r) => s + Number(r.refund_amount || 0), 0),
    pendingCount: pendingReturns.length,
    releasedCount: refunded.length,
    successRate: decided > 0 ? (refunded.length / decided) * 100 : 0,
  };

  // ---- Growth overview: a few counters, current range vs previous ----
  function growthRow(label, href, items) {
    const cur = items.filter((x) => inWindow(x.created_at, rangeStartMs, now)).length;
    const prev = items.filter((x) => inWindow(x.created_at, prevStartMs, rangeStartMs)).length;
    return { label, href, value: cur, delta: pctDelta(cur, prev) };
  }
  const growthList = [
    growthRow("New Customers", "/admin/customers", allProfiles),
    growthRow("New Orders", "/admin/orders", allOrders),
    growthRow("New Reviews", "/admin/reviews", reviews || []),
    growthRow("New Leads", "/admin/leads", leads || []),
  ];

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
    kpis,
    valueBreakdown,
    topStates,
    topCities,
    secondaryCounts,
    refundOverview,
    growthList,
    rangeStart: new Date(rangeStartMs),
    rangeEnd: new Date(now),
  };
}
