'use client'

import { useState, useTransition } from 'react'
import { triggerWeeklyDigest } from './actions'

export default function DigestButton() {
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function send() {
    setResult(null)
    startTransition(async () => {
      try {
        const res = await triggerWeeklyDigest()
        setResult({ ok: res.ok, msg: res.ok ? `Sent to ${res.sentTo}` : (res.error ?? 'Send failed') })
      } catch (e) {
        setResult({ ok: false, msg: e instanceof Error ? e.message : 'Send failed' })
      }
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      {result && (
        <p style={{ fontSize: 'var(--text-small)', color: result.ok ? '#22c55e' : '#ef4444' }}>{result.msg}</p>
      )}
      <button
        disabled={isPending}
        onClick={send}
        style={{ padding: '6px 14px', borderRadius: 6, fontSize: 'var(--text-small)', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', border: 'none', opacity: isPending ? 0.6 : 1, background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}
      >
        {isPending ? 'Sending…' : 'Send digest now'}
      </button>
    </div>
  )
}
