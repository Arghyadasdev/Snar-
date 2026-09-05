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
