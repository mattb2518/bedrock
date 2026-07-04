'use client'

// Interlayer unlock screen — shown after each layer's final question.
// SPEC §5 Interlayer Unlock Screens.
//
// Three stacked elements:
//   1. Unlock card: "Unlocked: [Pillar]" with payoff line
//   2. Templated "what we've learned" summary (pure function of scores, no API)
//   3. Forward tease with Keep going / Explore buttons

import { useMemo } from 'react'
import type { DimensionalProfile } from '@/types/quiz'
import { DIMENSIONS } from '@/lib/quiz/dimensions'
import type { PillarOneMode } from '@/lib/config/pillarOne'
import { PILLAR_ONE } from '@/lib/config/pillarOne'

interface Props {
  layer: 1 | 2 | 3
  profile: DimensionalProfile
  layer2Count?: number // number of L2 questions answered (for L2 summary)
  pillarOneMode: PillarOneMode
  onKeepGoing: () => void
  onExploreUnlocked: () => void
}

// Returns the dominant pole label for a dimension given its score
function poleLabel(dim: string, score: number): string {
  const meta = DIMENSIONS.find(d => d.key === dim)!
  return score < 50 ? meta.poleA : meta.poleB
}

// Templated "what we've learned" summary (pure function of profile)
function buildSummary(layer: 1 | 2 | 3, profile: DimensionalProfile, layer2Count: number, tileTitle: string): string {
  if (layer === 1) {
    const deviations = DIMENSIONS.map(d => ({
      key: d.key,
      deviation: Math.abs(profile[d.key] - 50),
      poleLabel: poleLabel(d.key, profile[d.key]),
      oppLabel: profile[d.key] < 50 ? d.poleB : d.poleA,
    })).sort((a, b) => b.deviation - a.deviation)

    const top2 = deviations.slice(0, 2)
    if (top2[0].deviation > 10 && top2[1].deviation > 10) {
      return `So far: you lean ${top2[0].poleLabel} over ${top2[0].oppLabel}, and ${top2[1].poleLabel} over ${top2[1].oppLabel}. That combination is rarer than you'd think — and it shapes every recommendation from here.`
    }
    return "So far: you sit closer to the middle than most — which is itself a signature. The next layer is where it sharpens."
  }

  if (layer === 2) {
    return `Your values now have positions attached — ${layer2Count} issues mapped. Your matches just got sharper.`
  }

  // layer === 3
  return `We now know not just what you believe, but what actually moves your vote. ${tileTitle} is live.`
}

interface UnlockCardDef {
  pillarName: string
  payoff: string
  accentColor: string
}

const UNLOCK_CARDS: Record<1 | 2 | 3, (p1: { tileTitle: string; tileBlurb: string; navLabel: string; eyebrow: string; h1: string }) => UnlockCardDef[]> = {
  1: () => [
    { pillarName: 'Your Civic Mantle', payoff: 'Your named identity + constellation — the fingerprint of how you think.', accentColor: 'var(--color-gold)' },
    { pillarName: 'Your Conversations', payoff: 'Claude-powered prep for difficult conversations across difference.', accentColor: 'var(--color-blue-accent)' },
  ],
  2: () => [
    { pillarName: 'Your Media Diet', payoff: 'Independent journalism matched to how you actually think — in three tiers.', accentColor: 'var(--color-white-warm)' },
  ],
  3: (p1) => [
    { pillarName: p1.tileTitle, payoff: p1.tileBlurb, accentColor: 'var(--color-red)' },
    { pillarName: 'Beyond Your Ballot', payoff: 'Candidates outside your district matched to your values.', accentColor: 'var(--color-rose)' },
  ],
}

const FORWARD_TEASE: Record<1 | 2 | 3, (tileTitle: string, completionPct: number) => string> = {
  1: (_t, pct) => `Layer 2 — about 4 minutes — unlocks Your Media Diet. You're ${pct}% mapped.`,
  2: (_t, pct) => `Layer 3 — about 5 minutes — unlocks Your Ballot tools and Beyond Your Ballot. You're ${pct}% mapped.`,
  3: (t, pct) => `Layer 4 — the dealbreaker checklist — gives ${t} its edge. You're ${pct}% mapped.`,
}

export default function InterlayerUnlockScreen({ layer, profile, layer2Count = 9, pillarOneMode, onKeepGoing, onExploreUnlocked }: Props) {
  const p1 = PILLAR_ONE[pillarOneMode]
  const cards = useMemo(() => UNLOCK_CARDS[layer](p1), [layer, p1])
  const summary = useMemo(() => buildSummary(layer, profile, layer2Count, p1.tileTitle), [layer, profile, layer2Count, p1.tileTitle])

  // completionPercent by layer
  const pct = layer === 1 ? 40 : layer === 2 ? 65 : 85
  const tease = FORWARD_TEASE[layer](p1.tileTitle, pct)

  const shell: React.CSSProperties = {
    maxWidth: 560,
    margin: '0 auto',
    padding: 'var(--space-10) var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)',
  }

  const card: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5)',
  }

  return (
    <div style={shell}>
      {/* 1. Unlock cards */}
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
          {cards.length > 1 ? 'Unlocked' : 'Unlocked'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {cards.map((c) => (
            <div key={c.pillarName} style={{ ...card, borderLeft: `3px solid ${c.accentColor}` }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                {c.pillarName}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
                {c.payoff}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. What we've learned */}
      <div style={{ ...card, backgroundColor: 'var(--color-bg-deep, #0f1f33)', borderColor: 'transparent' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', fontStyle: 'italic', margin: 0 }}>
          &ldquo;{summary}&rdquo;
        </p>
      </div>

      {/* 3. Forward tease */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-5)' }}>
          {tease}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onKeepGoing}
            style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--btn-radius)', backgroundColor: 'var(--color-red)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Keep going →
          </button>
          <button
            onClick={onExploreUnlocked}
            style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-body)', padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--btn-radius)', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
          >
            Explore what you've unlocked
          </button>
        </div>
      </div>
    </div>
  )
}
