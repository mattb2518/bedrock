-- Add classified_at timestamp to track when on-demand classification ran.
-- Used for 30-day cache TTL: if classified_at is more than 30 days ago,
-- getOrClassifyCandidate() re-runs classification on next access.
ALTER TABLE classified_candidates
  ADD COLUMN IF NOT EXISTS classified_at date;
