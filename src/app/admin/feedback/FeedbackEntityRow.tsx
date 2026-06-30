'use client'

import { useState, useTransition } from 'react'
import type { FeedbackSummary } from '@/lib/admin/feedbackThreshold'
import { analyzeFeedbackAction } from './actions'
import type { FeedbackAnalysisResult } from '@/lib/admin/feedbackAnalysis'
import { reclassifyEntry } from '@/app/admin/actions'

interface Props {
  summary: FeedbackSummary & {
    type: 'candidate' | 'source'
    freeText: string[]
    chips: string[]
    mantles: string[]
  }
  type: 'candidate' | 'source'
}

export default function FeedbackEntityRow({ summary, type }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [analysis, setAnalysis] = useState<FeedbackAnalysisResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [reclassifyMsg, setReclassifyMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Count chip frequency
  const chipFreq: Record<string, number> = {}
  for (const chip of summary.chips) {
    chipFreq[chip] = (chipFreq[chip] ?? 0) + 1
  }

  function runAnalyze() {
    setAnalyzeError(null)
    startTransition(async () => {
      try {
        const result = await analyzeFeedbackAction(type, summary.entityId, summary.freeText, summary.chips)
        setAnalysis(result)
      } catch (e) {
        setAnalyzeError(e instanceof Error ? e.message : 'Analysis failed.')
      }
    })
  }

  function runReclassify() {
    setReclassifyMsg(null)
    startTransition(async () => {
      try {
        await reclassifyEntry(type, summary.entityId)
        setReclassifyMsg('Re-classification queued. Check the review queue.')
      } catch (e) {
        setReclassifyMsg(e instanceof Error ? e.message : 'Failed.')
      }
    })
  }

  const rateColor = summary.thumbsDownRate > 0.3 ? '#ef4444' : summary.thumbsDownRate > 0.15 ? '#f59e0b' : '#22c55e'

  return (
    <div style={{ marginBottom: 'var(--space-3)', border: `1px solid ${summary.autoFlagged ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, background: summary.autoFlagged ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)' }}>
      {/* Summary row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', cursor: 'pointer' }}
      >
        <div>
          <p style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 2 }}>
            {summary.entityId}
            {summary.autoFlagged && (
              <span style={{ marginLeft: 8, padding: '2px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 10, fontWeight: 600 }}>AUTO-FLAGGED</span>
            )}
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            {summary.total} feedback · {summary.thumbsUp} 👍 · {summary.thumbsDown} 👎
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: rateColor }}>
            {(summary.thumbsDownRate * 100).toFixed(0)}%
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>thumbs-down</p>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: 'var(--space-4)' }}>
          {/* Chip frequency */}
          {Object.keys(chipFreq).length > 0 && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
                Chips selected
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {Object.entries(chipFreq).sort(([, a], [, b]) => b - a).map(([chip, count]) => (
                  <span key={chip} style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    {chip} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Free text */}
          {summary.freeText.length > 0 && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
                Free-text responses ({summary.freeText.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {summary.freeText.slice(0, 10).map((text, i) => (
                  <p key={i} style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', padding: 'var(--space-2) var(--space-3)', background: 'rgba(0,0,0,0.2)', borderRadius: 4, fontStyle: 'italic' }}>
                    "{text}"
                  </p>
                ))}
                {summary.freeText.length > 10 && (
                  <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>…and {summary.freeText.length - 10} more</p>
                )}
              </div>
            </div>
          )}

          {/* Analyze button */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
            <button
              disabled={isPending}
              onClick={runAnalyze}
              style={{ padding: '6px 14px', borderRadius: 5, fontSize: 'var(--text-small)', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', border: 'none', opacity: isPending ? 0.6 : 1, background: 'rgba(234,179,8,0.15)', color: '#eab308' }}
            >
              {isPending ? 'Analyzing…' : 'Analyze this'}
            </button>
            {(analysis?.recommendedAction === 'reclassify' || summary.autoFlagged) && (
              <button
                disabled={isPending}
                onClick={runReclassify}
                style={{ padding: '6px 14px', borderRadius: 5, fontSize: 'var(--text-small)', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', border: 'none', opacity: isPending ? 0.6 : 1, background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}
              >
                Re-classify
              </button>
            )}
          </div>

          {analyzeError && <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-small)', color: '#ef4444' }}>{analyzeError}</p>}
          {reclassifyMsg && <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-small)', color: '#60a5fa' }}>{reclassifyMsg}</p>}

          {/* Analysis result */}
          {analysis && (
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 8 }}>
              <p style={{ fontSize: 11, color: '#eab308', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>Claude Analysis</p>
              <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
                {analysis.patternSummary}
              </p>
              {analysis.likelyWrongAxes.length > 0 && (
                <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                  Likely miscalibrated axes: <strong style={{ color: 'var(--color-text-primary)' }}>{analysis.likelyWrongAxes.join(', ')}</strong>
                </p>
              )}
              <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: analysis.draftUpdatedRationale ? 'var(--space-3)' : 0 }}>
                Recommendation: <strong style={{ color: analysis.recommendedAction === 'reclassify' ? '#ef4444' : analysis.recommendedAction === 'lower_confidence' ? '#f59e0b' : '#22c55e' }}>{analysis.recommendedAction.replace(/_/g, ' ')}</strong>
                {' '}— {analysis.recommendedActionReason}
              </p>
              {analysis.draftUpdatedRationale && (
                <div style={{ padding: 'var(--space-3)', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                  <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Draft updated rationale</p>
                  <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', fontStyle: 'italic', lineHeight: 1.6 }}>{analysis.draftUpdatedRationale}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
