'use server'

/**
 * State legislative candidate lookup — Open States v3 (Plural Open Data).
 * §3.4 of data-sources-feasibility-june2026.md.
 *
 * Returns CandidateRecord-compatible objects for state senate and state house
 * races in the user's district.
 *
 * ⚠  Like federalCandidates.ts, candidates here have NO axisPlacement — that
 * comes from the classification pipeline (Stage 3). The engine produces
 * no_call for them, which is the correct graceful-degradation behavior (§22.4).
 *
 * Open States v3 base URL: https://v3.openstates.org/
 * Auth: OPENSTATES_API_KEY via X-API-KEY header
 *
 * OCD-ID mapping:
 *   sldu:N  → upper chamber (state senate)
 *   sldl:N  → lower chamber (state house / assembly)
 *   Nebraska uses a unicameral legislature (single chamber).
 */

import type { CandidateRecord } from '@/lib/engine/match'
import { queueCandidateForClassification } from './classificationQueue'

// ─────────────────────────────────────────────────────────────────────────────
// Open States API types
// ─────────────────────────────────────────────────────────────────────────────

interface OpenStatesPerson {
  id: string
  name: string
  party: string
  current_role: {
    title: string
    org_classification: 'upper' | 'lower' | 'legislature'
    district: string
    division_id: string
  } | null
  jurisdiction: {
    id: string
    name: string
    classification: 'government'
  }
  links: Array<{ url: string; note?: string }>
  sources: Array<{ url: string; note?: string }>
  image?: string
}

interface OpenStatesResponse {
  results: OpenStatesPerson[]
  pagination: {
    max_page: number
    page: number
    per_page: number
    total_count: number
  }
}

export interface StateLegCandidate extends Omit<CandidateRecord, 'axisPlacement' | 'dealbreakers'> {
  axisPlacement: Record<string, never>
  dealbreakers: Record<number, never>
  openStatesId: string
  chamber: 'upper' | 'lower' | 'legislature'
  websiteUrl: string | null
}

export interface StateLegBallot {
  senate: StateLegCandidate[]   // upper chamber (sldu)
  house: StateLegCandidate[]    // lower chamber (sldl); empty for unicameral states
}

// ─────────────────────────────────────────────────────────────────────────────
// OCD-ID helpers
// ─────────────────────────────────────────────────────────────────────────────

// Nebraska uses a single unicameral chamber — no separate upper/lower OCD-ID segments.
const UNICAMERAL_STATES = new Set(['NE'])

function stateLegOcdId(state: string, chamber: 'upper' | 'lower' | 'legislature', district: number): string {
  const stLower = state.toLowerCase()
  if (chamber === 'legislature') {
    return `ocd-division/country:us/state:${stLower}/sldu:${district}`
  }
  const seg = chamber === 'upper' ? 'sldu' : 'sldl'
  return `ocd-division/country:us/state:${stLower}/${seg}:${district}`
}

function officeLabel(state: string, chamber: 'upper' | 'lower' | 'legislature', district: number): string {
  const distStr = String(district).padStart(2, '0')
  if (chamber === 'upper' || chamber === 'legislature') {
    return `State Senate — ${state}-${distStr}`
  }
  return `State House — ${state}-${distStr}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Open States fetch
// ─────────────────────────────────────────────────────────────────────────────

async function fetchOpenStatesPeople(
  state: string,
  chamber: 'upper' | 'lower' | 'legislature',
  district: number
): Promise<OpenStatesPerson[]> {
  const apiKey = process.env.OPENSTATES_API_KEY
  if (!apiKey) throw new Error('OPENSTATES_API_KEY is not set')

  const url = new URL('https://v3.openstates.org/people')
  url.searchParams.set('jurisdiction', state.toLowerCase())
  url.searchParams.set('org_classification', chamber === 'legislature' ? 'upper' : chamber)
  url.searchParams.set('district', String(district))
  url.searchParams.set('per_page', '50')
  url.searchParams.set('include', 'links')

  const res = await fetch(url.toString(), {
    headers: { 'X-API-KEY': apiKey },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Open States API error ${res.status}: ${body}`)
  }

  const data: OpenStatesResponse = await res.json()
  return data.results ?? []
}

// ─────────────────────────────────────────────────────────────────────────────
// Build StateLegCandidate from an Open States person
// ─────────────────────────────────────────────────────────────────────────────

function buildStateLegCandidate(
  person: OpenStatesPerson,
  state: string,
  chamber: 'upper' | 'lower' | 'legislature',
  district: number
): StateLegCandidate {
  const websiteUrl =
    person.links.find((l) => l.note?.toLowerCase().includes('official') || l.note?.toLowerCase().includes('website'))?.url
    ?? person.links[0]?.url
    ?? null

  return {
    id: person.id,
    name: person.name,
    office: officeLabel(state, chamber, district),
    officeType: 'ideological',
    district: stateLegOcdId(state, chamber, district),
    party: person.party ?? 'Unknown',
    axisPlacement: {},
    dealbreakers: {},
    coverageTier: 'state_legislative',
    sourcedFrom: ['openstates'],
    lastUpdated: new Date().toISOString().slice(0, 10),
    openStatesId: person.id,
    chamber,
    websiteUrl,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch state legislative candidates for the user's state senate and state
 * house districts. Both district numbers come from OCD-ID parsing in
 * resolveDistrict (sldu:N and sldl:N segments).
 *
 * For unicameral states (Nebraska), only the senate/upper chamber is queried.
 * If a district number is null the corresponding chamber returns an empty array.
 */
export async function fetchStateLegCandidates(
  state: string,
  stateSenateDistrict: number | null,
  stateHouseDistrict: number | null
): Promise<StateLegBallot> {
  const isUnicameral = UNICAMERAL_STATES.has(state.toUpperCase())

  const [senatePeople, housePeople] = await Promise.all([
    stateSenateDistrict !== null
      ? fetchOpenStatesPeople(state, isUnicameral ? 'legislature' : 'upper', stateSenateDistrict).catch(() => [] as OpenStatesPerson[])
      : Promise.resolve([] as OpenStatesPerson[]),
    !isUnicameral && stateHouseDistrict !== null
      ? fetchOpenStatesPeople(state, 'lower', stateHouseDistrict).catch(() => [] as OpenStatesPerson[])
      : Promise.resolve([] as OpenStatesPerson[]),
  ])

  const senate = senatePeople.map((p) =>
    buildStateLegCandidate(p, state.toUpperCase(), isUnicameral ? 'legislature' : 'upper', stateSenateDistrict!)
  )

  const house = housePeople.map((p) =>
    buildStateLegCandidate(p, state.toUpperCase(), 'lower', stateHouseDistrict!)
  )

  // Fire-and-forget: queue every fetched candidate for classification if not already present.
  for (const c of [...senate, ...house]) {
    void queueCandidateForClassification({
      id:           c.id,
      name:         c.name,
      office:       c.office,
      district:     c.district,
      party:        c.party ?? 'Unknown',
      coverageTier: c.coverageTier,
      sourcedFrom:  c.sourcedFrom,
    })
  }

  return { senate, house }
}
