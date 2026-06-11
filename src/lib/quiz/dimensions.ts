// Single source of truth for the eight civic dimensions.
//
// Two different parts of the app talk about these axes in OPPOSITE directions,
// and that mismatch is a silent-bug magnet — so we encode the polarity exactly
// once, here, and derive everything else from it.
//
//   - DimensionalProfile (scoring):   0 = pole A, 100 = pole B
//   - Constellation radar (visual):   outer/high end = each axis's `radarHighPole`
//
// The radar was authored with 7 of 8 axes pointing OUTWARD to pole A; only
// local_federal points outward to pole B (Federal). `profileToRadar` is the one
// converter that bridges the two so they can never drift apart again.

import type { Dimension, DimensionalProfile } from '@/types/quiz'

export interface DimensionMeta {
  key: Dimension
  poleA: string // label at profile value 0
  poleB: string // label at profile value 100
  // Which pole sits at the OUTER (high) end of the constellation radar.
  radarHighPole: 'A' | 'B'
}

// Order matters: this is the radar axis order (top, then clockwise) and matches
// the hand-authored fingerprints in MantleConstellation:
// Stability, Federal, National, Rules, Markets, Pragmatism, Individual, Trust.
export const DIMENSIONS: DimensionMeta[] = [
  { key: 'stability_change',      poleA: 'Stability',  poleB: 'Change',     radarHighPole: 'A' },
  { key: 'local_federal',         poleA: 'Local',      poleB: 'Federal',    radarHighPole: 'B' },
  { key: 'national_global',       poleA: 'National',   poleB: 'Global',     radarHighPole: 'A' },
  { key: 'rules_outcomes',        poleA: 'Rules',      poleB: 'Outcomes',   radarHighPole: 'A' },
  { key: 'markets_governance',    poleA: 'Markets',    poleB: 'Governance', radarHighPole: 'A' },
  { key: 'pragmatism_idealism',   poleA: 'Pragmatism', poleB: 'Idealism',   radarHighPole: 'A' },
  { key: 'individual_collective', poleA: 'Individual', poleB: 'Collective', radarHighPole: 'A' },
  { key: 'trust_skepticism',      poleA: 'Trust',      poleB: 'Skepticism', radarHighPole: 'A' },
]

// The radar axis order as plain dimension keys.
export const RADAR_ORDER: Dimension[] = DIMENSIONS.map((d) => d.key)

// Convert a 0–100 dimensional profile into the 0–1 radar scores the
// Constellation component expects (outer end = each axis's radarHighPole).
export function profileToRadar(profile: DimensionalProfile): number[] {
  return DIMENSIONS.map((d) => {
    const v = profile[d.key] / 100 // 0 = pole A, 1 = pole B
    return d.radarHighPole === 'B' ? v : 1 - v
  })
}

// The pole label a given profile value leans toward, for prose/UI.
export function poleLabel(key: Dimension, value: number): string {
  const dim = DIMENSIONS.find((d) => d.key === key)!
  return value >= 50 ? dim.poleB : dim.poleA
}
