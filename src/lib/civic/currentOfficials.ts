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
  partyName: string  // congress.gov API field (NOT 'party')
  depiction?: { imageUrl?: string }
  terms: {
    item: Array<{ chamber: string; startYear?: number; endYear?: number }>
  }
  url: string
}

interface OpenStatesPerson {
  id: string
  name: string
  party: string
  image?: string | null
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

// §22b.6 — Unclassified lookup: name/office/party/photo only, zero LLM calls.
// Shown to visitors without a quiz profile; gating classification behind "has a
// profile" bounds cost for anonymous/bot traffic.
export interface UnclassifiedOfficial {
  id: string
  name: string
  office: string
  party: string
  district: string
  photoUrl: string | null
  bioguideId: string | null
  openStatesId: string | null
}

export interface UnclassifiedOfficialsBallot {
  senators: UnclassifiedOfficial[]
  representative: UnclassifiedOfficial | null
  governor: UnclassifiedOfficial | null
  stateUpperLeg: UnclassifiedOfficial | null
  stateLowerLeg: UnclassifiedOfficial | null
  governorCoverageNote?: string
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
// congress.gov — current members (path-based, genuinely filtered by state)
// ─────────────────────────────────────────────────────────────────────────────

// 119th Congress: Jan 3 2025 – Jan 3 2027. TODO: bump to 120 on Jan 3, 2027.
const CURRENT_CONGRESS = 119

async function fetchCongressStateMembers(
  state: string,
): Promise<CongressMember[]> {
  // DIAGNOSTIC — Batch 11: log length before the throw so it fires even when key is missing/empty.
  console.log(
    '[env diag] CONGRESS_GOV_API_KEY length (fetchCongressStateMembers):',
    process.env.CONGRESS_GOV_API_KEY?.length ?? 'undefined'
  )
  const apiKey = process.env.CONGRESS_GOV_API_KEY
  if (!apiKey) throw new Error('CONGRESS_GOV_API_KEY is not set')

  // Warn at runtime if the congress number may have rolled over.
  if (new Date().getFullYear() >= 2027) {
    console.warn(
      `currentOfficials: CURRENT_CONGRESS=${CURRENT_CONGRESS} may be stale — ` +
      'verify at api.congress.gov and bump the constant in currentOfficials.ts.'
    )
  }

  // Path-based endpoint: /v3/member/congress/{congress}/{stateCode}
  // Returns all current members for the state (both chambers); filter client-side.
  // The list-level /v3/member endpoint silently ignores stateCode/district params.
  const url = new URL(`${CONGRESS_BASE}/member/congress/${CURRENT_CONGRESS}/${state.toUpperCase()}`)
  url.searchParams.set('currentMember', 'true')
  url.searchParams.set('limit', '50')  // states have at most ~50 house seats + 2 senators
  url.searchParams.set('format', 'json')
  url.searchParams.set('api_key', apiKey)

  // DIAGNOSTIC — Batch 7: log real API shape before filtering. Remove after fix confirmed.
  const redactedUrl = url.toString().replace(apiKey, 'REDACTED')
  console.log('[congress.gov diag] GET', redactedUrl)

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })  // no-cache during diagnosis

  console.log('[congress.gov diag] status:', res.status)
  if (!res.ok) {
    const body = await res.text()
    console.log('[congress.gov diag] error body:', body.slice(0, 500))
    throw new Error(`congress.gov API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  const members: CongressMember[] = data.members ?? []
  console.log('[congress.gov diag] top-level keys:', Object.keys(data))
  console.log('[congress.gov diag] members.length:', members.length)
  console.log('[congress.gov diag] first 3 members:', JSON.stringify(
    members.slice(0, 3).map((m) => ({
      name: m.name,
      state: m.state,
      district: m.district,
      lastTermChamber: m.terms?.item?.at(-1)?.chamber,
    })),
    null, 2
  ))
  return members
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
    party: partyDisplay(member.partyName),
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
// Unclassified build helpers (§22b.6 — no getOrClassifyCandidate calls)
// ─────────────────────────────────────────────────────────────────────────────

function buildUnclassifiedFederal(
  member: CongressMember,
  office: string,
  district: string
): UnclassifiedOfficial {
  return {
    id: member.bioguideId,
    name: member.name,
    office,
    party: partyDisplay(member.partyName),
    district,
    photoUrl: member.depiction?.imageUrl ?? null,
    bioguideId: member.bioguideId,
    openStatesId: null,
  }
}

function buildUnclassifiedStateLeg(
  person: OpenStatesPerson,
  state: string,
  chamber: 'upper' | 'lower' | 'legislature',
  district: number
): UnclassifiedOfficial {
  const stUp = state.toUpperCase()
  const distStr = String(district).padStart(2, '0')
  const isUpper = chamber === 'upper' || chamber === 'legislature'
  const office = isUpper ? `State Senate — ${stUp}-${distStr}` : `State House — ${stUp}-${distStr}`
  const seg = isUpper ? 'sldu' : 'sldl'
  return {
    id: person.id,
    name: person.name,
    office,
    party: person.party ?? 'Unknown',
    district: `ocd-division/country:us/state:${state.toLowerCase()}/${seg}:${district}`,
    photoUrl: person.image ?? null,
    bioguideId: null,
    openStatesId: person.id,
  }
}

function buildUnclassifiedGovernor(
  person: OpenStatesPerson,
  state: string
): UnclassifiedOfficial {
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

/**
 * §22b.6 — Fetch officials without classification (no LLM calls).
 * Returns name/office/party/district/photo only. Used for visitors without a
 * quiz profile. The existing fetchCurrentOfficials (full classified) is
 * unchanged and still used for authenticated users with a profile.
 */
export async function fetchCurrentOfficialsUnclassified(
  state: string,
  congressionalDistrict: number | null,
  stateSenateDistrict: number | null,
  stateHouseDistrict: number | null
): Promise<UnclassifiedOfficialsBallot> {
  const stateUpper = state.toUpperCase()
  const isUnicameral = UNICAMERAL_STATES.has(stateUpper)

  // DIAGNOSTIC — Batch 8/10: log key names + CONGRESS key length (no values). Remove after fix.
  console.log(
    '[env diag] all process.env keys containing CONGRESS or FEC or OPENSTATES:',
    Object.keys(process.env).filter(k => /congress|fec|openstates/i.test(k))
  )
  console.log(
    '[env diag] CONGRESS_GOV_API_KEY length:',
    process.env.CONGRESS_GOV_API_KEY?.length ?? 'undefined'
  )

  const missingKeys: string[] = []
  if (!process.env.CONGRESS_GOV_API_KEY) missingKeys.push('CONGRESS_GOV_API_KEY')
  if (!process.env.OPENSTATES_API_KEY) missingKeys.push('OPENSTATES_API_KEY')
  if (missingKeys.length > 0) {
    console.error('fetchCurrentOfficialsUnclassified: missing required env var(s):', missingKeys.join(', '))
  }

  const sourceErrors: SourceError[] = []

  type FederalResult = { members: CongressMember[]; error: SourceError | null }
  type StateResult = { people: OpenStatesPerson[]; error: SourceError | null }

  const [federalResult, stateResult, governorResult] = await Promise.all([
    (async (): Promise<FederalResult> => {
      try {
        return { members: await fetchCongressStateMembers(stateUpper), error: null }
      } catch (e) {
        return { members: [], error: { source: 'federal', message: e instanceof Error ? e.message : String(e) } }
      }
    })(),
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
    (async (): Promise<{ people: OpenStatesPerson[]; error: SourceError | null }> => {
      try {
        return { people: await fetchOpenStatesCurrentOfficials(state, 'executive'), error: null }
      } catch (e) {
        return { people: [], error: { source: 'governor', message: e instanceof Error ? e.message : String(e) } }
      }
    })(),
  ])

  if (federalResult.error) sourceErrors.push(federalResult.error)
  if (stateResult.error) sourceErrors.push(stateResult.error)
  if (governorResult.error) sourceErrors.push(governorResult.error)

  const senateOcdId = `ocd-division/country:us/state:${stateUpper.toLowerCase()}`
  const houseOcdId = congressionalDistrict !== null
    ? `ocd-division/country:us/state:${stateUpper.toLowerCase()}/cd:${congressionalDistrict}`
    : senateOcdId

  const senateMembers = federalResult.members.filter((m) => {
    const c = m.terms?.item?.at(-1)?.chamber?.toLowerCase() ?? ''
    return c === 'senate'
  }).slice(0, 2)

  const houseMembers = federalResult.members.filter((m) => {
    const c = m.terms?.item?.at(-1)?.chamber?.toLowerCase() ?? ''
    const isHouse = c === 'house of representatives' || c === 'house'
    if (!isHouse) return false
    if (congressionalDistrict === null) return false
    return m.district === congressionalDistrict
  })

  const stateUpperPeople = stateResult.people.filter((p) => {
    const org = p.current_role?.org_classification
    return org === 'upper' || org === 'legislature'
  })
  const stateLowerPeople = stateResult.people.filter((p) => p.current_role?.org_classification === 'lower')
  const governorPerson = governorResult.people.find(
    (p) => p.current_role?.title?.toLowerCase() === 'governor'
  )

  const governorCoverageNote =
    !governorResult.error && governorPerson === undefined
      ? 'Governor data not available for this state via Open States. Check your state\'s official website.'
      : undefined

  return {
    senators: senateMembers.map((m) => buildUnclassifiedFederal(m, `US Senate — ${stateUpper}`, senateOcdId)),
    representative: houseMembers[0]
      ? buildUnclassifiedFederal(
          houseMembers[0],
          congressionalDistrict !== null
            ? `US House — ${stateUpper}-${String(congressionalDistrict).padStart(2, '0')}`
            : `US House — ${stateUpper}`,
          houseOcdId
        )
      : null,
    governor: governorPerson ? buildUnclassifiedGovernor(governorPerson, state) : null,
    stateUpperLeg: stateUpperPeople[0] && stateSenateDistrict !== null
      ? buildUnclassifiedStateLeg(stateUpperPeople[0], state, isUnicameral ? 'legislature' : 'upper', stateSenateDistrict)
      : null,
    stateLowerLeg: !isUnicameral && stateLowerPeople[0] && stateHouseDistrict !== null
      ? buildUnclassifiedStateLeg(stateLowerPeople[0], state, 'lower', stateHouseDistrict)
      : null,
    governorCoverageNote,
    sourceErrors,
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
  // DIAGNOSTIC — Batch 8/9/10: log key names + CONGRESS key length (no values). Remove after fix.
  console.log(
    '[env diag] all process.env keys containing CONGRESS or FEC or OPENSTATES:',
    Object.keys(process.env).filter(k => /congress|fec|openstates/i.test(k))
  )
  console.log(
    '[env diag] CONGRESS_GOV_API_KEY length:',
    process.env.CONGRESS_GOV_API_KEY?.length ?? 'undefined'
  )
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
    // Federal: one path-based state call returns all current members (both chambers).
    // Client-side filters by chamber and, for house, by district number.
    (async (): Promise<FederalResult> => {
      try {
        const members = await fetchCongressStateMembers(stateUpper)
        return { members, error: null }
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
    const isHouse = c === 'house of representatives' || c === 'house'
    if (!isHouse) return false
    // Filter to the user's specific congressional district
    if (congressionalDistrict === null) return false
    return m.district === congressionalDistrict
  })

  const stateUpperPeople = stateResult.people.filter((p) => {
    const org = p.current_role?.org_classification
    return org === 'upper' || org === 'legislature'
  })
  const stateLowerPeople = stateResult.people.filter((p) => p.current_role?.org_classification === 'lower')

  // Filter executive results to exactly "Governor" — Open States returns all statewide
  // executive officers (Governor, Lieutenant Governor, etc.) and lists them in arbitrary
  // order. A naive [0] pick or .includes('governor') check matches Lt. Governor.
  const governorPerson = governorResult.people.find(
    (p) => p.current_role?.title?.toLowerCase() === 'governor'
  )

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
    governorPerson
      ? buildAndClassifyGovernor(governorPerson, state).catch(() => null)
      : Promise.resolve(null),
  ])

  // Governor coverage note: only when the fetch SUCCEEDED but no "Governor"-titled
  // person was found. Covers both genuinely missing data and states where Open States
  // returns only non-Governor executive officers.
  const governorCoverageNote =
    !governorResult.error && governorPerson === undefined
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
