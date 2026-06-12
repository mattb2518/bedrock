// The Civic Mantle reveal — named type + constellation + secondary affinities +
// the eight-dimension breakdown. Reused by the end of the quiz and /results.
// SPEC §4 (Results Architecture, reveal copy, edge cases).

import Constellation from '@/components/ui/Constellation'
import { DIMENSIONS, profileToRadar } from '@/lib/quiz/dimensions'
import { mantleFor } from '@/lib/quiz/mantles'
import type { DimensionalProfile, QuizResult } from '@/types/quiz'

// Centered-profile detection (SPEC §4 edge case 2): 6+ of 8 dims within ±15 of
// the midpoint. Provisional; near-pure/scattered detection comes with the real
// engine.
function isCentered(profile: DimensionalProfile): boolean {
  const near = DIMENSIONS.filter((d) => Math.abs(profile[d.key] - 50) <= 15)
  return near.length >= 6
}

export default function MantleReveal({ result }: { result: QuizResult }) {
  const mantle = mantleFor(result.primaryType)
  const radar = profileToRadar(result.profile)
  const centered = isCentered(result.profile)
  const secondaries = result.secondaryTypes.slice(0, 2).map(mantleFor)

  return (
    <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
        Your Civic Mantle
      </p>

      {centered ? (
        <>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', textAlign: 'center', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-5)' }}>
            An unusually centered profile.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', maxWidth: 620, margin: '0 auto var(--space-8)', textAlign: 'center' }}>
            Across most of the eight dimensions, you sit close to the middle — you can see the case for both poles and don’t reflexively favor either one. That’s rarer than it sounds. We’ll build your recommendations from the dimensions where you do lean.
          </p>
        </>
      ) : (
        <>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', textAlign: 'center', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-4)' }}>
            You are {mantle.name}.
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3, var(--text-body-lg))', fontStyle: 'italic', color: 'var(--color-gold)', textAlign: 'center', marginBottom: 'var(--space-2)' }}>
            “{mantle.oneLiner}.”
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            {mantle.workingName}
            {secondaries.length > 0 && (
              <> · with strong affinities for {secondaries.map((s) => s.name).join(' and ')}</>
            )}
          </p>
        </>
      )}

      <Constellation scores={radar} size={400} />

      {/* Dimensional breakdown */}
      <div style={{ marginTop: 'var(--space-10)', maxWidth: 560, margin: 'var(--space-10) auto 0' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>
          Your eight dimensions
        </p>
        {DIMENSIONS.map((d) => {
          const v = result.profile[d.key]
          const isTop = result.topDimensions.includes(d.key)
          return (
            <div key={d.key} style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: v < 50 ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: v < 50 ? 'var(--weight-semibold)' : 'normal' }}>{d.poleA}</span>
                {isTop && (
                  <span style={{ color: 'var(--color-gold)', fontSize: 'var(--text-xs, 11px)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase' }}>most central</span>
                )}
                <span style={{ color: v > 50 ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: v > 50 ? 'var(--weight-semibold)' : 'normal' }}>{d.poleB}</span>
              </div>
              <div style={{ position: 'relative', height: 6, backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
                <div style={{ position: 'absolute', left: `${v}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: 'var(--radius-full)', backgroundColor: isTop ? 'var(--color-gold)' : '#6B9FEA' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
