'use server'

// Address → OCD-ID resolver using the Google Civic divisionsByAddress endpoint.
// Returns the list of OCD-IDs the address falls within (federal + state).
// Used by Beyond Your Ballot (Stage 5) and Your Ballot / Your Officials (Stage 7+).
//
// Google Civic API docs:
// https://developers.google.com/civic-information/docs/v2/divisions/search
// Endpoint: GET https://www.googleapis.com/civicinfo/v2/divisionsByAddress
//   ?address=<url-encoded>&key=<GOOGLE_CIVIC_API_KEY>
//
// The Representatives endpoint was shut down 2025-04-30 — see SPEC.md deprecated-APIs list.
// The response includes `divisions` keyed by OCD-ID. normalizedInput is a string (may be absent).

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

export async function resolveDistrict(address: string): Promise<ResolveDistrictResult> {
  const apiKey = process.env.GOOGLE_CIVIC_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_CIVIC_API_KEY is not set')
  }

  const url = new URL('https://www.googleapis.com/civicinfo/v2/divisionsByAddress')
  url.searchParams.set('address', address)
  url.searchParams.set('key', apiKey)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  let res: Response
  try {
    res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Google Civic API error ${res.status}: ${body}`)
  }

  const data = await res.json()

  const ocdIds = Object.keys(data.divisions ?? {})
  // normalizedInput is a plain string in divisionsByAddress (may be absent); fall back to raw input.
  const normalizedAddress = typeof data.normalizedInput === 'string' ? data.normalizedInput : address

  const { state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict } = parseDistrictInfo(ocdIds)

  return { ocdIds, normalizedAddress, state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict }
}
