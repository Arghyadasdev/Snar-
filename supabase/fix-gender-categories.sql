-- Fixes the Men/Women/Accessories/Collections nav: those pages
-- (src/app/men, /women, /accessories) look for a top-level category with
-- that exact slug, but no such category existed — every garment type
-- (round-neck-tshirt, polo-tshirt, shorts, bags, caps, ...) had been
-- created as its own top-level category instead of a sub-category. That
-- made /men and /women always empty, and the site's "4 main categories"
-- didn't exist at all.
--
-- This seeds the 4 fixed main categories and re-parents every existing
-- top-level category under one of them, so no existing product/category
-- link breaks. Safe to re-run.

insert into public.categories (slug, name, parent_id) values
  ('men', 'Men', null),
  ('women', 'Women', null),
  ('accessories', 'Accessories', null),
  ('collections', 'Collections', null)
on conflict (slug) do nothing;

-- Accessories: bags, caps.
update public.categories c
set parent_id = (select id from public.categories where slug = 'accessories')
where c.slug in ('bags', 'caps') and c.parent_id is null;

-- Everything else that was sitting at the top level is a garment type
-- currently only used by men's products (see products.name) — parked
-- under Men so nothing disappears. Use Admin → Categories to create the
-- matching Women's sub-category (e.g. "Women's Round Neck T-Shirt") and
-- re-assign products there once women's stock exists.
update public.categories c
set parent_id = (select id from public.categories where slug = 'men')
where c.parent_id is null
  and c.slug not in ('men', 'women', 'accessories', 'collections');
