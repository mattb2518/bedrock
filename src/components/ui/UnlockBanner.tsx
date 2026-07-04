'use client'

import Link from 'next/link'

export default function UnlockBanner({
  pillarName,
  resumeHref = '/quiz',
}: {
  pillarName: string
  resumeHref?: string
}) {
  return (
    <div style={{
      backgroundColor: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderLeft: '3px solid var(--color-blue-accent)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--space-3) var(--space-4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      flexWrap: 'wrap',
      marginBottom: 'var(--space-6)',
    }}>
      <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>Values matching is locked.</strong>{' '}
        Complete Layer 3 of the quiz to see how {pillarName.toLowerCase()} match your values.
      </p>
      <Link
        href={resumeHref}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-blue-accent)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Resume the quiz →
      </Link>
    </div>
  )
}
