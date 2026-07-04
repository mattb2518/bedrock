-- §22d: canonical address scalars on quiz_profiles.
-- Replaces the zip-code-in-demographics-jsonb pattern.
-- Legacy demographics.zipCode is left in the jsonb; read by nothing going forward.

alter table public.quiz_profiles
  add column if not exists formatted_address    text,
  add column if not exists district_state       text,
  add column if not exists district_cd          smallint,
  add column if not exists district_sldu        smallint,
  add column if not exists district_sldl        smallint,
  add column if not exists districts_resolved_at timestamptz;
