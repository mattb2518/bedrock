'use client'

// Homepage ghost-constellation teaser — SPEC §5 Homepage Teaser.
// Four quick questions (T1–T4) that sketch a partial constellation.
// Analytics only — does NOT feed the scoring engine and does NOT pre-fill Layer 1.
// Applies to PublicHome only.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Constellation from '@/components/ui/Constellation'

// ── Question data ─────────────────────────────────────────────────────────────

interface TeaserOption {
  id: string
  text: string
  axisIndex: number  // 0-7, radar axis index
  score: number      // 0-1 (maps to constellation axis)
}

interface TeaserQuestion {
  id: string
  text: string
  options: TeaserOption[]
  microReaction: string
}

// Axis indices (matching Constellation.tsx DIMENSION_AXES order):
// 0=Stability/Change, 1=Federal/Local, 2=National/Global, 3=Rules/Outcomes,
// 4=Markets/Governance, 5=Pragmatism/Idealism, 6=Individual/Collective, 7=Trust/Skepticism

const TEASER_QUESTIONS: TeaserQuestion[] = [
  {
    id: 'T1',
    text: 'A government agency releases a report that contradicts something you believed. Your first instinct?',
    microReaction: 'Noted. How you weigh evidence shapes more of your politics than any single issue does.',
    options: [
      { id: 'T1_A', text: 'Update my view — career experts with real data usually beat my hunches.', axisIndex: 7, score: 0.75 },
      { id: 'T1_B', text: "Check who funded it and what they'd gain before I move an inch.", axisIndex: 7, score: 0.25 },
      { id: 'T1_C', text: "Trust the data, not the press release — read past the summary, because the framing is where reports get bent.", axisIndex: 7, score: 0.55 },
      { id: 'T1_D', text: 'It depends', axisIndex: 7, score: 0.5 },
    ],
  },
  {
    id: 'T2',
    text: "When something in the country is clearly broken, it's better to...",
    microReaction: "Good. Pace-of-change instinct is one of the deepest dividers in American life — and it doesn't follow party lines.",
    options: [
      { id: 'T2_A', text: "Fix it fast, even imperfectly — waiting has costs too.", axisIndex: 0, score: 0.75 },
      { id: 'T2_B', text: "Move deliberately — quick fixes to complex systems usually break something else.", axisIndex: 0, score: 0.25 },
      { id: 'T2_C', text: "Pilot it small — let a few states or cities run the experiment before it goes national.", axisIndex: 0, score: 0.60 },
      { id: 'T2_D', text: 'It depends', axisIndex: 0, score: 0.5 },
    ],
  },
  {
    id: 'T3',
    text: 'What holds a free society together, most fundamentally?',
    microReaction: "That one goes back to the Founders — literally. They argued about it for an entire summer.",
    options: [
      { id: 'T3_A', text: "People free to run their own lives and make their own choices.", axisIndex: 6, score: 0.25 },
      { id: 'T3_B', text: "People willing to give something up for one another.", axisIndex: 6, score: 0.75 },
      { id: 'T3_C', text: "The layer in between — families, congregations, clubs, neighborhoods — doing what neither the individual nor the state can.", axisIndex: 6, score: 0.60 },
      { id: 'T3_D', text: 'It depends', axisIndex: 6, score: 0.5 },
    ],
  },
  {
    id: 'T4',
    text: "A deal passes that gets 60% of what you want and locks in 40% you dislike. That's...",
    microReaction: "The 60% question has broken more coalitions than any policy ever has.",
    options: [
      { id: 'T4_A', text: "A win. Sixty beats zero, and politics is the art of the next deal.", axisIndex: 5, score: 0.25 },
      { id: 'T4_B', text: "A trap. Locking in the bad 40% can cost more than waiting for a better hand.", axisIndex: 5, score: 0.75 },
      { id: 'T4_C', text: "Judged by direction, not percentage — does it bend things the right way over time?", axisIndex: 5, score: 0.45 },
      { id: 'T4_D', text: 'It depends', axisIndex: 5, score: 0.5 },
    ],
  },
]

// ── Shuffle helper (pins "It depends" last) ───────────────────────────────────

function shuffleOptions(options: TeaserOption[]): TeaserOption[] {
  const pinned = options.filter(o => o.text === 'It depends')
  const shuffleable = options.filter(o => o.text !== 'It depends')
  for (let i = shuffleable.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffleable[i], shuffleable[j]] = [shuffleable[j], shuffleable[i]]
  }
  return [...shuffleable, ...pinned]
}

// ── Ghost constellation scores ────────────────────────────────────────────────
// 8 axes; answered axes get the selected score, unanswered axes are null.

function buildGhostScores(answers: Record<string, TeaserOption>): (number | null)[] {
  const scores: (number | null)[] = Array(8).fill(null)
  Object.values(answers).forEach(opt => {
    scores[opt.axisIndex] = opt.score
  })
  return scores
}

// ── Ghost Constellation SVG ───────────────────────────────────────────────────

function GhostConstellation({ ghostScores }: { ghostScores: (number | null)[] }) {
  const cx = 200, cy = 200, r = 140
  const n = 8
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const angles = Array.from({ length: n }, (_, i) => (i * 360) / n - 90)
  const pt = (score: number, idx: number) => ({
    x: cx + score * r * Math.cos(toRad(angles[idx])),
    y: cy + score * r * Math.sin(toRad(angles[idx])),
  })

  // Build partial path using only answered axes; fill gaps with center point
  const filledScores = ghostScores.map(s => s ?? 0)
  const polyPoints = filledScores.map((s, i) => pt(s, i))
  const polyPath = polyPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

  const axisLabels = ["Stability", "Federal", "National", "Rules", "Markets", "Pragmatism", "Individual", "Trust"]

  return (
    <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 320, display: 'block', margin: '0 auto' }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(ring => {
        const pts = Array.from({ length: n }, (_, i) => pt(ring, i))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={ring} d={path} fill="none" stroke="var(--color-border)" strokeWidth="1" opacity="0.4" />
      })}

      {/* Axis spokes */}
      {Array.from({ length: n }, (_, i) => {
        const outer = pt(1, i)
        const isAnswered = ghostScores[i] !== null
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)}
              stroke={isAnswered ? 'var(--color-blue-accent)' : 'var(--color-border)'}
              strokeWidth="1" opacity={isAnswered ? 0.6 : 0.3} />
            <text x={outer.x + (outer.x - cx) * 0.12} y={outer.y + (outer.y - cy) * 0.12}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="10" fontFamily="var(--font-body)"
              fill={isAnswered ? 'var(--color-text-secondary)' : 'var(--color-text-muted)'}
              opacity={isAnswered ? 0.9 : 0.4}>
              {axisLabels[i]}
            </text>
          </g>
        )
      })}

      {/* Ghost fill — dashed stroke, low opacity */}
      <path d={polyPath}
        fill="var(--color-blue-accent)" fillOpacity="0.12"
        stroke="var(--color-blue-accent)" strokeWidth="1.5"
        strokeDasharray="4 3" opacity="0.6" />
    </svg>
  )
}

// ── Main HomeTeaser component ─────────────────────────────────────────────────

export default function HomeTeaser() {
  const [step, setStep] = useState<number>(0) // 0=opening, 1-4=questions, 5=reveal
  const [answers, setAnswers] = useState<Record<string, TeaserOption>>({})
  const [reaction, setReaction] = useState<string | null>(null)
  const [shuffled, setShuffled] = useState<TeaserOption[][]>([])

  // Shuffle options on mount
  useEffect(() => {
    setShuffled(TEASER_QUESTIONS.map(q => shuffleOptions(q.options)))
  }, [])

  function handleAnswer(qIdx: number, option: TeaserOption) {
    const q = TEASER_QUESTIONS[qIdx]
    setAnswers(prev => ({ ...prev, [q.id]: option }))
    setReaction(q.microReaction)
  }

  function advance() {
    setReaction(null)
    setStep(s => s + 1)
  }

  // Persist to sessionStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        sessionStorage.setItem('bedrock_teaser_responses', JSON.stringify(
          Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, { optionId: v.id, axisIndex: v.axisIndex, score: v.score }]))
        ))
      } catch { /* ignore */ }
    }
  }, [answers])

  const ghostScores = buildGhostScores(answers)
  const answeredCount = Object.keys(answers).length

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    textAlign: 'left',
    width: '100%',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-body)',
    color: 'var(--color-text-primary)',
    lineHeight: 'var(--leading-relaxed)',
    marginBottom: 'var(--space-3)',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  }

  const container: React.CSSProperties = {
    maxWidth: 540,
    margin: '0 auto',
    padding: 'var(--space-8) var(--space-6)',
  }

  if (shuffled.length === 0) return null

  return (
    <section style={{ backgroundColor: 'var(--color-bg-section)', padding: 'var(--space-16) var(--space-6)' }}>
      <div style={container}>
        {/* Skip link — always visible */}
        <div style={{ textAlign: 'right', marginBottom: 'var(--space-4)' }}>
          <Link href="/quiz" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Skip to the full quiz →
          </Link>
        </div>

        {/* Opening */}
        {step === 0 && (
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
              Quick sketch
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-5)' }}>
              What kind of voter are you — underneath the noise?
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
              Four quick questions to sketch it.
            </p>
            <button
              onClick={() => setStep(1)}
              style={{ display: 'inline-block', backgroundColor: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--btn-radius)', border: 'none', cursor: 'pointer' }}
            >
              Start →
            </button>
          </div>
        )}

        {/* Questions 1–4 */}
        {step >= 1 && step <= 4 && (
          <div>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: i <= answeredCount ? 'var(--color-blue-accent)' : 'var(--color-border)' }} />
              ))}
            </div>

            {reaction ? (
              // Micro-reaction — click anywhere to advance
              <div
                onClick={advance}
                style={{ cursor: 'pointer', padding: 'var(--space-6) 0' }}
              >
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-gold)', fontStyle: 'italic', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
                  {reaction}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
                  {step < 4 ? 'Tap to continue →' : 'Tap to see your sketch →'}
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                  Question {step} of 4
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-5)', fontWeight: 'var(--weight-medium)' }}>
                  {TEASER_QUESTIONS[step - 1].text}
                </p>
                <div>
                  {shuffled[step - 1].map(opt => (
                    <button
                      key={opt.id}
                      style={cardStyle}
                      onClick={() => {
                        handleAnswer(step - 1, opt)
                        // If last question, go directly to reveal after reaction
                      }}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Ghost constellation reveal */}
        {step === 5 && (
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
              Your sketch
            </p>
            <GhostConstellation ghostScores={ghostScores} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)', fontStyle: 'italic' }}>
              A sketch, not a reading.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              Your full constellation — and your Civic Mantle — takes fifteen questions and about ten minutes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'center' }}>
              <Link href="/quiz"
                style={{ display: 'inline-block', backgroundColor: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--btn-radius)', textDecoration: 'none' }}>
                Finish your constellation →
              </Link>
              <Link href="/methodology"
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                How this works
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
