/**
 * Shared union type for ballot candidate kinds.
 * Both FederalCandidate and StateLegCandidate extend CandidateRecord via Omit,
 * but their axisPlacement overrides make them incompatible for direct cross-cast.
 * Pages that render both use BallotCandidate + type guards instead of `as unknown as`.
 */

import type { FederalCandidate } from './federalCandidates'
import type { StateLegCandidate } from './stateLegCandidates'

export type BallotCandidate = FederalCandidate | StateLegCandidate

export function isFederalCandidate(c: BallotCandidate): c is FederalCandidate {
  return 'fecId' in c
}

export function isStateLegCandidate(c: BallotCandidate): c is StateLegCandidate {
  return 'openStatesId' in c
}
