'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import MantleReveal from '@/components/quiz/MantleReveal'
import ProfileDetails from '@/components/quiz/ProfileDetails'
import { useCallback, useState } from 'react'

function AccountPrompt() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 var(--space-6) var(--space-6)' }}>
      <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', fontSize: 'var(--text-body)' }}>
            Save your results
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            Create a free account to save your Civic Mantle and get personalized recommendations across all four pillars.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexShrink: 0 }}>
          <Link href="/signup" style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-small)', backgroundColor: 'var(--color-red)', color: '#fff', textDecoration: 'none', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--btn-radius)' }}>
            Sign Up Free
          </Link>
          <button onClick={() => setDismissed(true)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const session = useQuizStore((s) => s.session)
  const isAnonymous = !session?.userId

  if (!session?.result) {
    return (
      <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-5)' }}>
          No results yet.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
          Complete Layer 1 of the quiz to see your Civic Mantle, your constellation, and your eight-dimensional breakdown.
        </p>
        <Link href="/quiz" style={{ backgroundColor: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', textDecoration: 'none' }}>
          Take the quiz →
        </Link>
      </div>
    )
  }

  const completed = session.completedLayers ?? []
  const quizComplete = completed.length >= 4

  return (
    <>
      <MantleReveal result={session.result} hideDimBreakdown />
      {isAnonymous && <AccountPrompt />}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 var(--space-6) var(--space-4)', textAlign: 'center' }}>
        <a href="#put-it-to-work" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          Put it to work ↓
        </a>
      </div>
      <ProfileDetails session={session} />
      <QuizLinks quizComplete={quizComplete} />
      <ResultsNext quizComplete={quizComplete} />
    </>
  )
}

function QuizLinks({ quizComplete }: { quizComplete: boolean }) {
  const resetQuiz = useQuizStore((s) => s.resetQuiz)
  const router = useRouter()

  const handleRetake = useCallback(() => {
    resetQuiz()
    router.push('/quiz')
  }, [resetQuiz, router])

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 var(--space-6) var(--space-10)', display: 'flex', gap: 'var(--space-5)', alignItems: 'center' }}>
      {!quizComplete && (
        <Link href="/quiz" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
          Edit answers
        </Link>
      )}
      <button
        onClick={handleRetake}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
      >
        Retake quiz
      </button>
    </div>
  )
}

const PILLARS = [
  { href: '/your-ballot', title: 'Your Ballot', blurb: "Every race matched to your values — president to school board.", accent: 'var(--color-red)' },
  { href: '/media-diet', title: 'Your Media Diet', blurb: "Independent journalism matched to how you actually think.", accent: 'var(--color-white-warm)' },
  { href: '/conversations', title: 'Your Conversations', blurb: "Claude-powered prep for hard conversations across difference.", accent: 'var(--color-blue-accent)' },
  { href: '/beyond-your-ballot', title: 'Beyond Your Ballot', blurb: "Candidates you can't vote for, but who'd shape the country.", accent: 'var(--color-rose)' },
]

function ResultsNext({ quizComplete }: { quizComplete: boolean }) {
  return (
    <div id="put-it-to-work" style={{ maxWidth: 'var(--max-width-wide)', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-20)', scrollMarginTop: 'var(--nav-height)' }}>
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-12)' }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto var(--space-10)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            Now put it to work
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-4)' }}>
            Your mantle is the engine. Here's what it powers.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            {quizComplete
              ? 'Everything below is built on what you just mapped — personalized, sourced, and explained.'
              : 'You can build on these now — and the more of the quiz you finish, the sharper they get.'}
          </p>
        </div>

        <div className="results-pillars">
          {PILLARS.map((p) => (
            <Link key={p.href} href={p.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', borderTop: `3px solid ${p.accent}`, height: '100%', boxSizing: 'border-box' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>{p.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{p.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .results-pillars {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-auto-rows: 1fr;
          gap: var(--space-6);
          max-width: 760px;
          margin: 0 auto;
        }
        @media (max-width: 640px) {
          .results-pillars { grid-template-columns: 1fr; grid-auto-rows: auto; }
        }
      `}</style>
    </div>
  )
}
