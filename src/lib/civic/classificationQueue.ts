'use server'

/**
 * On-demand candidate classification with caching.
 *
 * getOrClassifyCandidate() replaces the old fire-and-forget stub pattern:
 *   1. Cache hit (approved + has data + < 30 days old)  → return stored result instantly
 *   2. Cache miss / stale / pending-with-no-placement   → run classifyCandidate(), store, return
 *   3. Classification fails for any reason              → return null (engine produces no_call)
 *
 * Auto-approve threshold: if classification yields ≥ 4 axes with confidence > 0.6,
 * the result is stored with status='approved' (safe to show users without human review).
 * Below threshold → status='pending_review' (queued for human spot-check).
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { classifyCandidate } from '@/lib/classification/classifyCandidates'
import type { CandidateRecord, AxisPlacement, Dimension } from '@/lib/engine/match'
import Anthropic from '@anthropic-ai/sdk'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_TTL_DAYS = 30
const AUTO_APPROVE_MIN_AXES = 4
const AUTO_APPROVE_MIN_CONFIDENCE = 0.6

// ─────────────────────────────────────────────────────────────────────────────
// Entry type (what callers must supply)
// ─────────────────────────────────────────────────────────────────────────────

export interface ClassificationQueueEntry {
  id: string
  name: string
  office: string
  officeType: CandidateRecord['officeType']
  district: string
  party: string
  coverageTier: CandidateRecord['coverageTier']
  sourcedFrom: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isStale(dateStr: string | null | undefined): boolean {
  if (!dateStr) return true
  const daysAgo = (Date.now() - new Date(dateStr).getTime()) / 86_400_000
  return daysAgo > CACHE_TTL_DAYS
}

function meetsAutoApproveThreshold(
  axisPlacement: Partial<Record<Dimension, AxisPlacement>>
): boolean {
  const highConfidence = Object.values(axisPlacement).filter(
    (ap) => ap && ap.confidence > AUTO_APPROVE_MIN_CONFIDENCE
  ).length
  return highConfidence >= AUTO_APPROVE_MIN_AXES
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRecord(row: Record<string, any>): CandidateRecord {
  return {
    id: row.candidate_id as string,
    name: row.name as string,
    office: row.office as string,
    officeType: (row.office_type ?? 'ideological') as CandidateRecord['officeType'],
    district: row.district as string,
    party: row.party as string | undefined,
    axisPlacement: (row.axis_placement ?? {}) as CandidateRecord['axisPlacement'],
    dealbreakers: (row.dealbreakers ?? {}) as CandidateRecord['dealbreakers'],
    coverageTier: row.coverage_tier as CandidateRecord['coverageTier'],
    sourcedFrom: (row.sourced_from as string[]) ?? [],
    lastUpdated: (row.last_reviewed as string) ?? new Date().toISOString().slice(0, 10),
    rhetoricalOnly: row.rhetorical_only as boolean | undefined,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a classified CandidateRecord, or null if classification fails.
 * Never throws — callers should handle null as no_call.
 */
export async function getOrClassifyCandidate(
  candidate: ClassificationQueueEntry
): Promise<CandidateRecord | null> {
  try {
    const admin = createAdminClient()

    // ── 1. Check cache ──────────────────────────────────────────────────────
    const { data: existing } = await admin
      .from('classified_candidates')
      .select('*')
      .eq('candidate_id', candidate.id)
      .single()

    if (existing) {
      const hasPlacement =
        existing.axis_placement &&
        Object.keys(existing.axis_placement as object).length > 0
      const approved = existing.status === 'approved'
      // Use classified_at if present, fall back to last_reviewed for older rows
      const fresh = !isStale(existing.classified_at ?? existing.last_reviewed)

      if (approved && hasPlacement && fresh) {
        return rowToRecord(existing)
      }
    }

    // ── 2. Classify ─────────────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const result = await classifyCandidate(
      {
        candidateId: candidate.id,
        name: candidate.name,
        office: candidate.office,
        officeType: candidate.officeType,
        district: candidate.district,
        party: candidate.party,
        coverageTier: candidate.coverageTier,
        sourcedFrom: candidate.sourcedFrom,
        taggedBy: 'auto_classify',
      },
      anthropic
    )

    const axisPlacement = result.candidateData.axisPlacement
    const dealbreakers = result.candidateData.dealbreakers
    const autoApproved = meetsAutoApproveThreshold(axisPlacement)
    const today = new Date().toISOString().slice(0, 10)

    // ── 3. Store / update cache ─────────────────────────────────────────────
    await admin.from('classified_candidates').upsert(
      {
        candidate_id:         candidate.id,
        name:                 candidate.name,
        office:               candidate.office,
        office_type:          candidate.officeType,
        district:             candidate.district,
        party:                candidate.party,
        coverage_tier:        candidate.coverageTier,
        sourced_from:         candidate.sourcedFrom,
        axis_placement:       axisPlacement,
        dealbreakers,
        rhetorical_only:      result.candidateData.rhetoricalOnly ?? false,
        status:               autoApproved ? 'approved' : 'pending_review',
        attribution:          'auto_classify',
        tagged_by:            'auto_classify',
        raw_classification:   result.rawClassification,
        source_evidence:      result.sourceEvidence,
        methodology_version:  result.methodologyVersion,
        last_reviewed:        today,
        classified_at:        today,
      },
      { onConflict: 'candidate_id', ignoreDuplicates: false }
    )

    return {
      id: candidate.id,
      name: candidate.name,
      office: candidate.office,
      officeType: candidate.officeType,
      district: candidate.district,
      party: candidate.party,
      axisPlacement,
      dealbreakers,
      coverageTier: candidate.coverageTier,
      sourcedFrom: candidate.sourcedFrom,
      lastUpdated: today,
      rhetoricalOnly: result.candidateData.rhetoricalOnly ?? false,
    }
  } catch {
    // Never crash the ballot page — return null so the engine produces no_call
    return null
  }
}
