'use client'

import Link from 'next/link'
import { useQuizStore } from '@/store/quizStore'
import MantleReveal from '@/components/quiz/MantleReveal'

export default function ResultsPage() {
  const session = useQuizStore((s) => s.session)

  if (!session?.result) {
    return (
      <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-5)' }}>
          No results yet.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
          Complete Layer 1 of the quiz to see your civic type, your constellation, and your eight-dimensional breakdown.
        </p>
        <Link href="/quiz" style={{ backgroundColor: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', textDecoration: 'none' }}>
          Take the quiz →
        </Link>
      </div>
    )
  }

  return <MantleReveal result={session.result} />
}
