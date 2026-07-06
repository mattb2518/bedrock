'use client'

// §22c admin card: Pillar 1 season toggle.
// Flip pillar_one_mode between 'ballot' and 'officials'.
// Requires admin role (enforced by /admin layout). Shows last-flipped audit info.

import { useState } from 'react'
import { flipPillarOneMode } from './actions'

type Mode = 'ballot' | 'officials'

export default function SeasonToggle({
  currentMode,
  lastFlipped,
  lastFlippedBy,
}: {
  currentMode: Mode
  lastFlipped: string | null
  lastFlippedBy: string | null
}) {
  const [mode, setMode] = useState<Mode>(currentMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function flip() {
    const newMode: Mode = mode === 'officials' ? 'ballot' : 'officials'
    setError(null)
    setLoading(true)
    try {
      const result = await flipPillarOneMode(newMode)
      if (!result.ok) {
        setError('Failed to update: ' + result.error)
        return
      }
      setMode(newMode)
    } catch (e) {
      setError('Failed to update: ' + (e instanceof Error ? e.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const label = mode === 'officials' ? 'Your Officials (off season)' : 'Your Ballot (in season)'
  const flipLabel = mode === 'officials' ? 'Switch to ballot mode' : 'Switch to officials mode'

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 8,
      padding: 'var(--space-5)',
      background: 'rgba(255,255,255,0.02)',
      marginBottom: 'var(--space-8)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Pillar 1 season
          </p>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', fontWeight: 'var(--weight-semibold)' }}>
            {label}
          </p>
          {lastFlipped && (
            <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Last changed {new Date(lastFlipped).toLocaleString()}{lastFlippedBy ? ` by ${lastFlippedBy}` : ''}
            </p>
          )}
          {error && (
            <p style={{ fontSize: 'var(--text-small)', color: '#f87171', marginTop: 4 }}>{error}</p>
          )}
        </div>
        <button
          onClick={flip}
          disabled={loading}
          style={{
            backgroundColor: mode === 'officials' ? 'var(--color-red)' : 'var(--color-blue-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            fontWeight: 'var(--weight-semibold)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Updating…' : flipLabel}
        </button>
      </div>
    </div>
  )
}
