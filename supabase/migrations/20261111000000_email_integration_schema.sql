create extension if not exists pgcrypto;

do $$ begin create type public.email_provider as enum ('google', 'microsoft'); exception when duplicate_object then null; end $$;
do $$ begin create type public.email_connection_status as enum ('connected', 'disconnected', 'syncing', 'error'); exception when duplicate_object then null; end $$;
do $$ begin create type public.sync_run_status as enum ('queued', 'running', 'succeeded', 'failed', 'expired'); exception when duplicate_object then null; end $$;
do $$ begin create type public.gmail_message_status as enum ('queued', 'processing', 'processed', 'failed', 'ignored'); exception when duplicate_object then null; end $$;
do $$ begin create type public.bank_notice_status as enum ('unclassified', 'candidate', 'pending', 'matched', 'rejected', 'confirmed', 'ignored'); exception when duplicate_object then null; end $$;

create table if not exists public.email_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider public.email_provider not null,
  email_address text not null,
  display_name text,
  provider_user_id text,
  status public.email_connection_status not null default 'connected',
  scopes text[] not null default '{}',
  token_expires_at timestamptz,
  last_sync_at timestamptz,
  last_error_code text,
  auto_sync_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, provider, email_address)
);

create table if not exists public.email_connection_secrets (
  connection_id uuid primary key references public.email_connections(id) on delete cascade,
  access_token_ciphertext text not null,
  refresh_token_ciphertext text,
  token_expires_at timestamptz,
  key_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_oauth_states (
  nonce text primary key,
  provider public.email_provider not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.email_sync_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  connection_id uuid not null references public.email_connections(id) on delete cascade,
  status public.sync_run_status not null default 'queued',
  cursor text,
  history_id text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.gmail_message_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  connection_id uuid not null references public.email_connections(id) on delete cascade,
  provider_message_id text not null,
  history_id text,
  from_address text,
  subject text,
  received_at timestamptz,
  status public.gmail_message_status not null default 'queued',
  raw_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (connection_id, provider_message_id)
);

create table if not exists public.bank_email_notices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  connection_id uuid references public.email_connections(id) on delete set null,
  provider_message_id text not null,
  bank_name text,
  amount_cop bigint check (amount_cop is null or amount_cop > 0),
  currency char(3) not null default 'COP',
  reference text,
  sender_name text,
  recipient_name text,
  sender_email text,
  recipient_email text,
  operation_date timestamptz,
  received_at timestamptz,
  subject text,
  message_body text,
  parsed_payload jsonb not null default '{}'::jsonb,
  status public.bank_notice_status not null default 'unclassified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, provider_message_id),
  check (currency = 'COP')
);

create index if not exists email_connections_company_provider_idx on public.email_connections(company_id, provider);
create index if not exists email_connections_status_idx on public.email_connections(status, updated_at desc);
create index if not exists email_oauth_states_company_user_idx on public.email_oauth_states(company_id, user_id, expires_at desc);
create index if not exists email_sync_runs_company_idx on public.email_sync_runs(company_id, started_at desc);
create index if not exists gmail_message_events_company_connection_idx on public.gmail_message_events(company_id, connection_id, created_at desc);
create index if not exists gmail_message_events_status_idx on public.gmail_message_events(status, received_at desc);
create index if not exists bank_email_notices_company_status_idx on public.bank_email_notices(company_id, status, received_at desc);
create index if not exists bank_email_notices_reference_idx on public.bank_email_notices(company_id, reference);
create index if not exists bank_email_notices_operation_date_idx on public.bank_email_notices(company_id, operation_date desc);

alter table public.email_connections enable row level security;
alter table public.email_connection_secrets enable row level security;
alter table public.email_oauth_states enable row level security;
alter table public.email_sync_runs enable row level security;
alter table public.gmail_message_events enable row level security;
alter table public.bank_email_notices enable row level security;

create policy "email_connections_read_company_members" on public.email_connections for select to authenticated using (
  public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[])
  or public.is_platform_admin()
);
create policy "email_connections_manage_admin" on public.email_connections for insert to authenticated with check (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
);
create policy "email_connections_update_admin" on public.email_connections for update to authenticated using (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
) with check (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
);
create policy "email_connections_delete_admin" on public.email_connections for delete to authenticated using (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
);

create policy "email_connection_secrets_admin_read" on public.email_connection_secrets for select to authenticated using (
  exists (
    select 1 from public.email_connections ec
    where ec.id = connection_id
      and (public.has_company_role(ec.company_id, array['company_admin']::public.company_role[]) or public.is_platform_admin())
  )
);
create policy "email_connection_secrets_admin_write" on public.email_connection_secrets for insert to authenticated with check (
  exists (
    select 1 from public.email_connections ec
    where ec.id = connection_id
      and public.has_company_role(ec.company_id, array['company_admin']::public.company_role[])
  )
);
create policy "email_connection_secrets_admin_update" on public.email_connection_secrets for update to authenticated using (
  exists (
    select 1 from public.email_connections ec
    where ec.id = connection_id
      and public.has_company_role(ec.company_id, array['company_admin']::public.company_role[])
  )
) with check (
  exists (
    select 1 from public.email_connections ec
    where ec.id = connection_id
      and public.has_company_role(ec.company_id, array['company_admin']::public.company_role[])
  )
);

create policy "email_oauth_states_user_scope" on public.email_oauth_states for select to authenticated using (
  user_id = auth.uid() or public.is_platform_admin()
);
create policy "email_oauth_states_self_insert" on public.email_oauth_states for insert to authenticated with check (
  user_id = auth.uid() and company_id in (
    select company_id from public.company_memberships where user_id = auth.uid() and status = 'active'
  )
);
create policy "email_oauth_states_self_update" on public.email_oauth_states for update to authenticated using (
  user_id = auth.uid()
) with check (
  user_id = auth.uid()
);

create policy "email_sync_runs_read_company" on public.email_sync_runs for select to authenticated using (
  public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[])
  or public.is_platform_admin()
);
create policy "email_sync_runs_insert_admin" on public.email_sync_runs for insert to authenticated with check (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
);
create policy "email_sync_runs_update_admin" on public.email_sync_runs for update to authenticated using (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
) with check (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
);

create policy "gmail_message_events_read_company" on public.gmail_message_events for select to authenticated using (
  public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[])
  or public.is_platform_admin()
);
create policy "gmail_message_events_manage_admin" on public.gmail_message_events for insert to authenticated with check (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
);
create policy "gmail_message_events_update_admin" on public.gmail_message_events for update to authenticated using (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
) with check (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
);

create policy "bank_email_notices_read_company" on public.bank_email_notices for select to authenticated using (
  public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[])
  or public.is_platform_admin()
);
create policy "bank_email_notices_manage_admin" on public.bank_email_notices for insert to authenticated with check (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
);
create policy "bank_email_notices_update_admin" on public.bank_email_notices for update to authenticated using (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
) with check (
  public.has_company_role(company_id, array['company_admin']::public.company_role[])
);
