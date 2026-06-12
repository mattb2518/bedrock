'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuizStore } from '@/store/quizStore'
import { LAYER1_QUESTIONS, IMPORTANCE_CLOSER } from '@/lib/quiz/layer1'
import { buildResult } from '@/lib/quiz/scoring'
import { DIMENSIONS } from '@/lib/quiz/dimensions'
import { IT_DEPENDS, type Dimension, type QuizQuestion } from '@/types/quiz'
import MantleReveal from '@/components/quiz/MantleReveal'

type Phase = 'intro' | 'quiz' | 'importance' | 'reveal'

// Stable per-question shuffle of the substantive options (SPEC §5 randomizes
// option order). "It depends" is appended separately, always last.
function useShuffledOptions(q: QuizQuestion) {
  return useMemo(() => {
    const opts = [...q.options]
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[opts[i], opts[j]] = [opts[j], opts[i]]
    }
    return opts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id])
}

const card: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-5)',
  textAlign: 'left',
  width: '100%',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  color: 'var(--color-text-primary)',
  lineHeight: 'var(--leading-relaxed)',
  marginBottom: 'var(--space-3)',
  transition: 'border-color 0.15s',
}

const primaryBtn: React.CSSProperties = {
  backgroundColor: 'var(--color-red)',
  color: '#fff',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--weight-semibold)',
  fontSize: 'var(--text-body)',
  padding: 'var(--btn-padding-y) var(--btn-padding-x)',
  borderRadius: 'var(--btn-radius)',
  border: 'none',
  cursor: 'pointer',
}

export default function QuizFlow() {
  const { session, startSession, submitAnswer, goBack, setTopDimensions, completeLayer, setResult, resetQuiz } =
    useQuizStore()
  const [phase, setPhase] = useState<Phase>('intro')

  // Transient per-question UI state
  const [pendingOption, setPendingOption] = useState<string | null>(null)
  const [dependsText, setDependsText] = useState('')
  const [dependsChoices, setDependsChoices] = useState<string[]>([])
  const [picks, setPicks] = useState<Dimension[]>([])

  const index = session?.currentQuestionIndex ?? 0
  const question = LAYER1_QUESTIONS[index]
  const shuffled = useShuffledOptions(question ?? LAYER1_QUESTIONS[0])

  function begin() {
    if (!session) startSession()
    setPhase('quiz')
  }

  function clearTransient() {
    setPendingOption(null)
    setDependsText('')
    setDependsChoices([])
  }

  function advance() {
    if (!pendingOption) return
    submitAnswer({
      questionId: question.id,
      optionId: pendingOption,
      dependsText: pendingOption === IT_DEPENDS && question.dependsFollowUp.type === 'open_text' ? dependsText : undefined,
      dependsChoices: pendingOption === IT_DEPENDS && question.dependsFollowUp.type === 'multiple_choice' ? dependsChoices : undefined,
    })
    clearTransient()
    if (index + 1 >= LAYER1_QUESTIONS.length) setPhase('importance')
  }

  function finishImportance() {
    setTopDimensions(picks)
    completeLayer(1)
    const result = buildResult(LAYER1_QUESTIONS, session?.answers ?? [], picks, [1])
    setResult(result)
    setPhase('reveal')
  }

  function restart() {
    resetQuiz()
    setPicks([])
    clearTransient()
    setPhase('intro')
  }

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <Shell>
        <Kicker>Layer 1 · What you believe</Kicker>
        <H1>Find your bedrock.</H1>
        <Body>
          Most civic tools ask where you stand on the issues. We’re asking something different — and harder. We want to know how you <em>think</em>: the underlying values that drive your positions.
        </Body>
        <Body>
          Twenty questions. About twelve minutes. No wrong answers — only honest ones. Every question has an “It depends” option — it’s not a cop-out, it’s often the most accurate answer. Your nuance is the point.
        </Body>
        <div style={{ marginTop: 'var(--space-8)' }}>
          <button style={primaryBtn} onClick={begin}>
            {session && session.answers.length > 0 ? 'Resume →' : 'Begin →'}
          </button>
        </div>
      </Shell>
    )
  }

  // ── REVEAL ───────────────────────────────────────────────────────────────
  if (phase === 'reveal' && session?.result) {
    return (
      <>
        <MantleReveal result={session.result} />
        <Shell>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/results" style={{ ...primaryBtn, textDecoration: 'none' }}>
              See full results →
            </Link>
            <button onClick={restart} style={{ ...primaryBtn, backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
              Start over
            </button>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-6)', fontStyle: 'italic' }}>
            Layers 2–4 (positions, voting behavior, dealbreakers) are coming next — this is your values foundation, ~40% of the full picture.
          </p>
        </Shell>
      </>
    )
  }

  // ── IMPORTANCE CLOSER ─────────────────────────────────────────────────────
  if (phase === 'importance') {
    const togglePick = (d: Dimension) => {
      setPicks((prev) =>
        prev.includes(d) ? prev.filter((x) => x !== d) : prev.length < IMPORTANCE_CLOSER.maxPicks ? [...prev, d] : prev
      )
    }
    return (
      <Shell>
        <Kicker>One last thing</Kicker>
        <H2>{IMPORTANCE_CLOSER.framing}</H2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          Pick up to {IMPORTANCE_CLOSER.maxPicks}. ({picks.length}/{IMPORTANCE_CLOSER.maxPicks})
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          {DIMENSIONS.map((d) => {
            const on = picks.includes(d.key)
            return (
              <button
                key={d.key}
                onClick={() => togglePick(d.key)}
                style={{
                  ...card,
                  marginBottom: 0,
                  textAlign: 'center',
                  borderColor: on ? 'var(--color-gold)' : 'var(--color-border)',
                  backgroundColor: on ? 'rgba(212,175,55,0.08)' : 'var(--color-bg-surface)',
                }}
              >
                {d.poleA} ↔ {d.poleB}
              </button>
            )
          })}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button style={primaryBtn} onClick={finishImportance}>
            Reveal my constellation →
          </button>
        </div>
      </Shell>
    )
  }

  // ── QUESTION ──────────────────────────────────────────────────────────────
  if (!question) return null
  const picked = pendingOption
  const isDepends = picked === IT_DEPENDS
  const pickedOption = question.options.find((o) => o.id === picked)
  const dependsReady =
    !isDepends ||
    (question.dependsFollowUp.type === 'open_text'
      ? dependsText.trim().length > 0
      : dependsChoices.length > 0)

  return (
    <Shell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <Kicker>
          Question {index + 1} of {LAYER1_QUESTIONS.length}
        </Kicker>
        {index > 0 && (
          <button onClick={() => { goBack(); clearTransient() }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', cursor: 'pointer' }}>
            ← Back
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-8)' }}>
        <div style={{ height: '100%', width: `${(index / LAYER1_QUESTIONS.length) * 100}%`, backgroundColor: 'var(--color-gold)', borderRadius: 'var(--radius-full)', transition: 'width 0.3s' }} />
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3, var(--text-body-lg))', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-snug, 1.4)', marginBottom: 'var(--space-6)' }}>
        {question.text}
      </h2>

      {/* Options */}
      {shuffled.map((opt) => {
        const selected = picked === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => { setPendingOption(opt.id); setDependsText(''); setDependsChoices([]) }}
            style={{ ...card, borderColor: selected ? 'var(--color-blue-accent)' : 'var(--color-border)', backgroundColor: selected ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-surface)' }}
          >
            {opt.text}
          </button>
        )
      })}
      {/* It depends */}
      <button
        onClick={() => setPendingOption(IT_DEPENDS)}
        style={{ ...card, fontStyle: 'italic', color: 'var(--color-text-secondary)', borderColor: isDepends ? 'var(--color-blue-accent)' : 'var(--color-border)', backgroundColor: isDepends ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-surface)' }}
      >
        It depends…
      </button>

      {/* Micro-reaction (non-depends) + easter egg */}
      {pickedOption?.microReaction && (
        <Aside>{pickedOption.microReaction}</Aside>
      )}

      {/* It-depends follow-up */}
      {isDepends && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            {question.dependsFollowUp.prompt}
          </p>
          {question.dependsFollowUp.type === 'open_text' ? (
            <textarea
              value={dependsText}
              onChange={(e) => setDependsText(e.target.value)}
              rows={3}
              placeholder="A sentence or two…"
              style={{ width: '100%', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', resize: 'vertical' }}
            />
          ) : (
            (question.dependsFollowUp.choices ?? []).map((choice) => {
              const on = dependsChoices.includes(choice)
              return (
                <button
                  key={choice}
                  onClick={() => setDependsChoices((prev) => (on ? prev.filter((c) => c !== choice) : [...prev, choice]))}
                  style={{ ...card, marginBottom: 'var(--space-2)', fontSize: 'var(--text-small)', borderColor: on ? 'var(--color-blue-accent)' : 'var(--color-border)', backgroundColor: on ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-surface)' }}
                >
                  {on ? '✓ ' : ''}{choice}
                </button>
              )
            })
          )}
        </div>
      )}

      {question.easterEgg && picked && (
        <Aside muted>{question.easterEgg}</Aside>
      )}

      {/* Continue */}
      {picked && (
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'right' }}>
          <button style={{ ...primaryBtn, opacity: dependsReady ? 1 : 0.4, cursor: dependsReady ? 'pointer' : 'not-allowed' }} onClick={advance} disabled={!dependsReady}>
            {index + 1 >= LAYER1_QUESTIONS.length ? 'Continue →' : 'Next →'}
          </button>
        </div>
      )}
    </Shell>
  )
}

// ── small presentational helpers ──────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>{children}</div>
}
function Kicker({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', margin: 0 }}>{children}</p>
}
function H1({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', margin: 'var(--space-4) 0 var(--space-6)' }}>{children}</h1>
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2, var(--text-h1))', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', textAlign: 'center', margin: 'var(--space-4) 0 var(--space-4)' }}>{children}</h2>
}
function Body({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>{children}</p>
}
function Aside({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', borderLeft: `2px solid ${muted ? 'var(--color-border)' : 'var(--color-gold)'}`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: muted ? 'var(--color-text-muted)' : 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', fontStyle: 'italic', margin: 0 }}>
        {children}
      </p>
    </div>
  )
}
