'use client'

import { useState } from 'react'
import { triggerWeeklyDigest } from './actions'

export default function SendDigestButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; sentTo?: string; error?: string } | null>(null)

  async function handleSend() {
    setLoading(true)
    setResult(null)
    try {
      const r = await triggerWeeklyDigest()
      setResult(r)
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
      <button
        onClick={handleSend}
        disabled={loading}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text-secondary)',
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          padding: '6px 14px',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Sending…' : 'Send digest now'}
      </button>
      {result?.ok && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: '#22c55e', margin: 0 }}>
          Sent to {result.sentTo}
        </p>
      )}
      {result && !result.ok && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)', margin: 0 }}>
          Error: {result.error}
        </p>
      )}
    </div>
  )
}
