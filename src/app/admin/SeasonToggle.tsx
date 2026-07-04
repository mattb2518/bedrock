'use client'

// §22c admin card: Pillar 1 season toggle.
// Flip pillar_one_mode between 'ballot' and 'officials'.
// Requires admin role (enforced by /admin layout). Shows last-flipped audit info.

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function flip() {
    const newMode: Mode = mode === 'officials' ? 'ballot' : 'officials'
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { error: err } = await supabase
        .from('site_config')
        .upsert({
          key: 'pillar_one_mode',
          value: newMode,
          updated_at: new Date().toISOString(),
          updated_by: user?.email ?? 'admin',
        }, { onConflict: 'key' })
      if (err) {
        setError('Failed to update: ' + err.message)
        return
      }
      setMode(newMode)
    })
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
          disabled={isPending}
          style={{
            backgroundColor: mode === 'officials' ? 'var(--color-red)' : 'var(--color-blue-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            fontWeight: 'var(--weight-semibold)',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? 'Updating…' : flipLabel}
        </button>
      </div>
    </div>
  )
}
