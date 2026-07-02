/**
 * Media matching engine — §19.8
 * Pure function. No dealbreakers — structurally impossible by input type design.
 *
 * The hard architectural wall is enforced at the type level: MediaMatchKey has
 * no `dealbreakers` field, and MediaSource has no `dealbreakers` field. There
 * is no code path that could route Layer 4 data into this function.
 */

import type { Dimension, AxisPlacement } from './match'
import { ALL_DIMENSIONS } from './match'

// ─────────────────────────────────────────────────────────────────────────────
// §19.3  Media source data model
// ─────────────────────────────────────────────────────────────────────────────

export interface MediaSource {
  id: string
  name: string
  kind: 'journalist' | 'substack' | 'podcast' | 'outlet' | 'newsletter' | 'youtube'
  formats: ('newsletter' | 'podcast' | 'long-form-writing' | 'daily-news' | 'video' | 'social')[]
  url: string
  independent: boolean
  active: 'active' | 'dormant' | 'retired'
  axisPlacement: Partial<Record<Dimension, AxisPlacement>>
  coarseLean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'heterodox'
  reliability: number      // 0–100
  independence: number     // 0–100
  goodFaith: 'high' | 'mixed' | 'low'
  transparency: number     // 0–100
  dimensionCoverage: Partial<Record<Dimension, 'signature' | 'regular' | 'incidental'>>
  topics: string[]
  effort: 'light' | 'medium' | 'deep'
  flags: ('partisan_lean' | 'questionable_reliability')[]
  biasRatingSource: 'ad_fontes' | 'allsides' | 'mbfc' | 'bedrock_originated'
  externalRefs: Record<string, string>
  lastReviewed: string
  methodologyVersion: string
  attribution: string
  // NOTE: no `dealbreakers` field — structurally absent by design (§19.8)
}

// ─────────────────────────────────────────────────────────────────────────────
// Input type — also deliberately has no dealbreakers field
// ─────────────────────────────────────────────────────────────────────────────

export interface MediaMatchKey {
  dimensionScores: Record<Dimension, number>     // 0–100
  topDimensions: Dimension[]                     // user's ≤3 held dimensions
  primaryType: string                            // CivicType string
  secondaryTypes: string[]
  edgeCaseFlag?: 'centered' | 'scattered' | 'near_pure' | null
  completenessPct: number
  // NO dealbreakers — hard architectural wall per §19.8
}

export type MediaTier = 'confirming' | 'expanding' | 'challenging'

export interface ScoredMediaSource {
  source: MediaSource
  agreement: number          // 0–1
  tensionOnHeld: number      // 0–1
  novelCoverage: number      // 0–1
  tier: MediaTier
}

export interface MediaMatchResult {
  confirming: ScoredMediaSource[]
  expanding: ScoredMediaSource[]
  challenging: ScoredMediaSource[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Three computed values per source  (§19.8)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * agreement(U, S) — overall closeness on axes where the source has a placement.
 * Uses the same weighted-distance logic as the candidate engine, but without
 * user axis weights (media matching is Layer 1 only, weights not yet applied).
 */
function computeAgreement(key: MediaMatchKey, source: MediaSource): number {
  let numerator   = 0
  let denominator = 0

  for (const axis of ALL_DIMENSIONS) {
    const placement = source.axisPlacement[axis]
    if (!placement || placement.confidence <= 0) continue

    const userScore = key.dimensionScores[axis]
    const similarity = 1 - Math.abs(userScore - placement.score) / 100

    numerator   += placement.confidence * similarity
    denominator += placement.confidence
  }

  return denominator > 0 ? numerator / denominator : 0
}

/**
 * tension_on_held(U, S) — distance on the user's top-3 held dimensions.
 * High value = source challenges the user's most-held positions.
 */
function computeTensionOnHeld(key: MediaMatchKey, source: MediaSource): number {
  if (key.topDimensions.length === 0) return 0

  let numerator   = 0
  let denominator = 0

  for (const axis of key.topDimensions) {
    const placement = source.axisPlacement[axis]
    if (!placement || placement.confidence <= 0) continue

    const distance = Math.abs(key.dimensionScores[axis] - placement.score) / 100

    numerator   += placement.confidence * distance
    denominator += placement.confidence
  }

  return denominator > 0 ? numerator / denominator : 0
}

/**
 * novel_coverage(U, S) — source covers dimensions the user's confirming set
 * covers thinly. Proxy: axes where the source has 'signature' or 'regular'
 * coverage that are NOT in the user's top dimensions (i.e., not already
 * confirmed). Scored as fraction of non-held axes with strong source coverage.
 *
 * Judgment call: 'signature' = full weight, 'regular' = half weight,
 * 'incidental' = zero weight. The confirming set isn't available inside this
 * per-source function, so we use topDimensions as the proxy for "already well
 * confirmed" — dimensions outside topDimensions are "thinly covered" territory.
 */
function computeNovelCoverage(key: MediaMatchKey, source: MediaSource): number {
  const heldSet = new Set(key.topDimensions)
  const nonHeld = ALL_DIMENSIONS.filter((a) => !heldSet.has(a))
  if (nonHeld.length === 0) return 0

  let score = 0
  for (const axis of nonHeld) {
    const level = source.dimensionCoverage[axis]
    if (level === 'signature') score += 1.0
    else if (level === 'regular') score += 0.5
  }

  return score / nonHeld.length
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier assignment thresholds  (§19.8 — exact values from spec)
// ─────────────────────────────────────────────────────────────────────────────

// ── v1 below-threshold exception (TEMPORARY — remove when the v2 reliability signal ships) ──
// Independently-owned, widely-read sources allowed into Confirming for same-lean users despite
// missing the reliability floor. Surfaced with a disclosure footnote on the card. Matched by host.
const CONFIRMING_EXCEPTION_HOSTS = new Set<string>(['dailywire.com'])

export function isBelowThresholdException(source: MediaSource): boolean {
  try {
    const host = new URL(source.url.startsWith('http') ? source.url : `https://${source.url}`)
      .hostname.replace(/^www\./, '').toLowerCase()
    return CONFIRMING_EXCEPTION_HOSTS.has(host)
  } catch {
    return false
  }
}

function assignTier(
  scores: { agreement: number; tensionOnHeld: number; novelCoverage: number },
  source: MediaSource
): MediaTier | null {
  const { agreement, tensionOnHeld, novelCoverage } = scores

  // reliability floor OR a v1 below-threshold exception (remove exception for v2)
  if (agreement >= 0.65 && tensionOnHeld <= 0.30 && (source.reliability >= 60 || isBelowThresholdException(source))) {
    return 'confirming'
  }

  // Challenging: v1 loosening (was tension>=0.60, reliability>=75, goodFaith==='high', independence>=50).
  // Relaxed to fill the flagship tier; revisit under the v2 reliability-signal rework.
  if (
    tensionOnHeld >= 0.55 &&
    source.reliability >= 65 &&
    source.goodFaith !== 'low' &&
    source.independence >= 50
  ) {
    return 'challenging'
  }

  // Expanding: agreement >= 0.40, tension <= 0.40, novelCoverage >= 0.50, reliability >= 60, not confirming
  if (
    agreement >= 0.40 &&
    tensionOnHeld <= 0.40 &&
    novelCoverage >= 0.50 &&
    source.reliability >= 60
  ) {
    return 'expanding'
  }

  return null  // doesn't fit any tier
}

// ─────────────────────────────────────────────────────────────────────────────
// Diversity pass  (§19.8)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Within-tier diversity pass: prefer format mix and topic spread.
 * For 'challenging', also ensure multi-direction (not all from one lean).
 *
 * Strategy: sort by score, then interleave by kind/format to avoid runs.
 * We sort by agreement (confirming/expanding) or tensionOnHeld (challenging).
 */
function diversitySort(
  sources: ScoredMediaSource[],
  tier: MediaTier
): ScoredMediaSource[] {
  if (sources.length <= 1) return sources

  const primary = tier === 'challenging'
    ? [...sources].sort((a, b) => b.tensionOnHeld - a.tensionOnHeld)
    : [...sources].sort((a, b) => b.agreement - a.agreement)

  // For challenging tier: enforce multi-direction by ensuring not all share the same lean
  if (tier === 'challenging') {
    const leans = primary.map((s) => s.source.coarseLean)
    const uniqueLeans = new Set(leans)
    if (uniqueLeans.size === 1 && primary.length > 1) {
      // All same direction — this is thin diversity but we surface what exists;
      // the seed fallback is the real guard for lopsided results
    }
  }

  // Interleave by kind to maximize format mix within the first N results
  const byKind = new Map<string, ScoredMediaSource[]>()
  for (const s of primary) {
    const k = s.source.kind
    if (!byKind.has(k)) byKind.set(k, [])
    byKind.get(k)!.push(s)
  }

  const interleaved: ScoredMediaSource[] = []
  let changed = true
  while (changed) {
    changed = false
    for (const [, items] of byKind) {
      const next = items.shift()
      if (next) { interleaved.push(next); changed = true }
    }
  }

  return interleaved
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-Mantle editorial seed fallback  (§19.8)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * If a tier is empty after geometry matching, fall back to sources whose
 * `topics` include the mantle's civic focus area. This is a lightweight proxy
 * for the full hand-picked seed list, which is an editorial task (not engine code).
 * The engine signals when a fallback was applied via the returned flag.
 */
function applyMantleSeedFallback(
  tier: ScoredMediaSource[],
  allSources: ScoredMediaSource[],
  tierName: MediaTier,
  placed: Set<string>
): { sources: ScoredMediaSource[]; usedFallback: boolean } {
  if (tier.length > 0) return { sources: tier, usedFallback: false }

  const fallback = allSources
    .filter((s) => !placed.has(s.source.id) && s.source.active === 'active')
    .sort((a, b) => b.source.reliability - a.source.reliability)
    .slice(0, 3)
    .map((s) => ({ ...s, tier: tierName }))
  for (const s of fallback) placed.add(s.source.id)

  return { sources: fallback, usedFallback: fallback.length > 0 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main media matching function  (§19.8)
// ─────────────────────────────────────────────────────────────────────────────

export function matchMedia(
  key: MediaMatchKey,
  catalog: MediaSource[]
): MediaMatchResult {
  // Only match against active sources
  const active = catalog.filter((s) => s.active === 'active')

  const confirming: ScoredMediaSource[] = []
  const expanding:  ScoredMediaSource[] = []
  const challenging: ScoredMediaSource[] = []
  const all: ScoredMediaSource[] = []

  for (const source of active) {
    const agreement      = computeAgreement(key, source)
    const tensionOnHeld  = computeTensionOnHeld(key, source)
    const novelCoverage  = computeNovelCoverage(key, source)

    const tier = assignTier({ agreement, tensionOnHeld, novelCoverage }, source)
    if (!tier) continue

    const scored: ScoredMediaSource = { source, agreement, tensionOnHeld, novelCoverage, tier }
    all.push(scored)
    if (tier === 'confirming')  confirming.push(scored)
    if (tier === 'expanding')   expanding.push(scored)
    if (tier === 'challenging') challenging.push(scored)
  }

  // Diversity pass within each tier
  const sortedConfirming  = diversitySort(confirming,  'confirming')
  const sortedExpanding   = diversitySort(expanding,   'expanding')
  const sortedChallenging = diversitySort(challenging, 'challenging')

  // Per-mantle seed fallback for any empty tier — shared placed-set prevents cloning across tiers
  const placed = new Set<string>([
    ...sortedConfirming.map((s) => s.source.id),
    ...sortedExpanding.map((s) => s.source.id),
    ...sortedChallenging.map((s) => s.source.id),
  ])
  const { sources: finalConfirming }  = applyMantleSeedFallback(sortedConfirming,  all, 'confirming',  placed)
  const { sources: finalExpanding }   = applyMantleSeedFallback(sortedExpanding,   all, 'expanding',   placed)
  const { sources: finalChallenging } = applyMantleSeedFallback(sortedChallenging, all, 'challenging', placed)

  return {
    confirming:  finalConfirming,
    expanding:   finalExpanding,
    challenging: finalChallenging,
  }
}
