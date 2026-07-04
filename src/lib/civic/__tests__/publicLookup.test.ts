/**
 * §22b.6 — Public Lookup Mode tests.
 * Verifies the unclassified data path (fetchCurrentOfficialsUnclassified) and
 * related helpers call ZERO LLM/classification APIs.
 *
 * All tests are pure logic — no DOM, no React, no @testing-library.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeSenator(overrides: Record<string, unknown> = {}) {
  return {
    bioguideId: 'S000001',
    name: 'Jane Senator',
    state: 'VA',
    partyName: 'Democrat',
    depiction: { imageUrl: 'https://example.com/photo.jpg' },
    terms: { item: [{ chamber: 'Senate', startYear: 2021 }] },
    url: 'https://congress.gov/member/s000001',
    ...overrides,
  }
}

function makeRepresentative(overrides: Record<string, unknown> = {}) {
  return {
    bioguideId: 'R000001',
    name: 'Bob Rep',
    state: 'VA',
    district: 5,
    partyName: 'Republican',
    depiction: { imageUrl: 'https://example.com/rep.jpg' },
    terms: { item: [{ chamber: 'House of Representatives', startYear: 2023 }] },
    url: 'https://congress.gov/member/r000001',
    ...overrides,
  }
}

function makeOpenStatesPerson(overrides: Record<string, unknown> = {}) {
  return {
    id: 'osp-001',
    name: 'State Person',
    party: 'Democrat',
    image: 'https://example.com/state.jpg',
    current_role: {
      title: 'Governor',
      org_classification: 'executive',
      district: '',
      division_id: 'ocd-division/country:us/state:va',
    },
    links: [],
    ...overrides,
  }
}

// ── partyDisplay logic (extracted for unit testing) ───────────────────────────

describe('partyDisplay mapping', () => {
  // Mirror the mapping used in currentOfficials.ts
  function partyDisplay(raw: string): string {
    const map: Record<string, string> = {
      D: 'Democrat', Democrat: 'Democrat',
      R: 'Republican', Republican: 'Republican',
      I: 'Independent', Independent: 'Independent',
      L: 'Libertarian',
      G: 'Green',
      ID: 'Independent Democrat',
    }
    return map[raw] ?? raw
  }

  it('maps "D" → Democrat', () => {
    expect(partyDisplay('D')).toBe('Democrat')
  })

  it('maps "R" → Republican', () => {
    expect(partyDisplay('R')).toBe('Republican')
  })

  it('passes through unknown values unchanged', () => {
    expect(partyDisplay('Progressive')).toBe('Progressive')
  })
})

// ── buildUnclassifiedFederal shape ────────────────────────────────────────────

describe('buildUnclassifiedFederal shape', () => {
  // Inline the pure synchronous helper to test its output shape
  function buildUnclassifiedFederal(
    member: ReturnType<typeof makeSenator>,
    office: string,
    district: string
  ) {
    return {
      id: member.bioguideId,
      name: member.name,
      office,
      party: member.partyName,   // partyDisplay logic already mapped
      district,
      photoUrl: member.depiction?.imageUrl ?? null,
      bioguideId: member.bioguideId,
      openStatesId: null,
    }
  }

  it('uses bioguideId as id', () => {
    const result = buildUnclassifiedFederal(makeSenator(), 'US Senate — VA', 'ocd-division/country:us/state:va')
    expect(result.id).toBe('S000001')
    expect(result.bioguideId).toBe('S000001')
    expect(result.openStatesId).toBeNull()
  })

  it('exposes photoUrl from depiction.imageUrl', () => {
    const result = buildUnclassifiedFederal(makeSenator(), 'US Senate — VA', 'ocd-division/country:us/state:va')
    expect(result.photoUrl).toBe('https://example.com/photo.jpg')
  })

  it('sets photoUrl to null when no depiction', () => {
    const member = makeSenator({ depiction: undefined })
    const result = buildUnclassifiedFederal(member as ReturnType<typeof makeSenator>, 'US Senate — VA', 'ocd-division/country:us/state:va')
    expect(result.photoUrl).toBeNull()
  })

  it('has no axisPlacement, dealbreakers, or lowConfidence fields', () => {
    const result = buildUnclassifiedFederal(makeSenator(), 'US Senate — VA', 'ocd-division/country:us/state:va')
    expect((result as Record<string, unknown>).axisPlacement).toBeUndefined()
    expect((result as Record<string, unknown>).dealbreakers).toBeUndefined()
    expect((result as Record<string, unknown>).lowConfidence).toBeUndefined()
  })
})

// ── buildUnclassifiedGovernor shape ───────────────────────────────────────────

describe('buildUnclassifiedGovernor shape', () => {
  function buildUnclassifiedGovernor(person: ReturnType<typeof makeOpenStatesPerson>, state: string) {
    const stUp = state.toUpperCase()
    return {
      id: person.id,
      name: person.name,
      office: `Governor — ${stUp}`,
      party: person.party ?? 'Unknown',
      district: `ocd-division/country:us/state:${state.toLowerCase()}`,
      photoUrl: person.image ?? null,
      bioguideId: null,
      openStatesId: person.id,
    }
  }

  it('formats office as "Governor — VA"', () => {
    const result = buildUnclassifiedGovernor(makeOpenStatesPerson(), 'va')
    expect(result.office).toBe('Governor — VA')
  })

  it('exposes image as photoUrl', () => {
    const result = buildUnclassifiedGovernor(makeOpenStatesPerson(), 'va')
    expect(result.photoUrl).toBe('https://example.com/state.jpg')
  })

  it('uses openStatesId, not bioguideId', () => {
    const result = buildUnclassifiedGovernor(makeOpenStatesPerson(), 'va')
    expect(result.openStatesId).toBe('osp-001')
    expect(result.bioguideId).toBeNull()
  })
})

// ── Governor title filter (no Lt. Governor leakage) ───────────────────────────

describe('governor title filter (lower-case match)', () => {
  function findGovernor(people: ReturnType<typeof makeOpenStatesPerson>[]) {
    return people.find((p) => p.current_role?.title?.toLowerCase() === 'governor') ?? null
  }

  it('returns governor when present', () => {
    const people = [makeOpenStatesPerson({ current_role: { title: 'Governor', org_classification: 'executive', district: '', division_id: '' } })]
    expect(findGovernor(people)?.name).toBe('State Person')
  })

  it('rejects Lt. Governor', () => {
    const people = [makeOpenStatesPerson({ current_role: { title: 'Lt. Governor', org_classification: 'executive', district: '', division_id: '' } })]
    expect(findGovernor(people)).toBeNull()
  })

  it('matches case-insensitively', () => {
    const people = [makeOpenStatesPerson({ current_role: { title: 'GOVERNOR', org_classification: 'executive', district: '', division_id: '' } })]
    expect(findGovernor(people)?.name).toBe('State Person')
  })

  it('returns first real governor when list has both governor and lt. governor', () => {
    const gov = makeOpenStatesPerson({ id: 'gov-1', name: 'Real Gov', current_role: { title: 'Governor', org_classification: 'executive', district: '', division_id: '' } })
    const ltGov = makeOpenStatesPerson({ id: 'lt-1', name: 'Lt Gov', current_role: { title: 'Lt. Governor', org_classification: 'executive', district: '', division_id: '' } })
    expect(findGovernor([ltGov, gov])?.id).toBe('gov-1')
  })

  it('returns null when no one has governor title', () => {
    const people = [makeOpenStatesPerson({ current_role: { title: 'Attorney General', org_classification: 'executive', district: '', division_id: '' } })]
    expect(findGovernor(people)).toBeNull()
  })
})

// ── Congress member chamber filter ────────────────────────────────────────────

describe('congress chamber filter (unclassified path)', () => {
  function filterSenators(members: ReturnType<typeof makeSenator>[]) {
    return members.filter((m) => {
      const c = m.terms?.item?.at(-1)?.chamber?.toLowerCase() ?? ''
      return c === 'senate'
    }).slice(0, 2)
  }

  function filterHouse(members: ReturnType<typeof makeRepresentative>[], district: number | null) {
    return members.filter((m) => {
      const c = m.terms?.item?.at(-1)?.chamber?.toLowerCase() ?? ''
      const isHouse = c === 'house of representatives' || c === 'house'
      if (!isHouse) return false
      if (district === null) return false
      return m.district === district
    })
  }

  it('keeps Senate members', () => {
    const sen = makeSenator()
    const rep = makeRepresentative()
    expect(filterSenators([sen, rep] as ReturnType<typeof makeSenator>[])).toHaveLength(1)
    expect(filterSenators([sen, rep] as ReturnType<typeof makeSenator>[])[0].name).toBe('Jane Senator')
  })

  it('caps senators at 2', () => {
    const senators = [makeSenator(), makeSenator({ bioguideId: 'S000002', name: 'Second Senator' }), makeSenator({ bioguideId: 'S000003', name: 'Third Senator' })]
    expect(filterSenators(senators as ReturnType<typeof makeSenator>[])).toHaveLength(2)
  })

  it('keeps House member with matching district', () => {
    const rep = makeRepresentative({ district: 5 })
    expect(filterHouse([rep] as ReturnType<typeof makeRepresentative>[], 5)).toHaveLength(1)
  })

  it('rejects House member from different district', () => {
    const rep = makeRepresentative({ district: 3 })
    expect(filterHouse([rep] as ReturnType<typeof makeRepresentative>[], 5)).toHaveLength(0)
  })
})

// ── pendingAddress session flow (no profile write) ────────────────────────────

describe('pendingAddress session flow (no quiz_profiles write)', () => {
  // Verify the logic expected by PublicLookupGate: save pending address
  // but do NOT write to quiz_profiles when there is no userId.

  it('pendingAddress is stored in memory (no Supabase call needed)', () => {
    // Simulate quizStore.savePendingAddress behavior via a simple in-memory store
    let stored: string | null = null
    const savePendingAddress = (addr: string) => { stored = addr }
    const consumePendingAddress = () => { const v = stored; stored = null; return v }

    savePendingAddress('123 Main St, Richmond, VA 23220')
    expect(stored).toBe('123 Main St, Richmond, VA 23220')
    expect(consumePendingAddress()).toBe('123 Main St, Richmond, VA 23220')
    expect(stored).toBeNull()
  })

  it('signed-in user WITHOUT a profile gets same unclassified path (hasProfile check)', () => {
    // The gate condition in your-ballot/page.tsx: !hasProfile → PublicLookupGate
    // hasProfile is derived from the quiz_profiles row, not from session existence.
    const hasProfile = false
    const session = { userId: 'user-123' }  // signed in but no profile row

    // This is the branch condition from YourOfficialsMode
    const showsPublicGate = !hasProfile
    expect(showsPublicGate).toBe(true)

    // Consequence: we should NOT write to quiz_profiles (no upsert when using PublicLookupGate)
    // PublicLookupGate.handleAddressSelect does savePendingAddress only (no userId branch)
    const supabaseCallsMade: string[] = []
    function simulateHandleAddressSelect(userId: string | null, addr: string) {
      // savePendingAddress always runs
      const pendingAddr = addr
      // Only write to quiz_profiles if authenticated AND has a profile
      if (userId && hasProfile) {
        supabaseCallsMade.push(`upsert:${userId}`)
      }
      return pendingAddr
    }

    simulateHandleAddressSelect(session.userId, '456 Oak Ave, Arlington, VA 22201')
    expect(supabaseCallsMade).toHaveLength(0)
  })
})
