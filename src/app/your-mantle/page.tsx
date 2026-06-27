'use client'

// "Your Mantle" — the post-quiz payoff page (D5 Tier 2). Leads with the user's
// major mantle and two minors, then an interactive ten-box map: the major glows
// gold, the minors blue, the rest dim. Click any mantle to read it. Flows down
// to the four pillars via /results.

import { useState } from 'react'
import Link from 'next/link'
import { useQuizStore } from '@/store/quizStore'
import Constellation from '@/components/ui/Constellation'
import { MANTLES, mantleFor } from '@/lib/quiz/mantles'
import { profileToRadar } from '@/lib/quiz/dimensions'
import type { CivicType } from '@/types/quiz'

export default function YourMantlePage() {
  const session = useQuizStore((s) => s.session)
  const result = session?.result

  const major = result ? mantleFor(result.primaryType) : null
  const minors = (result?.secondaryTypes ?? []).slice(0, 2).map(mantleFor)
  const minorTypes = new Set(minors.map((m) => m.type))

  const [selected, setSelected] = useState<CivicType | null>(null)
  const active = selected ?? major?.type ?? null
  const activeMantle = active ? mantleFor(active) : null

  if (!result || !major) {
    return (
      <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-5)' }}>
          You don’t have a mantle yet.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
          Take Layer 1 of the quiz — about twelve minutes — and we’ll map the civic identity that’s already yours.
        </p>
        <Link href="/quiz" style={{ backgroundColor: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', textDecoration: 'none' }}>
          Find your mantle →
        </Link>
      </div>
    )
  }

  const roleOf = (type: CivicType): 'major' | 'minor' | 'other' =>
    type === major.type ? 'major' : minorTypes.has(type) ? 'minor' : 'other'

  return (
    <div style={{ maxWidth: 'var(--max-width-wide)', margin: '0 auto', padding: 'var(--space-16) var(--space-6) var(--space-20)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto var(--space-12)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Your Civic Mantle · {result.completionPercent}% mapped
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-4)' }}>
          You are {major.name}.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          {major.oneLiner}.
        </p>
        {minors.length > 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
            Your closest affinities: {minors.map((m) => m.name).join(' and ')}.
          </p>
        )}
      </div>

      {/* Interactive ten-box */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-micro)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-subtle)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 'var(--space-5)' }}>
        All ten mantles · yours lit up — tap any to read it
      </p>
      <div className="ym-grid">
        {MANTLES.map((m) => {
          const role = roleOf(m.type)
          const isActive = m.type === active
          const ring =
            role === 'major' ? 'var(--color-gold)' : role === 'minor' ? 'var(--color-blue-accent)' : 'var(--color-border)'
          return (
            <button
              key={m.type}
              onClick={() => setSelected(m.type)}
              className="ym-cell"
              style={{
                borderColor: isActive ? ring : 'transparent',
                opacity: role === 'other' ? 0.45 : 1,
                boxShadow: isActive ? `0 0 0 1px ${ring}` : 'none',
              }}
            >
              <Constellation scores={profileToRadar(m.profile)} size={140} showLabels={false} showGrid={false} viewBox="70 70 260 260" />
              <span className="ym-cell__label" style={{ color: role === 'other' ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
                {m.name}
              </span>
              {role !== 'other' && (
                <span className="ym-cell__tag" style={{ color: ring, borderColor: ring }}>
                  {role === 'major' ? 'Your mantle' : 'Affinity'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Detail panel for the selected mantle */}
      {activeMantle && (
        <div style={{ maxWidth: 560, margin: 'var(--space-10) auto 0', textAlign: 'center', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-micro)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
            {roleOf(activeMantle.type) === 'major' ? 'Your mantle' : roleOf(activeMantle.type) === 'minor' ? 'One of your affinities' : 'Another mantle'}
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
            {activeMantle.name}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            {activeMantle.oneLiner}.
          </p>
        </div>
      )}

      {/* Onward */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-12)' }}>
        <Link href="/results" style={{ backgroundColor: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', textDecoration: 'none' }}>
          See your full results →
        </Link>
        <Link href="/civic-mantle" style={{ backgroundColor: 'transparent', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-medium)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', textDecoration: 'none', border: '1px solid var(--color-border)' }}>
          What the mantles mean
        </Link>
      </div>

      <style>{`
        .ym-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--space-2) var(--space-1);
          max-width: 900px;
          margin: 0 auto;
        }
        .ym-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding: var(--space-3) var(--space-1) var(--space-2);
          border: 1px solid transparent;
          border-radius: var(--radius-lg);
          background: none;
          cursor: pointer;
          transition: var(--transition-base);
        }
        .ym-cell:hover { background-color: var(--color-bg-surface); }
        .ym-cell__label {
          font-family: var(--font-display);
          font-size: var(--text-small);
          font-weight: 700;
          text-align: center;
          line-height: var(--leading-snug);
          margin-top: -6px;
        }
        .ym-cell__tag {
          margin-top: var(--space-2);
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          border: 1px solid;
          border-radius: var(--radius-full);
          padding: 2px 8px;
        }
        @media (max-width: 900px) { .ym-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 560px) { .ym-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  )
}
