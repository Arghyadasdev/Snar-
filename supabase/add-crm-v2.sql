-- CRM v2: lead-to-customer conversion link.
-- Set automatically when a lead's status flips to 'converted' and its email
-- matches an existing profile (see updateLeadStatus/updateLead in
-- src/lib/actions/admin-leads.js). Nullable — not every converted lead will
-- match an account (e.g. signed up with a different email).
alter table public.leads add column if not exists converted_customer_id uuid references public.profiles(id) on delete set null;
create index if not exists idx_leads_converted_customer on public.leads(converted_customer_id);
