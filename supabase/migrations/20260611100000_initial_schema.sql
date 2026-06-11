-- Garmin Wellness SaaS — initial schema
-- Auth: Supabase magic link (auth.users)
-- Billing: Gumroad webhooks
-- Data: per-user Garmin tokens + dashboard snapshots

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  locale text not null default 'ru' check (locale in ('en', 'ru')),
  coach_persona text not null default 'caring' check (coach_persona in ('caring', 'sarcastic')),
  onboarding_step text not null default 'signup'
    check (onboarding_step in ('signup', 'subscribe', 'connect_garmin', 'ready')),
  gumroad_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);

-- ---------------------------------------------------------------------------
-- subscriptions (Gumroad)
-- ---------------------------------------------------------------------------
create type public.subscription_status as enum (
  'active',
  'cancelled',
  'ended',
  'refunded',
  'disputed'
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  gumroad_sale_id text not null,
  gumroad_subscription_id text,
  gumroad_product_id text,
  gumroad_product_permalink text,
  purchaser_email text not null,
  status public.subscription_status not null default 'active',
  access_granted boolean not null default true,
  price_cents integer,
  currency text default 'usd',
  purchased_at timestamptz not null default now(),
  cancelled_at timestamptz,
  ends_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_gumroad_sale_id_key unique (gumroad_sale_id)
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_purchaser_email_idx on public.subscriptions (purchaser_email);
create index subscriptions_status_idx on public.subscriptions (status);

-- ---------------------------------------------------------------------------
-- gumroad webhook audit log
-- ---------------------------------------------------------------------------
create table public.gumroad_webhook_events (
  id uuid primary key default gen_random_uuid(),
  gumroad_sale_id text,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create unique index gumroad_webhook_events_sale_event_key
  on public.gumroad_webhook_events (gumroad_sale_id, event_type)
  where gumroad_sale_id is not null;

-- ---------------------------------------------------------------------------
-- garmin_connections — server-side only (no client SELECT on token_blob)
-- ---------------------------------------------------------------------------
create table public.garmin_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  garmin_email text,
  token_blob text not null,
  token_version integer not null default 1,
  last_login_at timestamptz,
  last_sync_at timestamptz,
  last_sync_status text check (last_sync_status in ('ok', 'mfa_required', 'failed')),
  last_sync_error text,
  mfa_pending boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- dashboard_snapshots — latest wellness JSON per sync
-- ---------------------------------------------------------------------------
create table public.dashboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  synced_at timestamptz not null,
  device text,
  source text not null default 'garmin',
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index dashboard_snapshots_user_synced_idx
  on public.dashboard_snapshots (user_id, synced_at desc);

-- ---------------------------------------------------------------------------
-- sync_jobs — optional queue for async Garmin sync
-- ---------------------------------------------------------------------------
create table public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'completed', 'failed')),
  triggered_by text not null default 'user',
  started_at timestamptz,
  finished_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create index sync_jobs_user_created_idx on public.sync_jobs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
create or replace function public.has_active_subscription(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscriptions s
    where s.user_id = uid
      and s.access_granted = true
      and s.status = 'active'
      and (s.ends_at is null or s.ends_at > now())
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

create trigger garmin_connections_touch_updated_at
  before update on public.garmin_connections
  for each row execute function public.touch_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.gumroad_webhook_events enable row level security;
alter table public.garmin_connections enable row level security;
alter table public.dashboard_snapshots enable row level security;
alter table public.sync_jobs enable row level security;

-- profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- subscriptions — user reads own; writes via service role only
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- garmin_connections — metadata only for user (no token_blob in client queries)
create policy "garmin_connections_select_own"
  on public.garmin_connections for select
  using (auth.uid() = user_id);

-- dashboard_snapshots
create policy "dashboard_snapshots_select_own"
  on public.dashboard_snapshots for select
  using (auth.uid() = user_id);

-- sync_jobs
create policy "sync_jobs_select_own"
  on public.sync_jobs for select
  using (auth.uid() = user_id);

-- gumroad_webhook_events: no client policies (service role only)

-- Client-safe view (never expose token_blob to the browser)
create view public.garmin_connection_status
with (security_invoker = true)
as
  select
    id,
    user_id,
    garmin_email,
    last_login_at,
    last_sync_at,
    last_sync_status,
    last_sync_error,
    mfa_pending,
    created_at,
    updated_at
  from public.garmin_connections;

grant select on public.garmin_connection_status to authenticated;
