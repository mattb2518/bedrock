import { describe, it, expect } from 'vitest'
import {
  lookupCatalog,
  parseCatalogCsv,
  extractHostname,
  type CatalogEntry,
} from '../catalogLookup'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FIXTURE_CATALOG: CatalogEntry[] = [
  { name: 'Letters from an American', lean: 'Center-left', flags: '[P]', url: 'https://heathercoxrichardson.substack.com' },
  { name: 'Popular Information',      lean: 'Left',         flags: '[P]', url: 'https://popular.info' },
  { name: 'The Dispatch',             lean: 'Center-right', flags: '',    url: 'https://thedispatch.com' },
  { name: 'The Lever',                lean: 'Left',         flags: '[P]+[R]', url: 'https://www.levernews.com' },
]

// ── extractHostname ───────────────────────────────────────────────────────────

describe('extractHostname', () => {
  it('strips www. prefix', () => {
    expect(extractHostname('https://www.levernews.com')).toBe('levernews.com')
  })

  it('strips path and query', () => {
    expect(extractHostname('https://popular.info/p/something?ref=foo')).toBe('popular.info')
  })

  it('handles URL without protocol', () => {
    expect(extractHostname('thedispatch.com')).toBe('thedispatch.com')
  })

  it('lowercases the result', () => {
    expect(extractHostname('https://TheDISPATCH.com')).toBe('thedispatch.com')
  })
})

// ── lookupCatalog ─────────────────────────────────────────────────────────────

describe('lookupCatalog — match found', () => {
  it('matches an article URL against a catalog entry by hostname', () => {
    const result = lookupCatalog('https://popular.info/p/some-article', FIXTURE_CATALOG)
    expect(result.inCatalog).toBe(true)
    if (!result.inCatalog) return
    expect(result.name).toBe('Popular Information')
    expect(result.lean).toBe('Left')
  })

  it('matches when catalog URL has www. prefix', () => {
    const result = lookupCatalog('https://levernews.com/article/1', FIXTURE_CATALOG)
    expect(result.inCatalog).toBe(true)
    if (!result.inCatalog) return
    expect(result.name).toBe('The Lever')
  })

  it('matches substack newsletters by full subdomain — not generic substack.com', () => {
    const result = lookupCatalog(
      'https://heathercoxrichardson.substack.com/p/todays-letter',
      FIXTURE_CATALOG
    )
    expect(result.inCatalog).toBe(true)
    if (!result.inCatalog) return
    expect(result.name).toBe('Letters from an American')
  })

  it('does NOT match a different substack newsletter as the same catalog entry', () => {
    // othernewsletter.substack.com should NOT match heathercoxrichardson.substack.com
    const result = lookupCatalog('https://othernewsletter.substack.com/p/foo', FIXTURE_CATALOG)
    expect(result.inCatalog).toBe(false)
  })

  it('returns parsed flags array', () => {
    const result = lookupCatalog('https://levernews.com', FIXTURE_CATALOG)
    expect(result.inCatalog).toBe(true)
    if (!result.inCatalog) return
    expect(result.flags).toEqual(['[P]', '[R]'])
  })

  it('returns empty flags array when no flags', () => {
    const result = lookupCatalog('https://thedispatch.com/article', FIXTURE_CATALOG)
    expect(result.inCatalog).toBe(true)
    if (!result.inCatalog) return
    expect(result.flags).toEqual([])
  })
})

describe('lookupCatalog — no match', () => {
  it('returns inCatalog: false for an unknown source', () => {
    const result = lookupCatalog('https://someblog.example.com/post/1', FIXTURE_CATALOG)
    expect(result.inCatalog).toBe(false)
  })

  it('returns inCatalog: false for an empty URL', () => {
    const result = lookupCatalog('', FIXTURE_CATALOG)
    expect(result.inCatalog).toBe(false)
  })
})

// ── parseCatalogCsv ───────────────────────────────────────────────────────────

describe('parseCatalogCsv', () => {
  const SAMPLE_CSV = `name,creators_hosts,format,lean,notable_for,url_or_platform,access_model,ownership,independence_risk,policy_depth_score,flags,tier_potential,dimension_coverage_notes
Letters from an American,Heather Cox Richardson,Newsletter,Center-left,Daily framing.,https://heathercoxrichardson.substack.com,Both,Solo creator,Low,4,[P],Confirming (left-leaning users),stability_change
Popular Information,Judd Legum,Newsletter,Left,Accountability journalism.,https://popular.info,Both,Solo creator,Low,5,[P],Confirming (left-leaning users),markets_governance`

  it('parses name and url from CSV', () => {
    const entries = parseCatalogCsv(SAMPLE_CSV)
    expect(entries).toHaveLength(2)
    expect(entries[0].name).toBe('Letters from an American')
    expect(entries[0].url).toBe('https://heathercoxrichardson.substack.com')
  })

  it('parses lean and flags', () => {
    const entries = parseCatalogCsv(SAMPLE_CSV)
    expect(entries[0].lean).toBe('Center-left')
    expect(entries[0].flags).toBe('[P]')
  })

  it('skips the header row', () => {
    const entries = parseCatalogCsv(SAMPLE_CSV)
    expect(entries[0].name).not.toBe('name')
  })
})
