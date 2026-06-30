'use client'

import { useState, useTransition } from 'react'
import { verifyEntry } from '@/app/admin/actions'

interface Props {
  type: 'candidate' | 'source'
  id: string
  lastCheck?: { checkedAt: string; summary: string } | null
}

export default function VerifyButton({ type, id, lastCheck }: Props) {
  const [result, setResult] = useState<{ summary: string; checkedAt: string } | null>(lastCheck ?? null)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function run() {
    setError(null)
    startTransition(async () => {
      const res = await verifyEntry(type, id)
      if (res.ok) {
        setResult({ summary: res.summary, checkedAt: res.checkedAt })
        setExpanded(true)
      } else {
        setError(res.error)
      }
    })
  }

  // Staleness indicator
  const daysSince = result?.checkedAt
    ? Math.floor((Date.now() - new Date(result.checkedAt).getTime()) / 86400000)
    : null

  const stalenessColor = daysSince == null ? 'var(--color-text-secondary)'
    : daysSince >= 180 ? '#ef4444'
    : daysSince >= 90 ? '#f59e0b'
    : '#22c55e'

  return (
    <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 8, background: 'rgba(96,165,250,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: result ? 'var(--space-3)' : 0 }}>
        <div>
          <p style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: '#60a5fa', marginBottom: 2 }}>
            Perplexity Verification
          </p>
          {result && (
            <p style={{ fontSize: 11, color: stalenessColor }}>
              Last checked: {result.checkedAt}
              {daysSince != null && ` (${daysSince}d ago)`}
              {daysSince != null && daysSince >= 180 && ' — STALE'}
              {daysSince != null && daysSince >= 90 && daysSince < 180 && ' — review soon'}
            </p>
          )}
        </div>
        <button
          disabled={isPending}
          onClick={run}
          style={{
            padding: '6px 14px', borderRadius: 5, fontSize: 'var(--text-small)',
            fontWeight: 'var(--weight-semibold)', cursor: isPending ? 'not-allowed' : 'pointer',
            border: 'none', opacity: isPending ? 0.6 : 1,
            background: 'rgba(96,165,250,0.2)', color: '#60a5fa',
          }}
        >
          {isPending ? 'Checking…' : result ? 'Re-verify' : 'Verify current status'}
        </button>
      </div>

      {error && (
        <p style={{ fontSize: 'var(--text-small)', color: '#ef4444', marginTop: 'var(--space-2)' }}>{error}</p>
      )}

      {result && (
        <div>
          <p
            onClick={() => setExpanded(!expanded)}
            style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', cursor: 'pointer', userSelect: 'none' }}
          >
            {expanded ? '▾ Hide' : '▸ Show'} verification summary
          </p>
          {expanded && (
            <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
              <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {result.summary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
