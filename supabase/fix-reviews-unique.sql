-- ON CONFLICT (product_id, user_id) needs a plain unique constraint as its
-- arbiter; a partial index (`where user_id is not null`) isn't inferable by
-- an unqualified ON CONFLICT target. A plain unique constraint works fine
-- here anyway: Postgres treats every NULL as distinct, so any number of
-- admin-authored reviews (user_id null) per product stay allowed, while
-- real customers are still capped at one review per product.

drop index if exists reviews_product_user_unique;
alter table public.reviews add constraint reviews_product_user_unique unique (product_id, user_id);
