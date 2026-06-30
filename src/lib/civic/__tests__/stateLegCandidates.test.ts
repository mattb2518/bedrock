import { describe, it, expect } from 'vitest'
import { parseDistrictInfo } from '../resolveDistrict'
import { matchRace } from '@/lib/engine/match'
import { buildMatchKey } from '@/lib/engine/buildMatchKey'
import type { CandidateRecord, MatchKey } from '@/lib/engine/match'
import type { QuizResult, QuizSession } from '@/types/quiz'
import { ALL_DIMENSIONS } from '@/lib/engine/match'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FLAT_PROFILE = Object.fromEntries(ALL_DIMENSIONS.map((d) => [d, 50])) as Record<string, number>

const BASE_RESULT: QuizResult = {
  primaryType: 'pragmatic_idealist',
  profile: FLAT_PROFILE as any,
  topDimensions: ['markets_governance'],
  completionPercent: 40,
}

const BASE_SESSION: QuizSession = {
  userId: 'user-1',
  result: BASE_RESULT,
  answers: [],
  dealbreakers: [],
}

function makeStateLegCandidate(
  overrides: Partial<CandidateRecord> = {}
): CandidateRecord {
  return {
    id: 'state-cand-1',
    name: 'State Candidate',
    office: 'State Senate — VA-22',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:va/sldu:22',
    party: 'Independent',
    axisPlacement: {},
    dealbreakers: {},
    coverageTier: 'state_legislative',
    sourcedFrom: ['openstates'],
    lastUpdated: '2026-06-30',
    ...overrides,
  }
}

function makeMatchKey(overrides: Partial<MatchKey> = {}): MatchKey {
  return { ...buildMatchKey(BASE_RESULT, BASE_SESSION), ...overrides }
}

// ── 1. parseDistrictInfo — state leg district extraction (Stage 8 extension) ──

describe('parseDistrictInfo — state legislative districts (Stage 8)', () => {
  it('extracts state senate district from sldu OCD-ID', () => {
    const result = parseDistrictInfo(['ocd-division/country:us/state:va/sldu:22'])
    expect(result.stateSenateDistrict).toBe(22)
    expect(result.stateHouseDistrict).toBeNull()
  })

  it('extracts state house district from sldl OCD-ID', () => {
    const result = parseDistrictInfo(['ocd-division/country:us/state:va/sldl:67'])
    expect(result.stateHouseDistrict).toBe(67)
    expect(result.stateSenateDistrict).toBeNull()
  })

  it('extracts both chambers from a full realistic OCD-ID set', () => {
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
    expect(result.stateSenateDistrict).toBe(22)
    expect(result.stateHouseDistrict).toBe(67)
  })

  it('handles district number 1 (does not require padding)', () => {
    const result = parseDistrictInfo(['ocd-division/country:us/state:nh/sldu:1'])
    expect(result.stateSenateDistrict).toBe(1)
  })

  it('handles state with only upper chamber in OCD-IDs (Nebraska unicameral-style)', () => {
    // Nebraska uses sldu even for its unicameral legislature
    const result = parseDistrictInfo(['ocd-division/country:us/state:ne/sldu:12'])
    expect(result.state).toBe('NE')
    expect(result.stateSenateDistrict).toBe(12)
    expect(result.stateHouseDistrict).toBeNull()
  })

  it('returns null for both when no state leg OCD-IDs present', () => {
    const result = parseDistrictInfo([
      'ocd-division/country:us',
      'ocd-division/country:us/state:va',
      'ocd-division/country:us/state:va/cd:5',
    ])
    expect(result.stateSenateDistrict).toBeNull()
    expect(result.stateHouseDistrict).toBeNull()
  })
})

// ── 2. State leg candidates — engine integration ──────────────────────────────

describe('state legislative candidates — engine integration', () => {
  const key = makeMatchKey()

  it('state leg candidate with no axis data produces no_call (graceful degradation)', () => {
    const cand = makeStateLegCandidate()
    const result = matchRace({ raceId: 'state-senate-va-22', candidates: [cand], key })
    expect(result.ranked[0].confidence).toBe('no_call')
    expect(result.ranked[0].score).toBe(0)
  })

  it('does not throw for an unclassified state leg candidate', () => {
    const cand = makeStateLegCandidate()
    expect(() => matchRace({ raceId: 'test', candidates: [cand], key })).not.toThrow()
  })

  it('state leg candidate with axis data ranks above unclassified in same race', () => {
    const classified = makeStateLegCandidate({
      id: 'classified',
      axisPlacement: Object.fromEntries(
        ALL_DIMENSIONS.map((d) => [d, { score: 50, confidence: 0.85, rationale: 'Test', sources: [] }])
      ),
    })
    const unclassified = makeStateLegCandidate({ id: 'unclassified' })

    const result = matchRace({
      raceId: 'state-senate-va-22',
      candidates: [unclassified, classified],
      key,
    })
    expect(result.ranked[0].candidate.id).toBe('classified')
    expect(result.ranked[1].candidate.id).toBe('unclassified')
    expect(result.ranked[1].confidence).toBe('no_call')
  })

  it('dealbreaker crosses state leg candidate — hard excluded (same behavior as federal)', () => {
    const keyWithDB = makeMatchKey({ dealbreakers: [{ itemId: 'DB-1' }] })

    const crosses = makeStateLegCandidate({
      id: 'crosses',
      dealbreakers: { 1: { status: 'crosses', evidence: 'Voted to restrict election access', source: 'openstates' } },
      axisPlacement: Object.fromEntries(
        ALL_DIMENSIONS.map((d) => [d, { score: 50, confidence: 0.85, rationale: 'Test', sources: [] }])
      ),
    })
    const clear = makeStateLegCandidate({
      id: 'clear',
      dealbreakers: { 1: { status: 'clear' } },
      axisPlacement: Object.fromEntries(
        ALL_DIMENSIONS.map((d) => [d, { score: 50, confidence: 0.85, rationale: 'Test', sources: [] }])
      ),
    })

    const result = matchRace({
      raceId: 'state-senate-va-22',
      candidates: [crosses, clear],
      key: keyWithDB,
      dealbreakersAsFlags: false,
    })
    const ids = result.ranked.map((r) => r.candidate.id)
    expect(ids).not.toContain('crosses')
    expect(ids).toContain('clear')
  })
})

// ── 3. Ballot ordering — federal before state leg ─────────────────────────────

describe('ballot ordering — state legislative races appear after federal', () => {
  it('state senate race is third in the results list (after fed senate + fed house)', () => {
    const key = makeMatchKey()

    const fedSenCand = makeStateLegCandidate({
      id: 'fed-sen', office: 'US Senate — VA', district: 'ocd-division/country:us/state:va',
      coverageTier: 'federal',
    })
    const fedHouseCand = makeStateLegCandidate({
      id: 'fed-house', office: 'US House — VA-05', district: 'ocd-division/country:us/state:va/cd:5',
      coverageTier: 'federal',
    })
    const stateSenCand = makeStateLegCandidate({
      id: 'state-sen', office: 'State Senate — VA-22', district: 'ocd-division/country:us/state:va/sldu:22',
    })
    const stateHouseCand = makeStateLegCandidate({
      id: 'state-house', office: 'State House — VA-67', district: 'ocd-division/country:us/state:va/sldl:67',
    })

    // Page builds in this order: fed senate, fed house, state senate, state house
    const results = [
      matchRace({ raceId: 'fed-senate', candidates: [fedSenCand], key }),
      matchRace({ raceId: 'fed-house',  candidates: [fedHouseCand], key }),
      matchRace({ raceId: 'state-senate', candidates: [stateSenCand], key }),
      matchRace({ raceId: 'state-house',  candidates: [stateHouseCand], key }),
    ]

    expect(results[0].raceId).toBe('fed-senate')
    expect(results[1].raceId).toBe('fed-house')
    expect(results[2].raceId).toBe('state-senate')
    expect(results[3].raceId).toBe('state-house')
  })
})

// ── 4. coverageTier — state_legislative on CandidateRecord ───────────────────

describe('state legislative coverageTier', () => {
  it('state leg candidates have coverageTier state_legislative', () => {
    const cand = makeStateLegCandidate()
    expect(cand.coverageTier).toBe('state_legislative')
  })

  it('federal candidates have coverageTier federal', () => {
    const cand = makeStateLegCandidate({ coverageTier: 'federal' })
    expect(cand.coverageTier).toBe('federal')
  })
})
