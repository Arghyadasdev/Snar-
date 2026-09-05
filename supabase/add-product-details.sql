-- Product spec table (flexible label/value rows, admin-editable) and a
-- reviews system: admin can add curated reviews, logged-in customers can
-- add their own (one per product), admin moderates via is_approved.

alter table public.products add column if not exists specifications jsonb not null default '[]'::jsonb;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  review_text text not null default '',
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists reviews_product_user_unique
  on public.reviews(product_id, user_id) where user_id is not null;

alter table public.reviews enable row level security;

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (is_approved = true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete using (auth.uid() = user_id);
