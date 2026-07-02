'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import MantleReveal from '@/components/quiz/MantleReveal'
import ProfileDetails from '@/components/quiz/ProfileDetails'

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

  const completed = session.completedLayers ?? []
  const quizComplete = completed.length >= 4

  return (
    <>
      <MantleReveal result={session.result} />
      <ResultsTopCta quizComplete={quizComplete} />
      <ProfileDetails session={session} />
      <ResultsNext quizComplete={quizComplete} />
    </>
  )
}

// Prominent next-step CTAs right under the reveal — so "Explore your mantle" and
// the way back into the quiz aren't buried at the bottom of a long page.
function ResultsTopCta({ quizComplete }: { quizComplete: boolean }) {
  const resetQuiz = useQuizStore((s) => s.resetQuiz)
  const router = useRouter()

  function handleRetake() {
    resetQuiz()
    router.push('/quiz')
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: '0 var(--space-6) var(--space-12)' }}>
      <Link href="/your-mantle" style={{ backgroundColor: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', textDecoration: 'none' }}>
        Explore your mantle →
      </Link>
      {quizComplete ? (
        <button
          onClick={handleRetake}
          style={{ backgroundColor: 'transparent', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-medium)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
        >
          Retake quiz
        </button>
      ) : (
        <>
          <Link href="/quiz" style={{ backgroundColor: 'transparent', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-medium)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', textDecoration: 'none', border: '1px solid var(--color-border)' }}>
            Edit answers →
          </Link>
          <button
            onClick={handleRetake}
            style={{ backgroundColor: 'transparent', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-medium)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
          >
            Retake quiz
          </button>
        </>
      )}
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
    <div style={{ maxWidth: 'var(--max-width-wide)', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-20)' }}>
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
