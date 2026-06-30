import { describe, it, expect } from 'vitest'
import { computeDisagreementDiff, DISAGREEMENT_THRESHOLD } from '../disagreementFlag'

const PLACEMENT_A = {
  stability_change:      { score: 50, confidence: 0.8, rationale: 'test', sources: [] },
  markets_governance:    { score: 30, confidence: 0.8, rationale: 'test', sources: [] },
  pragmatism_idealism:   { score: 70, confidence: 0.8, rationale: 'test', sources: [] },
  national_global:       { score: 45, confidence: 0.8, rationale: 'test', sources: [] },
}

// ── DISAGREEMENT_THRESHOLD constant ──────────────────────────────────────────

describe('DISAGREEMENT_THRESHOLD', () => {
  it('is 20', () => {
    expect(DISAGREEMENT_THRESHOLD).toBe(20)
  })
})

// ── computeDisagreementDiff ───────────────────────────────────────────────────

describe('computeDisagreementDiff — no disagreement', () => {
  it('returns flagged=false when all axes are within threshold', () => {
    const newPlacement = {
      stability_change:    { score: 55, confidence: 0.8, rationale: 'test', sources: [] },  // delta 5
      markets_governance:  { score: 40, confidence: 0.8, rationale: 'test', sources: [] },  // delta 10
      pragmatism_idealism: { score: 75, confidence: 0.8, rationale: 'test', sources: [] },  // delta 5
      national_global:     { score: 55, confidence: 0.8, rationale: 'test', sources: [] },  // delta 10
    }
    const result = computeDisagreementDiff(PLACEMENT_A, newPlacement)
    expect(result.flagged).toBe(false)
    expect(Object.values(result.diff).every((d) => !d.flagged)).toBe(true)
  })

  it('returns flagged=false for identical placements', () => {
    const result = computeDisagreementDiff(PLACEMENT_A, PLACEMENT_A)
    expect(result.flagged).toBe(false)
    expect(Object.values(result.diff).every((d) => d.delta === 0)).toBe(true)
  })

  it('does not flag axes exactly at the threshold (delta = 20 is NOT > 20)', () => {
    const newPlacement = {
      stability_change:    { score: 70, confidence: 0.8, rationale: 'test', sources: [] },  // delta 20 exactly
      markets_governance:  { score: 30, confidence: 0.8, rationale: 'test', sources: [] },
      pragmatism_idealism: { score: 70, confidence: 0.8, rationale: 'test', sources: [] },
      national_global:     { score: 45, confidence: 0.8, rationale: 'test', sources: [] },
    }
    const result = computeDisagreementDiff(PLACEMENT_A, newPlacement)
    expect(result.diff['stability_change'].delta).toBe(20)
    expect(result.diff['stability_change'].flagged).toBe(false)  // delta must be > 20, not >= 20
    expect(result.flagged).toBe(false)
  })
})

describe('computeDisagreementDiff — disagreement detected', () => {
  it('flags when any axis diverges more than 20 points', () => {
    const newPlacement = {
      ...PLACEMENT_A,
      markets_governance: { score: 65, confidence: 0.8, rationale: 'test', sources: [] },   // delta 35 — flagged
    }
    const result = computeDisagreementDiff(PLACEMENT_A, newPlacement)
    expect(result.flagged).toBe(true)
    expect(result.diff['markets_governance'].flagged).toBe(true)
    expect(result.diff['markets_governance'].delta).toBe(35)
  })

  it('only flags the divergent axis, not others within range', () => {
    const newPlacement = {
      stability_change:    { score: 52, confidence: 0.8, rationale: 'test', sources: [] },  // delta 2 — fine
      markets_governance:  { score: 75, confidence: 0.8, rationale: 'test', sources: [] },  // delta 45 — flagged
      pragmatism_idealism: { score: 68, confidence: 0.8, rationale: 'test', sources: [] },  // delta 2 — fine
      national_global:     { score: 47, confidence: 0.8, rationale: 'test', sources: [] },  // delta 2 — fine
    }
    const result = computeDisagreementDiff(PLACEMENT_A, newPlacement)
    expect(result.flagged).toBe(true)
    const flaggedAxes = Object.entries(result.diff).filter(([, d]) => d.flagged).map(([a]) => a)
    expect(flaggedAxes).toEqual(['markets_governance'])
  })

  it('flags multiple axes when multiple diverge', () => {
    const newPlacement = {
      stability_change:    { score: 80, confidence: 0.8, rationale: 'test', sources: [] },  // delta 30 — flagged
      markets_governance:  { score: 75, confidence: 0.8, rationale: 'test', sources: [] },  // delta 45 — flagged
      pragmatism_idealism: { score: 70, confidence: 0.8, rationale: 'test', sources: [] },  // delta 0 — fine
      national_global:     { score: 45, confidence: 0.8, rationale: 'test', sources: [] },  // delta 0 — fine
    }
    const result = computeDisagreementDiff(PLACEMENT_A, newPlacement)
    expect(result.flagged).toBe(true)
    const flaggedAxes = Object.entries(result.diff).filter(([, d]) => d.flagged).map(([a]) => a)
    expect(flaggedAxes.sort()).toEqual(['markets_governance', 'stability_change'].sort())
  })
})

describe('computeDisagreementDiff — first-time classification (empty old placement)', () => {
  it('returns flagged=false when old placement is empty — nothing to disagree with', () => {
    const newPlacement = { stability_change: { score: 80, confidence: 0.8, rationale: 'test', sources: [] } }
    const result = computeDisagreementDiff({}, newPlacement)
    expect(result.flagged).toBe(false)
    expect(result.diff).toEqual({})
  })

  it('returns flagged=false even if new scores would normally exceed threshold', () => {
    const newPlacement = {
      stability_change: { score: 0, confidence: 0.8, rationale: 'test', sources: [] },
      markets_governance: { score: 100, confidence: 0.8, rationale: 'test', sources: [] },
    }
    const result = computeDisagreementDiff({}, newPlacement)
    expect(result.flagged).toBe(false)
  })
})

describe('computeDisagreementDiff — missing axes in non-empty old placement', () => {
  it('treats a missing axis in new placement as score 50', () => {
    const result = computeDisagreementDiff(
      { stability_change: { score: 10, confidence: 0.8, rationale: 'test', sources: [] } },
      {}
    )
    // delta = |10 - 50| = 40 → flagged
    expect(result.diff['stability_change'].newScore).toBe(50)
    expect(result.diff['stability_change'].delta).toBe(40)
    expect(result.diff['stability_change'].flagged).toBe(true)
  })
})
