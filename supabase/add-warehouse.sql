-- Formalizes the Shiprocket pickup location into a real Warehouse entity
-- instead of two loose text fields on site_settings. Single warehouse for
-- now — the table shape leaves room to add more later without a rework.
create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_line1 text not null,
  city text not null,
  state text not null,
  pincode text not null,
  phone text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.warehouses enable row level security;

-- One-time carry-over from the old site_settings fields, so an already
-- configured Shiprocket pickup location isn't lost. Safe to re-run: only
-- inserts if no warehouse exists yet and the old fields were actually set.
insert into public.warehouses (name, address_line1, city, state, pincode)
select
  coalesce(nullif(s.shiprocket_pickup_location, ''), 'Primary Warehouse'),
  'Update this address',
  'Update this city',
  'Update this state',
  coalesce(nullif(s.shiprocket_pickup_pincode, ''), '000000')
from public.site_settings s
where s.id = 1
  and (nullif(s.shiprocket_pickup_location, '') is not null or nullif(s.shiprocket_pickup_pincode, '') is not null)
  and not exists (select 1 from public.warehouses);
