/**
 * Pure utility functions for parsing OCD-ID strings into district info.
 * No 'use server' — these are synchronous helpers safe to call from anywhere.
 * Imported by resolveDistrict.ts (server action) and tests.
 */

export interface DistrictInfo {
  state: string | null
  congressionalDistrict: number | null
  stateSenateDistrict: number | null
  stateHouseDistrict: number | null
}

/**
 * Parse state abbreviation and district numbers from a list of OCD-IDs.
 * OCD-ID patterns:
 *   ocd-division/country:us/state:va          → state="VA"
 *   ocd-division/country:us/state:va/cd:5     → congressional district 5
 *   ocd-division/country:us/state:va/sldu:22  → state senate district 22
 *   ocd-division/country:us/state:va/sldl:67  → state house district 67
 */
export function parseDistrictInfo(ocdIds: string[]): DistrictInfo {
  let state: string | null = null
  let congressionalDistrict: number | null = null
  let stateSenateDistrict: number | null = null
  let stateHouseDistrict: number | null = null

  for (const id of ocdIds) {
    const stateMatch = id.match(/\/state:([a-z]{2})(?:\/|$)/)
    if (stateMatch && !state) {
      state = stateMatch[1].toUpperCase()
    }
    const cdMatch = id.match(/\/cd:(\d+)/)
    if (cdMatch) congressionalDistrict = parseInt(cdMatch[1], 10)

    const slduMatch = id.match(/\/sldu:(\d+)/)
    if (slduMatch) stateSenateDistrict = parseInt(slduMatch[1], 10)

    const sldlMatch = id.match(/\/sldl:(\d+)/)
    if (sldlMatch) stateHouseDistrict = parseInt(sldlMatch[1], 10)
  }

  return { state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict }
}
