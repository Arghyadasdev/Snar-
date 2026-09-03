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
