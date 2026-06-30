/**
 * GET /api/media-catalog
 * Returns the parsed media catalog as MediaSource[] JSON.
 * Static data — cached at the edge for 1 hour.
 * Client-side pages fetch this and run matchMedia locally (pure function, no secrets).
 */

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { adaptCatalogRow } from '@/lib/media/catalogAdapter'
import type { CatalogRow } from '@/lib/media/catalogAdapter'

export const dynamic = 'force-static'
export const revalidate = 3600

function parseCsv(csv: string): CatalogRow[] {
  const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean)
  const header = lines[0].split(',')

  return lines.slice(1).map((line) => {
    // Handle commas inside quoted fields
    const cols: string[] = []
    let current = ''
    let inQuote = false
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote }
      else if (ch === ',' && !inQuote) { cols.push(current); current = '' }
      else { current += ch }
    }
    cols.push(current)

    const get = (name: string) => cols[header.indexOf(name)]?.trim() ?? ''
    return {
      name: get('name'),
      creators_hosts: get('creators_hosts'),
      format: get('format'),
      lean: get('lean'),
      notable_for: get('notable_for'),
      url: get('url_or_platform'),
      access_model: get('access_model'),
      ownership: get('ownership'),
      independence_risk: get('independence_risk'),
      policy_depth_score: get('policy_depth_score'),
      flags: get('flags'),
      tier_potential: get('tier_potential'),
      dimension_coverage_notes: get('dimension_coverage_notes'),
    } satisfies CatalogRow
  })
}

export async function GET() {
  const csvPath = path.join(process.cwd(), 'src', 'data', 'media-catalog.csv')
  const csv = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCsv(csv)
  const sources = rows.map(adaptCatalogRow)
  return NextResponse.json(sources)
}
