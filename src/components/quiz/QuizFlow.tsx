'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuizStore } from '@/store/quizStore'
import { LAYER1_QUESTIONS, IMPORTANCE_CLOSER } from '@/lib/quiz/layer1'
import { LAYER2_QUESTIONS } from '@/lib/quiz/layer2'
import { LAYER3_QUESTIONS } from '@/lib/quiz/layer3'
import { LAYER4_SECTIONS, FRAMING, DEALBREAKER_OTHER_PROMPT } from '@/lib/quiz/layer4'
import { LAYER_INTRO, LAYER_OUTRO, LAYER_LABELS } from '@/lib/quiz/layerCopy'
import { buildResult } from '@/lib/quiz/scoring'
import { DIMENSIONS } from '@/lib/quiz/dimensions'
import { IT_DEPENDS, type Dimension, type QuizLayer, type QuizQuestion } from '@/types/quiz'
import MantleReveal from '@/components/quiz/MantleReveal'

type Phase =
  | 'intro'
  | 'layerIntro'
  | 'quiz'
  | 'importance'
  | 'reveal'
  | 'outro'
  | 'dealbreakers'
  | 'done'

const QUESTIONS_BY_LAYER: Record<number, QuizQuestion[]> = {
  1: LAYER1_QUESTIONS,
  2: LAYER2_QUESTIONS,
  3: LAYER3_QUESTIONS,
}

// Stable per-question shuffle (SPEC §5). Options that open their own text field
// (followUpPrompt — e.g. the Layer 3 capstone's "name it yourself") are pinned
// last, like "It depends".
function useShuffledOptions(q: QuizQuestion) {
  return useMemo(() => {
    const pinned = q.options.filter((o) => o.followUpPrompt)
    const shuffle = q.options.filter((o) => !o.followUpPrompt)
    for (let i = shuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]]
    }
    return [...shuffle, ...pinned]
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

const ghostBtn: React.CSSProperties = {
  ...primaryBtn,
  backgroundColor: 'transparent',
  color: 'var(--color-text-muted)',
  border: '1px solid var(--color-border)',
}

const textarea: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-3)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  color: 'var(--color-text-primary)',
  resize: 'vertical',
}

export default function QuizFlow() {
  const {
    session,
    startSession,
    submitAnswer,
    goBack,
    setTopDimensions,
    completeLayer,
    setResult,
    setDealbreakers,
    setDealbreakerOther,
    resetQuiz,
  } = useQuizStore()
  const [phase, setPhase] = useState<Phase>('intro')

  // Transient per-question UI state
  const [pendingOption, setPendingOption] = useState<string | null>(null)
  const [followText, setFollowText] = useState('')
  const [followChoices, setFollowChoices] = useState<string[]>([])
  const [picks, setPicks] = useState<Dimension[]>([])
  const [dbPicks, setDbPicks] = useState<string[]>([])
  const [dbOther, setDbOther] = useState('')
  const [confirmingRetake, setConfirmingRetake] = useState(false)

  const layer = (session?.currentLayer ?? 1) as QuizLayer
  const questions = QUESTIONS_BY_LAYER[layer] ?? LAYER1_QUESTIONS
  const index = session?.currentQuestionIndex ?? 0
  const question = questions[index]
  const shuffled = useShuffledOptions(question ?? LAYER1_QUESTIONS[0])

  function clearTransient() {
    setPendingOption(null)
    setFollowText('')
    setFollowChoices([])
  }

  function begin() {
    if (!session) startSession()
    setPhase('quiz')
  }

  function recompute(completed: QuizLayer[], topDims: Dimension[]) {
    const result = buildResult(LAYER1_QUESTIONS, session?.answers ?? [], topDims, completed)
    setResult(result)
    return result
  }

  function advance() {
    if (!pendingOption || !question) return
    const opt = question.options.find((o) => o.id === pendingOption)
    submitAnswer({
      questionId: question.id,
      optionId: pendingOption,
      dependsText:
        (pendingOption === IT_DEPENDS && question.dependsFollowUp.type === 'open_text') || opt?.followUpPrompt
          ? followText
          : undefined,
      dependsChoices:
        pendingOption === IT_DEPENDS && question.dependsFollowUp.type === 'multiple_choice'
          ? followChoices
          : undefined,
    })
    clearTransient()

    const isLast = index + 1 >= questions.length
    if (!isLast) return
    if (layer === 1) {
      setPhase('importance')
    } else {
      const completed = [...(session?.completedLayers ?? []), layer]
      recompute(completed, session?.topDimensions ?? [])
      completeLayer(layer)
      setPhase('outro')
    }
  }

  function finishImportance() {
    setTopDimensions(picks)
    recompute([1], picks)
    completeLayer(1)
    setPhase('reveal')
  }

  function finishDealbreakers() {
    setDealbreakers(dbPicks)
    setDealbreakerOther(dbOther)
    recompute([1, 2, 3, 4], session?.topDimensions ?? [])
    completeLayer(4)
    setPhase('done')
  }

  function restart() {
    resetQuiz()
    setPicks([])
    setDbPicks([])
    setDbOther('')
    setConfirmingRetake(false)
    clearTransient()
    setPhase('intro')
  }

  function retakeFromScratch() {
    resetQuiz()
    setPicks([])
    setDbPicks([])
    setDbOther('')
    setConfirmingRetake(false)
    clearTransient()
    startSession()
    setPhase('quiz')
  }

  const fullyComplete = (session?.completedLayers?.length ?? 0) >= 4

  // ── RETAKE SCREEN (returning user, fully complete) ────────────────────────
  if (phase === 'intro' && fullyComplete) {
    return (
      <Shell>
        <Kicker>Welcome back</Kicker>
        <H1>Your thinking evolves. Your profile can too.</H1>
        <Body>
          You’ve completed all four layers. You can revisit your answers any time — your civic identity isn’t fixed, and neither is this.
        </Body>

        <div style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
          {/* Edit responses — coming soon */}
          <div style={{ ...card, marginBottom: 0, cursor: 'default', opacity: 0.7, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span>
              <strong style={{ color: 'var(--color-text-primary)' }}>Edit responses</strong>
              <span style={{ display: 'block', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                Revisit one layer at a time, with your answers pre-filled.
              </span>
            </span>
            <span style={{ flexShrink: 0, fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-full)', padding: '4px 10px' }}>
              Coming soon
            </span>
          </div>

          {/* Retake from scratch */}
          {confirmingRetake ? (
            <div style={{ ...card, marginBottom: 0, cursor: 'default', borderColor: 'var(--color-red)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
                This will replace your current profile. Your previous answers will be permanently deleted. Are you sure?
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button style={primaryBtn} onClick={retakeFromScratch}>Yes, start fresh</button>
                <button style={ghostBtn} onClick={() => setConfirmingRetake(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingRetake(true)}
              style={{ ...card, marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}
            >
              <span>
                <strong style={{ color: 'var(--color-text-primary)' }}>Retake from scratch</strong>
                <span style={{ display: 'block', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Clear everything and start over from Layer 1.
                </span>
              </span>
              <span style={{ flexShrink: 0, color: 'var(--color-text-muted)' }}>→</span>
            </button>
          )}
        </div>

        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
          <Link href="/results" style={{ color: 'var(--color-blue-accent)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)' }}>
            View my current results →
          </Link>
        </div>
      </Shell>
    )
  }

  // ── INTRO (Layer 1 welcome) ───────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <Shell>
        <Kicker>Layer 1 · {LAYER_LABELS[1]}</Kicker>
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

  // ── LAYER INTRO (Layers 2–4) ──────────────────────────────────────────────
  if (phase === 'layerIntro' && (layer === 2 || layer === 3 || layer === 4)) {
    const intro = LAYER_INTRO[layer]
    return (
      <Shell>
        <Kicker>Layer {layer} · {LAYER_LABELS[layer]}</Kicker>
        <H1>{intro.heading}</H1>
        <Body>{intro.body}</Body>
        <div style={{ marginTop: 'var(--space-8)' }}>
          <button style={primaryBtn} onClick={() => setPhase(layer === 4 ? 'dealbreakers' : 'quiz')}>
            {layer === 4 ? 'Draw my lines →' : `Begin Layer ${layer} →`}
          </button>
        </div>
      </Shell>
    )
  }

  // ── REVEAL (after Layer 1) ────────────────────────────────────────────────
  if (phase === 'reveal' && session?.result) {
    return (
      <>
        <MantleReveal result={session.result} />
        <Shell>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3, var(--text-body-lg))', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
              This is your values foundation — about 40% of the full picture.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', maxWidth: 520, margin: '0 auto var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
              {LAYER_OUTRO[1].teaser}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={primaryBtn} onClick={() => setPhase('layerIntro')}>
                Continue to Layer 2 →
              </button>
              <Link href="/results" style={{ ...ghostBtn, textDecoration: 'none' }}>
                Save & view results
              </Link>
            </div>
          </div>
        </Shell>
      </>
    )
  }

  // ── OUTRO (after Layers 2 & 3) ────────────────────────────────────────────
  if (phase === 'outro') {
    const justDone = (layer - 1) as QuizLayer // completeLayer already advanced currentLayer
    const outro = LAYER_OUTRO[justDone] ?? LAYER_OUTRO[2]
    return (
      <Shell>
        <Kicker>Layer {justDone} complete · {session?.result?.completionPercent ?? 0}% mapped</Kicker>
        <H1>{outro.heading}</H1>
        <Body>{outro.body}</Body>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-gold)', fontStyle: 'italic', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-8)' }}>
          {outro.teaser}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button style={primaryBtn} onClick={() => setPhase('layerIntro')}>
            Continue to Layer {layer} →
          </button>
          <Link href="/results" style={{ ...ghostBtn, textDecoration: 'none' }}>
            View results so far
          </Link>
        </div>
      </Shell>
    )
  }

  // ── DONE (after Layer 4) ──────────────────────────────────────────────────
  if (phase === 'done') {
    const outro = LAYER_OUTRO[4]
    return (
      <Shell>
        <Kicker>100% mapped</Kicker>
        <H1>{outro.heading}</H1>
        <Body>{outro.body}</Body>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-6)' }}>
          <Link href="/results" style={{ ...primaryBtn, textDecoration: 'none' }}>
            See your full results →
          </Link>
          <button style={ghostBtn} onClick={restart}>
            Start over
          </button>
        </div>
      </Shell>
    )
  }

  // ── IMPORTANCE CLOSER (Layer 1) ───────────────────────────────────────────
  if (phase === 'importance') {
    const togglePick = (d: Dimension) =>
      setPicks((prev) =>
        prev.includes(d) ? prev.filter((x) => x !== d) : prev.length < IMPORTANCE_CLOSER.maxPicks ? [...prev, d] : prev
      )
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
                style={{ ...card, marginBottom: 0, textAlign: 'center', borderColor: on ? 'var(--color-gold)' : 'var(--color-border)', backgroundColor: on ? 'rgba(200,169,110,0.08)' : 'var(--color-bg-surface)' }}
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

  // ── DEALBREAKERS (Layer 4) ────────────────────────────────────────────────
  if (phase === 'dealbreakers') {
    const toggleDb = (id: string) =>
      setDbPicks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    const dbCard = (id: string, text: string) => {
      const on = dbPicks.includes(id)
      return (
        <button
          key={id}
          onClick={() => toggleDb(id)}
          style={{ ...card, marginBottom: 'var(--space-2)', fontSize: 'var(--text-small)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', borderColor: on ? 'var(--color-red)' : 'var(--color-border)', backgroundColor: on ? 'rgba(212,64,53,0.08)' : 'var(--color-bg-surface)' }}
        >
          <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 4, border: `1px solid ${on ? 'var(--color-red)' : 'var(--color-border-strong)'}`, backgroundColor: on ? 'var(--color-red)' : 'transparent', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginTop: 2 }}>
            {on ? '✓' : ''}
          </span>
          <span>{text}</span>
        </button>
      )
    }
    return (
      <Shell>
        <Kicker>Layer 4 · {LAYER_LABELS[4]}</Kicker>
        <H2>{FRAMING}</H2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          Select as many or as few as apply. ({dbPicks.length} selected)
        </p>
        {LAYER4_SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 'var(--space-8)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
              {section.title}
            </p>
            {section.items?.map((it) => dbCard(it.id, it.text))}
            {section.pairs?.map((pair) => (
              <div key={pair.issue} style={{ marginBottom: 'var(--space-4)' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: 'var(--space-2)' }}>{pair.issue}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  {dbCard(pair.left.id, pair.left.text)}
                  {dbCard(pair.right.id, pair.right.text)}
                </div>
              </div>
            ))}
          </div>
        ))}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
          {DEALBREAKER_OTHER_PROMPT}
        </p>
        <textarea value={dbOther} onChange={(e) => setDbOther(e.target.value)} rows={2} placeholder="Optional…" style={{ ...textarea, marginBottom: 'var(--space-8)' }} />
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button style={primaryBtn} onClick={finishDealbreakers}>
            Finish →
          </button>
          <button style={ghostBtn} onClick={finishDealbreakers}>
            Skip — I have no hard lines
          </button>
        </div>
      </Shell>
    )
  }

  // ── QUESTION (all layers) ─────────────────────────────────────────────────
  if (!question) return null
  const hasItDepends = question.dependsFollowUp.prompt !== ''
  const picked = pendingOption
  const pickedOption = question.options.find((o) => o.id === picked)
  const isDepends = picked === IT_DEPENDS
  const needsFollowText =
    (isDepends && question.dependsFollowUp.type === 'open_text') || !!pickedOption?.followUpPrompt
  const needsFollowChoices = isDepends && question.dependsFollowUp.type === 'multiple_choice'
  const followReady =
    (!needsFollowText || followText.trim().length > 0) &&
    (!needsFollowChoices || followChoices.length > 0)
  const followPrompt = pickedOption?.followUpPrompt ?? question.dependsFollowUp.prompt

  return (
    <Shell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <Kicker>
          Layer {layer} · Question {index + 1} of {questions.length}
        </Kicker>
        {index > 0 && (
          <button onClick={() => { goBack(); clearTransient() }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', cursor: 'pointer' }}>
            ← Back
          </button>
        )}
      </div>

      <div style={{ height: 4, backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-8)' }}>
        <div style={{ height: '100%', width: `${(index / questions.length) * 100}%`, backgroundColor: 'var(--color-gold)', borderRadius: 'var(--radius-full)', transition: 'width 0.3s' }} />
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3, var(--text-body-lg))', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-snug, 1.4)', marginBottom: 'var(--space-6)' }}>
        {question.text}
      </h2>

      {shuffled.map((opt) => {
        const selected = picked === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => { setPendingOption(opt.id); setFollowText(''); setFollowChoices([]) }}
            style={{ ...card, borderColor: selected ? 'var(--color-blue-accent)' : 'var(--color-border)', backgroundColor: selected ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-surface)' }}
          >
            {opt.text}
          </button>
        )
      })}
      {hasItDepends && (
        <button
          onClick={() => setPendingOption(IT_DEPENDS)}
          style={{ ...card, fontStyle: 'italic', color: 'var(--color-text-secondary)', borderColor: isDepends ? 'var(--color-blue-accent)' : 'var(--color-border)', backgroundColor: isDepends ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-surface)' }}
        >
          It depends…
        </button>
      )}

      {pickedOption?.microReaction && <Aside>{pickedOption.microReaction}</Aside>}

      {/* Follow-up: It-depends open text / multiple choice, OR an option's own text field */}
      {(needsFollowText || needsFollowChoices) && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            {followPrompt}
          </p>
          {needsFollowChoices ? (
            (question.dependsFollowUp.choices ?? []).map((choice) => {
              const on = followChoices.includes(choice)
              return (
                <button
                  key={choice}
                  onClick={() => setFollowChoices((prev) => (on ? prev.filter((c) => c !== choice) : [...prev, choice]))}
                  style={{ ...card, marginBottom: 'var(--space-2)', fontSize: 'var(--text-small)', borderColor: on ? 'var(--color-blue-accent)' : 'var(--color-border)', backgroundColor: on ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-surface)' }}
                >
                  {on ? '✓ ' : ''}{choice}
                </button>
              )
            })
          ) : (
            <textarea value={followText} onChange={(e) => setFollowText(e.target.value)} rows={3} placeholder="A sentence or two…" style={textarea} />
          )}
        </div>
      )}

      {question.easterEgg && picked && <Aside muted>{question.easterEgg}</Aside>}

      {picked && (
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'right' }}>
          <button style={{ ...primaryBtn, opacity: followReady ? 1 : 0.4, cursor: followReady ? 'pointer' : 'not-allowed' }} onClick={advance} disabled={!followReady}>
            {index + 1 >= questions.length ? 'Continue →' : 'Next →'}
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
