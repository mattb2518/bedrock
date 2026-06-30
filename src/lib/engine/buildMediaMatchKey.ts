/**
 * Builds a MediaMatchKey from a QuizResult.
 *
 * Structural note: MediaMatchKey has NO dealbreakers field — this is the
 * architectural wall from §19.8. This function cannot forward dealbreakers
 * even if they exist on the session, because MediaMatchKey's type has no
 * slot for them. The wall is enforced at the type level, not by a runtime check.
 *
 * Called by the /media-diet page; do NOT substitute buildMatchKey here.
 */

import type { MediaMatchKey } from './mediaMatch'
import type { Dimension } from './match'
import { ALL_DIMENSIONS } from './match'
import type { QuizResult } from '@/types/quiz'

export function buildMediaMatchKey(result: QuizResult): MediaMatchKey {
  const dimensionScores = Object.fromEntries(
    ALL_DIMENSIONS.map((d) => [d, (result.profile as unknown as Record<string, number>)[d] ?? 50])
  ) as Record<Dimension, number>

  return {
    dimensionScores,
    topDimensions: result.topDimensions as Dimension[],
    primaryType: result.primaryType,
    secondaryTypes: [],
    edgeCaseFlag: null,
    completenessPct: result.completionPercent,
    // Dealbreakers are deliberately absent — MediaMatchKey has no dealbreakers field.
    // §26.3 FAQ: "Dealbreakers are ballot exclusion rules. Importing them into your
    // media diet would create an echo chamber — the exact failure mode this pillar
    // exists to fight."
  }
}
