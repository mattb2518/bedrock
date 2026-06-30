'use server'

/**
 * Federal candidate lookup — congress.gov + FEC openFEC.
 * §3.1 (congress.gov) and §3.2 (FEC) of data-sources-feasibility-june2026.md.
 *
 * Returns CandidateRecord-compatible objects for US Senate and US House races
 * for the given state and congressional district.
 *
 * ⚠  Candidates returned here have NO axisPlacement data — that comes from the
 * classification pipeline (Stage 3). The engine will produce no_call for them,
 * which is the correct graceful-degradation behavior per §22.4.
 */

import type { CandidateRecord } from '@/lib/engine/match'
import { getOrClassifyCandidate } from './classificationQueue'

// ─────────────────────────────────────────────────────────────────────────────
// Types for congress.gov and FEC API responses
// ─────────────────────────────────────────────────────────────────────────────

interface CongressMember {
  bioguideId: string
  name: string
  state: string
  district?: number
  party: string
  terms: {
    item: Array<{ chamber: string; startYear?: number; endYear?: number }>
  }
  url: string
  depiction?: { imageUrl?: string }
}

interface FECCandidate {
  candidate_id: string
  name: string
  party: string
  state: string
  district: string | null
  office: string   // 'H' | 'S' | 'P'
  election_years: number[]
  principal_committees?: Array<{ committee_id: string; name: string }>
}

interface FECTotals {
  receipts: number | null
  disbursements: number | null
  cash_on_hand_end_period: number | null
}

export interface FECFinanceSummary {
  totalRaised: number | null
  disbursements: number | null
  cashOnHand: number | null
  topDonors: string[]              // committee display names, not actual contributor names
  campaignSite: string | null
}

export interface FederalCandidate extends CandidateRecord {
  fecId: string | null
  campaignSite: string | null
  donateLink: string | null
  financeData: FECFinanceSummary | null
  bioguideId: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CONGRESS_BASE = 'https://api.congress.gov/v3'
const FEC_BASE      = 'https://api.open.fec.gov/v1'

// OCD-ID format for federal races
function senateOcdId(state: string) {
  return `ocd-division/country:us/state:${state.toLowerCase()}`
}
function houseOcdId(state: string, district: number) {
  return `ocd-division/country:us/state:${state.toLowerCase()}/cd:${district}`
}

function partyDisplay(congressParty: string): string {
  const map: Record<string, string> = {
    'D': 'Democrat', 'Democrat': 'Democrat',
    'R': 'Republican', 'Republican': 'Republican',
    'I': 'Independent', 'Independent': 'Independent',
    'L': 'Libertarian',
    'G': 'Green',
    'ID': 'Independent Democrat',
  }
  return map[congressParty] ?? congressParty
}

// ─────────────────────────────────────────────────────────────────────────────
// congress.gov — current members by state / district
// ─────────────────────────────────────────────────────────────────────────────

async function fetchCongressMembers(
  state: string,
  chamber: 'senate' | 'house',
  district?: number
): Promise<CongressMember[]> {
  const apiKey = process.env.CONGRESS_GOV_API_KEY
  if (!apiKey) throw new Error('CONGRESS_GOV_API_KEY is not set')

  const url = new URL(`${CONGRESS_BASE}/member`)
  url.searchParams.set('stateCode', state.toUpperCase())
  url.searchParams.set('currentMember', 'true')
  url.searchParams.set('limit', '50')
  url.searchParams.set('api_key', apiKey)
  if (chamber === 'house' && district !== undefined) {
    url.searchParams.set('district', String(district))
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`congress.gov API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  const members: CongressMember[] = data.members ?? []

  // Filter by chamber (the endpoint can return both house and senate members)
  return members.filter((m) => {
    const latestTerm = m.terms?.item?.at(-1)
    if (!latestTerm) return false
    const c = latestTerm.chamber.toLowerCase()
    return chamber === 'senate'
      ? c === 'senate'
      : c === 'house of representatives' || c === 'house'
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// FEC — candidate filings and finance summary
// ─────────────────────────────────────────────────────────────────────────────

async function fetchFECCandidates(
  state: string,
  office: 'H' | 'S',
  district?: number
): Promise<FECCandidate[]> {
  const apiKey = process.env.FEC_API_KEY
  if (!apiKey) throw new Error('FEC_API_KEY is not set')

  const url = new URL(`${FEC_BASE}/candidates/search/`)
  url.searchParams.set('state', state.toUpperCase())
  url.searchParams.set('office', office)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('election_year', '2026')
  url.searchParams.set('per_page', '50')
  if (office === 'H' && district !== undefined) {
    url.searchParams.set('district', String(district).padStart(2, '0'))
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`FEC API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.results ?? []
}

async function fetchFECFinanceTotals(committeeId: string): Promise<FECTotals> {
  const apiKey = process.env.FEC_API_KEY
  if (!apiKey) throw new Error('FEC_API_KEY is not set')

  const url = new URL(`${FEC_BASE}/committee/${committeeId}/totals/`)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('per_page', '1')
  url.searchParams.set('sort_hide_null', 'true')

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) return { receipts: null, disbursements: null, cash_on_hand_end_period: null }

  const data = await res.json()
  const latest = data.results?.[0]
  return {
    receipts: latest?.receipts ?? null,
    disbursements: latest?.disbursements ?? null,
    cash_on_hand_end_period: latest?.cash_on_hand_end_period ?? null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Merge congress.gov member + FEC candidate into FederalCandidate
// ─────────────────────────────────────────────────────────────────────────────

async function buildFederalCandidate(
  member: CongressMember,
  fecCandidate: FECCandidate | null,
  district: string,           // OCD-ID
  office: string,             // "US House — State CD-N" or "US Senate — State"
  coverageTier: CandidateRecord['coverageTier']
): Promise<FederalCandidate> {
  let financeData: FECFinanceSummary | null = null

  if (fecCandidate) {
    const pc = fecCandidate.principal_committees?.[0]
    if (pc) {
      const totals = await fetchFECFinanceTotals(pc.committee_id)
      financeData = {
        totalRaised: totals.receipts,
        disbursements: totals.disbursements,
        cashOnHand: totals.cash_on_hand_end_period,
        topDonors: [],  // Schedule A contributor list not fetched at card level — per FEC license note §3.2
        campaignSite: null,
      }
    }
  }

  // FEC doesn't expose campaign site URLs; use congress.gov profile as the best available link
  const congressUrl = member.url ?? null

  return {
    id: member.bioguideId,
    name: member.name,
    office,
    officeType: 'ideological' as const,
    district,
    party: partyDisplay(member.party),
    axisPlacement: {},
    dealbreakers: {},
    coverageTier,
    sourcedFrom: ['congress.gov', ...(fecCandidate ? ['openFEC'] : [])],
    lastUpdated: new Date().toISOString().slice(0, 10),
    bioguideId: member.bioguideId,
    fecId: fecCandidate?.candidate_id ?? null,
    campaignSite: congressUrl,
    donateLink: null,
    financeData,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export interface FederalBallot {
  senate: FederalCandidate[]
  house: FederalCandidate[]
}

/**
 * Fetch federal candidates (current + challengers) for a given state and
 * congressional district. Returns senate candidates (statewide) and house
 * candidates (district-specific).
 *
 * Candidates will have empty axisPlacement — engine will produce no_call
 * unless classification data has been added to the database (Stage 3 pipeline).
 */
export async function fetchFederalCandidates(
  state: string,
  congressionalDistrict: number | null
): Promise<FederalBallot> {
  const stateUpper = state.toUpperCase()

  // Fetch in parallel: senate members + house members + FEC senate candidates + FEC house candidates
  const [senateMembers, houseMembers, fecSenate, fecHouse] = await Promise.all([
    fetchCongressMembers(stateUpper, 'senate').catch(() => [] as CongressMember[]),
    congressionalDistrict !== null
      ? fetchCongressMembers(stateUpper, 'house', congressionalDistrict).catch(() => [] as CongressMember[])
      : Promise.resolve([] as CongressMember[]),
    fetchFECCandidates(stateUpper, 'S').catch(() => [] as FECCandidate[]),
    congressionalDistrict !== null
      ? fetchFECCandidates(stateUpper, 'H', congressionalDistrict).catch(() => [] as FECCandidate[])
      : Promise.resolve([] as FECCandidate[]),
  ])

  // Build FEC lookup by bioguideId isn't possible — match by name (fuzzy)
  function matchFEC(member: CongressMember, fecList: FECCandidate[]): FECCandidate | null {
    const lastName = member.name.split(',')[0].trim().toLowerCase()
    return fecList.find((f) => f.name.toLowerCase().includes(lastName)) ?? null
  }

  const senateCandidates = await Promise.all(
    senateMembers.map((m) =>
      buildFederalCandidate(
        m,
        matchFEC(m, fecSenate),
        senateOcdId(stateUpper),
        `US Senate — ${stateUpper}`,
        'federal'
      )
    )
  )

  const houseCandidates = await Promise.all(
    houseMembers.map((m) =>
      buildFederalCandidate(
        m,
        matchFEC(m, fecHouse),
        congressionalDistrict !== null ? houseOcdId(stateUpper, congressionalDistrict) : senateOcdId(stateUpper),
        congressionalDistrict !== null
          ? `US House — ${stateUpper}-${String(congressionalDistrict).padStart(2, '0')}`
          : `US House — ${stateUpper}`,
        'federal'
      )
    )
  )

  // Classify all candidates in parallel — cache hits return instantly; misses call Claude.
  // Results are merged back so the engine gets real axisPlacement rather than no_call.
  function withClassification(candidates: FederalCandidate[]) {
    return Promise.all(
      candidates.map(async (c) => {
        const classified = await getOrClassifyCandidate({
          id:          c.id,
          name:        c.name,
          office:      c.office,
          officeType:  c.officeType,
          district:    c.district,
          party:       c.party ?? 'Unknown',
          coverageTier: c.coverageTier,
          sourcedFrom: c.sourcedFrom,
        })
        if (!classified) return c
        return {
          ...c,
          axisPlacement:  classified.axisPlacement,
          dealbreakers:   classified.dealbreakers,
          rhetoricalOnly: classified.rhetoricalOnly,
          lastUpdated:    classified.lastUpdated,
        }
      })
    )
  }

  const [senate, house] = await Promise.all([
    withClassification(senateCandidates),
    withClassification(houseCandidates),
  ])

  return { senate, house }
}
