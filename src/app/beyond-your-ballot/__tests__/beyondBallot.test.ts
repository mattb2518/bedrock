import { describe, it, expect } from 'vitest'
import { filterBeyondBallotCandidates, matchRace } from '@/lib/engine/match'
import candidates from '@/data/beyond-ballot-candidates'
import type { BYBCandidateRecord } from '@/data/beyond-ballot-candidates'
import type { MatchKey } from '@/lib/engine/match'

// ── Shared test fixtures ──────────────────────────────────────────────────────

const TEST_DISTRICT = 'ocd-division/country:us/state:TEST/cd:99'

const FLAT_MATCH_KEY: MatchKey = {
  profile: {
    stability_change:      50,
    local_federal:         50,
    national_global:       50,
    rules_outcomes:        50,
    markets_governance:    50,
    pragmatism_idealism:   50,
    individual_collective: 50,
    trust_skepticism:      50,
  },
  axisWeights: {
    stability_change:      1.0,
    local_federal:         1.0,
    national_global:       1.0,
    rules_outcomes:        1.0,
    markets_governance:    1.0,
    pragmatism_idealism:   1.0,
    individual_collective: 1.0,
    trust_skepticism:      1.0,
  },
  axisConfidence: {
    stability_change:      0.8,
    local_federal:         0.8,
    national_global:       0.8,
    rules_outcomes:        0.8,
    markets_governance:    0.8,
    pragmatism_idealism:   0.8,
    individual_collective: 0.8,
    trust_skepticism:      0.8,
  },
  completenessPercent: 40,
}

// ── 1. Placeholder data integrity ─────────────────────────────────────────────

describe('beyond-ballot-candidates.ts — data integrity', () => {
  it('every candidate has a non-empty id and name', () => {
    for (const c of candidates) {
      expect(c.id).toBeTruthy()
      expect(c.name).toBeTruthy()
    }
  })

  it('independentMindedScore is 0–4 on every candidate', () => {
    for (const c of candidates) {
      const score = c.independentMindedScore ?? 0
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(4)
    }
  })

  it('has at least one candidate eligible (score >= 2) and at least one ineligible (score < 2)', () => {
    const eligible   = candidates.filter((c) => (c.independentMindedScore ?? 0) >= 2)
    const ineligible = candidates.filter((c) => (c.independentMindedScore ?? 0) < 2)
    expect(eligible.length).toBeGreaterThan(0)
    expect(ineligible.length).toBeGreaterThan(0)
  })

  it('has at least two candidates in the TEST district', () => {
    const testCandidates = candidates.filter((c) => c.district === TEST_DISTRICT)
    expect(testCandidates.length).toBeGreaterThanOrEqual(2)
  })

  it('has at least one candidate with a dealbreaker flag', () => {
    const withFlags = candidates.filter((c) => Object.keys(c.dealbreakers).length > 0)
    expect(withFlags.length).toBeGreaterThan(0)
  })

  it('all candidates have officeType "ideological"', () => {
    for (const c of candidates) {
      expect(c.officeType).toBe('ideological')
    }
  })
})

// ── 2. Geographic exclusion ───────────────────────────────────────────────────

describe('filterBeyondBallotCandidates — geographic exclusion', () => {
  it('excludes candidates in the user\'s own district from Part 2', () => {
    const filtered = filterBeyondBallotCandidates(candidates, [TEST_DISTRICT])
    const hasOwnDistrict = filtered.some((c) => c.district === TEST_DISTRICT)
    expect(hasOwnDistrict).toBe(false)
  })

  it('includes the test district candidates when the user\'s district is different', () => {
    const filtered = filterBeyondBallotCandidates(candidates, ['ocd-division/country:us/state:OTHER/cd:1'])
    const testCandidatesInResult = filtered.filter((c) => c.district === TEST_DISTRICT)
    // TEST candidates that pass the governance gate should appear
    const testEligible = candidates.filter(
      (c) => c.district === TEST_DISTRICT && (c.independentMindedScore ?? 0) >= 2
    )
    expect(testCandidatesInResult.length).toBe(testEligible.length)
  })

  it('excludes no one when userDistrictIds is empty', () => {
    const filtered = filterBeyondBallotCandidates(candidates, [])
    // Only the governance gate should apply
    const expectedCount = candidates.filter((c) => (c.independentMindedScore ?? 0) >= 2).length
    expect(filtered.length).toBe(expectedCount)
  })
})

// ── 3. Governance gate ────────────────────────────────────────────────────────

describe('filterBeyondBallotCandidates — governance gate', () => {
  it('excludes candidates with independentMindedScore < 2', () => {
    const filtered = filterBeyondBallotCandidates(candidates, [])
    const ineligibleInResult = filtered.filter((c) => (c.independentMindedScore ?? 0) < 2)
    expect(ineligibleInResult).toHaveLength(0)
  })

  it('includes candidates with independentMindedScore exactly 2', () => {
    const atMinimum = candidates.filter((c) => c.independentMindedScore === 2)
    expect(atMinimum.length).toBeGreaterThan(0)
    const filtered = filterBeyondBallotCandidates(candidates, [])
    const minInResult = filtered.filter((c) => c.independentMindedScore === 2)
    expect(minInResult.length).toBe(atMinimum.length)
  })

  it('includes candidates with independentMindedScore 3 and 4', () => {
    const filtered = filterBeyondBallotCandidates(candidates, [])
    const highScore = filtered.filter((c) => (c.independentMindedScore ?? 0) >= 3)
    expect(highScore.length).toBeGreaterThan(0)
  })
})

// ── 4. Dealbreakers are flags not exclusions on this page ────────────────────

describe('matchRace with dealbreakersAsFlags — §23.4', () => {
  it('does NOT exclude a candidate who crosses a user dealbreaker', () => {
    const candidateWithCross = candidates.find((c) =>
      Object.values(c.dealbreakers).some((v) => v.status === 'crosses')
    ) as BYBCandidateRecord

    expect(candidateWithCross).toBeDefined()

    const matchKeyWithDealbreaker: MatchKey = {
      ...FLAT_MATCH_KEY,
      dealbreakers: Object.keys(candidateWithCross.dealbreakers).map((k) => ({ itemId: `DB-${k}` })),
    }

    // With dealbreakersAsFlags: true (BYB mode) — candidate must appear in results
    const result = matchRace({
      raceId: 'test',
      candidates: [candidateWithCross],
      key: matchKeyWithDealbreaker,
      dealbreakersAsFlags: true,
    })

    expect(result.ranked).toHaveLength(1)
    expect(result.ranked[0].candidate.id).toBe(candidateWithCross.id)
  })

  it('would exclude the same candidate WITHOUT dealbreakersAsFlags (control)', () => {
    const candidateWithCross = candidates.find((c) =>
      Object.values(c.dealbreakers).some((v) => v.status === 'crosses')
    ) as BYBCandidateRecord

    const matchKeyWithDealbreaker: MatchKey = {
      ...FLAT_MATCH_KEY,
      dealbreakers: Object.keys(candidateWithCross.dealbreakers).map((k) => ({ itemId: `DB-${k}` })),
    }

    // Without flag mode — candidate is excluded
    const result = matchRace({
      raceId: 'test',
      candidates: [candidateWithCross],
      key: matchKeyWithDealbreaker,
      dealbreakersAsFlags: false,
    })

    expect(result.ranked).toHaveLength(0)
  })
})

// ── 5. Part 1 eligibility (in-district + governance gate) ────────────────────

describe('Part 1 — in-district candidates with governance gate', () => {
  it('correctly identifies Part 1 candidates: in-district AND governance-eligible', () => {
    const part1 = candidates.filter(
      (c) => c.district === TEST_DISTRICT && (c.independentMindedScore ?? 0) >= 2
    )
    expect(part1.length).toBeGreaterThanOrEqual(2)

    // These should NOT appear in Part 2 (filterBeyondBallotCandidates removes them)
    const part2 = filterBeyondBallotCandidates(candidates, [TEST_DISTRICT])
    for (const c of part1) {
      expect(part2.map((x) => x.id)).not.toContain(c.id)
    }
  })

  it('Part 1 engine call returns ranked output with dealbreakersAsFlags', () => {
    const inDistrict = candidates.filter(
      (c) => c.district === TEST_DISTRICT && (c.independentMindedScore ?? 0) >= 2
    )
    const result = matchRace({
      raceId: 'part1',
      candidates: inDistrict,
      key: FLAT_MATCH_KEY,
      dealbreakersAsFlags: true,
    })
    expect(result.ranked.length).toBe(inDistrict.length)
    expect(result.ranked.every((r) => r.score >= 0)).toBe(true)
  })
})
