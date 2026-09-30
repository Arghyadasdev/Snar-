-- Full Shiprocket per-order pipeline: AWB assignment, pickup request, and
-- label/invoice generation, in addition to the order-creation fields added
-- earlier. See src/lib/actions/shiprocket.js.
alter table public.orders add column if not exists shiprocket_label_url text;
alter table public.orders add column if not exists shiprocket_invoice_url text;
alter table public.orders add column if not exists shiprocket_pickup_status text;
