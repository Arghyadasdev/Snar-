-- Admin activity/audit log. Only written and read via the service-role
-- client in src/lib/actions/admin-activity.js, so no public RLS policies
-- are needed beyond enabling the table.
create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  admin_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_activity_log enable row level security;

create index if not exists idx_admin_activity_created on public.admin_activity_log(created_at desc);
