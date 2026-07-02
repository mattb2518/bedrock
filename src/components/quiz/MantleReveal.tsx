'use client'

// The Civic Mantle reveal — named type + constellation + secondary affinities +
// the eight-dimension breakdown. Reused by the end of the quiz and /results.
// SPEC §4 (Results Architecture, reveal copy, edge cases).
//
// Animated on mount: header fades up, the constellation pops in slightly after,
// and each dimension bar's marker slides from center to its scored position.

import { useEffect, useState } from 'react'
import Constellation from '@/components/ui/Constellation'
import { DIMENSIONS, profileToRadar } from '@/lib/quiz/dimensions'
import { mantleFor, type Mantle } from '@/lib/quiz/mantles'
import type { DimensionalProfile, QuizResult } from '@/types/quiz'

function FlipCard({ mantle, large = false, flipped, onFlip }: { mantle: Mantle; large?: boolean; flipped: boolean; onFlip: () => void }) {
  const pad = large ? 'var(--space-8)' : 'var(--space-5)'
  const nameSize = large ? 'var(--text-h2)' : 'var(--text-body-lg)'
  const height = large ? 260 : 200
  const face: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    padding: pad,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    boxSizing: 'border-box',
  }
  return (
    <div onClick={onFlip} style={{ cursor: 'pointer', perspective: '1200px', height }} title={flipped ? 'Click to flip back' : 'Click to flip'}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.5s ease', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <div style={{ ...face, backgroundColor: 'var(--color-bg-surface)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: nameSize, color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', margin: 0 }}>{mantle.name}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 0 }}>{mantle.workingName}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: large ? 'var(--text-body-lg)' : 'var(--text-body)', color: 'var(--color-gold)', fontStyle: 'italic', lineHeight: 'var(--leading-relaxed)', margin: 0, flex: 1 }}>"{mantle.oneLiner}."</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', margin: 0, textAlign: 'right', opacity: 0.6 }}>flip to meet your forebear →</p>
        </div>
        <div style={{ ...face, backgroundColor: 'var(--color-bg-deep, #0f1f33)', transform: 'rotateY(180deg)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-micro)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', margin: 0 }}>
            An early {mantle.name.replace(/^The /, '')}
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: nameSize, color: 'var(--color-text-primary)', margin: 0, lineHeight: 'var(--leading-tight)' }}>{mantle.figure.name}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: large ? 'var(--text-body)' : 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0, flex: 1 }}>{mantle.figure.why}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', margin: 0, textAlign: 'right', opacity: 0.6 }}>← flip back</p>
        </div>
      </div>
    </div>
  )
}

// Centered-profile detection (SPEC §4 edge case 2): 6+ of 8 dims within ±15 of
// the midpoint. Provisional; near-pure/scattered detection comes with the real
// engine.
function isCentered(profile: DimensionalProfile): boolean {
  return DIMENSIONS.filter((d) => Math.abs(profile[d.key] - 50) <= 15).length >= 6
}

export default function MantleReveal({ result, headerCta, hideDimBreakdown = false }: { result: QuizResult; headerCta?: React.ReactNode; hideDimBreakdown?: boolean }) {
  const mantle = mantleFor(result.primaryType)
  const radar = profileToRadar(result.profile)
  const centered = isCentered(result.profile)
  const secondaries = result.secondaryTypes.slice(0, 2).map(mantleFor)

  const [shown, setShown] = useState(false)
  const [activeFlip, setActiveFlip] = useState<string | null>(null)
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const rise = (delay: number): React.CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  })

  const toggleFlip = (id: string) => setActiveFlip((cur) => (cur === id ? null : id))

  return (
    <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <p style={{ ...rise(0), fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
        Your Civic Mantle · {result.completionPercent}% mapped
      </p>

      {centered ? (
        <div style={rise(0.1)}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', textAlign: 'center', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-5)' }}>
            An unusually centered profile.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', maxWidth: 620, margin: '0 auto var(--space-8)', textAlign: 'center' }}>
            Across most of the eight dimensions, you sit close to the middle — you can see the case for both poles and don't reflexively favor either one. That's rarer than it sounds. We'll build your recommendations from the dimensions where you do lean.
          </p>
        </div>
      ) : (
        <div style={rise(0.1)}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', textAlign: 'center', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-6)' }}>
            You are
          </h1>
          <div style={{ maxWidth: 520, margin: '0 auto var(--space-8)' }}>
            <FlipCard mantle={mantle} large flipped={activeFlip === mantle.type} onFlip={() => toggleFlip(mantle.type)} />
          </div>
        </div>
      )}

      {/* Optional header CTA (e.g. “Continue to Layer 2”) so the next step is
          reachable above the fold, not only after scrolling the whole reveal. */}
      {headerCta && (
        <div style={{ ...rise(0.15), textAlign: 'center', marginBottom: 'var(--space-8)' }}>{headerCta}</div>
      )}

      {/* Constellation — pops in after the header */}
      <div style={{ opacity: shown ? 1 : 0, transform: shown ? 'scale(1)' : 'scale(0.92)', transition: 'opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s' }}>
        <Constellation scores={radar} size={400} />
      </div>

      {/* Secondary affinity cards */}
      {!centered && secondaries.length > 0 && (
        <div style={{ ...rise(0.55), marginTop: 'var(--space-8)', maxWidth: 560, marginInline: 'auto' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
            With strong affinities for
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: secondaries.length > 1 ? '1fr 1fr' : '1fr', gap: 'var(--space-3)' }}>
            {secondaries.map((s) => (
              <FlipCard key={s.type} mantle={s} flipped={activeFlip === s.type} onFlip={() => toggleFlip(s.type)} />
            ))}
          </div>
        </div>
      )}

      {/* Dimensional breakdown — collapsed by default; hidden on /results where it
          appears alongside the other profile sections below the reveal */}
      {!hideDimBreakdown && <DimAccordion result={result} shown={shown} rise={rise} />}
    </div>
  )
}

function DimAccordion({ result, shown, rise }: { result: QuizResult; shown: boolean; rise: (d: number) => React.CSSProperties }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ ...rise(0.65), marginTop: 'var(--space-10)', maxWidth: 560, marginInline: 'auto' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 var(--space-3)', borderBottom: '1px solid var(--color-border)' }}
      >
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase' }}>
          Your eight dimensions
        </span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>
      {open && (
        <div style={{ paddingTop: 'var(--space-5)' }}>
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
                  <div style={{ position: 'absolute', left: `${shown ? v : 50}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: 'var(--radius-full)', backgroundColor: isTop ? 'var(--color-gold)' : '#6B9FEA', boxShadow: isTop ? '0 0 8px rgba(200,169,110,0.6)' : 'none', transition: `left 0.8s cubic-bezier(0.22,1,0.36,1) ${0.7 + i * 0.05}s` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
