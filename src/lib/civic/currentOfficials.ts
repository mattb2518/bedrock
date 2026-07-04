'use server'

/**
 * Current officeholder lookup — congress.gov (current-member) + Open States (current officeholder).
 * §22b.3 of SPEC.md.
 *
 * Returns the 6 currently-serving officials for a user's district, shaped as
 * ClassificationQueueEntry so they pass directly into getOrClassifyCandidate()
 * without modification.
 *
 * Governor coverage: Open States exposes executive officeholders via
 * org_classification=executive for most states. Coverage gaps are noted in the
 * returned governorCoverageNote field rather than throwing.
 */

import type { CandidateRecord, AxisPlacement, Dimension } from '@/lib/engine/match'
import { getOrClassifyCandidate } from './classificationQueue'

// ─────────────────────────────────────────────────────────────────────────────
// Types
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
}

interface OpenStatesPerson {
  id: string
  name: string
  party: string
  current_role: {
    title: string
    org_classification: 'upper' | 'lower' | 'legislature' | 'executive'
    district: string
    division_id: string
  } | null
  links: Array<{ url: string; note?: string }>
}

export interface CurrentOfficial extends CandidateRecord {
  bioguideId: string | null
  openStatesId: string | null
  /** true when classification has < 4 axes at confidence > 0.6 (pending_review threshold) */
  lowConfidence: boolean
}

export interface SourceError {
  source: 'federal' | 'stateLeg' | 'governor'
  message: string
}

export interface CurrentOfficialsBallot {
  senators: CurrentOfficial[]        // up to 2 US Senators
  representative: CurrentOfficial | null  // 1 US House rep
  governor: CurrentOfficial | null
  stateUpperLeg: CurrentOfficial | null  // State Senate
  stateLowerLeg: CurrentOfficial | null  // State House/Assembly
  /** Set when governor lookup SUCCEEDED but returned no person for this state. */
  governorCoverageNote?: string
  /** Non-empty when one or more upstream fetches threw (vs. genuinely empty district). */
  sourceErrors: SourceError[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CONGRESS_BASE = 'https://api.congress.gov/v3'
const OPENSTATES_BASE = 'https://v3.openstates.org'

const UNICAMERAL_STATES = new Set(['NE'])

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

function highConfidenceAxes(axisPlacement: Partial<Record<Dimension, AxisPlacement>>): number {
  return Object.values(axisPlacement).filter((ap) => ap && ap.confidence > 0.6).length
}

// ─────────────────────────────────────────────────────────────────────────────
// congress.gov — current members
// ─────────────────────────────────────────────────────────────────────────────

async function fetchCongressCurrentMembers(
  state: string,
  chamber: 'senate' | 'house',
  district?: number
): Promise<CongressMember[]> {
  const apiKey = process.env.CONGRESS_GOV_API_KEY
  if (!apiKey) throw new Error('CONGRESS_GOV_API_KEY is not set')

  const url = new URL(`${CONGRESS_BASE}/member`)
  url.searchParams.set('stateCode', state.toUpperCase())
  url.searchParams.set('currentMember', 'true')
  url.searchParams.set('limit', '10')
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
// Open States — current officeholders
// ─────────────────────────────────────────────────────────────────────────────

async function fetchOpenStatesCurrentOfficials(
  state: string,
  orgClassification: 'upper' | 'lower' | 'legislature' | 'executive',
  district?: number
): Promise<OpenStatesPerson[]> {
  const apiKey = process.env.OPENSTATES_API_KEY
  if (!apiKey) throw new Error('OPENSTATES_API_KEY is not set')

  const url = new URL(`${OPENSTATES_BASE}/people`)
  url.searchParams.set('jurisdiction', state.toLowerCase())
  url.searchParams.set('org_classification', orgClassification === 'legislature' ? 'upper' : orgClassification)
  if (district !== undefined) {
    url.searchParams.set('district', String(district))
  }
  url.searchParams.set('per_page', '5')
  url.searchParams.set('include', 'links')

  const res = await fetch(url.toString(), {
    headers: { 'X-API-KEY': apiKey },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Open States API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.results ?? []
}

// ─────────────────────────────────────────────────────────────────────────────
// Build helpers
// ─────────────────────────────────────────────────────────────────────────────

async function buildAndClassifyFederal(
  member: CongressMember,
  office: string,
  district: string,
  officeType: CandidateRecord['officeType'] = 'ideological'
): Promise<CurrentOfficial> {
  const entry = {
    id: member.bioguideId,
    name: member.name,
    office,
    officeType,
    district,
    party: partyDisplay(member.party),
    coverageTier: 'federal' as const,
    sourcedFrom: ['congress.gov'],
  }

  const classified = await getOrClassifyCandidate(entry)
  const axisPlacement = classified?.axisPlacement ?? {}

  return {
    id: entry.id,
    name: entry.name,
    office: entry.office,
    officeType: entry.officeType,
    district: entry.district,
    party: entry.party,
    axisPlacement,
    dealbreakers: classified?.dealbreakers ?? {},
    coverageTier: entry.coverageTier,
    sourcedFrom: entry.sourcedFrom,
    lastUpdated: classified?.lastUpdated ?? new Date().toISOString().slice(0, 10),
    rhetoricalOnly: classified?.rhetoricalOnly,
    bioguideId: member.bioguideId,
    openStatesId: null,
    lowConfidence: highConfidenceAxes(axisPlacement) < 4,
  }
}

async function buildAndClassifyStateLeg(
  person: OpenStatesPerson,
  state: string,
  chamber: 'upper' | 'lower' | 'legislature',
  district: number
): Promise<CurrentOfficial> {
  const stUp = state.toUpperCase()
  const distStr = String(district).padStart(2, '0')
  const isUpper = chamber === 'upper' || chamber === 'legislature'
  const office = isUpper ? `State Senate — ${stUp}-${distStr}` : `State House — ${stUp}-${distStr}`
  const seg = isUpper ? 'sldu' : 'sldl'
  const ocdDistrict = `ocd-division/country:us/state:${state.toLowerCase()}/${seg}:${district}`

  const entry = {
    id: person.id,
    name: person.name,
    office,
    officeType: 'ideological' as const,
    district: ocdDistrict,
    party: person.party ?? 'Unknown',
    coverageTier: 'state_legislative' as const,
    sourcedFrom: ['openstates'],
  }

  const classified = await getOrClassifyCandidate(entry)
  const axisPlacement = classified?.axisPlacement ?? {}

  return {
    id: entry.id,
    name: entry.name,
    office: entry.office,
    officeType: entry.officeType,
    district: entry.district,
    party: entry.party,
    axisPlacement,
    dealbreakers: classified?.dealbreakers ?? {},
    coverageTier: entry.coverageTier,
    sourcedFrom: entry.sourcedFrom,
    lastUpdated: classified?.lastUpdated ?? new Date().toISOString().slice(0, 10),
    rhetoricalOnly: classified?.rhetoricalOnly,
    bioguideId: null,
    openStatesId: person.id,
    lowConfidence: highConfidenceAxes(axisPlacement) < 4,
  }
}

async function buildAndClassifyGovernor(
  person: OpenStatesPerson,
  state: string
): Promise<CurrentOfficial> {
  const stUp = state.toUpperCase()
  const ocdDistrict = `ocd-division/country:us/state:${state.toLowerCase()}`

  const entry = {
    id: person.id,
    name: person.name,
    office: `Governor — ${stUp}`,
    officeType: 'ideological' as const,
    district: ocdDistrict,
    party: person.party ?? 'Unknown',
    coverageTier: 'statewide' as const,
    sourcedFrom: ['openstates'],
  }

  const classified = await getOrClassifyCandidate(entry)
  const axisPlacement = classified?.axisPlacement ?? {}

  return {
    id: entry.id,
    name: entry.name,
    office: entry.office,
    officeType: entry.officeType,
    district: entry.district,
    party: entry.party,
    axisPlacement,
    dealbreakers: classified?.dealbreakers ?? {},
    coverageTier: entry.coverageTier,
    sourcedFrom: entry.sourcedFrom,
    lastUpdated: classified?.lastUpdated ?? new Date().toISOString().slice(0, 10),
    rhetoricalOnly: classified?.rhetoricalOnly,
    bioguideId: null,
    openStatesId: person.id,
    lowConfidence: highConfidenceAxes(axisPlacement) < 4,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch and classify the 6 currently-serving officials for a user's district.
 * Parallel to fetchFederalCandidates / fetchStateLegCandidates but queries
 * current-member endpoints instead of candidate/filing lists.
 */
export async function fetchCurrentOfficials(
  state: string,
  congressionalDistrict: number | null,
  stateSenateDistrict: number | null,
  stateHouseDistrict: number | null
): Promise<CurrentOfficialsBallot> {
  const stateUpper = state.toUpperCase()
  const isUnicameral = UNICAMERAL_STATES.has(stateUpper)

  // Warn loudly if keys are missing — missing key ≠ empty district.
  const missingKeys: string[] = []
  if (!process.env.CONGRESS_GOV_API_KEY) missingKeys.push('CONGRESS_GOV_API_KEY')
  if (!process.env.OPENSTATES_API_KEY) missingKeys.push('OPENSTATES_API_KEY')
  if (missingKeys.length > 0) {
    console.error('fetchCurrentOfficials: missing required env var(s):', missingKeys.join(', '))
  }

  const sourceErrors: SourceError[] = []

  // ── Fetch raw official data in parallel, tracking per-source errors ──────────

  type FederalResult = { members: CongressMember[]; error: SourceError | null }
  type StateResult = { people: OpenStatesPerson[]; error: SourceError | null }

  const [federalResult, stateResult, governorResult] = await Promise.all([
    // Federal: senate + house together so one sourceError covers both
    (async (): Promise<FederalResult> => {
      try {
        const [senate, house] = await Promise.all([
          fetchCongressCurrentMembers(stateUpper, 'senate'),
          congressionalDistrict !== null
            ? fetchCongressCurrentMembers(stateUpper, 'house', congressionalDistrict)
            : Promise.resolve([] as CongressMember[]),
        ])
        return { members: [...senate, ...house], error: null }
      } catch (e) {
        return { members: [], error: { source: 'federal', message: e instanceof Error ? e.message : String(e) } }
      }
    })(),

    // State leg: upper + lower together
    (async (): Promise<StateResult> => {
      try {
        const [upper, lower] = await Promise.all([
          stateSenateDistrict !== null
            ? fetchOpenStatesCurrentOfficials(state, isUnicameral ? 'legislature' : 'upper', stateSenateDistrict)
            : Promise.resolve([] as OpenStatesPerson[]),
          !isUnicameral && stateHouseDistrict !== null
            ? fetchOpenStatesCurrentOfficials(state, 'lower', stateHouseDistrict)
            : Promise.resolve([] as OpenStatesPerson[]),
        ])
        return { people: [...upper, ...lower], error: null }
      } catch (e) {
        return { people: [], error: { source: 'stateLeg', message: e instanceof Error ? e.message : String(e) } }
      }
    })(),

    // Governor: separate so success-but-empty can be a coverage note, not an error
    (async (): Promise<{ people: OpenStatesPerson[]; error: SourceError | null }> => {
      try {
        const people = await fetchOpenStatesCurrentOfficials(state, 'executive')
        return { people, error: null }
      } catch (e) {
        return { people: [], error: { source: 'governor', message: e instanceof Error ? e.message : String(e) } }
      }
    })(),
  ])

  if (federalResult.error) sourceErrors.push(federalResult.error)
  if (stateResult.error) sourceErrors.push(stateResult.error)
  if (governorResult.error) sourceErrors.push(governorResult.error)

  // Unpack raw members/people from federal and state results
  const senateMembers = federalResult.members.filter((m) => {
    const c = m.terms?.item?.at(-1)?.chamber?.toLowerCase() ?? ''
    return c === 'senate'
  }).slice(0, 2)
  const houseMembers = federalResult.members.filter((m) => {
    const c = m.terms?.item?.at(-1)?.chamber?.toLowerCase() ?? ''
    return c === 'house of representatives' || c === 'house'
  })

  const stateUpperPeople = stateResult.people.filter((p) => {
    const org = p.current_role?.org_classification
    return org === 'upper' || org === 'legislature'
  })
  const stateLowerPeople = stateResult.people.filter((p) => p.current_role?.org_classification === 'lower')
  const governorPeople = governorResult.people

  // Classify all in parallel
  const senateOcdId = `ocd-division/country:us/state:${stateUpper.toLowerCase()}`
  const houseOcdId = congressionalDistrict !== null
    ? `ocd-division/country:us/state:${stateUpper.toLowerCase()}/cd:${congressionalDistrict}`
    : senateOcdId

  const [
    classifiedSenators,
    classifiedRep,
    classifiedUpperLeg,
    classifiedLowerLeg,
    classifiedGovernor,
  ] = await Promise.all([
    Promise.all(
      senateMembers.map((m) =>
        buildAndClassifyFederal(m, `US Senate — ${stateUpper}`, senateOcdId)
      )
    ),
    houseMembers[0]
      ? buildAndClassifyFederal(
          houseMembers[0],
          congressionalDistrict !== null
            ? `US House — ${stateUpper}-${String(congressionalDistrict).padStart(2, '0')}`
            : `US House — ${stateUpper}`,
          houseOcdId
        ).catch(() => null)
      : Promise.resolve(null),
    stateUpperPeople[0] && stateSenateDistrict !== null
      ? buildAndClassifyStateLeg(stateUpperPeople[0], state, isUnicameral ? 'legislature' : 'upper', stateSenateDistrict).catch(() => null)
      : Promise.resolve(null),
    !isUnicameral && stateLowerPeople[0] && stateHouseDistrict !== null
      ? buildAndClassifyStateLeg(stateLowerPeople[0], state, 'lower', stateHouseDistrict).catch(() => null)
      : Promise.resolve(null),
    governorPeople[0]
      ? buildAndClassifyGovernor(governorPeople[0], state).catch(() => null)
      : Promise.resolve(null),
  ])

  // Governor coverage note: only when the fetch SUCCEEDED but returned no person.
  // If the fetch errored, it's already in sourceErrors — not a coverage claim.
  const governorCoverageNote =
    !governorResult.error && governorPeople.length === 0
      ? 'Governor data not available for this state via Open States. Check your state\'s official website.'
      : undefined

  return {
    senators: classifiedSenators,
    representative: classifiedRep,
    governor: classifiedGovernor,
    stateUpperLeg: classifiedUpperLeg,
    stateLowerLeg: classifiedLowerLeg,
    governorCoverageNote,
    sourceErrors,
  }
}
