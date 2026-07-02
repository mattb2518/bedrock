'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { usePreviewStore } from '@/store/previewStore'

const ALLOWLIST = [
  '/results',
  '/your-mantle',
  '/media-diet',
  '/conversations',
  '/your-ballot',
  '/beyond-your-ballot',
]

const STORAGE_KEY = 'bedrock_account_banner_dismissed'

export default function AccountBanner() {
  const pathname = usePathname()
  const session = useQuizStore((s) => s.session)
  const { mode } = usePreviewStore()
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid SSR flash

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(STORAGE_KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [])

  function dismiss() {
    try { sessionStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    setDismissed(true)
  }

  const hasProfile = Boolean(session?.result)
  const isSignedIn = Boolean(session?.userId)
  const onAllowlistedPath = ALLOWLIST.includes(pathname)
  const isPreview = mode !== 'myself'

  if (!hasProfile || isSignedIn || dismissed || !onAllowlistedPath || isPreview) return null

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: 'var(--space-3) var(--space-6)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      flexWrap: 'wrap',
    }}>
      <p style={{ flex: 1, margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
        Your results are temporary.{' '}
        <a href="/signup" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none', fontWeight: 'var(--weight-semibold)' }}>
          Create a free account
        </a>{' '}
        to save them.
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  )
}
