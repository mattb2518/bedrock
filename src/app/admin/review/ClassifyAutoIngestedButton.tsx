'use client'

import { useState, useTransition } from 'react'
import { classifyAutoIngested } from '@/app/admin/actions'

export default function ClassifyAutoIngestedButton({ count }: { count: number }) {
  const [results, setResults] = useState<Array<{ id: string; ok: boolean; error?: string }> | null>(null)
  const [isPending, startTransition] = useTransition()

  function run() {
    startTransition(async () => {
      const r = await classifyAutoIngested()
      setResults(r)
    })
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
        {isPending ? 'Classifying…' : `Classify auto-ingested (up to ${Math.min(count, 20)})`}
      </button>

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
