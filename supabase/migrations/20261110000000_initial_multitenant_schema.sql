-- PayVerify initial multi-tenant schema for Supabase/PostgreSQL.
-- Apply once to a Supabase project using the SQL editor or Supabase CLI.

create extension if not exists pgcrypto;

do $$ begin create type public.company_role as enum ('company_admin', 'branch_manager', 'employee', 'analyst'); exception when duplicate_object then null; end $$;
do $$ begin create type public.membership_status as enum ('active', 'invited', 'suspended'); exception when duplicate_object then null; end $$;
do $$ begin create type public.company_status as enum ('active', 'suspended'); exception when duplicate_object then null; end $$;
do $$ begin create type public.proof_status as enum ('received', 'processing', 'matched', 'pending', 'rejected', 'unidentified', 'confirmed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.verification_status as enum ('matched', 'pending', 'rejected', 'unidentified', 'confirmed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.movement_source as enum ('manual', 'email_import', 'bank_feed'); exception when duplicate_object then null; end $$;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  city text,
  status public.company_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.company_role not null default 'employee',
  status public.membership_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  monthly_price_cop bigint not null check (monthly_price_cop >= 0),
  verification_limit integer not null check (verification_limit > 0),
  branch_limit integer,
  employee_limit integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'cancelled', 'suspended')),
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  city text,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, name)
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  role_label text not null default 'Empleado',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, email)
);

create table if not exists public.proof_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,
  storage_path text,
  amount_cop bigint check (amount_cop is null or amount_cop > 0),
  currency char(3) not null default 'COP',
  bank_name text,
  reference text,
  operation_id text,
  recipient_account_last4 char(4),
  occurred_at timestamptz,
  status public.proof_status not null default 'received',
  extraction_data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (currency = 'COP')
);

create table if not exists public.bank_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  bank_name text,
  amount_cop bigint check (amount_cop is null or amount_cop > 0),
  currency char(3) not null default 'COP',
  reference text,
  operation_id text,
  recipient_account_last4 char(4),
  sender_name text,
  recipient_name text,
  operation_type text,
  operation_status text,
  occurred_at timestamptz,
  source public.movement_source not null default 'manual',
  source_event_key text,
  raw_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (currency = 'COP'),
  unique (company_id, source_event_key)
);

create table if not exists public.verification_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  proof_id uuid references public.proof_documents(id) on delete set null,
  movement_id uuid references public.bank_movements(id) on delete set null,
  status public.verification_status not null,
  reason text,
  matched_fields text[] not null default '{}',
  evidence jsonb not null default '{}'::jsonb,
  checked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists memberships_user_status_idx on public.company_memberships(user_id, status);
create index if not exists branches_company_idx on public.branches(company_id);
create index if not exists employees_company_branch_idx on public.employees(company_id, branch_id);
create index if not exists proofs_company_created_idx on public.proof_documents(company_id, created_at desc);
create index if not exists movements_company_date_idx on public.bank_movements(company_id, occurred_at desc);
create index if not exists movements_company_reference_idx on public.bank_movements(company_id, reference);
create index if not exists verifications_company_created_idx on public.verification_events(company_id, created_at desc);
create index if not exists audit_company_created_idx on public.audit_logs(company_id, created_at desc);

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (select 1 from public.user_profiles p where p.user_id = auth.uid() and p.is_platform_admin = true);
$$;

create or replace function public.has_company_role(target_company uuid, allowed_roles public.company_role[])
returns boolean language sql stable security definer set search_path = public, auth as $$
  select public.is_platform_admin() or exists (
    select 1 from public.company_memberships m
    where m.company_id = target_company and m.user_id = auth.uid()
      and m.status = 'active' and m.role = any(allowed_roles)
  );
$$;

create or replace function public.create_company_with_owner(company_name text)
returns uuid language plpgsql security definer set search_path = public, auth as $$
declare new_company_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if char_length(trim(company_name)) < 2 or char_length(trim(company_name)) > 120 then raise exception 'invalid company name'; end if;
  insert into public.user_profiles(user_id) values (auth.uid()) on conflict (user_id) do nothing;
  insert into public.companies(name) values (trim(company_name)) returning id into new_company_id;
  insert into public.company_memberships(company_id, user_id, role, status)
  values (new_company_id, auth.uid(), 'company_admin', 'active');
  return new_company_id;
end;
$$;

revoke all on function public.is_platform_admin() from public;
revoke all on function public.has_company_role(uuid, public.company_role[]) from public;
revoke all on function public.create_company_with_owner(text) from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.has_company_role(uuid, public.company_role[]) to authenticated;
grant execute on function public.create_company_with_owner(text) to authenticated;

grant usage on schema public to authenticated;
grant select on public.user_profiles, public.companies, public.company_memberships, public.plans, public.subscriptions, public.branches, public.employees, public.proof_documents, public.bank_movements, public.verification_events, public.audit_logs to authenticated;
grant insert, update, delete on public.companies, public.branches, public.employees, public.proof_documents, public.bank_movements, public.verification_events to authenticated;
grant insert on public.audit_logs to authenticated;

alter table public.user_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.branches enable row level security;
alter table public.employees enable row level security;
alter table public.proof_documents enable row level security;
alter table public.bank_movements enable row level security;
alter table public.verification_events enable row level security;
alter table public.audit_logs enable row level security;

create policy "profile_read_self_or_platform_admin" on public.user_profiles for select to authenticated using (user_id = auth.uid() or public.is_platform_admin());
create policy "companies_read_member" on public.companies for select to authenticated using (public.is_platform_admin() or exists (select 1 from public.company_memberships m where m.company_id = id and m.user_id = auth.uid() and m.status = 'active'));
create policy "companies_update_admin" on public.companies for update to authenticated using (public.has_company_role(id, array['company_admin']::public.company_role[])) with check (public.has_company_role(id, array['company_admin']::public.company_role[]));
create policy "memberships_read_own_or_admin" on public.company_memberships for select to authenticated using (user_id = auth.uid() or public.has_company_role(company_id, array['company_admin']::public.company_role[]));
create policy "plans_read_active" on public.plans for select to authenticated using (active or public.is_platform_admin());
create policy "subscriptions_read_company" on public.subscriptions for select to authenticated using (public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[]));

create policy "branches_read_company" on public.branches for select to authenticated using (public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[]));
create policy "branches_insert_admin" on public.branches for insert to authenticated with check (public.has_company_role(company_id, array['company_admin']::public.company_role[]));
create policy "branches_update_admin" on public.branches for update to authenticated using (public.has_company_role(company_id, array['company_admin']::public.company_role[])) with check (public.has_company_role(company_id, array['company_admin']::public.company_role[]));
create policy "branches_delete_admin" on public.branches for delete to authenticated using (public.has_company_role(company_id, array['company_admin']::public.company_role[]));

create policy "employees_read_company" on public.employees for select to authenticated using (public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[]));
create policy "employees_insert_admin" on public.employees for insert to authenticated with check (public.has_company_role(company_id, array['company_admin']::public.company_role[]));
create policy "employees_update_admin" on public.employees for update to authenticated using (public.has_company_role(company_id, array['company_admin']::public.company_role[])) with check (public.has_company_role(company_id, array['company_admin']::public.company_role[]));
create policy "employees_delete_admin" on public.employees for delete to authenticated using (public.has_company_role(company_id, array['company_admin']::public.company_role[]));

create policy "proofs_read_company" on public.proof_documents for select to authenticated using (public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[]));
create policy "proofs_insert_company" on public.proof_documents for insert to authenticated with check (public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee']::public.company_role[]));
create policy "proofs_update_admin" on public.proof_documents for update to authenticated using (public.has_company_role(company_id, array['company_admin', 'branch_manager']::public.company_role[])) with check (public.has_company_role(company_id, array['company_admin', 'branch_manager']::public.company_role[]));
create policy "movements_read_company" on public.bank_movements for select to authenticated using (public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[]));
create policy "movements_insert_admin" on public.bank_movements for insert to authenticated with check (public.has_company_role(company_id, array['company_admin']::public.company_role[]));
create policy "verification_read_company" on public.verification_events for select to authenticated using (public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[]));
create policy "verification_insert_company" on public.verification_events for insert to authenticated with check (public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee']::public.company_role[]));
create policy "audit_read_admin" on public.audit_logs for select to authenticated using (public.has_company_role(company_id, array['company_admin']::public.company_role[]));
create policy "audit_insert_member" on public.audit_logs for insert to authenticated with check (company_id is null or public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[]));

insert into public.plans(key, name, monthly_price_cop, verification_limit, branch_limit, employee_limit)
values
  ('emprende', 'Emprende', 99900, 200, 1, 3),
  ('crecimiento', 'Crecimiento', 249900, 800, 3, 10),
  ('pro', 'Pro', 499900, 2500, 10, 30),
  ('enterprise', 'Enterprise', 999900, 6000, null, null)
on conflict (key) do nothing;
