// Results-page accordion sections: dimensions + deeper quiz layers.
// All four sections use the same collapsed accordion pattern so they read
// as parallel — dimensions first, then positions, vote drivers, dealbreakers.

import { createContext, useContext, useEffect, useState } from 'react'
import { DIMENSIONS } from '@/lib/quiz/dimensions'
import { LAYER2_QUESTIONS } from '@/lib/quiz/layer2'
import { LAYER3_QUESTIONS } from '@/lib/quiz/layer3'
import { QUESTION_TOPICS } from '@/lib/quiz/layerCopy'
import { DEALBREAKER_TEXT } from '@/lib/quiz/layer4'
import { IT_DEPENDS, type QuizAnswer, type QuizQuestion, type QuizSession } from '@/types/quiz'

// ── Shared accordion shell ────────────────────────────────────────────────────

const AccordionCtx = createContext<{ openTitle: string | null; setOpenTitle: (t: string | null) => void }>({ openTitle: null, setOpenTitle: () => {} })

function Accordion({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  const { openTitle, setOpenTitle } = useContext(AccordionCtx)
  const open = openTitle === title
  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <button
        onClick={() => setOpenTitle(open ? null : title)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--color-border)' }}
      >
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase' }}>
          {title}{count !== undefined ? ` · ${count}` : ''}
        </span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>
      {open && <div style={{ paddingTop: 'var(--space-4)' }}>{children}</div>}
    </div>
  )
}

// ── Dimensions ────────────────────────────────────────────────────────────────

function DimensionsSection({ result }: { result: NonNullable<QuizSession['result']> }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t) }, [])

  return (
    <Accordion title="Your eight dimensions">
      {DIMENSIONS.map((d, i) => {
        const v = result.profile[d.key]
        const isTop = result.topDimensions.includes(d.key)
        return (
          <div key={d.key} style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', marginBottom: 'var(--space-2)' }}>
              <span style={{ color: v < 50 ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: v < 50 ? 'var(--weight-semibold)' : 'normal' }}>{d.poleA}</span>
              {isTop && (
                <span style={{ color: 'var(--color-gold)', fontSize: '11px', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase' }}>most central</span>
              )}
              <span style={{ color: v > 50 ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: v > 50 ? 'var(--weight-semibold)' : 'normal' }}>{d.poleB}</span>
            </div>
            <div style={{ position: 'relative', height: 6, backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
              <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1, backgroundColor: 'var(--color-border-strong)' }} />
              <div style={{ position: 'absolute', left: `${mounted ? v : 50}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: 'var(--radius-full)', backgroundColor: isTop ? 'var(--color-gold)' : '#6B9FEA', boxShadow: isTop ? '0 0 8px rgba(200,169,110,0.6)' : 'none', transition: `left 0.8s cubic-bezier(0.22,1,0.36,1) ${0.05 + i * 0.05}s` }} />
            </div>
          </div>
        )
      })}
    </Accordion>
  )
}

// ── Layer 2/3 positions helper ────────────────────────────────────────────────

function describe(question: QuizQuestion, answer: QuizAnswer): { topic: string; chosen: string } {
  const topic = QUESTION_TOPICS[question.id] ?? question.id
  if (answer.optionId === IT_DEPENDS) {
    const detail = answer.dependsText?.trim() || answer.dependsChoices?.join('; ') || ''
    return { topic, chosen: detail ? `It depends — ${detail}` : 'It depends' }
  }
  const opt = question.options.find((o) => o.id === answer.optionId)
  let chosen = opt?.text ?? '—'
  if (opt?.followUpPrompt && answer.dependsText?.trim()) {
    chosen = `${opt.text.replace(/\s*—.*$/, '')} "${answer.dependsText.trim()}"`
  }
  return { topic, chosen }
}

function AnswerSection({ title, questions, answers }: { title: string; questions: QuizQuestion[]; answers: QuizAnswer[] }) {
  const rows = questions
    .map((q) => { const a = answers.find((x) => x.questionId === q.id); return a ? describe(q, a) : null })
    .filter((r): r is { topic: string; chosen: string } => r !== null)

  if (rows.length === 0) return null

  return (
    <Accordion title={title} count={rows.length}>
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
    </Accordion>
  )
}

// ── Dealbreakers ──────────────────────────────────────────────────────────────

function DealbreakersSection({ dealbreakers, dealbreakerOther }: { dealbreakers: string[]; dealbreakerOther?: string }) {
  const count = dealbreakers.length + (dealbreakerOther?.trim() ? 1 : 0)
  if (count === 0) return null

  return (
    <Accordion title="Your dealbreakers" count={count}>
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
    </Accordion>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function ProfileDetails({ session }: { session: QuizSession }) {
  if (!session.result) return null
  const { answers, dealbreakers, dealbreakerOther } = session
  const [openTitle, setOpenTitle] = useState<string | null>(null)

  return (
    <AccordionCtx.Provider value={{ openTitle, setOpenTitle }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 var(--space-6) var(--space-6)' }}>
        <DimensionsSection result={session.result} />
        <AnswerSection title="Your positions" questions={LAYER2_QUESTIONS} answers={answers} />
        <AnswerSection title="What drives your vote" questions={LAYER3_QUESTIONS} answers={answers} />
        <DealbreakersSection dealbreakers={dealbreakers} dealbreakerOther={dealbreakerOther} />
      </div>
    </AccordionCtx.Provider>
  )
}
