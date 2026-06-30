'use client'

import { useState, useTransition } from 'react'
import { seedCatalogSources } from './actions'

export default function SeedCatalogButton() {
  const [result, setResult] = useState<{ seeded: number; skipped: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSeed() {
    setResult(null)
    setError(null)
    startTransition(async () => {
      try {
        const r = await seedCatalogSources()
        setResult(r)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
      <button
        onClick={handleSeed}
        disabled={isPending}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text-secondary)',
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          padding: '6px 14px',
          cursor: isPending ? 'wait' : 'pointer',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? 'Seeding…' : 'Seed catalog sources (run once)'}
      </button>
      {result && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: '#22c55e', margin: 0 }}>
          {result.seeded} sources seeded ({result.skipped} already existed)
        </p>
      )}
      {error && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)', margin: 0 }}>
          Error: {error}
        </p>
      )}
    </div>
  )
}
