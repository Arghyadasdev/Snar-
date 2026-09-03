import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

function toCsvCell(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("slug, name, price, compare_at_price, stock, is_active, category:categories(name)")
    .order("created_at", { ascending: false });

  const header = ["Slug", "Name", "Category", "Price", "Compare At Price", "Stock", "Active"];
  const rows = (data || []).map((p) => [
    p.slug,
    p.name,
    p.category?.name || "",
    p.price,
    p.compare_at_price ?? "",
    p.stock,
    p.is_active ? "yes" : "no",
  ]);

  const csv = [header, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
