-- Return/refund requests. Customer requests a return on a delivered order;
-- admin approves (triggers a Razorpay refund for the full order total) or
-- rejects. See src/lib/actions/returns.js.
create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  status text not null default 'requested' check (status in ('requested','approved','rejected','refunded')),
  refund_amount numeric(10,2),
  razorpay_refund_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.return_requests enable row level security;

drop policy if exists "return_owner_select" on public.return_requests;
create policy "return_owner_select" on public.return_requests
  for select using (auth.uid() = user_id);

drop policy if exists "return_owner_insert" on public.return_requests;
create policy "return_owner_insert" on public.return_requests
  for insert with check (auth.uid() = user_id);

create index if not exists idx_return_requests_order on public.return_requests(order_id);
create index if not exists idx_return_requests_status on public.return_requests(status);
