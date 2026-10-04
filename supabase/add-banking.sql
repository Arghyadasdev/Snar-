-- Banking: bank/cash accounts and manually-entered transactions, with a
-- reconciled flag (admin confirms a transaction matches the real bank
-- statement line) rather than automated statement-import matching, which
-- would need a bank-feed integration this app doesn't have.
create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_type text not null default 'bank' check (account_type in ('bank','cash','wallet')),
  bank_name text not null default '',
  account_number text not null default '',
  ifsc_code text not null default '',
  opening_balance numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.bank_accounts enable row level security;

create table if not exists public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.bank_accounts(id) on delete cascade,
  txn_date date not null default current_date,
  type text not null check (type in ('credit','debit')),
  amount numeric(12,2) not null,
  description text not null default '',
  reference_number text not null default '',
  reconciled boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.bank_transactions enable row level security;
create index if not exists idx_bank_transactions_account on public.bank_transactions(account_id, txn_date desc);

create or replace view public.bank_account_balances as
select
  a.id as account_id,
  a.opening_balance + coalesce(sum(case when t.type = 'credit' then t.amount else -t.amount end), 0) as current_balance
from public.bank_accounts a
left join public.bank_transactions t on t.account_id = a.id
group by a.id, a.opening_balance;
