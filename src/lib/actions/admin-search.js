"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { ilikePattern } from "@/lib/supabase/filters";

// Cmd/Ctrl+K palette in the admin topbar. One ilike query per entity type,
// capped small since this runs on every keystroke.
export async function globalAdminSearch(query) {
  await requireAdmin();
  const q = query?.trim();
  if (!q || q.length < 2) return { orders: [], customers: [], products: [] };

  const pattern = ilikePattern(q);
  const admin = createAdminClient();
  const [{ data: orders }, { data: customers }, { data: products }] = await Promise.all([
    admin
      .from("orders_search")
      .select("id, shipping_name, total, status")
      .or(`id_text.ilike.${pattern},shipping_name.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("profiles")
      .select("id, full_name, email")
      .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
      .limit(5),
    admin
      .from("products")
      .select("id, name, slug, price")
      .ilike("name", `%${q}%`)
      .limit(5),
  ]);

  return { orders: orders || [], customers: customers || [], products: products || [] };
}
