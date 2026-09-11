-- Shiprocket integration: stores the shipment reference Shiprocket returns
-- when we create an order with them, plus the live tracking fields their
-- webhook (or an admin resync) updates as the shipment moves.
alter table public.orders add column if not exists shiprocket_order_id text;
alter table public.orders add column if not exists shiprocket_shipment_id text;
alter table public.orders add column if not exists awb_code text;
alter table public.orders add column if not exists courier_name text;
alter table public.orders add column if not exists shiprocket_status text;
