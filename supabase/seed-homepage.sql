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
