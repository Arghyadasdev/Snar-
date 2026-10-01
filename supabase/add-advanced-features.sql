-- Manual courier selection needs the pickup location's own pincode to call
-- Shiprocket's serviceability check (pickup_location is just a saved
-- nickname, not a pincode).
alter table public.site_settings add column if not exists shiprocket_pickup_pincode text not null default '';

-- Manifest PDF URL, alongside the existing label/invoice URLs.
alter table public.orders add column if not exists shiprocket_manifest_url text;

-- Lets the admin command palette (Ctrl/Cmd+K) match an order by its UUID
-- prefix, not just customer name — Postgrest can't ilike a uuid column
-- directly, so this view exposes a text cast to filter on.
create or replace view public.orders_search as
select id, id::text as id_text, shipping_name, total, status, created_at
from public.orders;
