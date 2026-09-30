"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

// Cmd/Ctrl+K palette in the admin topbar. One ilike query per entity type,
// capped small since this runs on every keystroke.
export async function globalAdminSearch(query) {
  await requireAdmin();
  const q = query?.trim();
  if (!q || q.length < 2) return { orders: [], customers: [], products: [] };

  const admin = createAdminClient();
  const [{ data: orders }, { data: customers }, { data: products }] = await Promise.all([
    admin
      .from("orders")
      .select("id, shipping_name, total, status")
      .ilike("shipping_name", `%${q}%`)
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("profiles")
      .select("id, full_name, email")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(5),
    admin
      .from("products")
      .select("id, name, slug, price")
      .ilike("name", `%${q}%`)
      .limit(5),
  ]);

  return { orders: orders || [], customers: customers || [], products: products || [] };
}
