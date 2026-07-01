'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { matchMedia } from '@/lib/engine/mediaMatch'
import { buildMediaMatchKey } from '@/lib/engine/buildMediaMatchKey'
import { BiasCheckerTool } from '@/components/media/BiasCheckerTool'
import type { MediaMatchResult, ScoredMediaSource, MediaTier } from '@/lib/engine/mediaMatch'
import type { MediaSource } from '@/lib/engine/mediaMatch'

// ── Constants ─────────────────────────────────────────────────────────────────

// Minimum sources before showing "thinner than usual" notice (§24.7)
const THIN_TIER_MIN = 2

// Feedback chips per §24.4
const FEEDBACK_CHIPS = [
  'I already read this',
  'Not my level',
  "Don't trust this source",
  'Good suggestion',
  'Wrong fit for me',
]

// Tier headers — one-line explanation pulled from §26.3 FAQ "What are the three tiers?"
const TIER_META: Record<MediaTier, { label: string; description: string; color: string }> = {
  confirming:  { label: 'Confirming',  color: 'var(--color-blue-accent)',  description: 'Deepen what you know. Sources that align with how you see the world and cover it rigorously.' },
  expanding:   { label: 'Expanding',   color: '#16a34a',                   description: 'Expand how you think. Sources that cover ground your current diet misses.' },
  challenging: { label: 'Challenging', color: '#d97706',                   description: 'Challenge you where it counts. The best honest case against your strongest views. The most important tier.' },
}

// Lean display
function leanLabel(source: MediaSource): string {
  const lean = source.coarseLean.replace(/-/g, ' ')
  const hasPartisan = source.flags.includes('partisan_lean')
  return hasPartisan ? `${lean} [P]` : lean
}

// Format display
function formatLabel(source: MediaSource): string {
  return source.formats.join(' · ')
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
        <button
          onClick={handleThumbsUp}
          aria-label="Thumbs up"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: thumbsState === 'down' ? 0.4 : 1 }}
        >👍</button>
        <button
          onClick={handleThumbsDown}
          aria-label="Thumbs down"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: thumbsState === 'up' ? 0.4 : 1 }}
        >👎</button>
      </div>

      {/* Thumbs-down expansion */}
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
}: {
  scored: ScoredMediaSource
  tier: MediaTier
  userMantleType: string | null
  userCompletionPercent: number
}) {
  const { source } = scored

  return (
    <div style={{
      padding: 'var(--space-4)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-bg-base)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
    }}>
      {/* Name + creator */}
      <div>
        <a href={source.url} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', textDecoration: 'none' }}>
          {source.name} ↗
        </a>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginLeft: 'var(--space-2)' }}>
          {formatLabel(source)}
        </span>
      </div>

      {/* One-line description */}
      <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
        {source.attribution}
      </p>

      {/* Lean label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', padding: '1px 8px', borderRadius: 99, backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
          {leanLabel(source)}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {source.effort} read
        </span>
      </div>

      {/* Feedback */}
      <FeedbackButtons
        source={source}
        tier={tier}
        userMantleType={userMantleType}
        userCompletionPercent={userCompletionPercent}
      />
    </div>
  )
}

// ── Tier section ──────────────────────────────────────────────────────────────

function TierSection({
  tier,
  sources,
  userMantleType,
  userCompletionPercent,
}: {
  tier: MediaTier
  sources: ScoredMediaSource[]
  userMantleType: string | null
  userCompletionPercent: number
}) {
  const meta = TIER_META[tier]
  const isThin = sources.length > 0 && sources.length < THIN_TIER_MIN
  const isEmpty = sources.length === 0

  return (
    <div style={{ marginBottom: 'var(--space-8)' }}>
      {/* Tier header */}
      <div style={{ marginBottom: 'var(--space-4)', borderLeft: `3px solid ${meta.color}`, paddingLeft: 'var(--space-3)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', fontWeight: 'var(--weight-bold)', color: meta.color, margin: '0 0 var(--space-1)' }}>
          {meta.label}
        </h2>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
          {meta.description}
        </p>
      </div>

      {/* Thin-tier notice — §24.7 fallback mechanism */}
      {(isThin || isEmpty) && (
        <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-surface)', marginBottom: 'var(--space-4)' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            {isEmpty
              ? `Fewer recommendations than usual in this tier. As we grow the catalog and classify more sources, this section will fill in.`
              : `Fewer recommendations than usual in this tier — we're showing what we have. The catalog is growing.`}
            {/* PRE-LAUNCH EDITORIAL TASK: replace with per-Mantle seed lists once written.
                The seed list mechanism is wired: if seeds were available, they'd be passed here
                and the isEmpty branch above would not show. See §24.7. */}
          </p>
        </div>
      )}

      {/* Source cards — up to 5 per tier per spec */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {sources.slice(0, 5).map((s) => (
          <SourceCard
            key={s.source.id}
            scored={s}
            tier={tier}
            userMantleType={userMantleType}
            userCompletionPercent={userCompletionPercent}
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
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" required
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MediaDietPage() {
  const session = useQuizStore((s) => s.session)
  const profileLoading = useQuizStore((s) => s.profileLoading)
  const hasProfile = Boolean(session?.result)

  const userProfile = session?.result ? (session.result.profile as unknown as Record<string, number>) : undefined
  const primaryType  = session?.result?.primaryType ?? null
  const mantleType   = session?.result?.primaryType ?? null
  const completionPct = session?.result?.completionPercent ?? 0

  const [matchResult, setMatchResult] = useState<MediaMatchResult | null>(null)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  // Load catalog + run matching — no dealbreakers in this call (§26.3 architectural wall)
  const loadRecommendations = useCallback(async () => {
    if (!session?.result) return
    try {
      const res = await fetch('/api/media-catalog')
      const catalog: MediaSource[] = await res.json()
      // buildMediaMatchKey returns MediaMatchKey — structurally has no dealbreakers field.
      // Even though session.dealbreakers may exist, they are never forwarded here.
      const key = buildMediaMatchKey(session.result)
      const result = matchMedia(key, catalog)
      setMatchResult(result)
    } catch (err) {
      setCatalogError('Could not load recommendations. Please refresh.')
      console.error('media catalog error:', err)
    }
  }, [session?.result])

  useEffect(() => {
    if (hasProfile) loadRecommendations()
  }, [hasProfile, loadRecommendations])

  // ── Loading — profile fetch in flight ────────────────────────────────────

  if (profileLoading && !hasProfile) {
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
        <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Main column */}
          <div style={{ flex: '1 1 60%', minWidth: 300 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
              Your Media Diet
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
              Independent journalism matched to how you actually think — in three tiers: sources that deepen what you know, sources that expand how you think, and sources that challenge you where it counts.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
              Take the quiz to get your personalized recommendations. We match your eight-dimension values profile against a curated catalog of independent journalists, Substacks, and podcasts.
            </p>
            <a href="/quiz"
              style={{ display: 'inline-block', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-blue-accent)', color: '#fff', textDecoration: 'none' }}>
              Take the quiz →
            </a>
          </div>

          {/* Right rail — bias checker always available */}
          <div style={{ flex: '0 0 300px', minWidth: 260, padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface)' }}>
            <BiasCheckerTool
              userProfile={userProfile}
              primaryType={primaryType ?? undefined}
              hasProfile={false}
              compact
            />
          </div>
        </div>
      </main>
    )
  }

  // ── Has profile — recommendations ─────────────────────────────────────────

  const confirming  = matchResult?.confirming  ?? []
  const expanding   = matchResult?.expanding   ?? []
  const challenging = matchResult?.challenging ?? []

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>

      {/* Page header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          Your Media Diet
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Independent journalism matched to how you actually think.
          {completionPct < 100 && (
            <> — <a href="/quiz" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>complete your profile</a> to refine these recommendations.</>
          )}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-start' }}>

        {/* Main column — three tiers */}
        <div style={{ flex: '1 1 68%', minWidth: 300 }}>

          {catalogError && (
            <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', marginBottom: 'var(--space-6)' }}>
              {catalogError}
            </div>
          )}

          {!matchResult && !catalogError && (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)' }}>
              Loading recommendations…
            </div>
          )}

          {matchResult && (
            <>
              <TierSection tier="confirming"  sources={confirming}  userMantleType={mantleType} userCompletionPercent={completionPct} />
              <TierSection tier="expanding"   sources={expanding}   userMantleType={mantleType} userCompletionPercent={completionPct} />
              <TierSection tier="challenging" sources={challenging} userMantleType={mantleType} userCompletionPercent={completionPct} />

              {/* Suggest a source — §24.5 */}
              <SuggestSourceForm />

              {/* Claude's role disclosure — §25.1 Your Media Diet version */}
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
        </div>

        {/* Right rail — Article Bias Checker, sticky (§24.1) */}
        <div style={{
          flex: '0 0 290px',
          minWidth: 240,
          position: 'sticky',
          top: 'var(--space-6)',
          alignSelf: 'flex-start',
          padding: 'var(--space-4)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-bg-surface)',
          maxHeight: 'calc(100vh - 80px)',
          overflowY: 'auto',
        }}>
          <BiasCheckerTool
            userProfile={userProfile}
            primaryType={primaryType ?? undefined}
            hasProfile={hasProfile}
            compact
          />
        </div>

      </div>
    </main>
  )
}
