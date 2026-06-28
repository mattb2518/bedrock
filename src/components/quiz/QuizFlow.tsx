'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuizStore } from '@/store/quizStore'
import { LAYER1_QUESTIONS, IMPORTANCE_CLOSER } from '@/lib/quiz/layer1'
import { LAYER2_QUESTIONS } from '@/lib/quiz/layer2'
import { LAYER3_QUESTIONS } from '@/lib/quiz/layer3'
import { LAYER4_SECTIONS, FRAMING, DEALBREAKER_OTHER_PROMPT } from '@/lib/quiz/layer4'
import { LAYER_INTRO, LAYER_OUTRO, LAYER_LABELS, LAYER_SUBTITLES } from '@/lib/quiz/layerCopy'
import {
  DEMOGRAPHIC_INTRO,
  PARTY_RELATIONSHIP,
  CURRENT_REGISTRATION,
  UPBRINGING,
  POLITICAL_LINEAGE,
  LINEAGE_TRIGGERS,
  AGE_RANGES,
  GEOGRAPHIES,
  REGIONS,
  DEMOGRAPHIC_OTHER_PROMPT,
} from '@/lib/quiz/demographics'
import { buildResult } from '@/lib/quiz/scoring'
import { DIMENSIONS } from '@/lib/quiz/dimensions'
import { IT_DEPENDS, type Demographics, type Dimension, type QuizLayer, type QuizQuestion } from '@/types/quiz'
import MantleReveal from '@/components/quiz/MantleReveal'

// Fire a Plausible custom event if the cookieless script is present. No-ops in
// dev / when the script hasn't loaded. Used to learn whether users actually read
// the easter eggs or skip past them (so we can decide their fate with data).
function track(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return
  const p = (window as unknown as { plausible?: (e: string, o?: { props: Record<string, unknown> }) => void }).plausible
  if (typeof p === 'function') p(event, props ? { props } : undefined)
}

type Phase =
  | 'intro'
  | 'layerIntro'
  | 'quiz'
  | 'interstitial'
  | 'importance'
  | 'reveal'
  | 'outro'
  | 'dealbreakers'
  | 'demographics'
  | 'done'

// A between-questions "Did you know?" intermission, shown only when the
// just-answered question carries an easter egg. It defers the layer transition
// until the user clicks Next, so the egg reads as a beat between questions
// rather than noise tacked onto the answer.
interface Interstitial {
  egg: string
  wasLast: boolean // was this the final question of the layer?
  layerAtAnswer: QuizLayer
}

const QUESTIONS_BY_LAYER: Record<number, QuizQuestion[]> = {
  1: LAYER1_QUESTIONS,
  2: LAYER2_QUESTIONS,
  3: LAYER3_QUESTIONS,
}

// Per-step config for the demographics stepper. Conditional steps are skipped
// automatically when their condition isn't met — the next/prev helpers below
// handle the traversal so the step index stays stable.
interface DemoStepDef {
  key: keyof Demographics
  type: 'choice' | 'pills' | 'text'
  prompt: string
  options?: string[]
  condition?: (d: Demographics) => boolean
}

const DEMO_STEPS: DemoStepDef[] = [
  { key: 'partyRelationship', type: 'choice', prompt: PARTY_RELATIONSHIP.prompt, options: PARTY_RELATIONSHIP.options },
  { key: 'lineage', type: 'choice', prompt: POLITICAL_LINEAGE.prompt, options: POLITICAL_LINEAGE.options, condition: (d) => !!d.partyRelationship && LINEAGE_TRIGGERS.includes(d.partyRelationship) },
  { key: 'currentRegistration', type: 'choice', prompt: CURRENT_REGISTRATION.prompt, options: CURRENT_REGISTRATION.options },
  { key: 'upbringing', type: 'choice', prompt: UPBRINGING.prompt, options: UPBRINGING.options },
  { key: 'ageRange', type: 'pills', prompt: 'Age range', options: AGE_RANGES },
  { key: 'geography', type: 'pills', prompt: 'Where you live', options: GEOGRAPHIES },
  { key: 'region', type: 'pills', prompt: 'Your region', options: REGIONS },
  { key: 'regionGrewUp', type: 'pills', prompt: 'Region you grew up in', options: REGIONS },
  { key: 'note', type: 'text', prompt: DEMOGRAPHIC_OTHER_PROMPT },
]

function nextDemoStep(step: number, d: Demographics): number {
  let n = step + 1
  while (n < DEMO_STEPS.length) {
    if (!DEMO_STEPS[n].condition || DEMO_STEPS[n].condition!(d)) break
    n++
  }
  return n
}

function prevDemoStep(step: number, d: Demographics): number {
  let n = step - 1
  while (n >= 0) {
    if (!DEMO_STEPS[n].condition || DEMO_STEPS[n].condition!(d)) break
    n--
  }
  return Math.max(n, 0)
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

const mutedLinkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  cursor: 'pointer',
  padding: 0,
  textAlign: 'left',
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
    setDemographics,
    setSkipEasterEggs,
    resetQuiz,
  } = useQuizStore()
  const [phase, setPhase] = useState<Phase>('intro')

  // Transient per-question UI state
  const [pendingOption, setPendingOption] = useState<string | null>(null)
  const [followText, setFollowText] = useState('')
  const [interstitial, setInterstitial] = useState<Interstitial | null>(null)
  const [picks, setPicks] = useState<Dimension[]>([])
  const [dbPicks, setDbPicks] = useState<string[]>([])
  const [dbOther, setDbOther] = useState('')
  const [confirmingRetake, setConfirmingRetake] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  // How many easter-egg intermissions the user has seen this sitting. Drives the
  // "skip the rest" button, which appears once they're past the second egg.
  const [eggsSeen, setEggsSeen] = useState(0)

  // Post-quiz demographic module (all optional)
  const [demo, setDemo] = useState<Demographics>({})

  const layer = (session?.currentLayer ?? 1) as QuizLayer
  const questions = QUESTIONS_BY_LAYER[layer] ?? LAYER1_QUESTIONS
  const index = session?.currentQuestionIndex ?? 0
  const question = questions[index]
  const shuffled = useShuffledOptions(question ?? LAYER1_QUESTIONS[0])

  function clearTransient() {
    setPendingOption(null)
    setFollowText('')
  }

  // Has the user already answered the question now on screen? If so we're
  // revisiting via the Back link — pre-fill their prior answer so it shows as
  // selected. Answering still auto-advances, exactly like a fresh question.
  const storedAnswer = session?.answers.find((a) => a.questionId === question?.id)

  // Sync the transient selection to the question on screen: restore a prior
  // answer when revisiting, clear it when arriving at a fresh question.
  useEffect(() => {
    if (phase !== 'quiz') return
    if (storedAnswer) {
      setPendingOption(storedAnswer.optionId)
      setFollowText(storedAnswer.dependsText ?? '')
    } else {
      setPendingOption(null)
      setFollowText('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, phase])

  // Land at the top whenever the screen changes (phase or question), so payoff
  // screens and module transitions never drop you mid-page.
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }, [phase, index])

  function begin() {
    if (!session) { startSession(); setPhase('quiz'); return }

    const idx = session.currentQuestionIndex
    const l = (session.currentLayer ?? 1) as QuizLayer
    const qs = QUESTIONS_BY_LAYER[l] ?? LAYER1_QUESTIONS

    // Guard: all questions answered but transition not yet completed (jail fix)
    if (idx >= qs.length) {
      setPhase(l === 1 ? 'importance' : 'outro')
      return
    }

    // Past Layer 1 — skip the L1-flavored intro and jump to the right place
    if ((session.completedLayers ?? []).includes(1)) {
      setPhase(idx === 0 ? 'layerIntro' : 'quiz')
      return
    }

    setPhase('quiz')
  }

  function recompute(completed: QuizLayer[], topDims: Dimension[]) {
    const result = buildResult(LAYER1_QUESTIONS, session?.answers ?? [], topDims, completed)
    setResult(result)
    return result
  }

  // Record the answer and move on. If the question carries an easter egg — and
  // the user hasn't opted out — pause on an intermission first; otherwise
  // transition straight away. "It depends" always stores the user's free text.
  function finalizeAnswer(optId: string, text: string) {
    if (!question) return
    const opt = question.options.find((o) => o.id === optId)
    const isDepends = optId === IT_DEPENDS
    submitAnswer({
      questionId: question.id,
      optionId: optId,
      dependsText: isDepends || opt?.followUpPrompt ? text : undefined,
    })

    const wasLast = index + 1 >= questions.length
    const layerAtAnswer = layer
    clearTransient()

    if (question.easterEgg && !session?.skipEasterEggs) {
      const seen = eggsSeen + 1
      setEggsSeen(seen)
      track('Easter Egg Shown', { layer: layerAtAnswer, n: seen })
      setInterstitial({ egg: question.easterEgg, wasLast, layerAtAnswer })
      setPhase('interstitial')
    } else {
      runTransition(wasLast, layerAtAnswer)
    }
  }

  // Where to go after a question (or its intermission). Non-last questions just
  // fall through to the next one (the index already advanced on submit).
  function runTransition(wasLast: boolean, layerAtAnswer: QuizLayer) {
    if (!wasLast) {
      setPhase('quiz')
      return
    }
    if (layerAtAnswer === 1) {
      setPhase('importance')
    } else {
      const completed = [...(session?.completedLayers ?? []), layerAtAnswer]
      recompute(completed, session?.topDimensions ?? [])
      completeLayer(layerAtAnswer)
      setPhase('outro')
    }
  }

  function leaveInterstitial() {
    const it = interstitial
    setInterstitial(null)
    if (it) runTransition(it.wasLast, it.layerAtAnswer)
    else setPhase('quiz')
  }

  // Click an answer. Any single-answer pick advances immediately — fresh or a
  // revisit. Only options with their own follow-up field wait for input.
  function selectOption(optId: string) {
    const opt = question?.options.find((o) => o.id === optId)
    if (pendingOption !== optId) setFollowText('')
    setPendingOption(optId)
    if (!opt?.followUpPrompt) finalizeAnswer(optId, '')
  }

  function selectItDepends() {
    if (pendingOption !== IT_DEPENDS) setFollowText('')
    setPendingOption(IT_DEPENDS)
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
    setDemoStep(0)
    setPhase('demographics')
  }

  function finishDemographics(save: boolean, demoOverride?: Demographics) {
    const d = demoOverride ?? demo
    setDemographics(save ? { ...d, completed: true } : { completed: true })
    track(save ? 'Demographics Submitted' : 'Demographics Skipped')
    setPhase('done')
  }

  function restart() {
    resetQuiz()
    setPicks([])
    setDbPicks([])
    setDbOther('')
    setDemo({})
    setEggsSeen(0)
    setConfirmingRetake(false)
    clearTransient()
    setPhase('intro')
  }

  function retakeFromScratch() {
    resetQuiz()
    setPicks([])
    setDbPicks([])
    setDbOther('')
    setDemo({})
    setEggsSeen(0)
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

  // ── INTRO (Layer 1 welcome, or mid-quiz resume) ───────────────────────────
  if (phase === 'intro') {
    // Mid-quiz resume: user has completed L1 and is somewhere in L2–L4.
    // Show layer-appropriate copy instead of the L1 welcome screen.
    const midQuizResume = session && (session.completedLayers ?? []).includes(1)
    if (midQuizResume) {
      return (
        <Shell>
          <Kicker>Layer {layer} · {LAYER_LABELS[layer]}</Kicker>
          <LayerSubtitle>{LAYER_SUBTITLES[layer]}</LayerSubtitle>
          <H1>Pick up where you left off.</H1>
          {index > 0 && (
            <Body>Question {index + 1} of {questions.length} in Layer {layer}.</Body>
          )}
          <div style={{ marginTop: 'var(--space-8)' }}>
            <button style={primaryBtn} onClick={begin}>
              {index === 0 ? `Continue to Layer ${layer} →` : 'Resume →'}
            </button>
          </div>
          {confirmingRetake ? (
            <div style={{ ...card, marginTop: 'var(--space-6)', marginBottom: 0, cursor: 'default', borderColor: 'var(--color-red)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
                This deletes all your answers and starts over from Layer 1. Sure?
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button style={primaryBtn} onClick={restart}>Yes, start over</button>
                <button style={ghostBtn} onClick={() => setConfirmingRetake(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 'var(--space-5)' }}>
              <button onClick={() => setConfirmingRetake(true)} style={mutedLinkBtn}>
                Start over from scratch
              </button>
            </div>
          )}
        </Shell>
      )
    }

    return (
      <Shell>
        <Kicker>Layer 1 · {LAYER_LABELS[1]}</Kicker>
        <LayerSubtitle>{LAYER_SUBTITLES[1]}</LayerSubtitle>
        <H1>Find your bedrock.</H1>
        <Body>
          Most civic tools ask where you stand on the issues. We’re asking something different — and harder. We want to know how you <em>think</em>: the underlying values that drive your positions.
        </Body>
        <Body>
          Fourteen questions. About ten minutes. No wrong answers — only honest ones. Every question has an “It depends” option — it’s not a cop-out, it’s often the most accurate answer. Your nuance is the point.
        </Body>
        <div style={{ marginTop: 'var(--space-8)' }}>
          <button style={primaryBtn} onClick={begin}>
            {session && session.answers.length > 0 ? 'Resume →' : 'Begin →'}
          </button>
        </div>

        {/* Start over — for a partial session, so you can reset without the
            full-completion retake screen. Confirmed, since it wipes progress. */}
        {session && session.answers.length > 0 && (
          confirmingRetake ? (
            <div style={{ ...card, marginTop: 'var(--space-6)', marginBottom: 0, cursor: 'default', borderColor: 'var(--color-red)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
                This deletes your current answers and starts you at Question 1. Sure?
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button style={primaryBtn} onClick={restart}>Yes, start over</button>
                <button style={ghostBtn} onClick={() => setConfirmingRetake(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 'var(--space-5)' }}>
              <button onClick={() => setConfirmingRetake(true)} style={mutedLinkBtn}>
                Start over from scratch
              </button>
            </div>
          )
        )}
      </Shell>
    )
  }

  // ── LAYER INTRO (Layers 2–4) ──────────────────────────────────────────────
  if (phase === 'layerIntro' && (layer === 2 || layer === 3 || layer === 4)) {
    const intro = LAYER_INTRO[layer]
    return (
      <Shell>
        <Kicker>Layer {layer} · {LAYER_LABELS[layer]}</Kicker>
        <LayerSubtitle>{LAYER_SUBTITLES[layer]}</LayerSubtitle>
        <H1>{intro.heading}</H1>
        <Body>{intro.body}</Body>
        <div style={{ marginTop: 'var(--space-8)' }}>
          <button style={primaryBtn} onClick={() => setPhase(layer === 4 ? 'dealbreakers' : 'quiz')}>
            {layer === 4 ? 'Mark my dealbreakers →' : `Begin Layer ${layer} →`}
          </button>
        </div>
      </Shell>
    )
  }

  // ── REVEAL (after Layer 1) ────────────────────────────────────────────────
  if (phase === 'reveal' && session?.result) {
    return (
      <>
        <MantleReveal
          result={session.result}
          headerCta={
            <button style={primaryBtn} onClick={() => setPhase('layerIntro')}>
              Continue to Layer 2 →
            </button>
          }
        />
        <Shell>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3, var(--text-body-lg))', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
              This is your values foundation — about 40% of the full picture.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', maxWidth: 520, margin: '0 auto var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
              {LAYER_OUTRO[1].teaser}
            </p>
            <div style={{ textAlign: 'center' }}>
              <button style={primaryBtn} onClick={() => setPhase('layerIntro')}>
                Continue to Layer 2 →
              </button>
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
          <div style={{ marginTop: 'var(--space-4)' }}>
            <button
              onClick={() => {
                setTopDimensions(picks)
                recompute([1], picks)
                completeLayer(1)
                setPhase('layerIntro')
              }}
              style={mutedLinkBtn}
            >
              Skip for now — continue to Layer 2 →
            </button>
          </div>
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
        <LayerSubtitle>{LAYER_SUBTITLES[4]}</LayerSubtitle>
        <H2>{FRAMING}</H2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: 480, margin: '0 auto var(--space-2)' }}>
          Most people land on a handful. These are your true non-negotiables — not every position you mildly dislike. The more you check, the fewer candidates survive the filter.
        </p>
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

  // ── DEMOGRAPHIC MODULE — one question at a time stepper ──────────────────
  if (phase === 'demographics') {
    const stepDef = DEMO_STEPS[demoStep]

    // All steps exhausted — save and exit (shouldn't normally render)
    if (!stepDef) {
      finishDemographics(true)
      return null
    }

    // Visible steps change as partyRelationship is set (lineage conditional).
    // Compute progress based on visible steps only so the bar doesn't jump.
    const visibleSteps = DEMO_STEPS.filter((s) => !s.condition || s.condition(demo))
    const visibleIdx = visibleSteps.findIndex((s) => s.key === stepDef.key)
    const progress = ((visibleIdx + 0.5) / visibleSteps.length) * 100

    // Advance to the next active step, or finish if past the last one.
    function advanceDemoStep(updatedDemo: Demographics) {
      const next = nextDemoStep(demoStep, updatedDemo)
      if (next >= DEMO_STEPS.length) {
        finishDemographics(true, updatedDemo)
      } else {
        setDemoStep(next)
      }
    }

    const currentValue = (demo as Record<string, string | undefined>)[stepDef.key]

    return (
      <Shell>
        {/* Header: kicker + escape hatch */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <Kicker>{DEMOGRAPHIC_INTRO.kicker}</Kicker>
          <button onClick={() => finishDemographics(true)} style={mutedLinkBtn}>
            Skip remaining →
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-6)' }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--color-gold)', borderRadius: 'var(--radius-full)', transition: 'width 0.3s' }} />
        </div>

        {/* Back (not on first step) */}
        {demoStep > 0 && (
          <button
            onClick={() => setDemoStep(prevDemoStep(demoStep, demo))}
            style={{ ...mutedLinkBtn, display: 'block', marginBottom: 'var(--space-6)' }}
          >
            ← Back
          </button>
        )}

        {/* Intro blurb on first step only */}
        {demoStep === 0 && <Body>{DEMOGRAPHIC_INTRO.body}</Body>}

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3, var(--text-body-lg))', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-snug, 1.4)', marginBottom: 'var(--space-6)' }}>
          {stepDef.prompt}
        </h2>

        {/* Choice: full-width cards, auto-advance on tap */}
        {stepDef.type === 'choice' && stepDef.options?.map((o) => (
          <button
            key={o}
            onClick={() => {
              const updated: Demographics = { ...demo, [stepDef.key]: o }
              if (stepDef.key === 'partyRelationship' && !LINEAGE_TRIGGERS.includes(o)) {
                updated.lineage = undefined
              }
              setDemo(updated)
              advanceDemoStep(updated)
            }}
            style={{ ...card, borderColor: currentValue === o ? 'var(--color-blue-accent)' : 'var(--color-border)', backgroundColor: currentValue === o ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-surface)' }}
          >
            {o}
          </button>
        ))}

        {/* Pills: compact row, auto-advance on tap, skippable */}
        {stepDef.type === 'pills' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
              {stepDef.options?.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    const updated: Demographics = { ...demo, [stepDef.key]: o }
                    setDemo(updated)
                    advanceDemoStep(updated)
                  }}
                  style={{ ...card, width: 'auto', marginBottom: 0, padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-small)', borderColor: currentValue === o ? 'var(--color-gold)' : 'var(--color-border)', backgroundColor: currentValue === o ? 'rgba(200,169,110,0.08)' : 'var(--color-bg-surface)' }}
                >
                  {o}
                </button>
              ))}
            </div>
            <button onClick={() => advanceDemoStep(demo)} style={mutedLinkBtn}>
              Skip this question →
            </button>
          </>
        )}

        {/* Text: textarea, Enter or button to finish */}
        {stepDef.type === 'text' && (
          <>
            <textarea
              value={demo.note ?? ''}
              onChange={(e) => setDemo((d) => ({ ...d, note: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  finishDemographics(true)
                }
              }}
              rows={3}
              placeholder="Optional…"
              style={{ ...textarea, marginBottom: 'var(--space-3)' }}
              autoFocus
            />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
              Press Enter to continue · Shift+Enter for a new line
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <button style={primaryBtn} onClick={() => finishDemographics(true)}>Done → see my results</button>
              <button style={ghostBtn} onClick={() => finishDemographics(true)}>Skip this note</button>
            </div>
          </>
        )}
      </Shell>
    )
  }

  // ── INTERSTITIAL (between questions, when an easter egg is present) ───────
  if (phase === 'interstitial' && interstitial) {
    // The "skip the rest" escape hatch appears once the user is past their
    // second easter egg (i.e. on the third and beyond).
    const canSkip = eggsSeen >= 3
    return (
      <Shell>
        <FunFact>{interstitial.egg}</FunFact>
        <div style={{ marginTop: 'var(--space-8)', textAlign: 'right' }}>
          <button style={primaryBtn} onClick={leaveInterstitial}>
            {interstitial.wasLast ? 'Continue →' : 'Next question →'}
          </button>
        </div>
        <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setInterstitial(null); goBack(); setPhase('quiz') }}
            style={mutedLinkBtn}
          >
            ← Back to the question
          </button>
          {canSkip && (
            <button
              onClick={() => {
                track('Easter Eggs Skipped', { atEgg: eggsSeen })
                setSkipEasterEggs(true)
                leaveInterstitial()
              }}
              style={mutedLinkBtn}
            >
              Skip the rest of the “Did You Know” moments and focus on the quiz →
            </button>
          )}
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
  // "It depends" always opens a free-text box now; an option may also carry its
  // own follow-up field. Either way we collect text, never multiple-choice chips.
  const needsFollowText = isDepends || !!pickedOption?.followUpPrompt
  const followReady = !needsFollowText || followText.trim().length > 0
  const followPrompt = pickedOption?.followUpPrompt ?? question.dependsFollowUp.prompt
  // Authored prompt themes (formerly chips) become optional example hints under
  // the box — they help the user know what to write without forcing a choice.
  const followExamples = isDepends ? question.dependsFollowUp.choices ?? [] : []

  return (
    <Shell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <Kicker>
          Layer {layer} · Question {index + 1} of {questions.length}
        </Kicker>
        <button
          onClick={() => {
            clearTransient()
            if (index > 0) goBack()
            else setPhase(layer === 1 ? 'intro' : 'layerIntro')
          }}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', cursor: 'pointer', padding: 0 }}
        >
          ← Back
        </button>
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
            onClick={() => selectOption(opt.id)}
            style={{ ...card, borderColor: selected ? 'var(--color-blue-accent)' : 'var(--color-border)', backgroundColor: selected ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-surface)' }}
          >
            {opt.text}
          </button>
        )
      })}
      {hasItDepends && (
        <button
          onClick={selectItDepends}
          style={{ ...card, fontStyle: 'italic', color: 'var(--color-text-secondary)', borderColor: isDepends ? 'var(--color-blue-accent)' : 'var(--color-border)', backgroundColor: isDepends ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-surface)' }}
        >
          It depends…
        </button>
      )}

      {/* Follow-up: a free-text box for "It depends" or an option's own field.
          You can always say it in your own words. */}
      {needsFollowText && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: followExamples.length ? 'var(--space-2)' : 'var(--space-3)' }}>
            {followPrompt}
          </p>
          {followExamples.length > 0 && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-relaxed)' }}>
              For instance: {followExamples.join(' · ')}
            </p>
          )}
          <textarea
            value={followText}
            onChange={(e) => setFollowText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && followReady) {
                e.preventDefault()
                finalizeAnswer(picked!, followText)
              }
            }}
            rows={3}
            placeholder="A sentence or two…"
            style={textarea}
            autoFocus
          />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Press Enter to continue · Shift+Enter for a new line
          </p>
        </div>
      )}

      {/* A continue affordance only when a follow-up field still needs input.
          Every other answer advances the moment you click. */}
      {picked && needsFollowText && (
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'right' }}>
          <button
            style={{ ...primaryBtn, opacity: followReady ? 1 : 0.4, cursor: followReady ? 'pointer' : 'not-allowed' }}
            onClick={() => finalizeAnswer(picked, followText)}
            disabled={!followReady}
          >
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
function LayerSubtitle({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: '4px 0 0' }}>{children}</p>
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
// A set-apart "reward" box for the per-question easter eggs — visually distinct
// so it reads as a bonus aside, not another step.
function FunFact({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-5)', backgroundColor: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.28)', borderRadius: 'var(--radius-lg)' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span aria-hidden="true">✦</span> Did you know?
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
        {children}
      </p>
    </div>
  )
}
