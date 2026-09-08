-- ============ CRM v1 additions ============
-- Paste this whole file once into Supabase SQL Editor. Safe to re-run.

-- ---- profiles.status ----
alter table public.profiles add column if not exists status text not null default 'active';

do $$
begin
  alter table public.profiles add constraint profiles_status_check check (status in ('active','inactive','blocked'));
exception when duplicate_object then null;
end $$;

create index if not exists idx_profiles_status on public.profiles(status);

-- ============ CUSTOMER NOTES ============
create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.customer_notes enable row level security;
create index if not exists idx_customer_notes_customer on public.customer_notes(customer_id, created_at desc);

-- ============ CUSTOMER ACTIVITIES ============
create table if not exists public.customer_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  activity_type text not null check (activity_type in (
    'customer_registered','order_placed','payment_completed','order_delivered','order_cancelled'
  )),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.customer_activities enable row level security;
create index if not exists idx_customer_activities_user on public.customer_activities(user_id, created_at desc);

-- ============ LEADS ============
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  status text not null default 'new' check (status in ('new','contacted','converted')),
  notes text,
  assigned_admin_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.leads enable row level security;
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created on public.leads(created_at desc);

-- ============ TAGS + CUSTOMER_TAGS ============
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
alter table public.tags enable row level security;

create table if not exists public.customer_tags (
  customer_id uuid not null references public.profiles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, tag_id)
);
alter table public.customer_tags enable row level security;
create index if not exists idx_customer_tags_tag on public.customer_tags(tag_id);

-- ============ SEGMENTATION SUPPORT: aggregate view ============
-- Raw per-customer order aggregates only. Segment *labels* (new/regular/vip/
-- inactive) are computed in JS from these numbers + profiles.created_at —
-- see src/lib/customer-segment.js — so thresholds can be tuned without
-- touching SQL.
create or replace view public.customer_order_stats as
select
  p.id as customer_id,
  count(o.id) filter (where o.payment_status = 'paid') as total_orders,
  coalesce(sum(o.total) filter (where o.payment_status = 'paid'), 0) as total_spent,
  max(o.created_at) filter (where o.payment_status = 'paid') as last_order_at
from public.profiles p
left join public.orders o on o.user_id = p.id
group by p.id;

-- ============ ACTIVITY LOGGING ON SIGNUP ============
-- Extends the existing trigger function (defined in schema.sql) so every
-- new auth.users row also gets a customer_registered activity row.
-- This is a full replace — must match the original body plus the new insert.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;

  insert into public.customer_activities (user_id, activity_type, metadata)
  values (new.id, 'customer_registered', '{}'::jsonb);

  return new;
end;
$$;
-- trigger on_auth_user_created already exists from schema.sql and points at
-- this function name, so no trigger re-creation is needed.
