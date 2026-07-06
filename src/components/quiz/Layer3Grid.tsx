'use client'

import { useState } from 'react'
import { useQuizStore } from '@/store/quizStore'
import type { QuizQuestion } from '@/types/quiz'

interface Props {
  questions: QuizQuestion[]  // L3-Q1 through L3-Q7 (indices 0–6)
  onComplete: () => void     // called after all 7 answers submitted
}

// Compressed stems and option labels for the grid layout.
// Full question text is preserved in layer3.ts and used for individual-card rendering (L3-Q8).
const GRID_ROWS: { stem: string; a: string; b: string; c: string }[] = [
  {
    stem: 'Candidate you agree with has a serious character problem?',
    a: 'Disqualifying',
    b: 'Policy wins',
    c: 'Depends on the flaw',
  },
  {
    stem: 'What would most reliably make you vote against your lean?',
    a: 'Wrong on a key issue',
    b: 'Genuinely unfit',
    c: 'Strong crossaisle candidate',
  },
  {
    stem: 'Primary: vote your favorite or the electable one?',
    a: 'Vote my preference',
    b: 'Vote to win',
    c: 'Depends on the gap',
  },
  {
    stem: 'Downballot races — how do you approach them?',
    a: 'Research all of them',
    b: 'Top of ticket + best guess',
    c: 'Measures only',
  },
  {
    stem: 'Incumbent running for reelection?',
    a: 'Meaningful advantage',
    b: 'Mild disadvantage',
    c: 'Depends on the record',
  },
  {
    stem: "Your party's candidate is mediocre; theirs is impressive?",
    a: 'Vote the party',
    b: 'Vote the candidate',
    c: 'Depends on the year',
  },
  {
    stem: 'Voting horizon: next 4 years or next 20?',
    a: 'Near term',
    b: 'Long term',
    c: 'Depends on the office',
  },
]

export default function Layer3Grid({ questions, onComplete }: Props) {
  const { submitAnswer } = useQuizStore()
  // Map from question ID to selected option suffix ('a' | 'b' | 'c')
  const [selections, setSelections] = useState<Record<string, 'a' | 'b' | 'c'>>({})
  const [submitting, setSubmitting] = useState(false)

  const answeredCount = Object.keys(selections).length
  const allAnswered = answeredCount === 7

  function select(qId: string, suffix: 'a' | 'b' | 'c') {
    setSelections((prev) => ({ ...prev, [qId]: suffix }))
  }

  async function handleContinue() {
    if (!allAnswered || submitting) return
    setSubmitting(true)
    for (const q of questions) {
      const suffix = selections[q.id]
      if (suffix) {
        submitAnswer({ questionId: q.id, optionId: `${q.id}-${suffix}` })
      }
    }
    onComplete()
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      {/* Counter */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        fontWeight: 'var(--weight-semibold)',
        color: 'var(--color-gold)',
        letterSpacing: 'var(--tracking-wider)',
        textTransform: 'uppercase',
        margin: '0 0 var(--space-6)',
      }}>
        {answeredCount} of 7 answered
      </p>

      {/* Grid rows */}
      {questions.map((q, i) => {
        const row = GRID_ROWS[i]
        const sel = selections[q.id]
        return (
          <div key={q.id} style={{ marginBottom: 'var(--space-6)' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--space-3)',
              fontWeight: 'var(--weight-semibold)',
            }}>
              {row.stem}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
              {(['a', 'b', 'c'] as const).map((suffix) => {
                const label = row[suffix]
                const selected = sel === suffix
                return (
                  <button
                    key={suffix}
                    onClick={() => select(q.id, suffix)}
                    style={{
                      backgroundColor: selected ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-surface)',
                      border: `1px solid ${selected ? 'var(--color-blue-accent)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-3) var(--space-2)',
                      textAlign: 'center',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-small)',
                      color: selected ? 'var(--color-blue-accent)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      lineHeight: 'var(--leading-snug, 1.4)',
                      transition: 'border-color 0.15s, background-color 0.15s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* CTA */}
      <div style={{ marginTop: 'var(--space-4)', textAlign: 'right' }}>
        <button
          onClick={handleContinue}
          disabled={!allAnswered || submitting}
          style={{
            backgroundColor: 'var(--color-red)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-body)',
            padding: 'var(--btn-padding-y) var(--btn-padding-x)',
            borderRadius: 'var(--btn-radius)',
            border: 'none',
            cursor: allAnswered ? 'pointer' : 'not-allowed',
            opacity: allAnswered ? 1 : 0.4,
            pointerEvents: allAnswered ? 'auto' : 'none',
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
