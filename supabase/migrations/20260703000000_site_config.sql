-- §22c: site_config table — admin-controlled feature flags
-- RLS: anon-readable, service-role-writable (no user writes).

create table if not exists public.site_config (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

-- Seed default: pillar 1 is in officials mode (off season)
insert into public.site_config (key, value)
values ('pillar_one_mode', 'officials')
on conflict (key) do nothing;

-- RLS
alter table public.site_config enable row level security;

-- Anon + authenticated users can read
create policy "site_config_anon_read"
  on public.site_config for select
  to anon, authenticated
  using (true);

-- Only the service role (used by admin actions) can write
-- (No insert/update/delete policy → only service-role bypass can write)
