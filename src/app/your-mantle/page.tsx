'use client'

// "Your Mantle" — the post-quiz payoff page. Leads with the user's major mantle
// as a large flip card (front: the mantle; back: the historical figure who
// embodies it), the two affinities as smaller flip cards beneath, then a visual
// ten-mantle map. Figures come from mantles.ts (single source of truth, shared
// with /civic-mantle).

import { useState } from 'react'
import Link from 'next/link'
import { useQuizStore } from '@/store/quizStore'
import { usePreviewStore } from '@/store/previewStore'
import Constellation from '@/components/ui/Constellation'
import { MANTLES, mantleFor, type Mantle } from '@/lib/quiz/mantles'
import { profileToRadar } from '@/lib/quiz/dimensions'

function FlipCard({ mantle, large = false, flipped, onFlip }: { mantle: Mantle; large?: boolean; flipped: boolean; onFlip: () => void }) {
  const pad = large ? 'var(--space-8)' : 'var(--space-5)'
  const nameSize = large ? 'var(--text-h2)' : 'var(--text-h4)'
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
        {/* Front — the mantle */}
        <div style={{ ...face, backgroundColor: 'var(--color-bg-surface)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: nameSize, color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', margin: 0 }}>{mantle.name}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 0 }}>{mantle.workingName}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: large ? 'var(--text-body-lg)' : 'var(--text-body)', color: 'var(--color-gold)', fontStyle: 'italic', lineHeight: 'var(--leading-relaxed)', margin: 0, flex: 1 }}>“{mantle.oneLiner}.”</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', margin: 0, textAlign: 'right', opacity: 0.6 }}>flip to meet your forebear →</p>
        </div>
        {/* Back — the figure */}
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

export default function YourMantlePage() {
  const session = useQuizStore((s) => s.session)
  const { mode, previewResult } = usePreviewStore()
  const result = mode !== 'myself' ? previewResult : (session?.result ?? null)

  const major = result ? mantleFor(result.primaryType) : null
  const minors = (result?.secondaryTypes ?? []).slice(0, 2).map(mantleFor)
  const minorTypes = new Set(minors.map((m) => m.type))
  const [activeFlip, setActiveFlip] = useState<string | null>(null)
  const toggleFlip = (id: string) => setActiveFlip((cur) => (cur === id ? null : id))

  if (!result || !major) {
    return (
      <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-5)' }}>
          You don't have a mantle yet.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
          Take Layer 1 of the quiz — about twelve minutes — and we'll map the civic identity that's already yours.
        </p>
        <Link href="/quiz" style={{ backgroundColor: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', textDecoration: 'none' }}>
          Find your mantle →
        </Link>
      </div>
    )
  }

  const roleOf = (type: string): 'major' | 'minor' | 'other' =>
    type === major.type ? 'major' : minorTypes.has(type as never) ? 'minor' : 'other'

  return (
    <div style={{ maxWidth: 'var(--max-width-wide)', margin: '0 auto', padding: 'var(--space-16) var(--space-6) var(--space-20)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto var(--space-10)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Your Civic Mantle · {result.completionPercent}% mapped
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-6)' }}>
          You are
        </h1>
      </div>

      {/* Major — large flip card */}
      <div style={{ maxWidth: 520, margin: '0 auto var(--space-8)' }}>
        <FlipCard mantle={major} large flipped={activeFlip === major.type} onFlip={() => toggleFlip(major.type)} />
      </div>

      {/* Affinities — smaller flip cards */}
      {minors.length > 0 && (
        <div style={{ maxWidth: 760, margin: '0 auto var(--space-16)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
            With strong affinities for
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: minors.length > 1 ? '1fr 1fr' : '1fr', gap: 'var(--space-4)' }} className="ym-affinities">
            {minors.map((m) => (
              <FlipCard key={m.type} mantle={m} flipped={activeFlip === m.type} onFlip={() => toggleFlip(m.type)} />
            ))}
          </div>
        </div>
      )}

      {/* All ten — visual map */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-micro)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-subtle)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 'var(--space-5)' }}>
        All ten mantles · yours lit up
      </p>
      <div className="ym-grid">
        {MANTLES.map((m) => {
          const role = roleOf(m.type)
          const ring = role === 'major' ? 'var(--color-gold)' : role === 'minor' ? 'var(--color-blue-accent)' : 'var(--color-border)'
          return (
            <div key={m.type} className="ym-cell" style={{ borderColor: role === 'other' ? 'transparent' : ring, opacity: role === 'other' ? 0.45 : 1 }}>
              <Constellation scores={profileToRadar(m.profile)} size={130} showLabels={false} showGrid={false} viewBox="70 70 260 260" />
              <span className="ym-cell__label" style={{ color: role === 'other' ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>{m.name}</span>
            </div>
          )
        })}
      </div>

      {/* Onward buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-12)', marginBottom: 'var(--space-16)' }}>
        <Link href="/results" style={{ backgroundColor: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', textDecoration: 'none' }}>
          See your full results →
        </Link>
        <Link href="/civic-mantle" style={{ backgroundColor: 'transparent', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-medium)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', borderRadius: 'var(--btn-radius)', textDecoration: 'none', border: '1px solid var(--color-border)' }}>
          Explore all ten
        </Link>
      </div>

      {/* Four pillars */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-12)' }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto var(--space-10)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            Now put it to work
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-4)' }}>
            Your mantle is the engine. Here's what it powers.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            Four tools built on your civic profile — personalized, sourced, and explained.
          </p>
        </div>
        <div className="ym-pillars">
          {[
            { href: '/your-ballot', title: 'Your Ballot', blurb: 'Every race matched to your values — president to school board.', accent: 'var(--color-red)' },
            { href: '/media-diet', title: 'Your Media Diet', blurb: 'Independent journalism matched to how you actually think.', accent: 'var(--color-white-warm)' },
            { href: '/conversations', title: 'Your Conversations', blurb: 'Claude-powered prep for hard conversations across difference.', accent: 'var(--color-blue-accent)' },
            { href: '/beyond-your-ballot', title: 'Beyond Your Ballot', blurb: "Candidates you can't vote for, but who'd shape the country.", accent: 'var(--color-rose)' },
          ].map((p) => (
            <Link key={p.href} href={p.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', borderTop: `3px solid ${p.accent}`, height: '100%', boxSizing: 'border-box' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>{p.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{p.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
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
          padding: var(--space-3) var(--space-1) var(--space-2);
          border: 1px solid transparent;
          border-radius: var(--radius-lg);
        }
        .ym-cell__label {
          font-family: var(--font-display);
          font-size: var(--text-small);
          font-weight: 700;
          text-align: center;
          line-height: var(--leading-snug);
          margin-top: -6px;
        }
        @media (max-width: 640px) { .ym-affinities { grid-template-columns: 1fr !important; } }
        @media (max-width: 900px) { .ym-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 560px) { .ym-grid { grid-template-columns: repeat(2, 1fr); } }
        .ym-pillars {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-auto-rows: 1fr;
          gap: var(--space-6);
          max-width: 760px;
          margin: 0 auto;
        }
        @media (max-width: 640px) { .ym-pillars { grid-template-columns: 1fr; grid-auto-rows: auto; } }
      `}</style>
    </div>
  )
}
