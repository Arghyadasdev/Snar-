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
