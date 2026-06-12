// Results-page summaries of the deeper layers: Layer 2 positions, Layer 3
// voting behavior, and Layer 4 dealbreakers. Each section renders only if the
// user has data for it (progressive depth). Reads straight off the session.

import { LAYER2_QUESTIONS } from '@/lib/quiz/layer2'
import { LAYER3_QUESTIONS } from '@/lib/quiz/layer3'
import { QUESTION_TOPICS } from '@/lib/quiz/layerCopy'
import { DEALBREAKER_TEXT } from '@/lib/quiz/layer4'
import { IT_DEPENDS, type QuizAnswer, type QuizQuestion, type QuizSession } from '@/types/quiz'

function describe(question: QuizQuestion, answer: QuizAnswer): { topic: string; chosen: string } {
  const topic = QUESTION_TOPICS[question.id] ?? question.id
  if (answer.optionId === IT_DEPENDS) {
    const detail = answer.dependsText?.trim() || answer.dependsChoices?.join('; ') || ''
    return { topic, chosen: detail ? `It depends — ${detail}` : 'It depends' }
  }
  const opt = question.options.find((o) => o.id === answer.optionId)
  let chosen = opt?.text ?? '—'
  if (opt?.followUpPrompt && answer.dependsText?.trim()) {
    chosen = `${opt.text.replace(/\s*—.*$/, '')} “${answer.dependsText.trim()}”`
  }
  return { topic, chosen }
}

function Section({
  title,
  questions,
  answers,
}: {
  title: string
  questions: QuizQuestion[]
  answers: QuizAnswer[]
}) {
  const rows = questions
    .map((q) => {
      const a = answers.find((x) => x.questionId === q.id)
      return a ? describe(q, a) : null
    })
    .filter((r): r is { topic: string; chosen: string } => r !== null)

  if (rows.length === 0) return null

  return (
    <div style={{ marginBottom: 'var(--space-10)' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>
        {title}
      </p>
      {rows.map((r) => (
        <div key={r.topic} style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ flexShrink: 0, width: 150, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)' }}>
            {r.topic}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            {r.chosen}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ProfileDetails({ session }: { session: QuizSession }) {
  const { answers, dealbreakers, dealbreakerOther } = session
  const hasLines = dealbreakers.length > 0 || !!dealbreakerOther?.trim()
  const hasAny =
    answers.some((a) => a.questionId.startsWith('L2-')) ||
    answers.some((a) => a.questionId.startsWith('L3-')) ||
    hasLines

  if (!hasAny) return null

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 var(--space-6) var(--space-12)' }}>
      <Section title="Your positions" questions={LAYER2_QUESTIONS} answers={answers} />
      <Section title="What drives your vote" questions={LAYER3_QUESTIONS} answers={answers} />

      {hasLines && (
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>
            Your lines · {dealbreakers.length + (dealbreakerOther?.trim() ? 1 : 0)}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            A candidate who crosses any of these is disqualified — regardless of how well they otherwise match.
          </p>
          {dealbreakers.map((id) => (
            <div key={id} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-red)', flexShrink: 0 }}>✕</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                {DEALBREAKER_TEXT[id] ?? id}
              </span>
            </div>
          ))}
          {dealbreakerOther?.trim() && (
            <div style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-red)', flexShrink: 0 }}>✕</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', fontStyle: 'italic', lineHeight: 'var(--leading-relaxed)' }}>
                {dealbreakerOther.trim()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
