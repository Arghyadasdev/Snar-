"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listInvoicesAdmin(search = "") {
  await requireAdmin();
  const admin = createAdminClient();

  let query = admin
    .from("orders")
    .select("id, invoice_number, invoice_date, shipping_name, total, gst_type, tax_amount, status")
    .not("invoice_number", "is", null)
    .order("invoice_date", { ascending: false });

  if (search.trim()) {
    query = query.or(`invoice_number.ilike.%${search.trim()}%,shipping_name.ilike.%${search.trim()}%`);
  }

  const { data } = await query;
  return data || [];
}
