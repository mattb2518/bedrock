'use client'

// Locked pillar state — SPEC §2 Unlock Ladder.
// Shown when a user hasn't completed the required layer to access a pillar.
// Renders a one-paragraph description, which layer unlocks it, and a "Resume the quiz" CTA.

import Link from 'next/link'

interface Props {
  pillarName: string
  description: string
  unlocksAfterLayer: number
  /** If provided, used to deep-link to the user's current quiz position. */
  resumeHref?: string
  accentColor?: string
}

export default function LockedPillarGate({
  pillarName,
  description,
  unlocksAfterLayer,
  resumeHref = '/quiz',
  accentColor = 'var(--color-blue-accent)',
}: Props) {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
      {/* Lock badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 56, height: 56, borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
        fontSize: 24, marginBottom: 'var(--space-6)',
      }}>
        🔒
      </div>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)',
        fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)',
        letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
        marginBottom: 'var(--space-4)',
      }}>
        {pillarName}
      </p>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2)',
        color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-5)',
      }}>
        Unlocks after Layer {unlocksAfterLayer}
      </h1>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)',
        color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)',
        marginBottom: 'var(--space-8)', maxWidth: 500, margin: '0 auto var(--space-8)',
      }}>
        {description}
      </p>

      <Link
        href={resumeHref}
        style={{
          display: 'inline-block',
          backgroundColor: accentColor,
          color: '#fff',
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-body)',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--btn-radius)',
          textDecoration: 'none',
        }}
      >
        Resume the quiz →
      </Link>
    </main>
  )
}
