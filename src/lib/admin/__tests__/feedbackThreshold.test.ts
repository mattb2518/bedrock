import { describe, it, expect } from 'vitest'
import { computeFeedbackSummary, exceedsThumbsDownThreshold, THUMBS_DOWN_FLAG_THRESHOLD, THUMBS_DOWN_MIN_COUNT } from '../feedbackThreshold'

// ── Constants ─────────────────────────────────────────────────────────────────

describe('threshold constants', () => {
  it('flag threshold is 30%', () => {
    expect(THUMBS_DOWN_FLAG_THRESHOLD).toBe(0.30)
  })

  it('minimum count is 5', () => {
    expect(THUMBS_DOWN_MIN_COUNT).toBe(5)
  })
})

// ── computeFeedbackSummary ────────────────────────────────────────────────────

describe('computeFeedbackSummary', () => {
  it('computes thumbsDownRate correctly', () => {
    const s = computeFeedbackSummary('x', 10, 4)
    expect(s.thumbsDownRate).toBeCloseTo(0.4)
    expect(s.thumbsUp).toBe(6)
    expect(s.thumbsDown).toBe(4)
    expect(s.total).toBe(10)
  })

  it('returns 0 rate when total is 0', () => {
    const s = computeFeedbackSummary('x', 0, 0)
    expect(s.thumbsDownRate).toBe(0)
    expect(s.autoFlagged).toBe(false)
  })

  it('auto-flags when rate > 30% and total >= 5', () => {
    const s = computeFeedbackSummary('x', 10, 4)   // 40% > 30%
    expect(s.autoFlagged).toBe(true)
  })

  it('does NOT flag at exactly 30% (must be strictly greater)', () => {
    const s = computeFeedbackSummary('x', 10, 3)   // exactly 30%
    expect(s.thumbsDownRate).toBeCloseTo(0.30)
    expect(s.autoFlagged).toBe(false)
  })

  it('does NOT flag when total is below the minimum count', () => {
    const s = computeFeedbackSummary('x', 4, 4)   // 100% but only 4 responses
    expect(s.autoFlagged).toBe(false)
  })

  it('does NOT flag when exactly at minimum count but rate <= 30%', () => {
    const s = computeFeedbackSummary('x', 5, 1)   // 20% — below threshold
    expect(s.autoFlagged).toBe(false)
  })

  it('flags at exactly minimum count when rate > 30%', () => {
    const s = computeFeedbackSummary('x', 5, 3)   // 60% and exactly 5 responses
    expect(s.autoFlagged).toBe(true)
  })
})

// ── exceedsThumbsDownThreshold ────────────────────────────────────────────────

describe('exceedsThumbsDownThreshold', () => {
  it('returns true for clear over-threshold cases', () => {
    expect(exceedsThumbsDownThreshold(20, 10)).toBe(true)   // 50%
    expect(exceedsThumbsDownThreshold(100, 40)).toBe(true)  // 40%
    expect(exceedsThumbsDownThreshold(7, 5)).toBe(true)     // ~71%
  })

  it('returns false for under-threshold cases', () => {
    expect(exceedsThumbsDownThreshold(20, 5)).toBe(false)   // 25%
    expect(exceedsThumbsDownThreshold(10, 3)).toBe(false)   // 30% exactly
    expect(exceedsThumbsDownThreshold(100, 29)).toBe(false) // 29%
  })

  it('returns false for small samples regardless of rate', () => {
    expect(exceedsThumbsDownThreshold(4, 4)).toBe(false)    // 100% but n=4
    expect(exceedsThumbsDownThreshold(1, 1)).toBe(false)    // 100% but n=1
    expect(exceedsThumbsDownThreshold(0, 0)).toBe(false)
  })

  it('boundary: 31 thumbs-down out of 100 triggers flag', () => {
    expect(exceedsThumbsDownThreshold(100, 31)).toBe(true)
  })

  it('boundary: 30 thumbs-down out of 100 does NOT trigger flag', () => {
    expect(exceedsThumbsDownThreshold(100, 30)).toBe(false)
  })
})
