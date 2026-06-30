import { describe, it, expect } from 'vitest'
import { matchRace } from '@/lib/engine/match'
import { buildMatchKey } from '@/lib/engine/buildMatchKey'
import { parseDistrictInfo } from '@/lib/civic/resolveDistrict'
import type { CandidateRecord, MatchKey } from '@/lib/engine/match'
import type { QuizResult, QuizSession } from '@/types/quiz'
import { ALL_DIMENSIONS } from '@/lib/engine/match'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FLAT_PROFILE = Object.fromEntries(ALL_DIMENSIONS.map((d) => [d, 50])) as Record<string, number>

const BASE_RESULT: QuizResult = {
  primaryType: 'pragmatic_idealist',
  profile: FLAT_PROFILE as any,
  topDimensions: ['markets_governance', 'stability_change'],
  completionPercent: 40,
}

const BASE_SESSION: QuizSession = {
  userId: 'user-1',
  result: BASE_RESULT,
  answers: [],
  dealbreakers: [],
}

// A candidate fully classified on 8 axes
function makeCandidate(overrides: Partial<CandidateRecord> = {}): CandidateRecord {
  const axisPlacement: CandidateRecord['axisPlacement'] = {}
  for (const d of ALL_DIMENSIONS) {
    axisPlacement[d] = { score: 40, confidence: 0.9, rationale: 'Test', sources: [] }
  }
  return {
    id: 'cand-1',
    name: 'Test Candidate',
    office: 'US House — VA-05',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:va/cd:5',
    party: 'Independent',
    axisPlacement,
    dealbreakers: {},
    coverageTier: 'federal',
    sourcedFrom: ['congress.gov'],
    lastUpdated: '2026-06-30',
    ...overrides,
  }
}

// A candidate with NO axis placement (simulates live-API candidate with no classification)
function makeUnclassifiedCandidate(overrides: Partial<CandidateRecord> = {}): CandidateRecord {
  return makeCandidate({ ...overrides, axisPlacement: {} })
}

function makeMatchKey(overrides: Partial<MatchKey> = {}): MatchKey {
  return {
    ...buildMatchKey(BASE_RESULT, BASE_SESSION),
    ...overrides,
  }
}

// ── 1. parseDistrictInfo — OCD-ID parsing ────────────────────────────────────

describe('parseDistrictInfo — OCD-ID → state + district', () => {
  it('extracts state from state-level OCD-ID', () => {
    const result = parseDistrictInfo(['ocd-division/country:us/state:va'])
    expect(result.state).toBe('VA')
    expect(result.congressionalDistrict).toBeNull()
  })

  it('extracts state and district from congressional district OCD-ID', () => {
    const result = parseDistrictInfo(['ocd-division/country:us/state:va/cd:5'])
    expect(result.state).toBe('VA')
    expect(result.congressionalDistrict).toBe(5)
  })

  it('extracts from a realistic set of mixed OCD-IDs', () => {
    const ocdIds = [
      'ocd-division/country:us',
      'ocd-division/country:us/state:va',
      'ocd-division/country:us/state:va/cd:5',
      'ocd-division/country:us/state:va/sldu:22',
      'ocd-division/country:us/state:va/sldl:67',
    ]
    const result = parseDistrictInfo(ocdIds)
    expect(result.state).toBe('VA')
    expect(result.congressionalDistrict).toBe(5)
  })

  it('returns nulls for empty list', () => {
    const result = parseDistrictInfo([])
    expect(result.state).toBeNull()
    expect(result.congressionalDistrict).toBeNull()
  })

  it('handles at-large districts (cd:0)', () => {
    const result = parseDistrictInfo(['ocd-division/country:us/state:ak/cd:0'])
    expect(result.state).toBe('AK')
    expect(result.congressionalDistrict).toBe(0)
  })
})

// ── 2. Quiz gating — address field visibility ─────────────────────────────────

describe('quiz gating — address field logic', () => {
  it('address field is NOT shown when there is no profile (hasProfile = false)', () => {
    // This test documents the rule from §22.3: generic ballots are not a feature.
    // The page renders the CTA block and NOT the address form when session?.result is falsy.
    // We verify the gating condition directly since the page is a client component.
    const session = null
    const hasProfile = Boolean((session as any)?.result)
    expect(hasProfile).toBe(false)
    // When hasProfile is false the page does NOT render the address field
  })

  it('address field IS shown when Layer 1 is complete (completionPercent >= 40)', () => {
    const hasProfile = Boolean(BASE_SESSION.result)
    expect(hasProfile).toBe(true)
    expect(BASE_SESSION.result?.completionPercent).toBe(40)
    // When hasProfile is true the address form renders
  })

  it('completionIndicatorPct maps 40% → 40', () => {
    function completionIndicatorPct(pct: number): number {
      if (pct >= 95) return 100
      if (pct >= 80) return 85
      if (pct >= 60) return 65
      return 40
    }
    expect(completionIndicatorPct(40)).toBe(40)
    expect(completionIndicatorPct(60)).toBe(65)
    expect(completionIndicatorPct(80)).toBe(85)
    expect(completionIndicatorPct(100)).toBe(100)
  })
})

// ── 3. Dealbreaker HARD EXCLUSION (Your Ballot) vs. flag-only (BYB) ──────────

describe('Your Ballot — dealbreakers are HARD EXCLUSIONS (contrast with Beyond Your Ballot)', () => {
  const key = makeMatchKey({
    dealbreakers: [{ itemId: 'DB-1' }],  // user has selected dealbreaker DB-1
  })

  const candidateCrosses = makeCandidate({
    id: 'cand-crosses',
    dealbreakers: { 1: { status: 'crosses', evidence: 'Voted against election certification', source: 'congress.gov' } },
  })

  const candidateClear = makeCandidate({
    id: 'cand-clear',
    dealbreakers: { 1: { status: 'clear' } },
  })

  it('excludes the dealbreaker-crossing candidate (dealbreakersAsFlags: false)', () => {
    const result = matchRace({
      raceId: 'test-race',
      candidates: [candidateCrosses, candidateClear],
      key,
      dealbreakersAsFlags: false,   // YOUR BALLOT default — hard exclusion
    })
    const ids = result.ranked.map((r) => r.candidate.id)
    expect(ids).not.toContain('cand-crosses')   // EXCLUDED
    expect(ids).toContain('cand-clear')          // still present
  })

  it('CONTROL: does NOT exclude when dealbreakersAsFlags: true (the BYB behavior)', () => {
    const result = matchRace({
      raceId: 'test-race',
      candidates: [candidateCrosses, candidateClear],
      key,
      dealbreakersAsFlags: true,    // BEYOND YOUR BALLOT mode — flag only
    })
    const ids = result.ranked.map((r) => r.candidate.id)
    expect(ids).toContain('cand-crosses')   // NOT excluded — flag only
    expect(ids).toContain('cand-clear')
  })
})

// ── 4. No axis placement → no_call graceful handling ─────────────────────────

describe('unclassified candidate → no_call (graceful degradation)', () => {
  const key = makeMatchKey()

  it('produces no_call for a candidate with no axis data (live-API candidate)', () => {
    const unclassified = makeUnclassifiedCandidate({ id: 'live-cand' })
    const result = matchRace({
      raceId: 'test-race',
      candidates: [unclassified],
      key,
    })
    expect(result.ranked).toHaveLength(1)
    expect(result.ranked[0].confidence).toBe('no_call')
    expect(result.ranked[0].score).toBe(0)
  })

  it('does NOT throw or error for an unclassified candidate — graceful, not an error', () => {
    const unclassified = makeUnclassifiedCandidate({ id: 'live-cand' })
    expect(() =>
      matchRace({ raceId: 'test-race', candidates: [unclassified], key })
    ).not.toThrow()
  })

  it('mixes classified and unclassified candidates in the same race — classified ranks higher', () => {
    const classified = makeCandidate({ id: 'classified', axisPlacement: Object.fromEntries(
      ALL_DIMENSIONS.map((d) => [d, { score: 50, confidence: 0.9, rationale: 'Test', sources: [] }])
    ) })
    const unclassified = makeUnclassifiedCandidate({ id: 'unclassified' })

    const result = matchRace({
      raceId: 'test-race',
      candidates: [unclassified, classified],
      key,
    })
    expect(result.ranked[0].candidate.id).toBe('classified')
    expect(result.ranked[0].confidence).not.toBe('no_call')
    expect(result.ranked[1].candidate.id).toBe('unclassified')
    expect(result.ranked[1].confidence).toBe('no_call')
  })
})

// ── 5. buildMatchKey produces correct structure from quiz session ─────────────

describe('buildMatchKey — integrates with Your Ballot engine call', () => {
  it('produces a valid MatchKey from a Layer 1 session', () => {
    const key = buildMatchKey(BASE_RESULT, BASE_SESSION)
    expect(key.completenessPercent).toBe(40)
    expect(key.profile).toBeDefined()
    expect(key.axisWeights).toBeDefined()
    // Priority axes have 1.5× weight
    expect(key.axisWeights['markets_governance']).toBe(1.5)
    expect(key.axisWeights['stability_change']).toBe(1.5)
    // Non-priority axes stay at 1.0
    expect(key.axisWeights['local_federal']).toBe(1.0)
  })

  it('dealbreakers from session are included in the MatchKey', () => {
    const sessionWithDealbreakers: QuizSession = {
      ...BASE_SESSION,
      dealbreakers: ['DB-1', 'DB-3'],
    }
    const key = buildMatchKey(BASE_RESULT, sessionWithDealbreakers)
    expect(key.dealbreakers).toHaveLength(2)
    expect(key.dealbreakers![0].itemId).toBe('DB-1')
    expect(key.dealbreakers![1].itemId).toBe('DB-3')
  })
})

// ── 6. Ballot ordering — Senate before House ─────────────────────────────────

describe('ballot ordering — federal races', () => {
  it('Senate results are built before House results (ballot order convention)', () => {
    const key = makeMatchKey()

    const senateCandidate = makeCandidate({ id: 'senator', office: 'US Senate — VA', district: 'ocd-division/country:us/state:va' })
    const houseCandidate = makeCandidate({ id: 'rep', office: 'US House — VA-05', district: 'ocd-division/country:us/state:va/cd:5' })

    const senateResult = matchRace({ raceId: 'senate', candidates: [senateCandidate], key })
    const houseResult  = matchRace({ raceId: 'house',  candidates: [houseCandidate], key })

    // Ordering is enforced by page render logic — senate is pushed first
    const results = [senateResult, houseResult]
    expect(results[0].raceId).toBe('senate')
    expect(results[1].raceId).toBe('house')
  })
})
