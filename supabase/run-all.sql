-- ======================================================================
-- FILE: schema.sql
-- ======================================================================
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


-- ======================================================================
-- FILE: seed-sportswear-categories.sql
-- ======================================================================
-- Sportswear as parent category, 14 types as its sub-categories.
-- Run AFTER schema.sql and seed-sportswear.sql, in Supabase SQL Editor.
-- Replaces the flat version of this file if you already ran an older copy.

alter table public.categories add column if not exists parent_id uuid references public.categories(id) on delete set null;

insert into public.categories (slug, name) values ('sportswear', 'Sportswear')
on conflict (slug) do nothing;

insert into public.categories (slug, name, parent_id)
select v.slug, v.name, p.id
from (values
  ('performance-polos', 'Performance Polos'),
  ('athletic-tshirts', 'Athletic T-Shirts'),
  ('gym-tshirts', 'Gym T-Shirts'),
  ('compression-shirts', 'Compression Shirts'),
  ('compression-tank-tops', 'Compression Tank Tops'),
  ('athletic-pants', 'Athletic Pants'),
  ('athletic-shorts', 'Athletic Shorts'),
  ('track-pants', 'Track Pants'),
  ('compression-pants', 'Compression Pants'),
  ('compression-shorts', 'Compression Shorts'),
  ('biker-shorts', 'Biker Shorts'),
  ('sports-bras', 'Sports Bras'),
  ('yoga-pants', 'Yoga Pants'),
  ('tights-leggings', 'Tights & Leggings')
) as v(slug, name)
cross join (select id from public.categories where slug = 'sportswear') as p
on conflict (slug) do update set parent_id = excluded.parent_id;

update public.products p
set category_id = c.id
from (values
  ('performance-polo', 'performance-polos'),
  ('athletic-tshirt', 'athletic-tshirts'),
  ('gym-tshirt', 'gym-tshirts'),
  ('compression-shirt', 'compression-shirts'),
  ('compression-tank-top', 'compression-tank-tops'),
  ('athletic-pants', 'athletic-pants'),
  ('athletic-shorts-2', 'athletic-shorts'),
  ('track-pants', 'track-pants'),
  ('compression-pants', 'compression-pants'),
  ('compression-shorts', 'compression-shorts'),
  ('biker-shorts', 'biker-shorts'),
  ('sports-bra', 'sports-bras'),
  ('yoga-pants', 'yoga-pants'),
  ('tights-leggings', 'tights-leggings')
) as map(product_slug, category_slug)
join public.categories c on c.slug = map.category_slug
where p.slug = map.product_slug;


-- ======================================================================
-- FILE: seed-sportswear.sql
-- ======================================================================
-- Additional products from "Type of Sportswear" reference sheet.
-- Run in Supabase SQL Editor -> New query -> Run (after schema.sql).
-- Safe to re-run: uses on conflict (slug) do nothing.

insert into public.products (slug, name, description, price, compare_at_price, category_id, image_url, sizes, stock)
select v.slug, v.name, v.description, v.price, v.compare_at_price, c.id, v.image_url, v.sizes::jsonb, v.stock
from (values
  ('performance-polo', 'Performance Polo', 'Polyester blend built for golf and tennis. Moisture-wicking with a professional appearance.', 1799, 2299, 'men', '/cat_tshirt.png', '["S","M","L","XL","XXL"]', 50),
  ('athletic-tshirt', 'Athletic T-Shirt', 'Cotton/polyester/spandex blend for boxing, sports, and general fitness. Breathable and lightweight.', 899, 1199, 'men', '/cat_tshirt.png', '["S","M","L","XL","XXL"]', 80),
  ('gym-tshirt', 'Gym T-Shirt', 'Polyester blend built for weight training. Stretch and durability where you need it.', 899, 1199, 'men', '/cat_tshirt.png', '["S","M","L","XL","XXL"]', 80),
  ('compression-shirt', 'Compression Shirt', 'Polyester, nylon, and spandex for powerlifting. Muscle support and faster recovery.', 1499, 1899, 'men', '/cat_tshirt.png', '["S","M","L","XL","XXL"]', 60),
  ('compression-tank-top', 'Compression Tank Top', 'Polyester and spandex for running and gym sessions. Cooling with unrestricted arm movement.', 1299, 1699, 'men', '/cat_tshirt.png', '["S","M","L","XL","XXL"]', 60),
  ('athletic-pants', 'Athletic Pants', 'Polyester, nylon, and spandex for outdoor training. Full mobility, less irritation.', 2199, 2799, 'men', '/cat_tracksuit.png', '["S","M","L","XL","XXL"]', 50),
  ('athletic-shorts-2', 'Athletic Shorts', 'Polyester and nylon for running and team sports. Breathable and lightweight.', 799, 1099, 'men', '/cat_shorts.png', '["S","M","L","XL"]', 70),
  ('track-pants', 'Track Pants', 'Polyester built for warm-ups and travel. Comfortable and quick drying.', 1899, 2399, 'men', '/cat_tracksuit.png', '["S","M","L","XL","XXL"]', 50),
  ('compression-pants', 'Compression Pants', 'Polyester, nylon, and spandex for recovery and powerlifting. Full compression support.', 1999, 2499, 'men', '/cat_tracksuit.png', '["S","M","L","XL","XXL"]', 40),
  ('compression-shorts', 'Compression Shorts', 'Polyester and spandex for gym and cycling. Muscle stabilization under load.', 999, 1299, 'men', '/cat_shorts.png', '["S","M","L","XL"]', 60),
  ('biker-shorts', 'Biker Shorts', 'Nylon, polyester, and spandex for cycling and yoga. Stretch with reduced chafing.', 999, 1299, 'women', '/cat_shorts.png', '["XS","S","M","L","XL"]', 60),
  ('sports-bra', 'Sports Bra', 'Polyester, nylon, and spandex built for women''s training. Impact support that lasts.', 1099, 1399, 'women', '/cat_accessories1.png', '["XS","S","M","L","XL"]', 60),
  ('yoga-pants', 'Yoga Pants', 'Polyester, nylon, and spandex for yoga and pilates. Four-way stretch.', 1799, 2199, 'women', '/cat_tracksuits.png', '["XS","S","M","L","XL"]', 50),
  ('tights-leggings', 'Tights & Leggings', 'Polyester, nylon, and spandex for running and stretching. Compression and flexibility.', 1599, 1999, 'women', '/cat_tracksuits.png', '["XS","S","M","L","XL"]', 50)
) as v(slug, name, description, price, compare_at_price, category_slug, image_url, sizes, stock)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do nothing;


-- ======================================================================
-- FILE: fix-place-paid-order.sql
-- ======================================================================
-- Fixes a bug in place_paid_order (and place_order): referencing a field of
-- an unassigned plpgsql `record` variable (v_coupon.id) throws "record
-- v_coupon is not assigned yet" whenever no coupon code is given, or the
-- code doesn't match any row. Rewritten to use FOUND + plain scalar
-- variables instead of touching record fields outside a guarded branch.

-- Also defensively ensures these columns exist: on the live DB, seed-advanced.sql's
-- ALTER TABLE for discount_amount/coupon_code had not actually been applied,
-- which made every place_paid_order call fail with "column discount_amount
-- of relation orders does not exist" and silently drop every paid order.
alter table public.orders add column if not exists discount_amount numeric(10,2) not null default 0;
alter table public.orders add column if not exists coupon_code text;

create or replace function public.place_paid_order(
  p_shipping jsonb,
  p_coupon_code text,
  p_razorpay_order_id text,
  p_razorpay_payment_id text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
  v_coupon_id uuid := null;
  v_coupon_final_code text := null;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true
      for update;

    if found then
      if v_coupon.discount_type = 'percent' then
        v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
      else
        v_discount := v_coupon.discount_value;
      end if;
      if v_discount > v_subtotal then
        v_discount := v_subtotal;
      end if;
      update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
      v_coupon_id := v_coupon.id;
      v_coupon_final_code := v_coupon.code;
    end if;
  end if;

  insert into public.orders (
    user_id, status, total, discount_amount, coupon_code,
    shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone,
    razorpay_order_id, razorpay_payment_id, payment_status
  ) values (
    v_user_id, 'processing', v_subtotal - v_discount, v_discount,
    v_coupon_final_code,
    p_shipping->>'name', p_shipping->>'address', p_shipping->>'city',
    p_shipping->>'state', p_shipping->>'zip', p_shipping->>'phone',
    p_razorpay_order_id, p_razorpay_payment_id, 'paid'
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

-- Same bug, same fix, for the older non-payment RPC (kept for potential
-- future COD flow — currently unused by the app, but shouldn't stay broken).
create or replace function public.place_order(p_shipping jsonb, p_coupon_code text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
  v_coupon_final_code text := null;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true
      for update;

    if not found then
      raise exception 'Invalid coupon code';
    end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'Coupon has expired';
    end if;
    if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
      raise exception 'Coupon usage limit reached';
    end if;
    if v_subtotal < v_coupon.min_order_amount then
      raise exception 'Order does not meet the minimum amount for this coupon';
    end if;

    if v_coupon.discount_type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
    else
      v_discount := v_coupon.discount_value;
    end if;
    if v_discount > v_subtotal then
      v_discount := v_subtotal;
    end if;

    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    v_coupon_final_code := v_coupon.code;
  end if;

  insert into public.orders (
    user_id, status, total, discount_amount, coupon_code,
    shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone
  ) values (
    v_user_id, 'pending', v_subtotal - v_discount, v_discount,
    v_coupon_final_code,
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


-- ======================================================================
-- FILE: fix-inventory.sql
-- ======================================================================
-- Adds stock validation + atomic decrement to both order-placement RPCs.
-- Previously stock was never touched on order placement (overselling risk).
-- Row lock (`for update of p`) prevents two concurrent orders from both
-- passing the stock check for the last unit of the same product.

create or replace function public.place_paid_order(
  p_shipping jsonb,
  p_coupon_code text,
  p_razorpay_order_id text,
  p_razorpay_payment_id text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
  v_coupon_id uuid := null;
  v_coupon_final_code text := null;
  v_short record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  -- Lock the product rows in the cart, then check stock before anything else.
  perform 1
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id
  for update of p;

  select p.name, p.stock, c.quantity into v_short
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id and p.stock < c.quantity
  limit 1;

  if found then
    raise exception 'Not enough stock for %: only % left', v_short.name, v_short.stock;
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true
      for update;

    if found then
      if v_coupon.discount_type = 'percent' then
        v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
      else
        v_discount := v_coupon.discount_value;
      end if;
      if v_discount > v_subtotal then
        v_discount := v_subtotal;
      end if;
      update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
      v_coupon_id := v_coupon.id;
      v_coupon_final_code := v_coupon.code;
    end if;
  end if;

  insert into public.orders (
    user_id, status, total, discount_amount, coupon_code,
    shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone,
    razorpay_order_id, razorpay_payment_id, payment_status
  ) values (
    v_user_id, 'processing', v_subtotal - v_discount, v_discount,
    v_coupon_final_code,
    p_shipping->>'name', p_shipping->>'address', p_shipping->>'city',
    p_shipping->>'state', p_shipping->>'zip', p_shipping->>'phone',
    p_razorpay_order_id, p_razorpay_payment_id, 'paid'
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, size)
  select v_order_id, p.id, p.name, p.price, c.quantity, c.size
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  update public.products p
  set stock = p.stock - c.quantity
  from public.cart_items c
  where c.product_id = p.id and c.user_id = v_user_id;

  delete from public.cart_items where user_id = v_user_id;

  return v_order_id;
end;
$$;

create or replace function public.place_order(p_shipping jsonb, p_coupon_code text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
  v_coupon_final_code text := null;
  v_short record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  perform 1
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id
  for update of p;

  select p.name, p.stock, c.quantity into v_short
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id and p.stock < c.quantity
  limit 1;

  if found then
    raise exception 'Not enough stock for %: only % left', v_short.name, v_short.stock;
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true
      for update;

    if not found then
      raise exception 'Invalid coupon code';
    end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'Coupon has expired';
    end if;
    if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
      raise exception 'Coupon usage limit reached';
    end if;
    if v_subtotal < v_coupon.min_order_amount then
      raise exception 'Order does not meet the minimum amount for this coupon';
    end if;

    if v_coupon.discount_type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
    else
      v_discount := v_coupon.discount_value;
    end if;
    if v_discount > v_subtotal then
      v_discount := v_subtotal;
    end if;

    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    v_coupon_final_code := v_coupon.code;
  end if;

  insert into public.orders (
    user_id, status, total, discount_amount, coupon_code,
    shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone
  ) values (
    v_user_id, 'pending', v_subtotal - v_discount, v_discount,
    v_coupon_final_code,
    p_shipping->>'name', p_shipping->>'address', p_shipping->>'city',
    p_shipping->>'state', p_shipping->>'zip', p_shipping->>'phone'
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, size)
  select v_order_id, p.id, p.name, p.price, c.quantity, c.size
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  update public.products p
  set stock = p.stock - c.quantity
  from public.cart_items c
  where c.product_id = p.id and c.user_id = v_user_id;

  delete from public.cart_items where user_id = v_user_id;

  return v_order_id;
end;
$$;


-- ======================================================================
-- FILE: add-product-details.sql
-- ======================================================================
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


-- ======================================================================
-- FILE: add-product-variants.sql
-- ======================================================================
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


-- ======================================================================
-- FILE: fix-reviews-unique.sql
-- ======================================================================
-- ON CONFLICT (product_id, user_id) needs a plain unique constraint as its
-- arbiter; a partial index (`where user_id is not null`) isn't inferable by
-- an unqualified ON CONFLICT target. A plain unique constraint works fine
-- here anyway: Postgres treats every NULL as distinct, so any number of
-- admin-authored reviews (user_id null) per product stay allowed, while
-- real customers are still capped at one review per product.

drop index if exists reviews_product_user_unique;
alter table public.reviews add constraint reviews_product_user_unique unique (product_id, user_id);


-- ======================================================================
-- FILE: seed-product-images.sql
-- ======================================================================
-- Extra gallery images per product (products.image_url stays the primary/thumbnail image).
-- Run in Supabase SQL Editor after schema.sql.

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.product_images enable row level security;

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images
  for select using (true);


-- ======================================================================
-- FILE: seed-homepage.sql
-- ======================================================================
-- Homepage content: admin-managed hero banners + promo marquee.
-- Run in Supabase SQL Editor after schema.sql.

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default '',
  headline_line1 text not null,
  headline_line2 text not null default '',
  accent_word text not null default '',
  subtitle text not null default '',
  cta1_label text not null default 'SHOP NOW',
  cta1_href text not null default '/collections',
  cta2_label text not null default '',
  cta2_href text not null default '',
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  media_url text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.banners enable row level security;

drop policy if exists "banners_public_read" on public.banners;
create policy "banners_public_read" on public.banners
  for select using (is_active = true);

create table if not exists public.marquee_items (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.marquee_items enable row level security;

drop policy if exists "marquee_public_read" on public.marquee_items;
create policy "marquee_public_read" on public.marquee_items
  for select using (is_active = true);

-- Seed with the site's existing hardcoded content so the homepage looks
-- unchanged until you edit it in /admin/homepage.
insert into public.banners (eyebrow, headline_line1, headline_line2, accent_word, subtitle, cta1_label, cta1_href, cta2_label, cta2_href, media_type, media_url, sort_order)
select * from (values
  ('PREMIUM SPORTSWEAR', 'IGNITE', 'YOUR', 'EDGE', 'Engineered for performance. Designed for champions.', 'SHOP NOW', '/collections', 'EXPLORE COLLECTION', '/collections', 'video', '/banner.mp4', 1),
  ('NEW COLLECTION 2026', 'PUSH', 'YOUR', 'LIMITS', 'Advanced fabric technology for elite performance.', 'SHOP NOW', '/collections', 'VIEW LOOKBOOK', '/collections', 'image', '/banner_1.png', 2),
  ('UP TO 30% OFF', 'SALE', 'NOW', 'LIVE', 'Selected items on sale. Grab yours before they''re gone.', 'SHOP SALE', '/collections', 'ALL PRODUCTS', '/collections', 'video', '/banner_2.mp4', 3)
) as v(eyebrow, headline_line1, headline_line2, accent_word, subtitle, cta1_label, cta1_href, cta2_label, cta2_href, media_type, media_url, sort_order)
where not exists (select 1 from public.banners);

insert into public.marquee_items (text, sort_order)
select * from (values
  ('PERFORMANCE', 1), ('ENGINEERED', 2), ('CHAMPIONS ONLY', 3), ('IGNITE YOUR EDGE', 4),
  ('PREMIUM SPORTSWEAR', 5), ('BUILT TO WIN', 6), ('PUSH YOUR LIMITS', 7), ('ELITE QUALITY', 8)
) as v(text, sort_order)
where not exists (select 1 from public.marquee_items);


-- ======================================================================
-- FILE: seed-advanced.sql
-- ======================================================================
-- Site settings, testimonials, stats, FAQs, coupons.
-- Run in Supabase SQL Editor after schema.sql.

-- ============ SITE SETTINGS (singleton row) ============
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text not null default '919875607634',
  instagram_url text not null default 'https://www.instagram.com/snarindia',
  facebook_url text not null default 'https://www.facebook.com/share/1Ku37nYEQW',
  contact_email text not null default 'info@snar.co.in',
  free_shipping_threshold numeric(10,2) not null default 999
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;
alter table public.site_settings enable row level security;
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings for select using (true);

-- ============ TESTIMONIALS ============
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text not null default '',
  location text not null default '',
  initials text not null default '',
  rating int not null default 5 check (rating between 1 and 5),
  product text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read" on public.testimonials for select using (is_active = true);

insert into public.testimonials (quote, name, role, location, initials, rating, product, sort_order)
select * from (values
  ('SNAR''s Performance Tee is unreal. Wore it through a brutal 90-minute training session and it kept me dry the entire time. The fabric feels premium without restricting movement.', 'Rahul Sharma', 'Professional Footballer', 'Mumbai', 'RS', 5, 'Performance Tee', 1),
  ('Finally found sportswear that actually lives up to its claims. The Elite Tracksuit fits perfectly and the material quality is on par with international brands — at half the price.', 'Priya Nair', 'Marathon Runner', 'Bangalore', 'PN', 5, 'Elite Tracksuit', 2),
  ('I''ve tried every major brand out there. SNAR hits different. The hoodie is warm but breathable — perfect for early morning runs when it''s cold. My go-to now.', 'Arjun Mehta', 'CrossFit Athlete', 'Delhi', 'AM', 5, 'Performance Hoodie', 3)
) as v(quote, name, role, location, initials, rating, product, sort_order)
where not exists (select 1 from public.testimonials);

-- ============ SITE STATS (4 fixed slots) ============
create table if not exists public.site_stats (
  slot text primary key check (slot in ('athletes', 'products', 'rating', 'satisfaction')),
  num text not null,
  label text not null
);
alter table public.site_stats enable row level security;
drop policy if exists "site_stats_public_read" on public.site_stats;
create policy "site_stats_public_read" on public.site_stats for select using (true);

insert into public.site_stats (slot, num, label) values
  ('athletes', '10K+', 'Athletes Trust SNAR'),
  ('products', '50+', 'Performance Products'),
  ('rating', '4.9★', 'Average Rating'),
  ('satisfaction', '99%', 'Satisfaction Rate')
on conflict (slot) do nothing;

-- ============ FAQS ============
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.faqs enable row level security;
drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read" on public.faqs for select using (is_active = true);

insert into public.faqs (question, answer, sort_order)
select * from (values
  ('How do I track my order?', 'Once your order ships, you''ll receive an email with a tracking link. Orders typically ship within 1–2 business days.', 1),
  ('What is your return policy?', 'We offer a 14-day return policy on all unworn, unwashed items with original tags attached.', 2),
  ('How long does delivery take?', 'Standard delivery takes 4–7 business days across India. Express delivery (2–3 days) is available at checkout.', 3),
  ('Do you offer free shipping?', 'Yes! Free shipping on all orders above ₹999. Orders below ₹999 incur a flat ₹79 shipping fee.', 4),
  ('How do I cancel or modify my order?', 'Orders can be cancelled or modified within 2 hours of placement. Contact us immediately via email.', 5),
  ('What payment methods do you accept?', 'We accept UPI, credit/debit cards, net banking, and wallets like Paytm and PhonePe.', 6)
) as v(question, answer, sort_order)
where not exists (select 1 from public.faqs);

-- ============ COUPONS ============
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10,2) not null,
  min_order_amount numeric(10,2) not null default 0,
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.coupons enable row level security;
-- No public read policy on purpose — codes are validated server-side only
-- (via place_order, which runs as security definer), never listed to clients.

-- ============ ORDERS: add discount tracking ============
alter table public.orders add column if not exists discount_amount numeric(10,2) not null default 0;
alter table public.orders add column if not exists coupon_code text;

-- ============ CHECKOUT: coupon-aware order placement ============
drop function if exists public.place_order(jsonb);

create or replace function public.place_order(p_shipping jsonb, p_coupon_code text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true
      for update;

    if v_coupon is null then
      raise exception 'Invalid coupon code';
    end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'Coupon has expired';
    end if;
    if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
      raise exception 'Coupon usage limit reached';
    end if;
    if v_subtotal < v_coupon.min_order_amount then
      raise exception 'Order does not meet the minimum amount for this coupon';
    end if;

    if v_coupon.discount_type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
    else
      v_discount := v_coupon.discount_value;
    end if;
    if v_discount > v_subtotal then
      v_discount := v_subtotal;
    end if;

    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  insert into public.orders (
    user_id, status, total, discount_amount, coupon_code,
    shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone
  ) values (
    v_user_id, 'pending', v_subtotal - v_discount, v_discount,
    case when v_coupon.id is not null then v_coupon.code else null end,
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


-- ======================================================================
-- FILE: seed-razorpay.sql
-- ======================================================================
-- Razorpay payment support: track payment on orders, preview cart totals
-- before charging, and place the order only after payment is verified.
-- Run in Supabase SQL Editor after schema.sql and seed-advanced.sql.

alter table public.orders add column if not exists razorpay_order_id text;
alter table public.orders add column if not exists razorpay_payment_id text;
alter table public.orders add column if not exists payment_status text not null default 'unpaid'
  check (payment_status in ('unpaid', 'paid', 'failed'));

-- ============ PREVIEW: subtotal/discount/total before payment ============
create or replace function public.preview_cart_total(p_coupon_code text default null)
returns table (subtotal numeric, discount numeric, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true;

    if not found then
      raise exception 'Invalid coupon code';
    end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'Coupon has expired';
    end if;
    if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
      raise exception 'Coupon usage limit reached';
    end if;
    if v_subtotal < v_coupon.min_order_amount then
      raise exception 'Order does not meet the minimum amount for this coupon';
    end if;

    if v_coupon.discount_type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
    else
      v_discount := v_coupon.discount_value;
    end if;
    if v_discount > v_subtotal then
      v_discount := v_subtotal;
    end if;
  end if;

  return query select v_subtotal, v_discount, v_subtotal - v_discount;
end;
$$;

-- ============ PLACE ORDER (post-payment) ============
-- Same logic as place_order, but records the Razorpay payment and marks
-- the order paid. Call this only after verifying the payment signature
-- server-side (never trust the client here).
create or replace function public.place_paid_order(
  p_shipping jsonb,
  p_coupon_code text,
  p_razorpay_order_id text,
  p_razorpay_payment_id text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true
      for update;

    if v_coupon.id is not null then
      if v_coupon.discount_type = 'percent' then
        v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
      else
        v_discount := v_coupon.discount_value;
      end if;
      if v_discount > v_subtotal then
        v_discount := v_subtotal;
      end if;
      update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    end if;
  end if;

  insert into public.orders (
    user_id, status, total, discount_amount, coupon_code,
    shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone,
    razorpay_order_id, razorpay_payment_id, payment_status
  ) values (
    v_user_id, 'processing', v_subtotal - v_discount, v_discount,
    case when v_coupon.id is not null then v_coupon.code else null end,
    p_shipping->>'name', p_shipping->>'address', p_shipping->>'city',
    p_shipping->>'state', p_shipping->>'zip', p_shipping->>'phone',
    p_razorpay_order_id, p_razorpay_payment_id, 'paid'
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


-- ======================================================================
-- FILE: fix-variants-stock.sql
-- ======================================================================
-- Extends stock validation/decrement to color variants: when a cart item
-- has a variant_id, its stock (not the parent product's) is the source of
-- truth. Locks products and product_variants separately since FOR UPDATE
-- can't reliably target the nullable side of a LEFT JOIN.

create or replace function public.preview_cart_total(p_coupon_code text default null)
returns table (subtotal numeric, discount numeric, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
  v_short record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  select p.name, coalesce(v.stock, p.stock) as available, c.quantity into v_short
  from public.cart_items c
  join public.products p on p.id = c.product_id
  left join public.product_variants v on v.id = c.variant_id
  where c.user_id = v_user_id and coalesce(v.stock, p.stock) < c.quantity
  limit 1;

  if found then
    raise exception 'Not enough stock for %: only % left', v_short.name, v_short.available;
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true;

    if not found then
      raise exception 'Invalid coupon code';
    end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'Coupon has expired';
    end if;
    if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
      raise exception 'Coupon usage limit reached';
    end if;
    if v_subtotal < v_coupon.min_order_amount then
      raise exception 'Order does not meet the minimum amount for this coupon';
    end if;

    if v_coupon.discount_type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
    else
      v_discount := v_coupon.discount_value;
    end if;
    if v_discount > v_subtotal then
      v_discount := v_subtotal;
    end if;
  end if;

  return query select v_subtotal, v_discount, v_subtotal - v_discount;
end;
$$;

create or replace function public.place_paid_order(
  p_shipping jsonb,
  p_coupon_code text,
  p_razorpay_order_id text,
  p_razorpay_payment_id text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
  v_coupon_id uuid := null;
  v_coupon_final_code text := null;
  v_short record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  perform 1
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id
  for update of p;

  perform 1
  from public.cart_items c
  join public.product_variants v on v.id = c.variant_id
  where c.user_id = v_user_id
  for update of v;

  select p.name, coalesce(v.stock, p.stock) as available, c.quantity into v_short
  from public.cart_items c
  join public.products p on p.id = c.product_id
  left join public.product_variants v on v.id = c.variant_id
  where c.user_id = v_user_id and coalesce(v.stock, p.stock) < c.quantity
  limit 1;

  if found then
    raise exception 'Not enough stock for %: only % left', v_short.name, v_short.available;
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true
      for update;

    if found then
      if v_coupon.discount_type = 'percent' then
        v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
      else
        v_discount := v_coupon.discount_value;
      end if;
      if v_discount > v_subtotal then
        v_discount := v_subtotal;
      end if;
      update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
      v_coupon_id := v_coupon.id;
      v_coupon_final_code := v_coupon.code;
    end if;
  end if;

  insert into public.orders (
    user_id, status, total, discount_amount, coupon_code,
    shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone,
    razorpay_order_id, razorpay_payment_id, payment_status
  ) values (
    v_user_id, 'processing', v_subtotal - v_discount, v_discount,
    v_coupon_final_code,
    p_shipping->>'name', p_shipping->>'address', p_shipping->>'city',
    p_shipping->>'state', p_shipping->>'zip', p_shipping->>'phone',
    p_razorpay_order_id, p_razorpay_payment_id, 'paid'
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, size, variant_id, color_name)
  select v_order_id, p.id, p.name, p.price, c.quantity, c.size, c.variant_id, v.color_name
  from public.cart_items c
  join public.products p on p.id = c.product_id
  left join public.product_variants v on v.id = c.variant_id
  where c.user_id = v_user_id;

  update public.products p
  set stock = p.stock - c.quantity
  from public.cart_items c
  where c.product_id = p.id and c.user_id = v_user_id and c.variant_id is null;

  update public.product_variants v
  set stock = v.stock - c.quantity
  from public.cart_items c
  where c.variant_id = v.id and c.user_id = v_user_id;

  delete from public.cart_items where user_id = v_user_id;

  return v_order_id;
end;
$$;

create or replace function public.place_order(p_shipping jsonb, p_coupon_code text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
  v_coupon_final_code text := null;
  v_short record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  perform 1
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id
  for update of p;

  perform 1
  from public.cart_items c
  join public.product_variants v on v.id = c.variant_id
  where c.user_id = v_user_id
  for update of v;

  select p.name, coalesce(v.stock, p.stock) as available, c.quantity into v_short
  from public.cart_items c
  join public.products p on p.id = c.product_id
  left join public.product_variants v on v.id = c.variant_id
  where c.user_id = v_user_id and coalesce(v.stock, p.stock) < c.quantity
  limit 1;

  if found then
    raise exception 'Not enough stock for %: only % left', v_short.name, v_short.available;
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true
      for update;

    if not found then
      raise exception 'Invalid coupon code';
    end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'Coupon has expired';
    end if;
    if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
      raise exception 'Coupon usage limit reached';
    end if;
    if v_subtotal < v_coupon.min_order_amount then
      raise exception 'Order does not meet the minimum amount for this coupon';
    end if;

    if v_coupon.discount_type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
    else
      v_discount := v_coupon.discount_value;
    end if;
    if v_discount > v_subtotal then
      v_discount := v_subtotal;
    end if;

    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    v_coupon_final_code := v_coupon.code;
  end if;

  insert into public.orders (
    user_id, status, total, discount_amount, coupon_code,
    shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone
  ) values (
    v_user_id, 'pending', v_subtotal - v_discount, v_discount,
    v_coupon_final_code,
    p_shipping->>'name', p_shipping->>'address', p_shipping->>'city',
    p_shipping->>'state', p_shipping->>'zip', p_shipping->>'phone'
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, size, variant_id, color_name)
  select v_order_id, p.id, p.name, p.price, c.quantity, c.size, c.variant_id, v.color_name
  from public.cart_items c
  join public.products p on p.id = c.product_id
  left join public.product_variants v on v.id = c.variant_id
  where c.user_id = v_user_id;

  update public.products p
  set stock = p.stock - c.quantity
  from public.cart_items c
  where c.product_id = p.id and c.user_id = v_user_id and c.variant_id is null;

  update public.product_variants v
  set stock = v.stock - c.quantity
  from public.cart_items c
  where c.variant_id = v.id and c.user_id = v_user_id;

  delete from public.cart_items where user_id = v_user_id;

  return v_order_id;
end;
$$;


-- ======================================================================
-- FILE: fix-inventory-precheck.sql
-- ======================================================================
-- preview_cart_total runs BEFORE the Razorpay order/payment is created.
-- Without a stock check here, a customer could pay for an item that's out
-- of stock and only find out after money moved (place_paid_order's stock
-- check runs post-payment as the last line of defense, not the primary gate).

create or replace function public.preview_cart_total(p_coupon_code text default null)
returns table (subtotal numeric, discount numeric, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon record;
  v_short record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(p.price * c.quantity), 0) into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  select p.name, p.stock, c.quantity into v_short
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user_id and p.stock < c.quantity
  limit 1;

  if found then
    raise exception 'Not enough stock for %: only % left', v_short.name, v_short.stock;
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) and is_active = true;

    if not found then
      raise exception 'Invalid coupon code';
    end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'Coupon has expired';
    end if;
    if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
      raise exception 'Coupon usage limit reached';
    end if;
    if v_subtotal < v_coupon.min_order_amount then
      raise exception 'Order does not meet the minimum amount for this coupon';
    end if;

    if v_coupon.discount_type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
    else
      v_discount := v_coupon.discount_value;
    end if;
    if v_discount > v_subtotal then
      v_discount := v_subtotal;
    end if;
  end if;

  return query select v_subtotal, v_discount, v_subtotal - v_discount;
end;
$$;


-- ======================================================================
-- FILE: add-crm.sql
-- ======================================================================
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


-- ======================================================================
-- FILE: add-shiprocket.sql
-- ======================================================================
-- Shiprocket integration: stores the shipment reference Shiprocket returns
-- when we create an order with them, plus the live tracking fields their
-- webhook (or an admin resync) updates as the shipment moves.
alter table public.orders add column if not exists shiprocket_order_id text;
alter table public.orders add column if not exists shiprocket_shipment_id text;
alter table public.orders add column if not exists awb_code text;
alter table public.orders add column if not exists courier_name text;
alter table public.orders add column if not exists shiprocket_status text;


-- ======================================================================
-- FILE: add-shiprocket-settings.sql
-- ======================================================================
-- Lets an admin enter Shiprocket credentials from the Settings page instead
-- of an env var + redeploy. lib/shiprocket.js falls back to the
-- SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD / SHIPROCKET_PICKUP_LOCATION env
-- vars whenever these columns are empty.
alter table public.site_settings add column if not exists shiprocket_email text not null default '';
alter table public.site_settings add column if not exists shiprocket_password text not null default '';
alter table public.site_settings add column if not exists shiprocket_pickup_location text not null default '';


-- ======================================================================
-- FILE: add-crm-v2.sql
-- ======================================================================
-- CRM v2: lead-to-customer conversion link.
-- Set automatically when a lead's status flips to 'converted' and its email
-- matches an existing profile (see updateLeadStatus/updateLead in
-- src/lib/actions/admin-leads.js). Nullable — not every converted lead will
-- match an account (e.g. signed up with a different email).
alter table public.leads add column if not exists converted_customer_id uuid references public.profiles(id) on delete set null;
create index if not exists idx_leads_converted_customer on public.leads(converted_customer_id);


-- ======================================================================
-- FILE: add-wishlist.sql
-- ======================================================================
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


-- ======================================================================
-- FILE: add-returns.sql
-- ======================================================================
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


-- ======================================================================
-- FILE: add-shiprocket-pipeline.sql
-- ======================================================================
-- Full Shiprocket per-order pipeline: AWB assignment, pickup request, and
-- label/invoice generation, in addition to the order-creation fields added
-- earlier. See src/lib/actions/shiprocket.js.
alter table public.orders add column if not exists shiprocket_label_url text;
alter table public.orders add column if not exists shiprocket_invoice_url text;
alter table public.orders add column if not exists shiprocket_pickup_status text;


-- ======================================================================
-- FILE: add-admin-activity-log.sql
-- ======================================================================
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


-- ======================================================================
-- FILE: add-advanced-features.sql
-- ======================================================================
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


-- ======================================================================
-- FILE: add-warehouse.sql
-- ======================================================================
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


