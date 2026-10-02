-- GST invoice generation: SKU/HSN on products (snapshotted onto order_items
-- at purchase time so invoices stay accurate even if a product's SKU/HSN
-- changes later), seller GST details on site_settings, GST computation +
-- sequential invoice numbering on orders.

alter table public.products add column if not exists sku text;
alter table public.products add column if not exists hsn_code text;
alter table public.products add column if not exists gst_rate numeric(5,2);
create unique index if not exists idx_products_sku on public.products(sku) where sku is not null;

alter table public.order_items add column if not exists sku text;
alter table public.order_items add column if not exists hsn_code text;

alter table public.orders add column if not exists invoice_number text;
alter table public.orders add column if not exists invoice_date timestamptz;
alter table public.orders add column if not exists gst_type text check (gst_type in ('intra','inter'));
alter table public.orders add column if not exists gst_rate numeric(5,2);
alter table public.orders add column if not exists taxable_amount numeric(10,2);
alter table public.orders add column if not exists tax_amount numeric(10,2);
alter table public.orders add column if not exists cgst_amount numeric(10,2);
alter table public.orders add column if not exists sgst_amount numeric(10,2);
alter table public.orders add column if not exists igst_amount numeric(10,2);
create unique index if not exists idx_orders_invoice_number on public.orders(invoice_number) where invoice_number is not null;

alter table public.site_settings add column if not exists seller_business_name text not null default '';
alter table public.site_settings add column if not exists seller_gstin text not null default '';
alter table public.site_settings add column if not exists seller_pan text not null default '';
alter table public.site_settings add column if not exists seller_address text not null default '';
alter table public.site_settings add column if not exists seller_state text not null default '';
alter table public.site_settings add column if not exists gst_rate_percent numeric(5,2) not null default 12;

-- Sequential, per-financial-year invoice numbers (INV/2026-27/000001). The
-- upsert's row lock makes the increment atomic under concurrent orders.
create table if not exists public.invoice_sequences (
  fy text primary key,
  last_number int not null default 0
);
alter table public.invoice_sequences enable row level security;

create or replace function public.next_invoice_number(p_fy text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num int;
begin
  insert into public.invoice_sequences (fy, last_number) values (p_fy, 1)
  on conflict (fy) do update set last_number = invoice_sequences.last_number + 1
  returning last_number into v_num;
  return v_num;
end;
$$;

-- Snapshot sku/hsn_code onto order_items at purchase time. Same body as
-- fix-place-paid-order.sql's place_paid_order, plus the two new columns.
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

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, size, variant_id, color_name, sku, hsn_code)
  select v_order_id, p.id, p.name, p.price, c.quantity, c.size, c.variant_id, v.color_name, p.sku, p.hsn_code
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
