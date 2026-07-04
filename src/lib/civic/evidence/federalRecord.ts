/**
 * Federal legislative evidence — congress.gov per-member endpoints. §20.2a.
 *
 * Gathers sponsored + cosponsored legislation for a sitting member of Congress,
 * formatted as one line per item for the classification prompt (§20.2).
 *
 * Fail-open contract: ANY failure (missing key, non-200, empty, parse error)
 * returns [] — never throws. The classifier then runs rhetoric-only.
 *
 * Roll-call votes are deliberately absent: congress.gov exposes votes per-vote,
 * not per-member, so vote history requires a bulk ingestion pipeline (v2).
 */

const CONGRESS_BASE = 'https://api.congress.gov/v3'

interface LatestAction {
  actionDate?: string
  text?: string
}

// Shape verified live against /member/S000148/sponsored-legislation (2026-07-04).
// Sponsored items can be AMENDMENTS (amendmentNumber set, type/title null) —
// those carry no usable evidence text and are skipped.
interface LegislationItem {
  congress?: number
  type?: string | null
  number?: string | null
  title?: string | null
  amendmentNumber?: string
  policyArea?: { name?: string | null }
  latestAction?: LatestAction | null
  introducedDate?: string
}

function formatItem(prefix: 'Sponsored' | 'Cosponsored', item: LegislationItem): string | null {
  if (!item.type || !item.number || !item.title) return null // amendment or malformed
  const bill = `${item.type} ${item.number}`
  const congress = item.congress ? ` (${item.congress}th Congress)` : ''
  const policy = item.policyArea?.name ? ` [${item.policyArea.name}]` : ''
  const action = item.latestAction?.text
    ? ` — latest action: ${item.latestAction.text}${item.latestAction.actionDate ? ` (${item.latestAction.actionDate})` : ''}`
    : ''
  return `${prefix}: ${bill}${congress} — ${item.title}${policy}${action}`
}

async function fetchLegislation(
  bioguideId: string,
  endpoint: 'sponsored-legislation' | 'cosponsored-legislation',
  limit: number,
  apiKey: string
): Promise<LegislationItem[]> {
  const url = new URL(`${CONGRESS_BASE}/member/${bioguideId}/${endpoint}`)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('format', 'json')
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`congress.gov ${endpoint} ${res.status}`)

  const data = await res.json()
  // Response key matches the endpoint: sponsoredLegislation / cosponsoredLegislation
  return (endpoint === 'sponsored-legislation'
    ? data.sponsoredLegislation
    : data.cosponsoredLegislation) ?? []
}

export async function gatherFederalEvidence(bioguideId: string): Promise<string[]> {
  try {
    const apiKey = process.env.CONGRESS_GOV_API_KEY
    if (!apiKey) {
      console.warn(`gatherFederalEvidence: CONGRESS_GOV_API_KEY not set (bioguideId=${bioguideId})`)
      return []
    }

    const [sponsored, cosponsored] = await Promise.all([
      fetchLegislation(bioguideId, 'sponsored-legislation', 20, apiKey),
      fetchLegislation(bioguideId, 'cosponsored-legislation', 10, apiKey),
    ])

    const lines = [
      ...sponsored.map((item) => formatItem('Sponsored', item)),
      ...cosponsored.map((item) => formatItem('Cosponsored', item)),
    ].filter((line): line is string => line !== null)

    return lines
  } catch (e) {
    console.warn(`gatherFederalEvidence: failed for bioguideId=${bioguideId}:`, e instanceof Error ? e.message : e)
    return []
  }
}
