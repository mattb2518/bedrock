// Feedback auto-flag threshold — §21.8
// Pure functions only; no DB access.

export const THUMBS_DOWN_FLAG_THRESHOLD = 0.30   // 30%
export const THUMBS_DOWN_MIN_COUNT = 5            // don't flag on tiny sample sizes

export interface FeedbackSummary {
  entityId: string
  total: number
  thumbsDown: number
  thumbsUp: number
  thumbsDownRate: number
  autoFlagged: boolean
}

export function computeFeedbackSummary(
  entityId: string,
  total: number,
  thumbsDown: number
): FeedbackSummary {
  const thumbsUp = total - thumbsDown
  const thumbsDownRate = total > 0 ? thumbsDown / total : 0
  const autoFlagged = total >= THUMBS_DOWN_MIN_COUNT && thumbsDownRate > THUMBS_DOWN_FLAG_THRESHOLD

  return { entityId, total, thumbsDown, thumbsUp, thumbsDownRate, autoFlagged }
}

export function exceedsThumbsDownThreshold(total: number, thumbsDown: number): boolean {
  return computeFeedbackSummary('', total, thumbsDown).autoFlagged
}
