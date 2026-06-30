'use server'

// Minimal address → OCD-ID resolver using the Google Civic divisionByAddress endpoint.
// Returns the list of OCD-IDs the address falls within (federal + state).
// Stage 7 (Your Ballot) imports this instead of duplicating it.
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

  return { ocdIds, normalizedAddress }
}
