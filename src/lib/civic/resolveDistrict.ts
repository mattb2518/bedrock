'use server'

// Address → OCD-ID resolver using the Google Civic divisionByAddress endpoint.
// Returns the list of OCD-IDs the address falls within (federal + state).
// Used by Beyond Your Ballot (Stage 5) and Your Ballot (Stage 7+).
//
// Google Civic API docs:
// https://developers.google.com/civic-information/docs/v2/divisions/search
// Endpoint: GET https://civicinfo.googleapis.com/civicinfo/v2/representatives
//   ?address=<url-encoded>&key=<GOOGLE_CIVIC_API_KEY>
//
// We use the Representatives endpoint (NOT the deprecated representativeInfoByDivision).
// The response includes `divisions` keyed by OCD-ID.

export interface ResolveDistrictResult {
  ocdIds: string[]
  normalizedAddress: string | null
  /** Two-letter state code, uppercase — extracted from OCD-IDs (e.g. "VA"). Null if not found. */
  state: string | null
  /** Congressional district number (e.g. 5 for VA-05). Null for statewide/no district. */
  congressionalDistrict: number | null
}

/**
 * Parse state abbreviation and congressional district number from a list of OCD-IDs.
 * OCD-ID patterns:
 *   ocd-division/country:us/state:va          → state="VA"
 *   ocd-division/country:us/state:va/cd:5     → state="VA", district=5
 */
export function parseDistrictInfo(ocdIds: string[]): { state: string | null; congressionalDistrict: number | null } {
  let state: string | null = null
  let congressionalDistrict: number | null = null

  for (const id of ocdIds) {
    // Extract state code
    const stateMatch = id.match(/\/state:([a-z]{2})(?:\/|$)/)
    if (stateMatch && !state) {
      state = stateMatch[1].toUpperCase()
    }
    // Extract congressional district number
    const cdMatch = id.match(/\/cd:(\d+)/)
    if (cdMatch) {
      congressionalDistrict = parseInt(cdMatch[1], 10)
    }
  }

  return { state, congressionalDistrict }
}

export async function resolveDistrict(address: string): Promise<ResolveDistrictResult> {
  const apiKey = process.env.GOOGLE_CIVIC_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_CIVIC_API_KEY is not set')
  }

  const url = new URL('https://civicinfo.googleapis.com/civicinfo/v2/representatives')
  url.searchParams.set('address', address)
  url.searchParams.set('key', apiKey)
  // Request only the divisions object — we don't need full representative data here
  url.searchParams.set('includeOffices', 'false')

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } }) // cache 24h
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Google Civic API error ${res.status}: ${body}`)
  }

  const data = await res.json()

  const ocdIds = Object.keys(data.divisions ?? {})
  const normalizedAddress = data.normalizedInput
    ? [
        data.normalizedInput.line1,
        data.normalizedInput.city,
        data.normalizedInput.state,
        data.normalizedInput.zip,
      ]
        .filter(Boolean)
        .join(', ')
    : null

  const { state, congressionalDistrict } = parseDistrictInfo(ocdIds)

  return { ocdIds, normalizedAddress, state, congressionalDistrict }
}
