/**
 * State legislative evidence — Open States v3 bills search. §20.2a.
 *
 * Gathers bills sponsored by a state legislator, formatted as one line per
 * bill for the classification prompt (§20.2).
 *
 * Sponsor filtering verified live (2026-07-04): /bills?sponsor={ocd-person-id}
 * returns only that person's bills.
 *
 * Fail-open contract: ANY failure (missing key, non-200, empty, parse error)
 * returns [] — never throws. The classifier then runs rhetoric-only.
 */

const OPENSTATES_BASE = 'https://v3.openstates.org'

// Shape verified live against /bills?jurisdiction=ny&sponsor=... (2026-07-04).
interface OpenStatesBill {
  identifier?: string
  title?: string
  latest_action_description?: string
  latest_action_date?: string
}

export async function gatherStateEvidence(openStatesId: string, state: string): Promise<string[]> {
  try {
    const apiKey = process.env.OPENSTATES_API_KEY
    if (!apiKey) {
      console.warn(`gatherStateEvidence: OPENSTATES_API_KEY not set (openStatesId=${openStatesId})`)
      return []
    }

    const url = new URL(`${OPENSTATES_BASE}/bills`)
    url.searchParams.set('jurisdiction', state.toLowerCase())
    url.searchParams.set('sponsor', openStatesId)
    url.searchParams.set('per_page', '20')
    url.searchParams.set('sort', 'latest_action_desc')

    const res = await fetch(url.toString(), {
      headers: { 'X-API-KEY': apiKey },
      next: { revalidate: 86400 },
    })
    if (!res.ok) throw new Error(`Open States bills ${res.status}`)

    const data = await res.json()
    const bills: OpenStatesBill[] = data.results ?? []

    return bills
      .filter((b) => b.identifier && b.title)
      .map((b) => {
        const action = b.latest_action_description
          ? ` — latest action: ${b.latest_action_description}${b.latest_action_date ? ` (${b.latest_action_date})` : ''}`
          : ''
        return `Sponsored (state): ${b.identifier} — ${b.title}${action}`
      })
  } catch (e) {
    console.warn(`gatherStateEvidence: failed for openStatesId=${openStatesId}:`, e instanceof Error ? e.message : e)
    return []
  }
}
