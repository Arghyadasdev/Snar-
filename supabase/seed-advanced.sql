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
