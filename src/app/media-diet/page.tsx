'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { loadProfile } from '@/lib/quiz/sync'
import { matchMedia } from '@/lib/engine/mediaMatch'
import { buildMediaMatchKey } from '@/lib/engine/buildMediaMatchKey'
import { mantleFor } from '@/lib/quiz/mantles'
import { DIMENSIONS, poleLabel } from '@/lib/quiz/dimensions'
import type { MediaMatchResult, ScoredMediaSource, MediaTier } from '@/lib/engine/mediaMatch'
import type { MediaSource } from '@/lib/engine/mediaMatch'
import type { BlurbsResult, BlurbsRequest } from '@/app/api/media-blurbs/route'
import type { Dimension, DimensionalProfile } from '@/types/quiz'

// ── Constants ─────────────────────────────────────────────────────────────────

const THIN_TIER_MIN = 2

const FEEDBACK_CHIPS = [
  'I already read this',
  'Not my level',
  "Don't trust this source",
  'Good suggestion',
  'Wrong fit for me',
]

const TIERS: MediaTier[] = ['confirming', 'expanding', 'challenging']

const TIER_META: Record<MediaTier, { label: string; description: string; color: string }> = {
  confirming:  { label: 'Confirming',  color: 'var(--color-blue-accent)', description: 'Deepen what you know. Sources that align with how you see the world and cover it rigorously.' },
  expanding:   { label: 'Expanding',   color: '#16a34a',                  description: 'Expand how you think. Sources that cover ground your current diet misses.' },
  challenging: { label: 'Challenging', color: '#d97706',                  description: 'Challenge you where it counts. The best honest case against your strongest views. The most important tier.' },
}

// ── Lean label (no [P]) ───────────────────────────────────────────────────────

function formatLean(coarseLean: string): string {
  return coarseLean
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ── Feedback component ────────────────────────────────────────────────────────

function FeedbackButtons({
  source,
  tier,
  userMantleType,
  userCompletionPercent,
}: {
  source: MediaSource
  tier: MediaTier
  userMantleType: string | null
  userCompletionPercent: number
}) {
  const [thumbsState, setThumbsState] = useState<'up' | 'down' | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [freeText, setFreeText] = useState('')
  const [chips, setChips] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  function toggleChip(chip: string) {
    setChips((prev) => prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip])
  }

  async function submitFeedback(type: 'thumbs_up' | 'thumbs_down', extraFreeText?: string, extraChips?: string[]) {
    await fetch('/api/media-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: source.id,
        tier,
        feedbackType: type,
        freeText: extraFreeText ?? null,
        chipsSelected: extraChips ?? [],
        dimensionCoverageTags: Object.keys(source.dimensionCoverage),
        userMantleType,
        userCompletionPercent,
      }),
    })
    setSubmitted(true)
  }

  function handleThumbsUp() {
    setThumbsState('up')
    submitFeedback('thumbs_up')
  }

  function handleThumbsDown() {
    setThumbsState('down')
    setExpanded(true)
  }

  async function handleDownSubmit() {
    await submitFeedback('thumbs_down', freeText || undefined, chips)
    setExpanded(false)
  }

  if (submitted && thumbsState === 'up') {
    return <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Thanks!</span>
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <button onClick={handleThumbsUp} aria-label="Thumbs up"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: thumbsState === 'down' ? 0.4 : 1 }}>👍</button>
        <button onClick={handleThumbsDown} aria-label="Thumbs down"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: thumbsState === 'up' ? 0.4 : 1 }}>👎</button>
      </div>

      {expanded && !submitted && (
        <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-surface)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
            {FEEDBACK_CHIPS.map((chip) => (
              <button key={chip} onClick={() => toggleChip(chip)}
                style={{ fontFamily: 'var(--font-body)', fontSize: '12px', padding: '2px 8px', borderRadius: 99, border: `1px solid ${chips.includes(chip) ? 'var(--color-blue-accent)' : 'var(--color-border)'}`, backgroundColor: chips.includes(chip) ? 'var(--color-blue-accent)' : 'transparent', color: chips.includes(chip) ? '#fff' : 'var(--color-text-secondary)', cursor: 'pointer' }}>
                {chip}
              </button>
            ))}
          </div>
          <textarea value={freeText} onChange={(e) => setFreeText(e.target.value)}
            placeholder="Tell us more (optional)…" rows={2}
            style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: '12px', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)', resize: 'none', boxSizing: 'border-box', marginBottom: 'var(--space-2)' }} />
          <button onClick={handleDownSubmit}
            style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 'var(--weight-semibold)', padding: '4px 12px', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'var(--color-blue-accent)', color: '#fff', cursor: 'pointer' }}>
            Send
          </button>
          {' '}
          <button onClick={() => setExpanded(false)}
            style={{ fontFamily: 'var(--font-body)', fontSize: '12px', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      )}

      {submitted && thumbsState === 'down' && (
        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Thanks for the feedback.</p>
      )}
    </div>
  )
}

// ── Source card ───────────────────────────────────────────────────────────────

function SourceCard({
  scored,
  tier,
  userMantleType,
  userCompletionPercent,
  oneLiner,
}: {
  scored: ScoredMediaSource
  tier: MediaTier
  userMantleType: string | null
  userCompletionPercent: number
  oneLiner?: string
}) {
  const { source } = scored

  return (
    <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <a href={source.url} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', textDecoration: 'none' }}>
          {source.name} ↗
        </a>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
          {source.formats.join(' · ')}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', padding: '1px 8px', borderRadius: 99, backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
          {formatLean(source.coarseLean)}
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <FeedbackButtons source={source} tier={tier} userMantleType={userMantleType} userCompletionPercent={userCompletionPercent} />
        </div>
      </div>
      {/* Description */}
      <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
        {source.attribution}
      </p>
      {/* Claude one-liner */}
      {oneLiner && (
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: '1.5', fontStyle: 'italic' }}>
          {oneLiner}
        </p>
      )}
    </div>
  )
}

// ── Tab nav (switches view, no scroll-spy) ────────────────────────────────────

function TierTabNav({
  active,
  onChange,
}: {
  active: MediaTier
  onChange: (tier: MediaTier) => void
}) {
  return (
    <div style={{
      position: 'sticky',
      top: 'var(--nav-height)',
      zIndex: 10,
      backgroundColor: 'var(--color-bg-page)',
      borderBottom: '1px solid var(--color-border)',
      marginBottom: 'var(--space-6)',
      marginLeft: 'calc(-1 * var(--space-4))',
      marginRight: 'calc(-1 * var(--space-4))',
      paddingLeft: 'var(--space-4)',
      paddingRight: 'var(--space-4)',
    }}>
      <div style={{ display: 'flex', gap: 'var(--space-1)', padding: 'var(--space-2) 0' }}>
        {TIERS.map((tier) => {
          const isActive = active === tier
          const color = TIER_META[tier].color
          return (
            <button
              key={tier}
              onClick={() => onChange(tier)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                color: isActive ? color : 'var(--color-text-secondary)',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                padding: 'var(--space-2) var(--space-3)',
                cursor: 'pointer',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {TIER_META[tier].label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Disclosures ───────────────────────────────────────────────────────────────

function Disclosure({ toggleClosed, toggleOpen, children }: {
  toggleClosed: string
  toggleOpen: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}
      >
        {open ? toggleOpen : toggleClosed}
      </button>

      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.2s ease',
        overflow: 'hidden',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function LabelLegend() {
  return (
    <Disclosure toggleClosed="What do these labels mean? ↓" toggleOpen="Got it ↑">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {[
          {
            label: '↗',
            text: 'Opens the source in a new tab so you can peruse and subscribe.',
          },
          {
            label: '👍 👎',
            text: 'Tell us if this fits. We use your feedback to improve your future recommendations.',
          },
          {
            label: 'Editorial Perspective',
            text: (
              <>
                Our assessment of the source&apos;s overall editorial viewpoint, based on topic selection, framing, and sourcing patterns. Possible values:
                <ul style={{ margin: 'var(--space-2) 0 0 var(--space-4)', padding: 0, lineHeight: '1.8' }}>
                  {['Left — consistent liberal/progressive framing',
                    'Lean Left — generally center-left, with some partisan framing',
                    'Center — balanced or deliberately nonpartisan',
                    'Lean Right — generally center-right, with some partisan framing',
                    'Right — consistent conservative framing',
                    'Heterodox — doesn\'t fit the left-right spectrum; contrarian, cross-cutting, or ideologically independent',
                  ].map((item) => (
                    <li key={item} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ),
          },
        ].map(({ label, text }) => (
          <div key={label} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', width: 132, flexShrink: 0 }}>
              {label}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </Disclosure>
  )
}

function IndependenceDisclosure() {
  return (
    <Disclosure toggleClosed="What do we mean by independent and reliable? ↓" toggleOpen="Got it ↑">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
          The editorial voice is not controlled by a corporate owner, political party, advertiser network, or institutional funder with a partisan agenda. Independent journalists still have to earn a living — subscriptions, advertising, private investors, foundation grants are all fine as long as they don&apos;t control what gets covered or how.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
          A journalist with a Substack and ten thousand paying subscribers answers to those subscribers. A journalist working for a network owned by a Fortune 500 conglomerate answers to a board of directors. That&apos;s the difference that matters. CNN is not independent. A journalist who left CNN to run their own Substack is.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
          Reliable means the source gets its facts right, corrects its mistakes, and argues in good faith instead of misleading you to win a point. Reliability is separate from viewpoint — a source can hold a strong, clearly-stated position and still be scrupulous with the facts, and another can sound perfectly neutral while playing loose with them. We score every source for reliability and weigh it in what we recommend; a documented accuracy problem triggers a re-check. A clear lean is fine. Getting the facts wrong is not.
        </p>
      </div>
    </Disclosure>
  )
}

// ── Tier content panel ────────────────────────────────────────────────────────

function TierPanel({
  tier,
  sources,
  userMantleType,
  userCompletionPercent,
  blurb,
  blurbsLoading,
  cardOneLiners,
}: {
  tier: MediaTier
  sources: ScoredMediaSource[]
  userMantleType: string | null
  userCompletionPercent: number
  blurb: string | null
  blurbsLoading: boolean
  cardOneLiners: Record<string, string>
}) {
  const meta = TIER_META[tier]
  const isThin = sources.length > 0 && sources.length < THIN_TIER_MIN
  const isEmpty = sources.length === 0

  return (
    <div>
      {/* Tier header */}
      <div style={{ marginBottom: 'var(--space-4)', borderLeft: `3px solid ${meta.color}`, paddingLeft: 'var(--space-3)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', fontWeight: 'var(--weight-bold)', color: meta.color, margin: '0 0 var(--space-1)' }}>
          {meta.label}
        </h2>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{meta.description}</p>
        {blurb && (
          <p style={{ margin: 'var(--space-1) 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{blurb}</p>
        )}
      </div>

      {/* Thin-tier notice */}
      {(isThin || isEmpty) && (
        <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-surface)', marginBottom: 'var(--space-4)' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            {isEmpty
              ? `Fewer recommendations than usual in this tier. As we grow the catalog and classify more sources, this section will fill in.`
              : `Fewer recommendations than usual in this tier — we're showing what we have. The catalog is growing.`}
          </p>
        </div>
      )}

      {/* Source cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {sources.slice(0, 5).map((s) => (
          <SourceCard
            key={s.source.id}
            scored={s}
            tier={tier}
            userMantleType={userMantleType}
            userCompletionPercent={userCompletionPercent}
            oneLiner={cardOneLiners[s.source.name]}
          />
        ))}
      </div>
    </div>
  )
}

// ── Suggest a source ──────────────────────────────────────────────────────────

function SuggestSourceForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return
    setLoading(true)
    try {
      await fetch('/api/source-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), url: url.trim(), note: note.trim() }),
      })
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface)', textAlign: 'center' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-primary)' }}>
          Thanks — your suggestion goes into our review queue. Every suggestion goes through the same scoring process before anything appears.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: open ? 'var(--space-3)' : 0 }}>
        <div>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
            Know a source we should add?
          </p>
          {!open && (
            <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
              Suggestions go into our review queue — human review before anything goes live.
            </p>
          )}
        </div>
        <button onClick={() => setOpen((v) => !v)}
          style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-blue-accent)', background: 'none', border: '1px solid var(--color-blue-accent)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {open ? 'Cancel' : 'Suggest a source'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Source name" required
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)', width: '100%', boxSizing: 'border-box' }} />
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (e.g. example.com)" required
            pattern="[^\s]+\.[a-zA-Z]{2,}"
            title="Enter a web address (e.g. example.com or https://example.com)"
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)', width: '100%', boxSizing: 'border-box' }} />
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Why should this be in the catalog? (optional)" rows={2}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)', resize: 'none', width: '100%', boxSizing: 'border-box' }} />
          <button type="submit" disabled={loading || !name.trim() || !url.trim()}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'var(--color-blue-accent)', color: '#fff', cursor: loading ? 'default' : 'pointer', alignSelf: 'flex-start', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending…' : 'Submit suggestion'}
          </button>
        </form>
      )}
    </div>
  )
}

// ── Blurb request builder ─────────────────────────────────────────────────────

function buildBlurbsRequest(
  matchResult: MediaMatchResult,
  result: { primaryType: string; topDimensions: Dimension[]; profile: DimensionalProfile },
  oneLiner: string,
): BlurbsRequest {
  const profile = result.profile as unknown as Record<string, number>

  // top dimensions → plain English
  const topDims = result.topDimensions.slice(0, 3).map((dim) =>
    poleLabel(dim as Dimension, profile[dim] ?? 50)
  )

  // bottom 2 = dimensions closest to 50 (most uncertain)
  const bottomDims = DIMENSIONS
    .map((d) => ({ key: d.key, certainty: Math.abs((profile[d.key] ?? 50) - 50) }))
    .sort((a, b) => a.certainty - b.certainty)
    .slice(0, 2)
    .map((d) => poleLabel(d.key, profile[d.key] ?? 50))

  function summarize(sources: ScoredMediaSource[]) {
    return sources.slice(0, 5).map((s) => {
      const sigAxes = Object.entries(s.source.dimensionCoverage)
        .filter(([, v]) => v === 'signature')
        .slice(0, 2)
        .map(([k]) => {
          const dim = DIMENSIONS.find((d) => d.key === k)
          return dim ? `${dim.poleA}/${dim.poleB}` : k
        })
      return {
        name: s.source.name,
        lean: formatLean(s.source.coarseLean),
        signatureAxes: sigAxes,
      }
    })
  }

  return {
    mantleType: result.primaryType,
    oneLiner,
    topDimensions: topDims,
    bottomDimensions: bottomDims,
    confirming:  summarize(matchResult.confirming),
    expanding:   summarize(matchResult.expanding),
    challenging: summarize(matchResult.challenging),
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MediaDietPage() {
  const session = useQuizStore((s) => s.session)
  const setSessionFromCloud = useQuizStore((s) => s.setSessionFromCloud)
  const hasProfile = Boolean(session?.result)
  const isAnonymous = hasProfile && !session?.userId
  const [mediaBannerDismissed, setMediaBannerDismissed] = useState(false)

  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (hasProfile) { setAuthChecked(true); return }
    loadProfile().then((profile) => {
      if (profile) setSessionFromCloud(profile)
      setAuthChecked(true)
    })
  }, [])

  const result       = session?.result
  const mantleType   = result?.primaryType ?? null
  const completionPct = result?.completionPercent ?? 0
  const mantleInfo   = mantleType ? mantleFor(mantleType) : null

  const [activeTier, setActiveTier] = useState<MediaTier>('confirming')
  const [matchResult, setMatchResult] = useState<MediaMatchResult | null>(null)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [blurbs, setBlurbs] = useState<BlurbsResult | null>(null)
  const [blurbsLoading, setBlurbsLoading] = useState(false)
  const loadedRef = useRef(false)

  const loadRecommendations = useCallback(async () => {
    if (!session?.result) return
    try {
      const res = await fetch('/api/media-catalog')
      const catalog = await res.json()
      const key = buildMediaMatchKey(session.result)
      const mr = matchMedia(key, catalog)
      setMatchResult(mr)
    } catch (err) {
      setCatalogError('Could not load recommendations. Please refresh.')
      console.error('media catalog error:', err)
    }
  }, [session?.result])

  useEffect(() => {
    if (hasProfile && !loadedRef.current) {
      loadedRef.current = true
      loadRecommendations()
    }
  }, [hasProfile, loadRecommendations])

  // Fetch Claude blurbs once match result is ready
  useEffect(() => {
    if (!matchResult || !result || !mantleInfo) return
    let cancelled = false
    setBlurbsLoading(true)
    const body = buildBlurbsRequest(
      matchResult,
      { primaryType: result.primaryType, topDimensions: result.topDimensions as Dimension[], profile: result.profile as unknown as DimensionalProfile },
      mantleInfo.oneLiner,
    )
    fetch('/api/media-blurbs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data: BlurbsResult) => { if (!cancelled) { setBlurbs(data); setBlurbsLoading(false) } })
      .catch(() => { if (!cancelled) setBlurbsLoading(false) })
    return () => { cancelled = true }
  }, [matchResult])

  // ── Loading — auth check ──────────────────────────────────────────────────

  if (!authChecked) {
    return (
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)' }}>
          Loading your profile…
        </div>
      </main>
    )
  }

  // ── No profile — soft gate ────────────────────────────────────────────────

  if (!hasProfile) {
    return (
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>
          Your Media Diet
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-5)', lineHeight: 'var(--leading-tight)' }}>
          Independent journalism, matched to how you think.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
          Independent journalism matched to how you actually think — in three tiers: sources that deepen what you know, sources that expand how you think, and sources that challenge you where it counts.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
          Take the quiz to get your personalized recommendations. We match your eight-dimension values profile against a curated catalog of independent journalists, Substacks, and podcasts.
        </p>
        <a href="/quiz"
          style={{ display: 'inline-block', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-blue-accent)', color: '#fff', textDecoration: 'none' }}>
          Take the quiz / Create an account →
        </a>
      </main>
    )
  }

  // ── Has profile — recommendations ─────────────────────────────────────────

  const tierSources: Record<MediaTier, ScoredMediaSource[]> = {
    confirming:  matchResult?.confirming  ?? [],
    expanding:   matchResult?.expanding   ?? [],
    challenging: matchResult?.challenging ?? [],
  }

  const tierBlurbs: Record<MediaTier, string | null> = {
    confirming:  blurbs?.confirming_blurb  ?? null,
    expanding:   blurbs?.expanding_blurb   ?? null,
    challenging: blurbs?.challenging_blurb ?? null,
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>

      {/* Account banner for quiz-complete/no-account (13b) */}
      {isAnonymous && !mediaBannerDismissed && (
        <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-gold)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <p style={{ flex: 1, margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            Your results are temporary. <a href="/signup" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none', fontWeight: 'var(--weight-semibold)' }}>Create a free account</a> to save them.
          </p>
          <button onClick={() => setMediaBannerDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', padding: 0, flexShrink: 0 }}>Dismiss</button>
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text-muted)',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-5)',
        }}>
          Your Media Diet
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-h1)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-5)',
          lineHeight: 'var(--leading-tight)',
        }}>
          Journalism that deepens, expands, and challenges — based on what you actually believe.
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body-lg)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: 'var(--space-4)',
        }}>
          Not an algorithm designed to rage bait you. Not a political party&apos;s talking points. Not an echo chamber.
        </p>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body-lg)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: 'var(--space-4)',
        }}>
          Your recommendations are built on your eight-dimension values profile — matched against a curated catalog of independent journalists, Substacks, and podcasts. Three tiers, by design: sources that reinforce your foundation, sources that broaden your view, and sources that push back where it matters.
        </p>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--leading-relaxed)',
          fontStyle: 'italic',
          marginBottom: completionPct < 100 ? 'var(--space-4)' : 0,
        }}>
          We&apos;re starting with 62 hand-curated sources — chosen for quality, independence, reliability, and range. More coming.
        </p>

        {completionPct < 100 && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', margin: 0 }}>
            <a href="/quiz" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>Complete your profile</a> to refine these recommendations.
          </p>
        )}
      </div>

      {/* ── Catalog error ────────────────────────────────────────────────── */}
      {catalogError && (
        <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', marginBottom: 'var(--space-6)' }}>
          {catalogError}
        </div>
      )}

      {/* ── Loading recommendations ───────────────────────────────────────── */}
      {!matchResult && !catalogError && (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)' }}>
          Loading recommendations…
        </div>
      )}

      {/* ── Tab view ─────────────────────────────────────────────────────── */}
      {matchResult && (
        <>
          <TierTabNav active={activeTier} onChange={setActiveTier} />

          {/* Disclosures — sit between tab bar and cards, side-by-side */}
          <div style={{ marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 0', minWidth: 0 }}><LabelLegend /></div>
            <div style={{ flex: '1 1 0', minWidth: 0 }}><IndependenceDisclosure /></div>
          </div>

          {/* Active tier content */}
          <TierPanel
            tier={activeTier}
            sources={tierSources[activeTier]}
            userMantleType={mantleType}
            userCompletionPercent={completionPct}
            blurb={tierBlurbs[activeTier]}
            blurbsLoading={blurbsLoading}
            cardOneLiners={blurbs?.card_oneliners ?? {}}
          />

          {/* Suggest a source */}
          <div style={{ marginTop: 'var(--space-10)' }}>
            <SuggestSourceForm />
          </div>

          {/* Claude's role disclosure */}
          <details style={{ marginTop: 'var(--space-8)' }}>
            <summary style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>▸</span> How these recommendations are made &amp; Claude&apos;s role —{' '}
              <a href="/methodology#media-diet" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>full methodology →</a>
            </summary>
            <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                The analysis behind these recommendations is generated by Claude, Anthropic&apos;s AI.
                Claude reads each source&apos;s body of work, scores it on the eight civic dimensions, and drafts the explanation you see on each card.
                Humans review placements before they go live and can override Claude&apos;s scoring when the evidence warrants it.
                We also look at thumbs up and thumbs down feedback regularly — when users systematically disagree with a recommendation, that&apos;s a signal we take seriously and investigate.
                We also use Perplexity to verify current ownership and status of sources — independent media changes, and we want our catalog to reflect current reality.
                Current-status verification is a systematic part of our quarterly review.
              </p>
            </div>
          </details>
        </>
      )}

    </main>
  )
}
