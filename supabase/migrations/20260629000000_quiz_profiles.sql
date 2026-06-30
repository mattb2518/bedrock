-- Stage 1: Supabase persistence layer
-- Run this in the Supabase SQL editor (once, in order).

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. quiz_profiles — one row per signed-in user, JSONB for churn-prone fields
-- ──────────────────────────────────────────────────────────────────────────────
create table public.quiz_profiles (
  user_id            uuid primary key
                       references auth.users (id) on delete cascade,

  -- churn-prone, stored as JSON (mirrors QuizSession)
  answers            jsonb        not null default '[]'::jsonb,
  result             jsonb,
  demographics       jsonb,
  dealbreakers       text[]       not null default '{}',
  dealbreaker_other  text,
  top_dimensions     text[]       not null default '{}',

  -- promoted scalars for querying / cheap reads
  primary_type       text,
  completion_percent int          not null default 0,
  completed_layers   int[]        not null default '{}',

  started_at         timestamptz,
  updated_at         timestamptz  not null default now(),
  created_at         timestamptz  not null default now()
);

-- keep updated_at honest on every update
create function public.touch_updated_at()
  returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger quiz_profiles_touch
  before update on public.quiz_profiles
  for each row execute function public.touch_updated_at();

-- RLS: users see only their own row
alter table public.quiz_profiles enable row level security;

create policy "own profile - select" on public.quiz_profiles
  for select using (auth.uid() = user_id);

create policy "own profile - insert" on public.quiz_profiles
  for insert with check (auth.uid() = user_id);

create policy "own profile - update" on public.quiz_profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own profile - delete" on public.quiz_profiles
  for delete using (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────────────
-- 2. user_roles — three-tier role system (super_admin / admin / user)
--    Default is 'user'. Admin tool (Stage 4) queries this.
--    Cascade-deletes with the auth.users row so no orphan role rows.
-- ──────────────────────────────────────────────────────────────────────────────
create table public.user_roles (
  user_id  uuid primary key
             references auth.users (id) on delete cascade,
  role     text not null default 'user'
             check (role in ('user', 'admin', 'super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_roles_touch
  before update on public.user_roles
  for each row execute function public.touch_updated_at();

-- RLS: users can read their own role; only service-role key can write
alter table public.user_roles enable row level security;

create policy "own role - select" on public.user_roles
  for select using (auth.uid() = user_id);

-- Inserts/updates are done server-side via the service-role key (bypasses RLS).
-- No client-side write policy is intentional.


-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Auto-provision a 'user' role row when a new auth.users row is inserted.
--    This keeps user_roles in sync without any app-level code.
-- ──────────────────────────────────────────────────────────────────────────────
create function public.provision_user_role()
  returns trigger language plpgsql security definer as $$
begin
  insert into public.user_roles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;

create trigger auth_users_provision_role
  after insert on auth.users
  for each row execute function public.provision_user_role();
