// The ten Civic Mantle types and their canonical dimensional profiles.
//
// Each profile is a DimensionalProfile (0 = pole A, 100 = pole B on every axis).
// These values are the SOURCE OF TRUTH for each type; the homepage constellation
// "fingerprints" reproduce exactly from them via profileToRadar() in dimensions.ts
// (so the two never drift). Display copy (essence/description) is a TODO to pull
// from SPEC — names are final.

import type { CivicType, DimensionalProfile } from '@/types/quiz'
import { DIMENSIONS } from '@/lib/quiz/dimensions'

export interface Mantle {
  type: CivicType
  name: string
  workingName: string // SPEC Civic Mantle Directory
  oneLiner: string
  profile: DimensionalProfile
}

export const MANTLES: Mantle[] = [
  { type: 'honest_broker',   name: 'The Honest Broker',    workingName: 'Pragmatic Constitutionalist', oneLiner: 'The rules are the freedom',                              profile: { stability_change: 15, local_federal: 85, national_global: 50, rules_outcomes: 15, markets_governance: 15, pragmatism_idealism: 50, individual_collective: 50, trust_skepticism: 15 } },
  { type: 'system_fixer',    name: 'The System Fixer',     workingName: 'Independent Architect',        oneLiner: 'Not left or right — building better machinery',           profile: { stability_change: 82, local_federal: 50, national_global: 50, rules_outcomes: 82, markets_governance: 50, pragmatism_idealism: 15, individual_collective: 50, trust_skepticism: 82 } },
  { type: 'long_gamer',      name: 'The Long Gamer',       workingName: 'Principled Globalist',         oneLiner: 'Thinks in decades and across borders',                    profile: { stability_change: 50, local_federal: 85, national_global: 82, rules_outcomes: 50, markets_governance: 50, pragmatism_idealism: 82, individual_collective: 82, trust_skepticism: 50 } },
  { type: 'good_neighbor',   name: 'The Good Neighbor',    workingName: 'Rooted Pragmatist',            oneLiner: 'Believes the best solutions start closest to home',        profile: { stability_change: 15, local_federal: 18, national_global: 50, rules_outcomes: 50, markets_governance: 50, pragmatism_idealism: 15, individual_collective: 82, trust_skepticism: 50 } },
  { type: 'missourian',      name: 'The Missourian',       workingName: 'Constructive Skeptic',         oneLiner: "You'll believe it when you see it — and you're usually right", profile: { stability_change: 50, local_federal: 50, national_global: 50, rules_outcomes: 82, markets_governance: 50, pragmatism_idealism: 15, individual_collective: 15, trust_skepticism: 82 } },
  { type: 'eternal_optimist',name: 'The Eternal Optimist', workingName: 'Civic Optimist',               oneLiner: "Democracy is messy and you're here for all of it",         profile: { stability_change: 82, local_federal: 50, national_global: 50, rules_outcomes: 50, markets_governance: 50, pragmatism_idealism: 82, individual_collective: 82, trust_skepticism: 15 } },
  { type: 'steward',         name: 'The Steward',          workingName: 'Steady Steward',               oneLiner: "Knows what's worth conserving — and what isn't",           profile: { stability_change: 15, local_federal: 18, national_global: 50, rules_outcomes: 15, markets_governance: 50, pragmatism_idealism: 50, individual_collective: 50, trust_skepticism: 15 } },
  { type: 'free_agent',      name: 'The Free Agent',       workingName: 'Sovereign Independent',        oneLiner: 'Never fit a box and stopped trying',                      profile: { stability_change: 50, local_federal: 18, national_global: 50, rules_outcomes: 50, markets_governance: 15, pragmatism_idealism: 50, individual_collective: 15, trust_skepticism: 82 } },
  { type: 'standard_bearer', name: 'The Standard Bearer',  workingName: 'Principled Institutionalist',  oneLiner: 'The institutions are imperfect — and worth defending',     profile: { stability_change: 50, local_federal: 85, national_global: 82, rules_outcomes: 15, markets_governance: 50, pragmatism_idealism: 82, individual_collective: 50, trust_skepticism: 15 } },
  { type: 'pioneer',         name: 'The Pioneer',          workingName: 'Growth-First Independent',     oneLiner: 'Progress is possible, and you know how to build it',       profile: { stability_change: 82, local_federal: 50, national_global: 15, rules_outcomes: 50, markets_governance: 15, pragmatism_idealism: 15, individual_collective: 50, trust_skepticism: 50 } },
]

export function mantleFor(type: CivicType): Mantle {
  return MANTLES.find((m) => m.type === type)!
}

// Provisional scoring: classify a profile to its nearest Mantle by Euclidean
// distance across the eight axes. Returns the best match plus ranked runners-up
// (the next 3) to seed "secondary types." This is a Phase-A stand-in — the real
// typing method from SPEC replaces it later.
export function classifyProfile(profile: DimensionalProfile): {
  primary: CivicType
  secondary: CivicType[]
} {
  const ranked = MANTLES.map((m) => {
    const dist = Math.sqrt(
      DIMENSIONS.reduce((sum, d) => {
        const diff = profile[d.key] - m.profile[d.key]
        return sum + diff * diff
      }, 0)
    )
    return { type: m.type, dist }
  }).sort((a, b) => a.dist - b.dist)

  return {
    primary: ranked[0].type,
    secondary: ranked.slice(1, 4).map((r) => r.type),
  }
}
