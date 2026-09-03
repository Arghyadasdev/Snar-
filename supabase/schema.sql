-- SNAR e-commerce schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run: uses "if not exists" / "or replace" where possible.

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- auto-create a profile row whenever a new auth user signs up
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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ CATEGORIES ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

alter table public.categories enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (true);

-- ============ PRODUCTS ============
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  category_id uuid references public.categories(id) on delete set null,
  image_url text not null,
  sizes jsonb not null default '[]'::jsonb,
  stock int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (is_active = true);

-- ============ CART ============
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null default '',
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, size)
);

alter table public.cart_items enable row level security;

drop policy if exists "cart_items_owner_all" on public.cart_items;
create policy "cart_items_owner_all" on public.cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ ORDERS ============
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled')),
  total numeric(10,2) not null,
  shipping_name text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_zip text not null,
  shipping_phone text not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "orders_owner_select" on public.orders;
create policy "orders_owner_select" on public.orders
  for select using (auth.uid() = user_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null,
  size text not null default ''
);

alter table public.order_items enable row level security;

drop policy if exists "order_items_owner_select" on public.order_items;
create policy "order_items_owner_select" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- ============ CHECKOUT (atomic order creation) ============
create or replace function public.place_order(p_shipping jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_total numeric;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_total
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_total = 0 then
    raise exception 'Cart is empty';
  end if;

  insert into public.orders (
    user_id, status, total,
    shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone
  ) values (
    v_user_id, 'pending', v_total,
    p_shipping->>'name', p_shipping->>'address', p_shipping->>'city',
    p_shipping->>'state', p_shipping->>'zip', p_shipping->>'phone'
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, size)
  select v_order_id, p.id, p.name, p.price, c.quantity, c.size
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  delete from public.cart_items where user_id = v_user_id;

  return v_order_id;
end;
$$;

-- ============ SEED DATA ============
insert into public.categories (slug, name) values
  ('men', 'Men'),
  ('women', 'Women'),
  ('accessories', 'Accessories')
on conflict (slug) do nothing;

insert into public.products (slug, name, description, price, compare_at_price, category_id, image_url, sizes, stock)
select v.slug, v.name, v.description, v.price, v.compare_at_price, c.id, v.image_url, v.sizes::jsonb, v.stock
from (values
  ('mens-performance-tracksuit', 'Men''s Performance Tracksuit', 'Four-way stretch tracksuit engineered for training and recovery.', 3499, 4499, 'men', '/cat_tracksuit.png', '["S","M","L","XL","XXL"]', 40),
  ('mens-elite-hoodie', 'Men''s Elite Hoodie', 'Warm, breathable hoodie built for cold-weather sessions.', 2199, 2799, 'men', '/cat_hoodie.png', '["S","M","L","XL","XXL"]', 60),
  ('mens-training-tee', 'Men''s Training Tee', 'Sweat-wicking performance tee for everyday training.', 999, 1299, 'men', '/cat_tshirt.png', '["S","M","L","XL","XXL"]', 100),
  ('mens-flex-shorts', 'Men''s Flex Shorts', 'Lightweight shorts with four-way stretch for full range of motion.', 899, 1199, 'men', '/cat_shorts.png', '["S","M","L","XL"]', 80),
  ('womens-performance-tracksuit', 'Women''s Performance Tracksuit', 'Four-way stretch tracksuit designed for elite performance.', 3499, 4499, 'women', '/cat_tracksuits.png', '["XS","S","M","L","XL"]', 40),
  ('womens-elite-hoodie', 'Women''s Elite Hoodie', 'Warm, breathable hoodie built for cold-weather sessions.', 2199, 2799, 'women', '/cat_hoodie.png', '["XS","S","M","L","XL"]', 60),
  ('womens-training-tee', 'Women''s Training Tee', 'Sweat-wicking performance tee for everyday training.', 999, 1299, 'women', '/cat_tshirt.png', '["XS","S","M","L","XL"]', 100),
  ('womens-flex-shorts', 'Women''s Flex Shorts', 'Lightweight shorts with four-way stretch for full range of motion.', 899, 1199, 'women', '/cat_shorts.png', '["XS","S","M","L"]', 80),
  ('performance-gym-bag', 'Performance Gym Bag', 'Durable, water-resistant gym bag with dedicated shoe compartment.', 1499, 1899, 'accessories', '/cat_accessories.png', '["One Size"]', 50),
  ('training-cap', 'Training Cap', 'Breathable mesh-back cap for training in the sun.', 599, 799, 'accessories', '/cat_accessories1.png', '["One Size"]', 70)
) as v(slug, name, description, price, compare_at_price, category_slug, image_url, sizes, stock)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do nothing;

-- ============ MAKE YOURSELF ADMIN ============
-- Sign up on the site first with this email, THEN run this statement again
-- (or run it any time after — it's safe to re-run):
update public.profiles set role = 'admin' where email = 'teams.nxtgenservices@gmail.com';
