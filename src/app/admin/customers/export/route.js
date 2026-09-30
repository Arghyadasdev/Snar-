import { requireAdmin } from "@/lib/auth/dal";
import { listCustomersAdmin } from "@/lib/actions/admin-customers";

function toCsvCell(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET(request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const segment = searchParams.get("segment") || "";
  const ids = searchParams.get("ids")?.split(",").filter(Boolean);

  let customers = await listCustomersAdmin(q, status, segment);
  if (ids?.length) {
    const idSet = new Set(ids);
    customers = customers.filter((c) => idSet.has(c.id));
  }

  const header = ["Name", "Email", "Role", "Status", "Segment", "Total Orders", "Total Spent", "Last Order", "Joined"];
  const rows = customers.map((c) => [
    c.full_name || "",
    c.email,
    c.role,
    c.status,
    c.segment || "",
    c.total_orders,
    c.total_spent,
    c.last_order_at ? new Date(c.last_order_at).toISOString().slice(0, 10) : "",
    new Date(c.created_at).toISOString().slice(0, 10),
  ]);

  const csv = [header, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
