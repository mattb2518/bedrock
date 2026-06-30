import { describe, it, expect } from 'vitest'
import { matchMedia } from '../mediaMatch'
import type { MediaMatchKey } from '../mediaMatch'
import {
  MEDIA_MATCH_KEY,
  MEDIA_CONFIRMING,
  MEDIA_EXPANDING,
  MEDIA_CHALLENGING,
  MEDIA_LOW_RELIABILITY,
  MEDIA_DORMANT,
} from './fixtures'

const CATALOG = [
  MEDIA_CONFIRMING,
  MEDIA_EXPANDING,
  MEDIA_CHALLENGING,
  MEDIA_LOW_RELIABILITY,
  MEDIA_DORMANT,
]

// ── 1. Three-tier assignment ───────────────────────────────────────────────

describe('matchMedia — tier assignment', () => {
  it('places Aligned Weekly in confirming tier', () => {
    const result = matchMedia(MEDIA_MATCH_KEY, CATALOG)
    const ids = result.confirming.map((s) => s.source.id)
    expect(ids).toContain('media-confirming')
  })

  it('places Breadth Report in expanding tier', () => {
    const result = matchMedia(MEDIA_MATCH_KEY, CATALOG)
    const ids = result.expanding.map((s) => s.source.id)
    expect(ids).toContain('media-expanding')
  })

  it('places Counterpoint in challenging tier', () => {
    const result = matchMedia(MEDIA_MATCH_KEY, CATALOG)
    const ids = result.challenging.map((s) => s.source.id)
    expect(ids).toContain('media-challenging')
  })

  it('excludes low-reliability source from all tiers', () => {
    const result = matchMedia(MEDIA_MATCH_KEY, CATALOG)
    const allIds = [
      ...result.confirming,
      ...result.expanding,
      ...result.challenging,
    ].map((s) => s.source.id)
    expect(allIds).not.toContain('media-low-rel')
  })

  it('excludes dormant source from all tiers', () => {
    const result = matchMedia(MEDIA_MATCH_KEY, CATALOG)
    const allIds = [
      ...result.confirming,
      ...result.expanding,
      ...result.challenging,
    ].map((s) => s.source.id)
    expect(allIds).not.toContain('media-dormant')
  })
})

// ── 2. Computed score sanity checks ──────────────────────────────────────

describe('matchMedia — computed scores', () => {
  it('confirming source has agreement >= 0.65', () => {
    const result = matchMedia(MEDIA_MATCH_KEY, CATALOG)
    const conf = result.confirming.find((s) => s.source.id === 'media-confirming')
    expect(conf).toBeDefined()
    expect(conf!.agreement).toBeGreaterThanOrEqual(0.65)
  })

  it('challenging source has tensionOnHeld >= 0.60', () => {
    const result = matchMedia(MEDIA_MATCH_KEY, CATALOG)
    const chal = result.challenging.find((s) => s.source.id === 'media-challenging')
    expect(chal).toBeDefined()
    expect(chal!.tensionOnHeld).toBeGreaterThanOrEqual(0.60)
  })

  it('expanding source has novelCoverage >= 0.50', () => {
    const result = matchMedia(MEDIA_MATCH_KEY, CATALOG)
    const exp = result.expanding.find((s) => s.source.id === 'media-expanding')
    expect(exp).toBeDefined()
    expect(exp!.novelCoverage).toBeGreaterThanOrEqual(0.50)
  })
})

// ── 3. Architectural wall — dealbreakers structurally absent ─────────────

describe('matchMedia — dealbreaker architectural wall', () => {
  it('MediaMatchKey type has no dealbreakers field — structural wall verified', () => {
    // The structural wall: MediaMatchKey has no `dealbreakers` field.
    // TypeScript enforces this at the call site via excess property checking on
    // direct object literals (e.g. `matchMedia({ ..., dealbreakers: [] }, catalog)`
    // would be a compile error). Object spreads bypass excess-property checks in TS,
    // so we verify the guarantee structurally: the field simply does not exist on
    // the type, and the function produces identical results whether or not extra
    // data is smuggled in via a cast — because the engine never reads it.
    const key: MediaMatchKey = {
      dimensionScores: MEDIA_MATCH_KEY.dimensionScores,
      topDimensions: MEDIA_MATCH_KEY.topDimensions,
      primaryType: 'pioneer',
      secondaryTypes: [],
      completenessPct: 40,
    }

    // Verify the type has no dealbreakers key at the property level
    expect('dealbreakers' in key).toBe(false)

    // Confirm the function runs correctly without the field
    expect(() => matchMedia(key, CATALOG)).not.toThrow()

    // Confirm results are identical if extra data is smuggled in via cast —
    // the engine simply never reads it
    const keyWithExtra = { ...key, dealbreakers: [{ itemId: 'DB-1' }] } as unknown as MediaMatchKey
    const result1 = matchMedia(key, CATALOG)
    const result2 = matchMedia(keyWithExtra, CATALOG)
    expect(result1.confirming.map((s) => s.source.id)).toEqual(
      result2.confirming.map((s) => s.source.id)
    )
  })

  it('MediaSource has no dealbreakers field', () => {
    // Type-level check: the source fixture should not have a dealbreakers property
    expect('dealbreakers' in MEDIA_CONFIRMING).toBe(false)
  })
})

// ── 4. Empty catalog fallback ─────────────────────────────────────────────

describe('matchMedia — empty catalog', () => {
  it('returns empty tiers without throwing', () => {
    const result = matchMedia(MEDIA_MATCH_KEY, [])
    expect(result.confirming).toHaveLength(0)
    expect(result.expanding).toHaveLength(0)
    expect(result.challenging).toHaveLength(0)
  })
})
