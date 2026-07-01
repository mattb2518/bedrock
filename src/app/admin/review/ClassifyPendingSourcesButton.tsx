'use client'

import { useState } from 'react'

export default function ClassifyPendingSourcesButton({ count }: { count: number }) {
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const cap = Math.min(count, 20)

  async function run() {
    setIsPending(true)
    setStarted(false)
    setError(null)
    try {
      const res = await fetch('/api/admin/trigger-classify-sources', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Server error ${res.status}`)
      }
      setStarted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start classification job.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div>
      <button
        onClick={run}
        disabled={isPending}
        style={{
          padding: '6px 14px',
          borderRadius: 5,
          fontSize: 'var(--text-small)',
          fontWeight: 'var(--weight-semibold)',
          cursor: isPending ? 'not-allowed' : 'pointer',
          border: 'none',
          background: isPending ? 'rgba(96,165,250,0.2)' : '#60a5fa',
          color: '#000',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? 'Starting job…' : `Classify all with Claude (up to ${cap})`}
      </button>

      {error && (
        <p style={{ marginTop: 'var(--space-3)', fontSize: 11, color: '#ef4444' }}>
          Error: {error}
        </p>
      )}

      {started && (
        <p style={{ marginTop: 'var(--space-3)', fontSize: 11, color: '#22c55e' }}>
          Job started — refresh in a few minutes to see results.
        </p>
      )}
    </div>
  )
}
