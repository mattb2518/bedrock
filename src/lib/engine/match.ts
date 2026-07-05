/**
 * Recommendation Engine — pure function, no side effects.
 * Profile in → ranked results out.
 * §19 of SPEC.md is the authoritative source for every formula and threshold here.
 */

import { LAYER2_QUESTIONS } from '@/lib/quiz/layer2'

// ─────────────────────────────────────────────────────────────────────────────
// §19.1  Core types
// ─────────────────────────────────────────────────────────────────────────────

export type Dimension =
  | 'stability_change'
  | 'local_federal'
  | 'national_global'
  | 'rules_outcomes'
  | 'markets_governance'
  | 'pragmatism_idealism'
  | 'individual_collective'
  | 'trust_skepticism'

export const ALL_DIMENSIONS: Dimension[] = [
  'stability_change',
  'local_federal',
  'national_global',
  'rules_outcomes',
  'markets_governance',
  'pragmatism_idealism',
  'individual_collective',
  'trust_skepticism',
]

export type DimensionalProfile = Record<Dimension, number>   // 0–100 per axis
export type AxisWeights        = Record<Dimension, number>   // 1.0 default; flagged axes higher
export type AxisConfidence     = Record<Dimension, number>   // 0–1; near-50 answers → lower

// L2 issue stance — which option the user chose for a Layer 2 question
export interface IssuePosition {
  questionId: string         // e.g. 'L2-Q1'
  selectedOptionId: string   // e.g. 'L2-Q1-a'
}

// L3 behavioral modifiers — named fields from §19.1
export interface BehaviorModifiers {
  characterWeight: 'high' | 'medium' | 'low'
  electabilityTolerance: 'high' | 'medium' | 'low'
  downballotSalience: 'high' | 'medium' | 'low'
  crossPartyTolerance: 'high' | 'medium' | 'low'
}

// L4 user-selected dealbreaker item (e.g. 'DB-1')
export interface ExclusionPredicate {
  itemId: string   // matches DealbreakerItem.id from layer4.ts (e.g. 'DB-1')
}

export interface MatchKey {
  // Tier 0 — required (Layer 1 only, ~40% complete)
  profile: DimensionalProfile
  axisWeights: AxisWeights
  axisConfidence: AxisConfidence

  // Tier 1 — optional (Layers 2 & 3, ~65–85% complete)
  issuePositions?: IssuePosition[]
  behaviorMods?: BehaviorModifiers

  // Tier 2 — optional (Layer 4, ~100% complete)
  dealbreakers?: ExclusionPredicate[]

  // Metadata
  completenessPercent: number
  edgeCaseFlag?: 'centered' | 'scattered' | 'near_pure' | null
}

// ─────────────────────────────────────────────────────────────────────────────
// §19.2  Candidate data model
// ─────────────────────────────────────────────────────────────────────────────

export interface AxisPlacement {
  score: number        // 0–100, same polarity as user profile
  confidence: number   // 0–1
  rationale: string    // one-line source basis
  sources: string[]    // citation URLs
}

export type DealbreakEval =
  | { status: 'clear' }
  | { status: 'crosses'; evidence: string; source: string }
  | { status: 'unknown'; note: string }

export interface CandidateRecord {
  id: string
  name: string
  office: string
  officeType: 'ideological' | 'nonpartisan' | 'judicial'
  district: string                  // OCD-ID
  party?: string                    // display only, never used in matching
  axisPlacement: Partial<Record<Dimension, AxisPlacement>>
  // Key is the numeric portion of the DB-N dealbreaker id (1–29)
  dealbreakers: Record<number, DealbreakEval>
  coverageTier: 'federal' | 'statewide' | 'state_legislative' | 'local' | 'school_board'
  sourcedFrom: string[]
  lastUpdated: string               // ISO date
  independentMindedScore?: number   // 0–4; Beyond Your Ballot only
  // When true, no voting record exists — axis confidence is capped at 0.5 at engine time
  rhetoricalOnly?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// §19.5  Confidence bands
// ─────────────────────────────────────────────────────────────────────────────

export type ConfidenceBand = 'confident' | 'lean' | 'informational' | 'no_call'

// Ordered from strongest to weakest — used for min-capping logic
const BAND_ORDER: ConfidenceBand[] = ['confident', 'lean', 'informational', 'no_call']

function minBand(a: ConfidenceBand, b: ConfidenceBand): ConfidenceBand {
  return BAND_ORDER.indexOf(a) >= BAND_ORDER.indexOf(b) ? a : b
}

// ─────────────────────────────────────────────────────────────────────────────
// §19.6  Output per race
// ─────────────────────────────────────────────────────────────────────────────

export interface RankedCandidate {
  candidate: CandidateRecord
  score: number
  confidence: ConfidenceBand
  topAlignedAxes: Dimension[]
  topDivergentAxes: Dimension[]
  explanation: string
  unknownDealbreakers: string[]   // dealbreaker item IDs that were 'unknown'
}

export interface RaceResult {
  raceId: string
  officeName: string
  officeType: 'ideological' | 'nonpartisan' | 'judicial'
  ranked: RankedCandidate[]
  separation: number
  dataCompleteness: number
  attributionSources: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extract the numeric index from a dealbreaker item ID like 'DB-3' → 3 */
function dealbreakerIndex(itemId: string): number {
  return parseInt(itemId.replace('DB-', ''), 10)
}

/**
 * Stage 1 — Hard exclude any candidate who `crosses` a user-selected dealbreaker.
 * Returns { excluded: boolean; unknownIds: string[] }.
 * `unknown` does NOT exclude but must be surfaced to the user.
 */
function evaluateDealbreakers(
  candidate: CandidateRecord,
  userDealbreakers: ExclusionPredicate[] | undefined
): { excluded: boolean; unknownIds: string[] } {
  if (!userDealbreakers || userDealbreakers.length === 0) {
    return { excluded: false, unknownIds: [] }
  }

  const unknownIds: string[] = []

  for (const pred of userDealbreakers) {
    const idx = dealbreakerIndex(pred.itemId)
    const eval_ = candidate.dealbreakers[idx]
    if (!eval_) { unknownIds.push(pred.itemId); continue }  // missing entry → must surface as unknown, not silent clear (§19.4)
    if (eval_.status === 'crosses') return { excluded: true, unknownIds: [] }
    if (eval_.status === 'unknown') unknownIds.push(pred.itemId)
  }

  return { excluded: false, unknownIds }
}

/**
 * Stage 2 — Weighted dimensional distance formula from §19.4.
 *
 * score(c) = Σ_{a∈A}  w_a · conf_cand_a · (1 − |u_a − c_a| / 100)
 *            ────────────────────────────────────────────────────────
 *                        Σ_{a∈A}  w_a · conf_cand_a
 *
 * Missing axes are NEVER imputed to 50 — they are excluded from both
 * numerator and denominator.
 *
 * When rhetoricalOnly === true, candidate axis confidence is capped at 0.5
 * per the §19.4 rhetoric-only rule.
 */
function computeScore(
  key: MatchKey,
  candidate: CandidateRecord
): { score: number; scoredAxes: Dimension[] } {
  let numerator = 0
  let denominator = 0
  const scoredAxes: Dimension[] = []

  for (const axis of ALL_DIMENSIONS) {
    const placement = candidate.axisPlacement[axis]
    if (!placement || placement.confidence <= 0) continue

    const w = key.axisWeights[axis] ?? 1.0
    const userScore = key.profile[axis]

    // Apply rhetoric-only cap: challenger with no voting record → conf ≤ 0.5
    const candConf = candidate.rhetoricalOnly
      ? Math.min(placement.confidence, 0.5)
      : placement.confidence

    const similarity = 1 - Math.abs(userScore - placement.score) / 100

    numerator   += w * candConf * similarity
    denominator += w * candConf
    scoredAxes.push(axis)
  }

  const score = denominator > 0 ? numerator / denominator : 0
  return { score, scoredAxes }
}

/**
 * Coverage-based confidence band for a single candidate.
 *
 * Judgment calls (flagged):
 * - 6+ scored axes AND all user priority axes covered → can reach 'confident'
 * - 4–5 scored axes → ceiling 'lean'
 * - 2–3 scored axes → ceiling 'informational'
 * - <2 → 'no_call'
 * Priority axes = those where axisWeights[a] > 1.0
 */
function coverageBand(key: MatchKey, scoredAxes: Dimension[]): ConfidenceBand {
  const priorityAxes = ALL_DIMENSIONS.filter((a) => (key.axisWeights[a] ?? 1.0) > 1.0)
  const priorityCovered = priorityAxes.every((a) => scoredAxes.includes(a))
  const n = scoredAxes.length

  if (n >= 6 && (priorityAxes.length === 0 || priorityCovered)) return 'confident'
  if (n >= 4) return 'lean'
  if (n >= 2) return 'informational'
  return 'no_call'
}

/**
 * Unknown-dealbreaker cap on confidence band.
 *
 * Judgment calls (flagged):
 * - 1 unknown dealbreaker → cap at 'lean'
 * - 2+ unknown dealbreakers → cap at 'informational'
 */
function unknownDealbreakerBand(unknownCount: number): ConfidenceBand {
  if (unknownCount === 0) return 'confident'
  if (unknownCount === 1) return 'lean'
  return 'informational'
}

/**
 * Separation-based confidence band.
 *
 * Judgment calls (flagged):
 * - gap ≥ 0.20 → 'confident'
 * - gap ≥ 0.10 → 'lean'
 * - gap ≥ 0.05 → 'informational'
 * - gap <  0.05 → 'no_call'
 */
function separationBand(separation: number): ConfidenceBand {
  if (separation >= 0.20) return 'confident'
  if (separation >= 0.10) return 'lean'
  if (separation >= 0.05) return 'informational'
  return 'no_call'
}

/**
 * Layer 2 bounded confidence boost.
 *
 * Scans issuePositions for any that directly corroborate candidate alignment
 * on an axis. Boost is capped so it cannot overturn the dimensional ranking.
 * Upgrade rules:
 * - 'lean' → 'confident' only when 2+ positions corroborate
 * - 'no_call' is NEVER upgraded by L2 positions
 * - 'informational' is NEVER upgraded to 'confident'
 */
function applyL2Boost(
  current: ConfidenceBand,
  candidate: CandidateRecord,
  issuePositions: IssuePosition[] | undefined,
  key: MatchKey
): ConfidenceBand {
  if (!issuePositions || issuePositions.length === 0) return current
  if (current === 'no_call') return current  // hard floor

  // Count corroborating positions using the real issue-to-dimension mapping.
  // Each L2 question declares which dimension(s) it's evidence for via its
  // `dimensions` field (filled in during Stage 3). A position corroborates a
  // candidate when the candidate's score on EVERY declared dimension is within
  // 25 points of the user's profile score on that dimension.
  const questionMap = new Map(LAYER2_QUESTIONS.map((q) => [q.id, q]))
  let corroborating = 0
  for (const pos of issuePositions) {
    const question = questionMap.get(pos.questionId)
    if (!question || question.dimensions.length === 0) continue

    const allDimsCorroborate = question.dimensions.every((axis) => {
      const placement = candidate.axisPlacement[axis as Dimension]
      if (!placement) return false
      return Math.abs(key.profile[axis as Dimension] - placement.score) <= 25
    })
    if (allDimsCorroborate) corroborating++
  }

  if (current === 'lean' && corroborating >= 2) return 'confident'
  return current
}

/**
 * Build a human-readable explanation from the candidate's top aligned axes.
 * Actual production copy is Claude-generated from the pillar page — this is
 * a structured template for the pure-function layer.
 */
function buildExplanation(
  candidate: CandidateRecord,
  topAligned: Dimension[],
  topDivergent: Dimension[]
): string {
  const axisLabel: Record<Dimension, string> = {
    stability_change:      'stability vs. change',
    local_federal:         'local vs. federal authority',
    national_global:       'national vs. global outlook',
    rules_outcomes:        'rules vs. outcomes',
    markets_governance:    'markets vs. governance',
    pragmatism_idealism:   'pragmatism vs. idealism',
    individual_collective: 'individual vs. collective',
    trust_skepticism:      'institutional trust vs. skepticism',
  }

  const aligned   = topAligned.map((a) => axisLabel[a]).join(', ')
  const divergent = topDivergent.map((a) => axisLabel[a]).join(', ')

  let explanation = `${candidate.name} aligns with your values`
  if (aligned)   explanation += ` most strongly on: ${aligned}`
  if (divergent) explanation += `. Greatest divergence on: ${divergent}`
  explanation += '.'
  return explanation
}

// ─────────────────────────────────────────────────────────────────────────────
// §19.4 / §19.7  Main engine — match one race
// ─────────────────────────────────────────────────────────────────────────────

export interface MatchRaceOptions {
  raceId: string
  candidates: CandidateRecord[]
  key: MatchKey
  // When true, dealbreakers become yellow flags rather than hard exclusions
  // (used for Beyond Your Ballot per §19.9)
  dealbreakersAsFlags?: boolean
}

export function matchRace(opts: MatchRaceOptions): RaceResult {
  const { raceId, candidates, key, dealbreakersAsFlags = false } = opts

  // ── nonpartisan / judicial short-circuit ──────────────────────────────────
  // §19.7: nonpartisan/judicial offices don't values-match
  const firstCandidate = candidates[0]
  if (firstCandidate && firstCandidate.officeType !== 'ideological') {
    return {
      raceId,
      officeName: firstCandidate.office,
      officeType: firstCandidate.officeType,
      ranked: candidates.map((c) => ({
        candidate: c,
        score: 0,
        confidence: 'no_call',
        topAlignedAxes: [],
        topDivergentAxes: [],
        explanation: 'Values matching does not apply to this office. See endorsements and qualifications.',
        unknownDealbreakers: [],
      })),
      separation: 0,
      dataCompleteness: 0,
      attributionSources: [],
    }
  }

  // ── Stage 1: dealbreaker filtering ───────────────────────────────────────
  const scored: Array<{
    candidate: CandidateRecord
    score: number
    scoredAxes: Dimension[]
    unknownIds: string[]
  }> = []

  for (const candidate of candidates) {
    const { excluded, unknownIds } = evaluateDealbreakers(candidate, key.dealbreakers)
    if (excluded && !dealbreakersAsFlags) continue  // hard exclusion

    // ── Stage 2: weighted dimensional distance ──────────────────────────────
    const { score, scoredAxes } = computeScore(key, candidate)
    scored.push({ candidate, score, scoredAxes, unknownIds })
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score)

  const separation =
    scored.length >= 2 ? scored[0].score - scored[1].score : (scored[0]?.score ?? 0)

  // ── Build ranked output ───────────────────────────────────────────────────
  const ranked: RankedCandidate[] = scored.map(({ candidate, score, scoredAxes, unknownIds }) => {
    // Top aligned / divergent axes (from scored axes only)
    const axisGaps = scoredAxes
      .map((a) => ({
        axis: a,
        gap: Math.abs(key.profile[a] - (candidate.axisPlacement[a]?.score ?? 50)),
      }))
      .sort((x, y) => x.gap - y.gap)

    const topAlignedAxes   = axisGaps.slice(0, 3).map((x) => x.axis)
    const topDivergentAxes = axisGaps.slice(-3).reverse().map((x) => x.axis)

    // Confidence band = min of three factors (weakest caps the result)
    let band: ConfidenceBand = coverageBand(key, scoredAxes)
    band = minBand(band, unknownDealbreakerBand(unknownIds.length))
    band = minBand(band, separationBand(separation))

    // L2 bounded boost (cannot overturn ranking, cannot lift no_call)
    band = applyL2Boost(band, candidate, key.issuePositions, key)

    return {
      candidate,
      score,
      confidence: band,
      topAlignedAxes,
      topDivergentAxes,
      explanation: buildExplanation(candidate, topAlignedAxes, topDivergentAxes),
      unknownDealbreakers: unknownIds,
    }
  })

  // Attribution sources: union across all ranked candidates
  const attributionSources = Array.from(
    new Set(
      ranked.flatMap((r) =>
        ALL_DIMENSIONS.flatMap((a) => r.candidate.axisPlacement[a]?.sources ?? [])
      )
    )
  )

  // Data completeness: average coverage ratio across ranked candidates
  const dataCompleteness =
    ranked.length > 0
      ? ranked.reduce(
          (sum, r) => sum + Object.keys(r.candidate.axisPlacement).length / 8,
          0
        ) / ranked.length
      : 0

  return {
    raceId,
    officeName: firstCandidate?.office ?? '',
    officeType: (firstCandidate?.officeType ?? 'ideological') as RaceResult['officeType'],
    ranked,
    separation,
    dataCompleteness,
    attributionSources,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// §19.9  Beyond Your Ballot pre-filters
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply the two Beyond Your Ballot pre-filters to a candidate set before
 * passing to matchRace:
 * 1. Remove candidates in any of the user's own district OCD-IDs.
 * 2. Require independentMindedScore >= 2.
 *
 * Dealbreakers are flags, not exclusions, per §19.9 — callers should pass
 * dealbreakersAsFlags: true to matchRace.
 */
export function filterBeyondBallotCandidates(
  candidates: CandidateRecord[],
  userDistrictIds: string[]
): CandidateRecord[] {
  return candidates.filter(
    (c) =>
      !userDistrictIds.includes(c.district) &&
      (c.independentMindedScore ?? 0) >= 2
  )
}
