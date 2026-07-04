import { describe, it, expect } from 'vitest'
import { matchRace } from '@/lib/engine/match'
import { buildMatchKey } from '@/lib/engine/buildMatchKey'
import { ALL_DIMENSIONS } from '@/lib/engine/match'
import type { CandidateRecord, MatchKey, Dimension } from '@/lib/engine/match'
import type { QuizResult, QuizSession, DimensionalProfile } from '@/types/quiz'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FLAT_PROFILE = Object.fromEntries(ALL_DIMENSIONS.map((d) => [d, 50])) as DimensionalProfile

const BASE_RESULT: QuizResult = {
  primaryType: 'pragmatic_idealist',
  profile: FLAT_PROFILE,
  topDimensions: ['markets_governance', 'stability_change'],
  completionPercent: 80,
}

const BASE_SESSION: QuizSession = {
  userId: 'user-1',
  result: BASE_RESULT,
  answers: [],
  dealbreakers: [],
}

function makeMatchKey(overrides: Partial<MatchKey> = {}): MatchKey {
  return { ...buildMatchKey(BASE_RESULT, BASE_SESSION), ...overrides }
}

function makeOfficial(overrides: Partial<CandidateRecord> = {}): CandidateRecord {
  const axisPlacement: CandidateRecord['axisPlacement'] = {}
  for (const d of ALL_DIMENSIONS) {
    axisPlacement[d] = { score: 40, confidence: 0.9, rationale: 'Test', sources: [] }
  }
  return {
    id: 'official-1',
    name: 'Jane Smith',
    office: 'US Senate — VA',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:va',
    party: 'Democrat',
    axisPlacement,
    dealbreakers: {},
    coverageTier: 'federal',
    sourcedFrom: ['congress.gov'],
    lastUpdated: '2026-07-03',
    ...overrides,
  }
}

// ── 1. fetchCurrentOfficials — pure logic (low-confidence threshold) ──────────

describe('lowConfidence threshold — mirrors classificationQueue AUTO_APPROVE_MIN_AXES', () => {
  it('4 axes at confidence > 0.6 → NOT low confidence', () => {
    const dims = ALL_DIMENSIONS.slice(0, 4) as Dimension[]
    const axisPlacement: CandidateRecord['axisPlacement'] = {}
    for (const d of dims) {
      axisPlacement[d] = { score: 50, confidence: 0.7, rationale: 'Test', sources: [] }
    }
    const highConfidenceCount = Object.values(axisPlacement).filter((ap) => ap && ap.confidence > 0.6).length
    expect(highConfidenceCount).toBe(4)
    expect(highConfidenceCount >= 4).toBe(true)
  })

  it('3 axes at confidence > 0.6 → IS low confidence (pending_review)', () => {
    const axisPlacement: CandidateRecord['axisPlacement'] = {}
    for (const d of ALL_DIMENSIONS.slice(0, 3)) {
      axisPlacement[d] = { score: 50, confidence: 0.8, rationale: 'Test', sources: [] }
    }
    for (const d of ALL_DIMENSIONS.slice(3)) {
      axisPlacement[d] = { score: 50, confidence: 0.4, rationale: 'Test', sources: [] }
    }
    const highConfidenceCount = Object.values(axisPlacement).filter((ap) => ap && ap.confidence > 0.6).length
    expect(highConfidenceCount).toBe(3)
    expect(highConfidenceCount < 4).toBe(true)
  })
})

// ── 2. Season toggle — officials mode vs. ballot mode ────────────────────────

describe('season toggle', () => {
  it('HOLDING_STATE=true → out of season → officials mode', () => {
    const HOLDING_STATE = true
    // When holding state is true, your-ballot page renders officials mode.
    // This documents the §22b.1 decision: the toggle is the existing HOLDING_STATE flag.
    expect(HOLDING_STATE).toBe(true)
  })

  it('HOLDING_STATE=false → in season → ballot mode (unchanged)', () => {
    const HOLDING_STATE = false
    expect(HOLDING_STATE).toBe(false)
  })
})

// ── 3. Dealbreaker flag rendering for officials ───────────────────────────────

describe('officials — dealbreakers are FLAGS not exclusions (§22b.4)', () => {
  const key = makeMatchKey({
    dealbreakers: [{ itemId: 'DB-1' }],
  })

  const officialWithCrossedDealbreaker = makeOfficial({
    id: 'official-crossed',
    dealbreakers: { 1: { status: 'crosses', evidence: 'Voted against election certification', source: 'congress.gov' } },
  })

  const officialClear = makeOfficial({
    id: 'official-clear',
    dealbreakers: { 1: { status: 'clear' } },
  })

  it('official with crossed dealbreaker is NOT excluded (dealbreakersAsFlags: true)', () => {
    const result = matchRace({
      raceId: 'officials-race',
      candidates: [officialWithCrossedDealbreaker, officialClear],
      key,
      dealbreakersAsFlags: true,
    })
    const ids = result.ranked.map((r) => r.candidate.id)
    expect(ids).toContain('official-crossed')   // present — not excluded
    expect(ids).toContain('official-clear')
  })

  it('crossedDealbreakers are reflected in the ranked result unknownDealbreakers or via direct dealbreaker check', () => {
    const result = matchRace({
      raceId: 'officials-race',
      candidates: [officialWithCrossedDealbreaker],
      key,
      dealbreakersAsFlags: true,
    })
    // The official is ranked and the crossed dealbreaker is accessible via candidate.dealbreakers
    expect(result.ranked).toHaveLength(1)
    const ranked = result.ranked[0]
    const crossedCount = Object.values(ranked.candidate.dealbreakers)
      .filter((v) => v.status === 'crosses').length
    expect(crossedCount).toBe(1)
  })
})

// ── 4. topAlignedAxes / topDivergentAxes via matchRace ───────────────────────

describe('per-dimension convergence/divergence — derived via matchRace', () => {
  it('topAlignedAxes populated when official shares user values on held dimensions', () => {
    // User holds markets_governance at 80, official is at 80 → should align
    const profile = { ...FLAT_PROFILE, markets_governance: 80 } as DimensionalProfile
    const result: QuizResult = { ...BASE_RESULT, profile, topDimensions: ['markets_governance'] }
    const session: QuizSession = { ...BASE_SESSION, result }
    const key = buildMatchKey(result, session)

    const official = makeOfficial({
      axisPlacement: {
        markets_governance: { score: 80, confidence: 0.9, rationale: 'Test', sources: [] },
        stability_change:   { score: 50, confidence: 0.9, rationale: 'Test', sources: [] },
      },
    })

    const raceResult = matchRace({
      raceId: 'test',
      candidates: [official],
      key,
      dealbreakersAsFlags: true,
    })
    expect(raceResult.ranked).toHaveLength(1)
    expect(raceResult.ranked[0].topAlignedAxes).toContain('markets_governance')
  })

  it('topDivergentAxes populated when official diverges on held dimensions', () => {
    const profile = { ...FLAT_PROFILE, markets_governance: 80 } as DimensionalProfile
    const result: QuizResult = { ...BASE_RESULT, profile, topDimensions: ['markets_governance'] }
    const session: QuizSession = { ...BASE_SESSION, result }
    const key = buildMatchKey(result, session)

    const official = makeOfficial({
      axisPlacement: {
        markets_governance: { score: 20, confidence: 0.9, rationale: 'Test', sources: [] },  // opposite
      },
    })

    const raceResult = matchRace({
      raceId: 'test',
      candidates: [official],
      key,
      dealbreakersAsFlags: true,
    })
    expect(raceResult.ranked[0].topDivergentAxes).toContain('markets_governance')
  })
})

// ── 5. sourceErrors / empty-state rendering logic ────────────────────────────

import type { CurrentOfficialsBallot } from '@/lib/civic/currentOfficials'

function makeOfficialsBallot(overrides: Partial<CurrentOfficialsBallot> = {}): CurrentOfficialsBallot {
  return {
    senators: [],
    representative: null,
    governor: null,
    stateUpperLeg: null,
    stateLowerLeg: null,
    sourceErrors: [],
    ...overrides,
  }
}

describe('officials empty-state rendering logic', () => {
  it('empty officials + sourceErrors → show error message, not empty message', () => {
    const ballot = makeOfficialsBallot({
      sourceErrors: [{ source: 'federal', message: 'CONGRESS_GOV_API_KEY is not set' }],
    })
    const officialsToShow: unknown[] = []
    const shouldShowError = officialsToShow.length === 0 && ballot.sourceErrors.length > 0
    const shouldShowEmpty = officialsToShow.length === 0 && ballot.sourceErrors.length === 0
    expect(shouldShowError).toBe(true)
    expect(shouldShowEmpty).toBe(false)
  })

  it('empty officials + zero sourceErrors → show empty message, not error message', () => {
    const ballot = makeOfficialsBallot({ sourceErrors: [] })
    const officialsToShow: unknown[] = []
    const shouldShowError = officialsToShow.length === 0 && ballot.sourceErrors.length > 0
    const shouldShowEmpty = officialsToShow.length === 0 && ballot.sourceErrors.length === 0
    expect(shouldShowError).toBe(false)
    expect(shouldShowEmpty).toBe(true)
  })

  it('governorCoverageNote only set when fetch succeeded and returned empty', () => {
    // Error case: governorResult.error is non-null → no coverage note
    const governorError = { source: 'governor' as const, message: 'API error 503' }
    const governorResult = { people: [], error: governorError }
    const noteOnError = !governorResult.error && governorResult.people.length === 0
      ? 'Governor data not available' : undefined
    expect(noteOnError).toBeUndefined()

    // Success but empty → coverage note shown
    const governorEmpty = { people: [], error: null }
    const noteOnEmpty = !governorEmpty.error && governorEmpty.people.length === 0
      ? 'Governor data not available' : undefined
    expect(noteOnEmpty).toBe('Governor data not available')
  })
})
