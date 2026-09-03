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
