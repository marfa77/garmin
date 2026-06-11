-- Waitlist for $10/mo launch notification (no payment yet)

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'en' check (locale in ('en', 'ru')),
  price_usd integer not null default 10,
  source text not null default 'landing',
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  constraint waitlist_signups_email_key unique (email)
);

create index if not exists waitlist_signups_created_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

-- No public policies — inserts via service role API only
