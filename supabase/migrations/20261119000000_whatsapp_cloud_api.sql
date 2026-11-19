-- WhatsApp Cloud API: conexiones, mensajes e idempotencia por empresa.
create table if not exists public.whatsapp_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  phone_number_id text not null unique,
  business_account_id text not null,
  display_phone_number text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  last_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider_message_id text not null unique,
  phone_number_id text not null,
  from_wa_id text not null,
  message_type text not null,
  text_body text,
  media_id text,
  media_mime_type text,
  direction text not null default 'inbound' check (direction in ('inbound', 'outbound')),
  status text not null default 'received' check (status in ('received', 'processed', 'unsupported', 'failed')),
  error_message text,
  raw_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_connections_company_idx on public.whatsapp_connections(company_id);
create index if not exists whatsapp_messages_company_created_idx on public.whatsapp_messages(company_id, created_at desc);

alter table public.whatsapp_connections enable row level security;
alter table public.whatsapp_messages enable row level security;
grant select, insert, update, delete on public.whatsapp_connections to authenticated;
grant select on public.whatsapp_messages to authenticated;

create policy "whatsapp_connections_read_company" on public.whatsapp_connections for select to authenticated using (public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[]));
create policy "whatsapp_connections_write_admin" on public.whatsapp_connections for all to authenticated using (public.has_company_role(company_id, array['company_admin']::public.company_role[])) with check (public.has_company_role(company_id, array['company_admin']::public.company_role[]));
create policy "whatsapp_messages_read_company" on public.whatsapp_messages for select to authenticated using (public.has_company_role(company_id, array['company_admin', 'branch_manager', 'employee', 'analyst']::public.company_role[]));
