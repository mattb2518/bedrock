'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const TOUR_KEY = 'bedrock_tour_seen'

// ── Slide content ─────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'mission',
    headline: "You're not red. You're not blue.",
    subhead: "You're more complicated than that — and so is your vote.",
    body: "Bedrock is a civic identity platform for independent-minded voters. One values quiz. Four tools to help you understand what you actually believe, vote it, read it, talk about it, and fund it.",
    accent: 'var(--color-blue)',
  },
  {
    id: 'quiz',
    headline: "It starts with how you think — not where you stand.",
    subhead: "Most civic tools ask about issues. We ask about values.",
    body: "20 questions. About 12 minutes. No wrong answers — only honest ones.",
    accent: 'var(--color-gold)',
    hasQuizCard: true,
  },
  {
    id: 'ballot',
    headline: "Your Ballot",
    subhead: "Every race. Matched to your values.",
    body: "Personalized ballot recommendations from president to school board — including the downballot races that shape your daily life and are hardest to research on your own. Candidate data is actively maintained and growing — coverage expands as we approach each election.",
    accent: 'var(--color-red)',
    pill: 'Action 1',
  },
  {
    id: 'byb',
    headline: "Beyond Your Ballot",
    subhead: "Your values, applied beyond your district.",
    body: "Find candidates outside your own district who match your values and are running in races where your support could actually shift the balance of power. Donate. Get involved. Think nationally.",
    accent: 'var(--color-rose)',
    pill: 'Action 2',
  },
  {
    id: 'media',
    headline: "Your Media Diet",
    subhead: "Independent journalism, matched to how you think.",
    body: "Not an echo chamber. Not a fire hose. A curated shortlist of journalists, Substacks, and podcasts — in three tiers: what confirms your thinking, what expands it, and what challenges it. Every source bias-checked against our eight-dimension framework. Plus the Article Bias Checker — paste any link or text and see exactly what it's doing to your thinking, mapped to your specific profile.",
    accent: 'var(--color-blue)',
    pill: 'Action 3',
  },
  {
    id: 'conversations',
    headline: "Your Conversations",
    subhead: "Talk across difference without losing your mind.",
    body: "A Claude-powered tool for preparing and navigating hard civic conversations — with family, colleagues, anyone. Uses your actual profile as context. Not a debate coach. A thinking partner.",
    accent: 'var(--color-gold)',
    pill: 'Action 4',
  },
]

// ── Quiz card (slide 2 only) ──────────────────────────────────────────────────

function QuizCard() {
  const options = [
    "Let markets work — intervention usually makes things worse",
    "Intervene when the stakes are high enough — markets have blind spots",
    "Depends on the domain — I don't apply one rule everywhere",
  ]
  return (
    <div style={{ margin: 'var(--space-4) 0' }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        fontWeight: 'var(--weight-semibold)',
        color: 'var(--color-text-subtle)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 'var(--space-2)',
      }}>
        Example question
      </p>
      <div style={{
        position: 'relative',
        background: 'var(--color-bg-input)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        opacity: 0.75,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-primary)',
          lineHeight: 1.5,
          marginBottom: 'var(--space-4)',
        }}>
          When government and markets point in different directions, your instinct is to:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {options.map((opt, i) => (
            <div key={i} style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-bg-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-secondary)',
              cursor: 'default',
            }}>
              {opt}
            </div>
          ))}
        </div>
        {/* Preview watermark */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '28px',
            fontWeight: 'var(--weight-bold)',
            color: 'rgba(255,255,255,0.08)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            transform: 'rotate(-20deg)',
            userSelect: 'none',
          }}>
            Preview
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Slide renderer ────────────────────────────────────────────────────────────

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const touchStartX = useRef<number | null>(null)
  const total = SLIDES.length

  useEffect(() => {
    try {
      if (!localStorage.getItem(TOUR_KEY)) setVisible(true)
    } catch { /* storage blocked */ }
  }, [])

  const dismiss = useCallback(() => {
    try { localStorage.setItem(TOUR_KEY, 'true') } catch { /* storage blocked */ }
    setVisible(false)
  }, [])

  const go = useCallback((next: number) => {
    setDirection(next > index ? 1 : -1)
    setIndex(next)
  }, [index])

  const advance = useCallback(() => {
    if (index < total - 1) go(index + 1)
    else dismiss()
  }, [index, total, go, dismiss])

  const retreat = useCallback(() => {
    if (index > 0) go(index - 1)
  }, [index, go])

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') advance()
      if (e.key === 'ArrowLeft') retreat()
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, advance, retreat, dismiss])

  // Touch / swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) delta > 0 ? advance() : retreat()
    touchStartX.current = null
  }

  if (!visible) return null

  const slide = SLIDES[index]
  const isLast = index === total - 1

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10, 18, 30, 0.82)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      {/* Modal */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'relative',
          width: '100%', maxWidth: 560,
          background: 'var(--color-bg-surface)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          minHeight: 400,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Accent bar */}
        <div style={{ height: 3, background: slide.accent, transition: 'background 0.4s ease' }} />

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Close tour"
          style={{
            position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)',
            background: 'rgba(255,255,255,0.07)', border: 'none',
            color: 'var(--color-text-muted)', cursor: 'pointer',
            width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, lineHeight: 1, zIndex: 10,
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'
          }}
        >
          ×
        </button>

        {/* Slide content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={slide.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ padding: 'var(--space-8) var(--space-8) var(--space-6)' }}
            >
              {slide.pill && (
                <p style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  fontWeight: 'var(--weight-semibold)',
                  color: slide.accent,
                  background: `color-mix(in srgb, ${slide.accent} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${slide.accent} 30%, transparent)`,
                  borderRadius: 4,
                  padding: '2px 8px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-3)',
                }}>
                  {slide.pill}
                </p>
              )}

              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 4vw, 26px)',
                fontWeight: 400,
                color: 'var(--color-text-primary)',
                lineHeight: 1.25,
                marginBottom: 'var(--space-3)',
                paddingRight: 'var(--space-8)',
              }}>
                {slide.headline}
              </h2>

              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                fontWeight: 'var(--weight-medium)',
                color: slide.accent,
                marginBottom: 'var(--space-4)',
                lineHeight: 1.5,
              }}>
                {slide.subhead}
              </p>

              {slide.hasQuizCard && (
                <>
                  <QuizCard />
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(15px, 3.5vw, 18px)',
                    color: slide.accent,
                    textAlign: 'center',
                    lineHeight: 1.4,
                    fontStyle: 'italic',
                    margin: 'var(--space-4) 0 var(--space-3)',
                  }}>
                    Then your identity map drives four civic actions.
                  </p>
                </>
              )}

              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
              }}>
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: dots + nav */}
        <div style={{
          padding: 'var(--space-5) var(--space-8)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}>
          {/* Back arrow */}
          <button
            onClick={retreat}
            disabled={index === 0}
            aria-label="Previous slide"
            style={{
              background: 'none', border: 'none',
              color: index === 0 ? 'var(--color-text-subtle)' : 'var(--color-text-secondary)',
              cursor: index === 0 ? 'default' : 'pointer',
              fontSize: 20, lineHeight: 1, padding: 'var(--space-1)',
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
          >
            ←
          </button>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === index ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === index ? slide.accent : 'rgba(255,255,255,0.2)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>

          {/* Next / Let's go */}
          <button
            onClick={advance}
            style={{
              background: slide.accent,
              color: isLast ? 'var(--color-bg-page)' : 'var(--color-text-inverse)',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 'var(--weight-semibold)',
              fontSize: 'var(--text-small)',
              padding: '8px 18px',
              borderRadius: 'var(--btn-radius)',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {isLast ? "Let's go" : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
