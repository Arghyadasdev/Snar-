"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

// Real P&L from data this app actually has: paid order revenue minus paid
// expenses, by category. Not a full balance sheet — this app has no chart
// of accounts, inventory valuation ledger, or liability tracking, so
// assets/liabilities/equity can't be computed honestly. P&L can.
export async function getProfitAndLoss(from, to) {
  await requireAdmin();
  const admin = createAdminClient();

  let orderQuery = admin.from("orders").select("total, created_at").eq("payment_status", "paid");
  if (from) orderQuery = orderQuery.gte("created_at", from);
  if (to) orderQuery = orderQuery.lte("created_at", `${to}T23:59:59`);

  let expenseQuery = admin
    .from("expenses")
    .select("total_amount, expense_date, category:expense_categories(name)")
    .eq("status", "paid");
  if (from) expenseQuery = expenseQuery.gte("expense_date", from);
  if (to) expenseQuery = expenseQuery.lte("expense_date", to);

  const [{ data: orders }, { data: expenses }] = await Promise.all([orderQuery, expenseQuery]);

  const revenue = (orders || []).reduce((sum, o) => sum + Number(o.total), 0);
  const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.total_amount), 0);

  const byCategory = new Map();
  for (const e of expenses || []) {
    const name = e.category?.name || "Uncategorized";
    byCategory.set(name, (byCategory.get(name) || 0) + Number(e.total_amount));
  }

  return {
    revenue,
    totalExpenses,
    netProfit: revenue - totalExpenses,
    orderCount: (orders || []).length,
    expenseCount: (expenses || []).length,
    expensesByCategory: [...byCategory.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total),
  };
}
