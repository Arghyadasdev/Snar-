-- The real cause of "multiple images never show on the product page":
-- getProductImages() (src/lib/data/products.js) and the per-variant
-- gallery grouping in product-detail-client.js both select/read
-- product_images.variant_id — but that column was never actually added to
-- the table. Every read of product_images has been failing with
-- PostgREST error 42703 ("column does not exist") and silently returning
-- an empty array (`data || []`), so the gallery looked empty no matter
-- how many photos were uploaded through the admin.

alter table public.product_images
  add column if not exists variant_id uuid references public.product_variants(id) on delete cascade;
