-- Wishlist. Was previously just a local useState toggle on the product page
-- that reset on every reload — this persists it per user.
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlist_items enable row level security;

drop policy if exists "wishlist_owner_all" on public.wishlist_items;
create policy "wishlist_owner_all" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_wishlist_user on public.wishlist_items(user_id, created_at desc);
