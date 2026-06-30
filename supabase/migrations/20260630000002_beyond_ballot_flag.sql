-- Stage 5 follow-up: add beyond_ballot_flag to candidate_feedback
-- Missing from Stage 4b migration; §23.2 requires it and the BYB page already writes it.

alter table public.candidate_feedback
  add column if not exists beyond_ballot_flag boolean not null default false;
