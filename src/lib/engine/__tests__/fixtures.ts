/**
 * Shared test fixtures for engine unit tests.
 * These are minimal mock objects — not real catalog data.
 */

import type { CandidateRecord, MatchKey, DimensionalProfile, AxisWeights, AxisConfidence, Dimension } from '../match'
import type { MediaSource, MediaMatchKey } from '../mediaMatch'

// ── User profile helpers ───────────────────────────────────────────────────

export const FLAT_PROFILE: DimensionalProfile = {
  stability_change:      50,
  local_federal:         50,
  national_global:       50,
  rules_outcomes:        50,
  markets_governance:    50,
  pragmatism_idealism:   50,
  individual_collective: 50,
  trust_skepticism:      50,
}

export const FLAT_WEIGHTS: AxisWeights = {
  stability_change:      1.0,
  local_federal:         1.0,
  national_global:       1.0,
  rules_outcomes:        1.0,
  markets_governance:    1.0,
  pragmatism_idealism:   1.0,
  individual_collective: 1.0,
  trust_skepticism:      1.0,
}

export const FLAT_CONFIDENCE: AxisConfidence = {
  stability_change:      0.9,
  local_federal:         0.9,
  national_global:       0.9,
  rules_outcomes:        0.9,
  markets_governance:    0.9,
  pragmatism_idealism:   0.9,
  individual_collective: 0.9,
  trust_skepticism:      0.9,
}

/** A user with a clear center-left leaning on all axes */
export const MATCH_KEY_FULL: MatchKey = {
  profile: {
    stability_change:      60,
    local_federal:         55,
    national_global:       65,
    rules_outcomes:        45,
    markets_governance:    55,
    pragmatism_idealism:   60,
    individual_collective: 55,
    trust_skepticism:      50,
  },
  axisWeights: {
    ...FLAT_WEIGHTS,
    stability_change: 1.5,   // user flagged this as a priority axis
    pragmatism_idealism: 1.5,
  },
  axisConfidence: FLAT_CONFIDENCE,
  completenessPercent: 100,
}

// ── Candidate fixtures ─────────────────────────────────────────────────────

function placement(score: number, confidence = 0.85) {
  return { score, confidence, rationale: 'mock', sources: ['https://example.com'] }
}

/** Close match to MATCH_KEY_FULL — expect 'confident' */
export const CANDIDATE_CLOSE: CandidateRecord = {
  id: 'cand-close',
  name: 'Alice Close',
  office: 'U.S. House',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:ca/cd:12',
  axisPlacement: {
    stability_change:      placement(62),
    local_federal:         placement(53),
    national_global:       placement(67),
    rules_outcomes:        placement(47),
    markets_governance:    placement(57),
    pragmatism_idealism:   placement(58),
    individual_collective: placement(55),
    trust_skepticism:      placement(52),
  },
  dealbreakers: { 1: { status: 'clear' }, 2: { status: 'clear' } },
  coverageTier: 'federal',
  sourcedFrom: ['congress.gov'],
  lastUpdated: '2026-06-01',
}

/** Far from user profile — should rank below CANDIDATE_CLOSE */
export const CANDIDATE_FAR: CandidateRecord = {
  id: 'cand-far',
  name: 'Bob Far',
  office: 'U.S. House',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:ca/cd:12',
  axisPlacement: {
    stability_change:      placement(10),
    local_federal:         placement(15),
    national_global:       placement(20),
    rules_outcomes:        placement(90),
    markets_governance:    placement(10),
    pragmatism_idealism:   placement(15),
    individual_collective: placement(20),
    trust_skepticism:      placement(85),
  },
  dealbreakers: { 1: { status: 'clear' } },
  coverageTier: 'federal',
  sourcedFrom: ['congress.gov'],
  lastUpdated: '2026-06-01',
}

/** Has a 'crosses' status on DB-1 */
export const CANDIDATE_DEALBREAKER_CROSSES: CandidateRecord = {
  id: 'cand-crosses',
  name: 'Carol Crosses',
  office: 'U.S. House',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:ca/cd:12',
  axisPlacement: {
    stability_change:      placement(61),
    local_federal:         placement(54),
    pragmatism_idealism:   placement(59),
  },
  dealbreakers: {
    1: { status: 'crosses', evidence: 'Voted to reject certified results', source: 'congress.gov' },
  },
  coverageTier: 'federal',
  sourcedFrom: ['congress.gov'],
  lastUpdated: '2026-06-01',
}

/** Has an 'unknown' status on DB-2 */
export const CANDIDATE_DEALBREAKER_UNKNOWN: CandidateRecord = {
  id: 'cand-unknown',
  name: 'Dan Unknown',
  office: 'U.S. House',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:ca/cd:12',
  axisPlacement: {
    stability_change:      placement(61),
    local_federal:         placement(54),
    pragmatism_idealism:   placement(59),
    rules_outcomes:        placement(46),
    markets_governance:    placement(56),
  },
  dealbreakers: {
    2: { status: 'unknown', note: 'Conflicting reports, could not verify' },
  },
  coverageTier: 'federal',
  sourcedFrom: ['congress.gov'],
  lastUpdated: '2026-06-01',
}

/** Sparse data — only 1 axis covered → no_call */
export const CANDIDATE_SPARSE: CandidateRecord = {
  id: 'cand-sparse',
  name: 'Eve Sparse',
  office: 'U.S. House',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:ca/cd:99',
  axisPlacement: {
    stability_change: placement(55),
  },
  dealbreakers: {},
  coverageTier: 'federal',
  sourcedFrom: [],
  lastUpdated: '2026-06-01',
}

/** Incumbent — has a voting record, confidence 0.9 */
export const CANDIDATE_INCUMBENT: CandidateRecord = {
  id: 'cand-incumbent',
  name: 'Frank Incumbent',
  office: 'U.S. Senate',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:tx/sldu:1',
  axisPlacement: {
    stability_change:      placement(62, 0.90),
    local_federal:         placement(55, 0.90),
    national_global:       placement(65, 0.90),
    rules_outcomes:        placement(45, 0.90),
    markets_governance:    placement(55, 0.90),
    pragmatism_idealism:   placement(60, 0.90),
    individual_collective: placement(55, 0.90),
    trust_skepticism:      placement(50, 0.90),
  },
  dealbreakers: {},
  coverageTier: 'federal',
  sourcedFrom: ['congress.gov'],
  lastUpdated: '2026-06-01',
  rhetoricalOnly: false,
}

/** Challenger — rhetoric only; same stated positions as incumbent but capped at 0.5 */
export const CANDIDATE_CHALLENGER: CandidateRecord = {
  id: 'cand-challenger',
  name: 'Grace Challenger',
  office: 'U.S. Senate',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:tx/sldu:1',
  axisPlacement: {
    stability_change:      placement(62, 0.90),  // same stated scores as incumbent
    local_federal:         placement(55, 0.90),
    national_global:       placement(65, 0.90),
    rules_outcomes:        placement(45, 0.90),
    markets_governance:    placement(55, 0.90),
    pragmatism_idealism:   placement(60, 0.90),
    individual_collective: placement(55, 0.90),
    trust_skepticism:      placement(50, 0.90),
  },
  dealbreakers: {},
  coverageTier: 'federal',
  sourcedFrom: ['candidate-website.com'],
  lastUpdated: '2026-06-01',
  rhetoricalOnly: true,   // ← triggers 0.5 confidence cap at engine time
}

/** Beyond Your Ballot candidate — outside user's district, independentMindedScore = 3 */
export const CANDIDATE_BYB_ELIGIBLE: CandidateRecord = {
  id: 'cand-byb-eligible',
  name: 'Henry BYB',
  office: 'U.S. House',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:or/cd:3',
  axisPlacement: {
    stability_change:      placement(58),
    local_federal:         placement(52),
    pragmatism_idealism:   placement(62),
  },
  dealbreakers: {},
  coverageTier: 'federal',
  sourcedFrom: ['congress.gov'],
  lastUpdated: '2026-06-01',
  independentMindedScore: 3,
}

/** BYB candidate who fails the gate (score < 2) */
export const CANDIDATE_BYB_INELIGIBLE: CandidateRecord = {
  id: 'cand-byb-ineligible',
  name: 'Ivan Low',
  office: 'U.S. House',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:or/cd:4',
  axisPlacement: { stability_change: placement(55) },
  dealbreakers: {},
  coverageTier: 'federal',
  sourcedFrom: [],
  lastUpdated: '2026-06-01',
  independentMindedScore: 1,  // below gate
}

/** BYB candidate in the user's own district — should be excluded */
export const CANDIDATE_BYB_OWN_DISTRICT: CandidateRecord = {
  id: 'cand-byb-own',
  name: 'Jane Own',
  office: 'U.S. House',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:ca/cd:12',  // user's district
  axisPlacement: { stability_change: placement(60) },
  dealbreakers: {},
  coverageTier: 'federal',
  sourcedFrom: [],
  lastUpdated: '2026-06-01',
  independentMindedScore: 4,
}

// ── Media source fixtures ──────────────────────────────────────────────────

function mediaPl(score: number, confidence = 0.8) {
  return { score, confidence, rationale: 'mock', sources: [] }
}

const BASE_SOURCE: Omit<MediaSource, 'id' | 'name' | 'axisPlacement' | 'coarseLean' | 'reliability' | 'independence' | 'goodFaith' | 'dimensionCoverage'> = {
  kind: 'newsletter',
  formats: ['newsletter'],
  url: 'https://example.com',
  independent: true,
  active: 'active',
  transparency: 80,
  topics: ['policy', 'governance'],
  effort: 'medium',
  flags: [],
  biasRatingSource: 'bedrock_originated',
  externalRefs: {},
  lastReviewed: '2026-06-01',
  methodologyVersion: '1.0',
  attribution: 'Bedrock originated',
}

/** High-agreement, low-tension source → Confirming */
export const MEDIA_CONFIRMING: MediaSource = {
  ...BASE_SOURCE,
  id: 'media-confirming',
  name: 'Aligned Weekly',
  coarseLean: 'center',
  reliability: 85,
  independence: 80,
  goodFaith: 'high',
  axisPlacement: {
    stability_change:      mediaPl(62),
    local_federal:         mediaPl(56),
    national_global:       mediaPl(66),
    pragmatism_idealism:   mediaPl(61),
    markets_governance:    mediaPl(56),
  },
  dimensionCoverage: {
    stability_change:      'signature',
    pragmatism_idealism:   'regular',
    national_global:       'regular',
  },
}

/** Mid-agreement, mid-tension, high novel coverage → Expanding */
export const MEDIA_EXPANDING: MediaSource = {
  ...BASE_SOURCE,
  id: 'media-expanding',
  name: 'Breadth Report',
  kind: 'podcast',
  formats: ['podcast'],
  coarseLean: 'lean-left',
  reliability: 75,
  independence: 70,
  goodFaith: 'high',
  axisPlacement: {
    rules_outcomes:        mediaPl(70),   // somewhat away from user's 45
    markets_governance:    mediaPl(40),   // somewhat away from user's 55
    trust_skepticism:      mediaPl(30),   // away from user's 50
  },
  dimensionCoverage: {
    rules_outcomes:        'signature',
    trust_skepticism:      'signature',
    individual_collective: 'regular',
    local_federal:         'regular',
  },
}

/**
 * High-tension, high reliability, high faith → Challenging
 * User topDimensions: stability_change(60), pragmatism_idealism(60), national_global(65)
 * Source scores: 0 on all three → distances 0.60, 0.60, 0.65 → tensionOnHeld ≈ 0.617
 */
export const MEDIA_CHALLENGING: MediaSource = {
  ...BASE_SOURCE,
  id: 'media-challenging',
  name: 'Counterpoint',
  kind: 'substack',
  formats: ['long-form-writing'],
  coarseLean: 'right',
  reliability: 80,
  independence: 75,
  goodFaith: 'high',
  axisPlacement: {
    stability_change:      mediaPl(0),    // user 60 → distance 0.60
    pragmatism_idealism:   mediaPl(0),    // user 60 → distance 0.60
    national_global:       mediaPl(0),    // user 65 → distance 0.65
    markets_governance:    mediaPl(10),
    individual_collective: mediaPl(10),
  },
  dimensionCoverage: {
    stability_change:    'signature',
    pragmatism_idealism: 'signature',
    national_global:     'signature',
  },
}

/** Low reliability — should not appear in any tier */
export const MEDIA_LOW_RELIABILITY: MediaSource = {
  ...BASE_SOURCE,
  id: 'media-low-rel',
  name: 'Shaky News',
  coarseLean: 'left',
  reliability: 40,   // below all tier minimums
  independence: 50,
  goodFaith: 'mixed',
  axisPlacement: { stability_change: mediaPl(61) },
  dimensionCoverage: {},
}

/** Dormant source — should not appear */
export const MEDIA_DORMANT: MediaSource = {
  ...BASE_SOURCE,
  id: 'media-dormant',
  name: 'Old Voice',
  active: 'dormant',
  coarseLean: 'center',
  reliability: 85,
  independence: 80,
  goodFaith: 'high',
  axisPlacement: { stability_change: mediaPl(62) },
  dimensionCoverage: {},
}

export const MEDIA_MATCH_KEY: MediaMatchKey = {
  dimensionScores: {
    stability_change:      60,
    local_federal:         55,
    national_global:       65,
    rules_outcomes:        45,
    markets_governance:    55,
    pragmatism_idealism:   60,
    individual_collective: 55,
    trust_skepticism:      50,
  },
  topDimensions: ['stability_change', 'pragmatism_idealism', 'national_global'],
  primaryType: 'eternal_optimist',
  secondaryTypes: ['pioneer'],
  completenessPct: 100,
}
