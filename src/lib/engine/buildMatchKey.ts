// Builds a MatchKey from a stored QuizResult + QuizSession.
// Used by Beyond Your Ballot (Stage 5) and Your Ballot (Stage 7-8).

import type { MatchKey, AxisWeights, AxisConfidence } from './match'
import { ALL_DIMENSIONS } from './match'
import type { QuizResult, QuizSession } from '@/types/quiz'

export function buildMatchKey(result: QuizResult, session: QuizSession): MatchKey {
  // Priority axes: the up-to-3 dimensions the user flagged as most important.
  // These get a 1.5× weight; all others stay at 1.0.
  const prioritySet = new Set(result.topDimensions)

  const axisWeights: AxisWeights = Object.fromEntries(
    ALL_DIMENSIONS.map((d) => [d, prioritySet.has(d) ? 1.5 : 1.0])
  ) as AxisWeights

  // Axis confidence defaults to 0.8 for all dimensions.
  // Per-axis user confidence (near-50 answers → lower) is not persisted in QuizResult v1;
  // this is a known simplification. Tracked in DECISIONS.md as a future refinement.
  const axisConfidence: AxisConfidence = Object.fromEntries(
    ALL_DIMENSIONS.map((d) => [d, 0.8])
  ) as AxisConfidence

  // Layer 2 issue positions from the session's answer list
  const issuePositions = session.answers
    .filter((a) => a.questionId.startsWith('L2-'))
    .map((a) => ({ questionId: a.questionId, selectedOptionId: a.optionId }))

  // Dealbreakers from session
  const dealbreakers = (session.dealbreakers ?? []).map((itemId) => ({ itemId }))

  return {
    profile: result.profile,
    axisWeights,
    axisConfidence,
    issuePositions: issuePositions.length > 0 ? issuePositions : undefined,
    dealbreakers: dealbreakers.length > 0 ? dealbreakers : undefined,
    completenessPercent: result.completionPercent,
  }
}
