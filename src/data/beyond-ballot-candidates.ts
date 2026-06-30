// PLACEHOLDER DATA — replace with real candidates before launch. See admin pre-launch checklist.
// All names are clearly fictional. Populate from congress.gov + FEC data before the pillar goes live.
// The TEST district (state:TEST/cd:99) is used only for unit tests — remove before launch.
// See CandidateRecord in src/lib/engine/match.ts for the full schema.

import type { CandidateRecord } from '@/lib/engine/match'

export interface BYBCandidateRecord extends CandidateRecord {
  campaignSite?: string | null
  donateLink?: string | null
}

const candidates: BYBCandidateRecord[] = [
  // ── Eligible (independentMindedScore >= 2), out-of-district ───────────────
  {
    id: 'byb-placeholder-a',
    name: 'Example Candidate A',
    office: 'U.S. House',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:co/cd:6',
    party: 'Independent',
    axisPlacement: {
      stability_change:      { score: 55, confidence: 0.80, rationale: 'Placeholder', sources: [] },
      local_federal:         { score: 48, confidence: 0.75, rationale: 'Placeholder', sources: [] },
      national_global:       { score: 60, confidence: 0.70, rationale: 'Placeholder', sources: [] },
      rules_outcomes:        { score: 42, confidence: 0.80, rationale: 'Placeholder', sources: [] },
      markets_governance:    { score: 52, confidence: 0.75, rationale: 'Placeholder', sources: [] },
      pragmatism_idealism:   { score: 58, confidence: 0.80, rationale: 'Placeholder', sources: [] },
      individual_collective: { score: 50, confidence: 0.70, rationale: 'Placeholder', sources: [] },
      trust_skepticism:      { score: 45, confidence: 0.75, rationale: 'Placeholder', sources: [] },
    },
    dealbreakers: {},
    coverageTier: 'federal',
    sourcedFrom: [],
    lastUpdated: '2026-06-30',
    independentMindedScore: 3,
    campaignSite: 'https://example.com/candidate-a',
    donateLink: null,
  },
  {
    // Eligible + has a 'crosses' dealbreaker on DB-3 → renders as yellow flag on BYB page (not excluded)
    id: 'byb-placeholder-b',
    name: 'Example Candidate B',
    office: 'U.S. Senate',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:me',
    party: 'Republican',
    axisPlacement: {
      stability_change:      { score: 40, confidence: 0.85, rationale: 'Placeholder', sources: [] },
      local_federal:         { score: 35, confidence: 0.80, rationale: 'Placeholder', sources: [] },
      national_global:       { score: 38, confidence: 0.75, rationale: 'Placeholder', sources: [] },
      rules_outcomes:        { score: 55, confidence: 0.85, rationale: 'Placeholder', sources: [] },
      markets_governance:    { score: 35, confidence: 0.80, rationale: 'Placeholder', sources: [] },
      pragmatism_idealism:   { score: 45, confidence: 0.85, rationale: 'Placeholder', sources: [] },
      individual_collective: { score: 40, confidence: 0.80, rationale: 'Placeholder', sources: [] },
      trust_skepticism:      { score: 38, confidence: 0.75, rationale: 'Placeholder', sources: [] },
    },
    dealbreakers: {
      3: { status: 'crosses', evidence: 'Placeholder — voted against bipartisan bill (example only)', source: 'https://example.com' },
    },
    coverageTier: 'federal',
    sourcedFrom: [],
    lastUpdated: '2026-06-30',
    independentMindedScore: 4,
    campaignSite: 'https://example.com/candidate-b',
    donateLink: 'https://donate.example.com/candidate-b',
  },
  {
    // Eligible at minimum score (2) + 'unknown' dealbreaker on DB-7
    id: 'byb-placeholder-c',
    name: 'Example Candidate C',
    office: 'U.S. House',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:pa/cd:1',
    party: 'Democrat',
    axisPlacement: {
      stability_change:    { score: 62, confidence: 0.70, rationale: 'Placeholder', sources: [] },
      markets_governance:  { score: 58, confidence: 0.70, rationale: 'Placeholder', sources: [] },
      pragmatism_idealism: { score: 55, confidence: 0.70, rationale: 'Placeholder', sources: [] },
    },
    dealbreakers: {
      7: { status: 'unknown', note: 'Placeholder — could not verify position (example only)' },
    },
    coverageTier: 'federal',
    sourcedFrom: [],
    lastUpdated: '2026-06-30',
    independentMindedScore: 2,
    campaignSite: 'https://example.com/candidate-c',
    donateLink: null,
  },
  {
    // Eligible, rhetoric-only challenger (axisPlacement confidence capped at 0.5 by engine)
    id: 'byb-placeholder-h',
    name: 'Example Candidate H',
    office: 'U.S. House',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:or/cd:5',
    party: 'Republican',
    axisPlacement: {
      stability_change:    { score: 48, confidence: 0.50, rationale: 'Placeholder', sources: [] },
      local_federal:       { score: 42, confidence: 0.50, rationale: 'Placeholder', sources: [] },
      pragmatism_idealism: { score: 52, confidence: 0.50, rationale: 'Placeholder', sources: [] },
    },
    dealbreakers: {},
    coverageTier: 'federal',
    sourcedFrom: [],
    lastUpdated: '2026-06-30',
    independentMindedScore: 3,
    rhetoricalOnly: true,
    campaignSite: 'https://example.com/candidate-h',
    donateLink: null,
  },

  // ── Ineligible — filtered out by governance gate (independentMindedScore < 2) ──
  {
    id: 'byb-placeholder-d',
    name: 'Example Candidate D',
    office: 'U.S. House',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:ks/cd:3',
    party: 'Republican',
    axisPlacement: {
      stability_change:   { score: 30, confidence: 0.80, rationale: 'Placeholder', sources: [] },
      markets_governance: { score: 28, confidence: 0.80, rationale: 'Placeholder', sources: [] },
    },
    dealbreakers: {},
    coverageTier: 'federal',
    sourcedFrom: [],
    lastUpdated: '2026-06-30',
    independentMindedScore: 1,  // below gate → filtered out of Part 2
    campaignSite: null,
    donateLink: null,
  },
  {
    id: 'byb-placeholder-e',
    name: 'Example Candidate E',
    office: 'U.S. House',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:oh/cd:12',
    party: 'Democrat',
    axisPlacement: {
      stability_change: { score: 70, confidence: 0.75, rationale: 'Placeholder', sources: [] },
    },
    dealbreakers: {},
    coverageTier: 'federal',
    sourcedFrom: [],
    lastUpdated: '2026-06-30',
    independentMindedScore: 0,  // below gate → filtered out of Part 2
    campaignSite: null,
    donateLink: null,
  },

  // ── TEST DISTRICT — in user's own district → excluded from Part 2, eligible for Part 1 ──
  // REMOVE before launch; these exist only so unit tests can exercise geographic exclusion.
  {
    id: 'byb-placeholder-f',
    name: 'Example Candidate F',
    office: 'U.S. House',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:TEST/cd:99',
    party: 'Independent',
    axisPlacement: {
      stability_change:      { score: 58, confidence: 0.85, rationale: 'Placeholder', sources: [] },
      local_federal:         { score: 50, confidence: 0.80, rationale: 'Placeholder', sources: [] },
      national_global:       { score: 62, confidence: 0.80, rationale: 'Placeholder', sources: [] },
      rules_outcomes:        { score: 44, confidence: 0.85, rationale: 'Placeholder', sources: [] },
      markets_governance:    { score: 54, confidence: 0.80, rationale: 'Placeholder', sources: [] },
      pragmatism_idealism:   { score: 60, confidence: 0.85, rationale: 'Placeholder', sources: [] },
    },
    dealbreakers: {},
    coverageTier: 'federal',
    sourcedFrom: [],
    lastUpdated: '2026-06-30',
    independentMindedScore: 3,
    campaignSite: 'https://example.com/candidate-f',
    donateLink: 'https://donate.example.com/candidate-f',
  },
  {
    // In-district + governance-eligible + unknown dealbreaker → Part 1 eligible, flag shown
    id: 'byb-placeholder-g',
    name: 'Example Candidate G',
    office: 'U.S. House',
    officeType: 'ideological',
    district: 'ocd-division/country:us/state:TEST/cd:99',
    party: 'Democrat',
    axisPlacement: {
      stability_change:    { score: 52, confidence: 0.75, rationale: 'Placeholder', sources: [] },
      pragmatism_idealism: { score: 56, confidence: 0.75, rationale: 'Placeholder', sources: [] },
      markets_governance:  { score: 50, confidence: 0.70, rationale: 'Placeholder', sources: [] },
    },
    dealbreakers: {
      2: { status: 'unknown', note: 'Placeholder — could not verify position (example only)' },
    },
    coverageTier: 'federal',
    sourcedFrom: [],
    lastUpdated: '2026-06-30',
    independentMindedScore: 4,
    campaignSite: 'https://example.com/candidate-g',
    donateLink: null,
  },
]

export default candidates
