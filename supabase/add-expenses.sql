-- Business expense tracking (operating costs — rent, ads, supplies — not
-- customer orders/invoices, which are a separate module). Mirrors Zoho
-- Books' Expenses: categories, vendors, a draft->submitted->approved->paid
-- workflow, and recurring templates that generate expenses on schedule.

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.expense_categories enable row level security;

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  gstin text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);
alter table public.vendors enable row level security;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  category_id uuid references public.expense_categories(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  amount numeric(10,2) not null,
  tax_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null,
  payment_method text not null default 'bank_transfer' check (payment_method in ('cash','bank_transfer','card','upi','cheque','other')),
  reference_number text not null default '',
  description text not null default '',
  status text not null default 'draft' check (status in ('draft','submitted','approved','rejected','paid')),
  receipt_url text,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.expenses enable row level security;
create index if not exists idx_expenses_date on public.expenses(expense_date desc);
create index if not exists idx_expenses_status on public.expenses(status);
create index if not exists idx_expenses_category on public.expenses(category_id);

create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.expense_categories(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  amount numeric(10,2) not null,
  description text not null default '',
  payment_method text not null default 'bank_transfer' check (payment_method in ('cash','bank_transfer','card','upi','cheque','other')),
  frequency text not null check (frequency in ('weekly','monthly','yearly')),
  next_run_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.recurring_expenses enable row level security;

insert into public.expense_categories (name) values
  ('Rent'), ('Utilities'), ('Marketing & Ads'), ('Office Supplies'),
  ('Packaging'), ('Salaries'), ('Software & Subscriptions'), ('Shipping & Logistics'), ('Other')
on conflict (name) do nothing;
