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
import { mantleFor } from '@/lib/quiz/mantles'
import type { DimensionalProfile, QuizResult } from '@/types/quiz'

// Centered-profile detection (SPEC §4 edge case 2): 6+ of 8 dims within ±15 of
// the midpoint. Provisional; near-pure/scattered detection comes with the real
// engine.
function isCentered(profile: DimensionalProfile): boolean {
  return DIMENSIONS.filter((d) => Math.abs(profile[d.key] - 50) <= 15).length >= 6
}

export default function MantleReveal({ result }: { result: QuizResult }) {
  const mantle = mantleFor(result.primaryType)
  const radar = profileToRadar(result.profile)
  const centered = isCentered(result.profile)
  const secondaries = result.secondaryTypes.slice(0, 2).map(mantleFor)

  const [shown, setShown] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const rise = (delay: number): React.CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  })

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
            Across most of the eight dimensions, you sit close to the middle — you can see the case for both poles and don’t reflexively favor either one. That’s rarer than it sounds. We’ll build your recommendations from the dimensions where you do lean.
          </p>
        </div>
      ) : (
        <div style={rise(0.1)}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', textAlign: 'center', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-4)' }}>
            You are {mantle.name}.
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3, var(--text-body-lg))', fontStyle: 'italic', color: 'var(--color-gold)', textAlign: 'center', marginBottom: 'var(--space-2)' }}>
            “{mantle.oneLiner}.”
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            {mantle.workingName}
          </p>
        </div>
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
              <div key={s.type} style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>{s.name}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', fontStyle: 'italic', lineHeight: 'var(--leading-relaxed)' }}>“{s.oneLiner}.”</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dimensional breakdown */}
      <div style={{ ...rise(0.65), marginTop: 'var(--space-10)', maxWidth: 560, marginInline: 'auto' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>
          Your eight dimensions
        </p>
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
                {/* center tick */}
                <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1, backgroundColor: 'var(--color-border-strong)' }} />
                {/* marker animates from center to value */}
                <div style={{ position: 'absolute', left: `${shown ? v : 50}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: 'var(--radius-full)', backgroundColor: isTop ? 'var(--color-gold)' : '#6B9FEA', boxShadow: isTop ? '0 0 8px rgba(200,169,110,0.6)' : 'none', transition: `left 0.8s cubic-bezier(0.22,1,0.36,1) ${0.7 + i * 0.05}s` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
