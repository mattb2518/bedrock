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

import { parseDistrictInfo } from './districtUtils'

export interface ResolveDistrictResult {
  ocdIds: string[]
  normalizedAddress: string | null
  /** Two-letter state code, uppercase — extracted from OCD-IDs (e.g. "VA"). Null if not found. */
  state: string | null
  /** Congressional district number (e.g. 5 for VA-05). Null for statewide/no district. */
  congressionalDistrict: number | null
  /** State senate district number from OCD-ID sldu segment. Null if not present. */
  stateSenateDistrict: number | null
  /** State house district number from OCD-ID sldl segment. Null if not present. */
  stateHouseDistrict: number | null
}

// Re-export so callers that imported these from resolveDistrict keep working.
// These are NOT server actions — they live in districtUtils.ts (no 'use server').
export { parseDistrictInfo } from './districtUtils'
export type { DistrictInfo } from './districtUtils'

export async function resolveDistrict(address: string): Promise<ResolveDistrictResult> {
  const apiKey = process.env.GOOGLE_CIVIC_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_CIVIC_API_KEY is not set')
  }

  const url = new URL('https://civicinfo.googleapis.com/civicinfo/v2/representatives')
  url.searchParams.set('address', address)
  url.searchParams.set('key', apiKey)
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

  const { state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict } = parseDistrictInfo(ocdIds)

  return { ocdIds, normalizedAddress, state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict }
}
