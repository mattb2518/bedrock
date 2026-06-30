-- Stage 3: Catalog tables for classified candidates and media sources
-- Run this in the Supabase SQL editor after the Stage 1 migration.

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. classified_candidates
--    Stores CandidateRecord + §20.4 provenance + review status.
--    Nothing is live/usable by the engine until status = 'approved'.
-- ──────────────────────────────────────────────────────────────────────────────
create table public.classified_candidates (
  id                  uuid primary key default gen_random_uuid(),

  -- Identity
  candidate_id        text not null unique,  -- source-system ID (e.g. congress.gov bioguide)
  name                text not null,
  office              text not null,
  office_type         text not null check (office_type in ('ideological', 'nonpartisan', 'judicial')),
  district            text not null,         -- OCD-ID
  party               text,
  coverage_tier       text not null check (coverage_tier in ('federal', 'statewide', 'state_legislative', 'local', 'school_board')),
  sourced_from        text[] not null default '{}',

  -- Engine data (mirrors CandidateRecord)
  axis_placement      jsonb not null default '{}'::jsonb,
  dealbreakers        jsonb not null default '{}'::jsonb,
  rhetorical_only     boolean not null default false,
  independent_minded_score int,

  -- §20.4 provenance
  tagged_by           text not null,
  reviewed_by         text,
  source_evidence     text[] not null default '{}',
  external_refs       jsonb not null default '{}'::jsonb,
  last_reviewed       date,
  methodology_version text not null default '1.0',
  attribution         text not null default '',
  bedrock_originated  boolean not null default true,

  -- Raw Claude output — preserved for admin review and re-classification
  raw_classification  jsonb,

  -- Review workflow
  status              text not null default 'pending_review'
                        check (status in ('pending_review', 'approved', 'rejected')),
  rejection_reason    text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger classified_candidates_touch
  before update on public.classified_candidates
  for each row execute function public.touch_updated_at();

-- Index for common admin queries
create index classified_candidates_status_idx    on public.classified_candidates (status);
create index classified_candidates_district_idx  on public.classified_candidates (district);
create index classified_candidates_tier_idx      on public.classified_candidates (coverage_tier);

-- RLS: readable only via service-role key (admin tool uses service role)
-- No anon/user read access — engine reads pre-approved data via server-side calls.
alter table public.classified_candidates enable row level security;


-- ──────────────────────────────────────────────────────────────────────────────
-- 2. classified_sources
--    Stores MediaSource + §20.4 provenance + review status.
--    Same status gate: nothing is live until approved.
-- ──────────────────────────────────────────────────────────────────────────────
create table public.classified_sources (
  id                  uuid primary key default gen_random_uuid(),

  -- Identity
  source_id           text not null unique,
  name                text not null,
  kind                text not null check (kind in ('journalist', 'substack', 'podcast', 'outlet', 'newsletter', 'youtube')),
  formats             text[] not null default '{}',
  url                 text not null,
  independent         boolean not null default true,
  active              text not null default 'active' check (active in ('active', 'dormant', 'retired')),

  -- Engine data (mirrors MediaSource)
  axis_placement      jsonb not null default '{}'::jsonb,
  coarse_lean         text check (coarse_lean in ('left', 'lean-left', 'center', 'lean-right', 'right', 'heterodox')),
  reliability         int  check (reliability between 0 and 100),
  independence        int  check (independence between 0 and 100),
  good_faith          text check (good_faith in ('high', 'mixed', 'low')),
  transparency        int  check (transparency between 0 and 100),
  dimension_coverage  jsonb not null default '{}'::jsonb,
  topics              text[] not null default '{}',
  effort              text check (effort in ('light', 'medium', 'deep')),
  flags               text[] not null default '{}',
  bias_rating_source  text check (bias_rating_source in ('ad_fontes', 'allsides', 'mbfc', 'bedrock_originated')),

  -- §20.4 provenance
  tagged_by           text not null,
  reviewed_by         text,
  source_evidence     text[] not null default '{}',
  external_refs       jsonb not null default '{}'::jsonb,
  last_reviewed       date,
  methodology_version text not null default '1.0',
  attribution         text not null default '',
  bedrock_originated  boolean not null default true,

  -- Raw Claude output
  raw_classification  jsonb,

  -- Review workflow
  status              text not null default 'pending_review'
                        check (status in ('pending_review', 'approved', 'rejected')),
  rejection_reason    text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger classified_sources_touch
  before update on public.classified_sources
  for each row execute function public.touch_updated_at();

create index classified_sources_status_idx on public.classified_sources (status);
create index classified_sources_kind_idx   on public.classified_sources (kind);
create index classified_sources_active_idx on public.classified_sources (active);

alter table public.classified_sources enable row level security;


-- ──────────────────────────────────────────────────────────────────────────────
-- 3. classification_audit_log
--    Append-only log of every status change and human override.
--    No deletes, no updates. Admin tool reads this for the audit trail (§21.6).
-- ──────────────────────────────────────────────────────────────────────────────
create table public.classification_audit_log (
  id            uuid primary key default gen_random_uuid(),
  entry_type    text not null check (entry_type in ('candidate', 'source')),
  entry_id      text not null,       -- candidate_id or source_id
  action        text not null,       -- 'classified' | 'approved' | 'rejected' | 'overridden' | 'reclassified'
  actor_user_id uuid references auth.users (id) on delete set null,
  previous_status text,
  new_status      text,
  notes         text,
  created_at    timestamptz not null default now()
);

alter table public.classification_audit_log enable row level security;
-- No RLS policies — service-role only. No one should read or write this from the client.
