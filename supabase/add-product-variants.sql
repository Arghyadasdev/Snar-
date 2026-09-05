-- Color variants (Flipkart-style swatches). Each variant has its own photo
-- and its own stock; price stays per-product (matches the reference UI,
-- which shows one price regardless of which color swatch is selected).

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_name text not null,
  image_url text not null,
  stock int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.product_variants enable row level security;

drop policy if exists "variants_public_read" on public.product_variants;
create policy "variants_public_read" on public.product_variants
  for select using (true);

-- Cart items and order items now optionally reference a variant. NULL means
-- "no color chosen" (product has no variants, or predates this feature).
alter table public.cart_items add column if not exists variant_id uuid references public.product_variants(id) on delete cascade;

alter table public.cart_items drop constraint if exists cart_items_user_id_product_id_size_key;
alter table public.cart_items add constraint cart_items_user_product_size_variant_key
  unique (user_id, product_id, size, variant_id);

alter table public.order_items add column if not exists variant_id uuid references public.product_variants(id) on delete set null;
alter table public.order_items add column if not exists color_name text;
