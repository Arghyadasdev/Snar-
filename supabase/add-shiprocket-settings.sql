-- Lets an admin enter Shiprocket credentials from the Settings page instead
-- of an env var + redeploy. lib/shiprocket.js falls back to the
-- SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD / SHIPROCKET_PICKUP_LOCATION env
-- vars whenever these columns are empty.
alter table public.site_settings add column if not exists shiprocket_email text not null default '';
alter table public.site_settings add column if not exists shiprocket_password text not null default '';
alter table public.site_settings add column if not exists shiprocket_pickup_location text not null default '';
