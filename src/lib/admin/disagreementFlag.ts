// Disagreement detection — §21.5
// Pure functions only; no DB access. Called by the re-classify server action.

export interface AxisDelta {
  oldScore: number
  newScore: number
  delta: number        // absolute difference
  flagged: boolean     // delta > DISAGREEMENT_THRESHOLD
}

export interface DisagreementResult {
  flagged: boolean     // true if ANY axis exceeds the threshold
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  diff: Record<string, AxisDelta>
}

export const DISAGREEMENT_THRESHOLD = 20

export function computeDisagreementDiff(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldPlacement: Record<string, { score: number; [key: string]: any }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newPlacement: Record<string, { score: number; [key: string]: any }>
): DisagreementResult {
  const diff: Record<string, AxisDelta> = {}
  let anyFlagged = false

  // Check all axes present in either placement
  const axes = new Set([...Object.keys(oldPlacement), ...Object.keys(newPlacement)])

  for (const axis of axes) {
    const oldScore = oldPlacement[axis]?.score ?? 50   // treat missing as neutral
    const newScore = newPlacement[axis]?.score ?? 50
    const delta = Math.abs(oldScore - newScore)
    const flagged = delta > DISAGREEMENT_THRESHOLD

    diff[axis] = { oldScore, newScore, delta, flagged }
    if (flagged) anyFlagged = true
  }

  return { flagged: anyFlagged, diff }
}
