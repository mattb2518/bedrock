-- Stage 4b: Feedback tables + admin support columns
-- Run in Supabase SQL editor after the Stage 3 migration.

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. candidate_feedback — §22.6
-- ──────────────────────────────────────────────────────────────────────────────
create table public.candidate_feedback (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users (id) on delete set null,
  candidate_id          text not null,
  race_id               text,
  confidence_band       text check (confidence_band in ('confident', 'lean', 'informational', 'no_call')),
  feedback_type         text not null check (feedback_type in ('thumbs_up', 'thumbs_down')),
  free_text             text,
  chips_selected        text[] not null default '{}',
  user_mantle_type      text,
  user_completion_percent int,
  app_version           text,
  data_version          text,
  created_at            timestamptz not null default now()
);

create index candidate_feedback_candidate_idx on public.candidate_feedback (candidate_id);
create index candidate_feedback_user_idx      on public.candidate_feedback (user_id);
create index candidate_feedback_type_idx      on public.candidate_feedback (feedback_type);
create index candidate_feedback_created_idx   on public.candidate_feedback (created_at);

alter table public.candidate_feedback enable row level security;

-- Users can insert their own feedback; no one can read individual rows client-side.
-- Admin dashboard reads via service-role key only.
create policy "users_insert_own_candidate_feedback"
  on public.candidate_feedback for insert
  with check (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────────────
-- 2. source_feedback — §24.4
-- ──────────────────────────────────────────────────────────────────────────────
create table public.source_feedback (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users (id) on delete set null,
  source_id             text not null,
  tier                  text check (tier in ('confirming', 'expanding', 'challenging')),
  feedback_type         text not null check (feedback_type in ('thumbs_up', 'thumbs_down')),
  free_text             text,
  chips_selected        text[] not null default '{}',
  dimension_coverage_tags text[] not null default '{}',
  user_mantle_type      text,
  user_completion_percent int,
  app_version           text,
  data_version          text,
  created_at            timestamptz not null default now()
);

create index source_feedback_source_idx  on public.source_feedback (source_id);
create index source_feedback_user_idx    on public.source_feedback (user_id);
create index source_feedback_type_idx    on public.source_feedback (feedback_type);
create index source_feedback_created_idx on public.source_feedback (created_at);

alter table public.source_feedback enable row level security;

create policy "users_insert_own_source_feedback"
  on public.source_feedback for insert
  with check (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────────────
-- 3. admin_checklist — persistent pre-launch checklist (§21.9)
-- ──────────────────────────────────────────────────────────────────────────────
create table public.admin_checklist (
  item_id    text primary key,
  checked    boolean not null default false,
  checked_by uuid references auth.users (id) on delete set null,
  checked_at timestamptz
);

alter table public.admin_checklist enable row level security;
-- Service-role only — no client policies.

-- Seed the checklist items so toggling them is an update, not an insert.
insert into public.admin_checklist (item_id) values
  ('bias_check_quiz'),
  ('partisan_lean_consistency'),
  ('bias_check_methodology'),
  ('bias_check_byb_criteria'),
  ('allsides_eligibility'),
  ('ad_fontes_pricing'),
  ('ballotpedia_licensing'),
  ('cookie_banner_review'),
  ('methodology_published'),
  ('pew_typology_constants'),
  ('profile_export'),
  ('account_deletion_cascade'),
  ('demographics_opt_out'),
  ('anthropic_data_handling'),
  ('pricing_model'),
  ('open_source_scoring'),
  ('byb_json_populated');

-- Mark the two already-complete items
update public.admin_checklist set checked = true, checked_at = now()
  where item_id in ('cookie_banner_review', 'account_deletion_cascade');


-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Add reconciliation and Perplexity columns to catalog tables
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.classified_candidates
  add column if not exists flagged_for_reconciliation boolean not null default false,
  add column if not exists reconciliation_diff        jsonb,
  add column if not exists perplexity_last_check      jsonb;

alter table public.classified_sources
  add column if not exists flagged_for_reconciliation boolean not null default false,
  add column if not exists reconciliation_diff        jsonb,
  add column if not exists perplexity_last_check      jsonb;

-- Add a 'flagged' option to the action column in the audit log for auto-flags
-- (no constraint change needed — action is free text)
