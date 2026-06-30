'use server'

/**
 * Fire-and-forget stub insertion for candidates fetched from live APIs.
 *
 * When a real candidate is returned by fetchFederalCandidates or
 * fetchStateLegCandidates, we insert a pending_review stub into
 * classified_candidates so the admin classification pipeline can pick it up.
 *
 * Design constraints:
 * - NEVER awaited at call site — must not block the ballot page render
 * - Idempotent: upsert with ignoreDuplicates so repeat lookups don't duplicate
 * - Uses admin client to bypass RLS (these inserts run server-side only)
 */

import { createAdminClient } from '@/lib/supabase/admin'

export interface ClassificationQueueEntry {
  id: string
  name: string
  office: string
  district: string
  party: string
  coverageTier: string
  sourcedFrom: string[]
}

export async function queueCandidateForClassification(
  candidate: ClassificationQueueEntry
): Promise<void> {
  try {
    const admin = createAdminClient()

    await admin.from('classified_candidates').upsert(
      {
        candidate_id:   candidate.id,
        name:           candidate.name,
        office:         candidate.office,
        office_type:    'ideological',
        district:       candidate.district,
        party:          candidate.party,
        coverage_tier:  candidate.coverageTier,
        sourced_from:   candidate.sourcedFrom,
        status:         'pending_review',
        attribution:    'auto_ingested',
        axis_placement: {},
        dealbreakers:   {},
      },
      // If a row already exists (pending, approved, rejected) leave it alone.
      { onConflict: 'candidate_id', ignoreDuplicates: true }
    )
  } catch {
    // Swallow errors — this is fire-and-forget; ballot page must not be affected.
  }
}
