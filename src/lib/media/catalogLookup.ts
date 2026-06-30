// Catalog lookup — checks whether a source URL matches an entry in the static
// media catalog CSV. Server-side only (uses fs). For testability, the lookup
// function accepts an optional pre-parsed catalog so tests can inject fixtures
// without touching the filesystem.

import fs from 'fs'
import path from 'path'

export interface CatalogEntry {
  name: string
  lean: string
  flags: string   // raw string from CSV, e.g. "[P]" or "[P]+[R]"
  url: string
}

export interface CatalogMatch {
  inCatalog: true
  name: string
  lean: string
  flags: string[]  // parsed array, e.g. ['[P]'] or ['[P]', '[R]']
}

export interface CatalogMiss {
  inCatalog: false
}

export type CatalogResult = CatalogMatch | CatalogMiss

// CSV header indices (hardcoded to the known catalog schema — fast and explicit)
const COL_NAME  = 0
const COL_LEAN  = 3
const COL_URL   = 5
const COL_FLAGS = 10

export function parseCatalogCsv(csv: string): CatalogEntry[] {
  const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean)
  return lines.slice(1).map((line) => {
    const cols = line.split(',')
    return {
      name:  cols[COL_NAME]  ?? '',
      lean:  cols[COL_LEAN]  ?? '',
      url:   cols[COL_URL]   ?? '',
      flags: cols[COL_FLAGS] ?? '',
    }
  })
}

export function extractHostname(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    return new URL(normalized).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return url.toLowerCase().replace(/^www\./, '')
  }
}

// Match when hostnames are equal OR the article URL is on a subdomain of the
// catalog entry (e.g. heathercoxrichardson.substack.com matches the catalog
// entry for that specific newsletter, not all of substack).
function hostnamesMatch(articleUrl: string, catalogUrl: string): boolean {
  if (!articleUrl || !catalogUrl) return false
  const articleHost = extractHostname(articleUrl)
  const catalogHost = extractHostname(catalogUrl)
  return articleHost === catalogHost
}

export function lookupCatalog(sourceUrl: string, catalog?: CatalogEntry[]): CatalogResult {
  const entries = catalog ?? _loadCatalog()

  for (const entry of entries) {
    if (hostnamesMatch(sourceUrl, entry.url)) {
      return {
        inCatalog: true,
        name: entry.name,
        lean: entry.lean,
        flags: entry.flags.split('+').map((f) => f.trim()).filter(Boolean),
      }
    }
  }

  return { inCatalog: false }
}

// Module-level cache — loaded once per server process lifetime
let _catalogCache: CatalogEntry[] | null = null

function _loadCatalog(): CatalogEntry[] {
  if (_catalogCache) return _catalogCache
  const csvPath = path.join(process.cwd(), 'src', 'data', 'media-catalog.csv')
  const csv = fs.readFileSync(csvPath, 'utf-8')
  _catalogCache = parseCatalogCsv(csv)
  return _catalogCache
}
