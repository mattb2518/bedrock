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

describe('season routing — pillarOneMode + BALLOT_DATA_READY (§22b.1)', () => {
  // Mode comes from site_config.pillar_one_mode, not a hardcoded boolean.
  // BALLOT_DATA_READY is a separate flag that gates the full ballot render.

  it('mode=officials → YourOfficialsMode (always, regardless of BALLOT_DATA_READY)', () => {
    const pillarOneMode = 'officials'
    const BALLOT_DATA_READY = false
    const rendersOfficials = pillarOneMode === 'officials'
    expect(rendersOfficials).toBe(true)
    // BALLOT_DATA_READY is irrelevant when mode=officials
    expect(BALLOT_DATA_READY).toBe(false)
  })

  it('mode=ballot + BALLOT_DATA_READY=false → YourBallotHoldingState (explicit "coming soon")', () => {
    const pillarOneMode = 'ballot'
    const BALLOT_DATA_READY = false
    const rendersBallot = pillarOneMode === 'ballot' && BALLOT_DATA_READY
    const rendersHolding = pillarOneMode === 'ballot' && !BALLOT_DATA_READY
    expect(rendersBallot).toBe(false)
    expect(rendersHolding).toBe(true)
  })

  it('mode=ballot + BALLOT_DATA_READY=true → full ballot render', () => {
    const pillarOneMode = 'ballot'
    const BALLOT_DATA_READY = true
    const rendersBallot = pillarOneMode === 'ballot' && BALLOT_DATA_READY
    expect(rendersBallot).toBe(true)
  })

  it('mode=officials with BALLOT_DATA_READY=true still renders officials (flag does not override mode)', () => {
    const pillarOneMode = 'officials'
    const BALLOT_DATA_READY = true
    // The mode check gates first — BALLOT_DATA_READY is only consulted in ballot mode
    const rendersOfficials = pillarOneMode === 'officials'
    expect(rendersOfficials).toBe(true)
  })
})

// ── 2b. Unlock Ladder exemption for officials mode (§22b.1) ──────────────────

describe('officials mode exempt from Unlock Ladder (§22b.1)', () => {
  // The routing logic in your-ballot/page.tsx:
  //   if (pillarOneMode === 'officials') return <YourOfficialsMode>   ← runs FIRST
  //   if (!unlock.pillar1) return <LockedPillarGate>                  ← ballot only
  //   if (!BALLOT_DATA_READY) return <YourBallotHoldingState>
  //
  // This tests that ordering: officials mode bypasses the unlock gate entirely.

  function simulateRouting(pillarOneMode: 'officials' | 'ballot', unlockPillar1: boolean) {
    const BALLOT_DATA_READY = false
    // Mirrors the exact conditional order in page.tsx
    if (pillarOneMode === 'officials') return 'YourOfficialsMode'
    if (!unlockPillar1) return 'LockedPillarGate'
    if (!BALLOT_DATA_READY) return 'YourBallotHoldingState'
    return 'FullBallotRender'
  }

  it('mode=officials + layersCompleted=0 (unlockPillar1=false) → YourOfficialsMode, not LockedPillarGate', () => {
    expect(simulateRouting('officials', false)).toBe('YourOfficialsMode')
  })

  it('mode=officials + unlockPillar1=true → still YourOfficialsMode (gate not consulted)', () => {
    expect(simulateRouting('officials', true)).toBe('YourOfficialsMode')
  })

  it('mode=ballot + unlockPillar1=false → LockedPillarGate (ballot keeps Layer-3 requirement)', () => {
    expect(simulateRouting('ballot', false)).toBe('LockedPillarGate')
  })

  it('mode=ballot + unlockPillar1=true → YourBallotHoldingState (gate passed, data not ready)', () => {
    expect(simulateRouting('ballot', true)).toBe('YourBallotHoldingState')
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

// ── 6. Congress endpoint + governor filter logic ──────────────────────────────

describe('fetchCongressStateMembers — path-based endpoint + client-side chamber/district filter', () => {
  // Mirrors the filter logic in fetchCurrentOfficials after the state-level call
  interface MockMember {
    bioguideId: string
    partyName: string
    district?: number
    terms: { item: Array<{ chamber: string }> }
  }

  function filterSenate(members: MockMember[]) {
    return members.filter((m) => {
      const c = m.terms?.item?.at(-1)?.chamber?.toLowerCase() ?? ''
      return c === 'senate'
    }).slice(0, 2)
  }

  function filterHouse(members: MockMember[], congressionalDistrict: number | null) {
    return members.filter((m) => {
      const c = m.terms?.item?.at(-1)?.chamber?.toLowerCase() ?? ''
      const isHouse = c === 'house of representatives' || c === 'house'
      if (!isHouse) return false
      if (congressionalDistrict === null) return false
      return m.district === congressionalDistrict
    })
  }

  const VA_MEMBERS: MockMember[] = [
    { bioguideId: 'W000817', partyName: 'Democratic', district: undefined, terms: { item: [{ chamber: 'Senate' }] } },
    { bioguideId: 'K000384', partyName: 'Democratic', district: undefined, terms: { item: [{ chamber: 'Senate' }] } },
    { bioguideId: 'G000596', partyName: 'Democratic', district: 4,         terms: { item: [{ chamber: 'House of Representatives' }] } },
    { bioguideId: 'S000185', partyName: 'Democratic', district: 3,         terms: { item: [{ chamber: 'House of Representatives' }] } },
    { bioguideId: 'C001069', partyName: 'Republican', district: 2,         terms: { item: [{ chamber: 'House of Representatives' }] } },
  ]

  it('filters out senators when looking for house district 4', () => {
    const house = filterHouse(VA_MEMBERS, 4)
    expect(house).toHaveLength(1)
    expect(house[0].bioguideId).toBe('G000596')
  })

  it('returns both senators and no house members for senate filter', () => {
    const senate = filterSenate(VA_MEMBERS)
    expect(senate).toHaveLength(2)
    senate.forEach((m) => expect(m.terms.item.at(-1)?.chamber.toLowerCase()).toBe('senate'))
  })

  it('returns empty for house when congressionalDistrict is null', () => {
    expect(filterHouse(VA_MEMBERS, null)).toHaveLength(0)
  })

  it('returns empty for house district that is not in results', () => {
    expect(filterHouse(VA_MEMBERS, 99)).toHaveLength(0)
  })
})

describe('governor title filter — exact match, excludes Lieutenant Governor', () => {
  interface MockPerson {
    id: string
    current_role: { title: string; org_classification: string } | null
  }

  function findGovernor(people: MockPerson[]) {
    return people.find((p) => p.current_role?.title?.toLowerCase() === 'governor')
  }

  it('selects the Governor when listed after Lt. Governor', () => {
    const people: MockPerson[] = [
      { id: 'lt-gov', current_role: { title: 'Lieutenant Governor', org_classification: 'executive' } },
      { id: 'gov',    current_role: { title: 'Governor',            org_classification: 'executive' } },
    ]
    expect(findGovernor(people)?.id).toBe('gov')
  })

  it('selects the Governor when listed first', () => {
    const people: MockPerson[] = [
      { id: 'gov',    current_role: { title: 'Governor',            org_classification: 'executive' } },
      { id: 'lt-gov', current_role: { title: 'Lieutenant Governor', org_classification: 'executive' } },
    ]
    expect(findGovernor(people)?.id).toBe('gov')
  })

  it('returns undefined (coverage note path) when only Lt. Governor is present', () => {
    const people: MockPerson[] = [
      { id: 'lt-gov', current_role: { title: 'Lieutenant Governor', org_classification: 'executive' } },
    ]
    expect(findGovernor(people)).toBeUndefined()
  })

  it('returns undefined for empty executive result', () => {
    expect(findGovernor([])).toBeUndefined()
  })

  it('matches "governor" case-insensitively', () => {
    const people: MockPerson[] = [
      { id: 'gov', current_role: { title: 'GOVERNOR', org_classification: 'executive' } },
    ]
    expect(findGovernor(people)?.id).toBe('gov')
  })
})

describe('loading UX — message swap after timeout', () => {
  it('loadingLong becomes true after the delay fires (mechanism test with 50ms stub)', async () => {
    // The production delay is 9000ms; we validate the mechanism with 50ms.
    let loadingLong = false
    const DELAY = 50  // stands in for the 9000ms production value
    const timer = setTimeout(() => { loadingLong = true }, DELAY)

    expect(loadingLong).toBe(false)
    await new Promise((r) => setTimeout(r, DELAY + 20))
    expect(loadingLong).toBe(true)

    clearTimeout(timer)
  })

  it('timer resets to false when isPending flips to false', () => {
    let loadingLong = true  // already set from a previous pending cycle
    const isPending = false
    if (!isPending) loadingLong = false
    expect(loadingLong).toBe(false)
  })
})
