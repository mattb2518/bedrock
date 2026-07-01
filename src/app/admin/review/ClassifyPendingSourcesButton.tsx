'use client'

import { useState } from 'react'

export default function ClassifyPendingSourcesButton({ count }: { count: number }) {
  const [results, setResults] = useState<Array<{ id: string; ok: boolean; error?: string }> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const cap = Math.min(count, 20)

  async function run() {
    setIsPending(true)
    setResults(null)
    setError(null)
    try {
      const res = await fetch('/api/admin/classify-sources', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Server error ${res.status}`)
      }
      const r = await res.json() as Array<{ id: string; ok: boolean; error?: string }>
      setResults(r)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Classification failed — check server logs.')
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
        {isPending
          ? `Classifying up to ${cap}…`
          : `Classify all with Claude (up to ${cap})`}
      </button>

      {error && (
        <p style={{ marginTop: 'var(--space-3)', fontSize: 11, color: '#ef4444' }}>
          Error: {error}
        </p>
      )}

      {results && (
        <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Results: {results.filter((r) => r.ok).length}/{results.length} succeeded
          </p>
          {results.map((r) => (
            <div key={r.id} style={{ display: 'flex', gap: 8, fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: r.ok ? '#22c55e' : '#ef4444' }}>{r.ok ? '✓' : '✗'}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{r.id}{r.error ? ` — ${r.error}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
