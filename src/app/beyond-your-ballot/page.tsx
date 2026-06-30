'use client'

import { useState, useTransition, useMemo } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { filterBeyondBallotCandidates, matchRace } from '@/lib/engine/match'
import { buildMatchKey } from '@/lib/engine/buildMatchKey'
import { resolveDistrict } from '@/lib/civic/resolveDistrict'
import { createClient } from '@/lib/supabase/client'
import candidates from '@/data/beyond-ballot-candidates'
import type { RankedCandidate } from '@/lib/engine/match'
import type { BYBCandidateRecord } from '@/data/beyond-ballot-candidates'

// Dealbreaker label lookup — item ID → display name.
// Full list is in src/lib/quiz/layer4.ts; only the IDs that appear in the
// placeholder data are needed here. Real editorial pass will expand this.
const DEALBREAKER_LABELS: Record<number, string> = {
  1: 'Election denialism',
  2: 'Abortion absolute restriction',
  3: 'Refusal to certify elections',
  7: 'Incitement to violence',
}

function dealbreakerLabel(id: number): string {
  return DEALBREAKER_LABELS[id] ?? `Item DB-${id}`
}

// ── Feedback chips ────────────────────────────────────────────────────────────

const FEEDBACK_CHIPS = [
  "Doesn't fit my values",
  "Wrong district for me to care about",
  "Not enough info on this candidate",
  "Disagree with the governance rating",
  "Good suggestion, wrong timing",
]

// ── Candidate card ────────────────────────────────────────────────────────────

function CandidateCard({
  ranked,
  beyondBallotFlag,
  userId,
  mantleType,
  completionPercent,
}: {
  ranked: RankedCandidate
  beyondBallotFlag: boolean
  userId: string | null
  mantleType: string | null
  completionPercent: number
}) {
  const { candidate, score, confidence, topAlignedAxes, topDivergentAxes, unknownDealbreakers } = ranked
  const c = candidate as BYBCandidateRecord

  const [thumbState, setThumbState] = useState<'up' | 'down' | null>(null)
  const [chips, setChips] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Identify dealbreaker crosses (flagged, not excluded, per §23.4)
  const crossedDealbreakers = Object.entries(candidate.dealbreakers)
    .filter(([, v]) => v.status === 'crosses')
    .map(([k]) => parseInt(k, 10))

  async function submitFeedback(type: 'thumbs_up' | 'thumbs_down') {
    setSubmitting(true)
    try {
      const supabase = createClient()
      await supabase.from('candidate_feedback').insert({
        user_id: userId,
        candidate_id: candidate.id,
        race_id: candidate.district,
        confidence_band: confidence,
        feedback_type: type,
        free_text: freeText || null,
        chips_selected: chips,
        user_mantle_type: mantleType,
        user_completion_percent: completionPercent,
        app_version: '1.0',
        data_version: candidate.lastUpdated,
        beyond_ballot_flag: beyondBallotFlag,
      })
      setSubmitted(true)
    } catch {
      // Silent fail — feedback is best-effort; don't block the UI
    } finally {
      setSubmitting(false)
    }
  }

  function handleThumb(type: 'up' | 'down') {
    if (submitted) return
    setThumbState(type)
    if (type === 'up') {
      void submitFeedback('thumbs_up')
    }
    // thumbs_down expands the form first
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    void submitFeedback('thumbs_down')
  }

  const confidenceLabel: Record<string, string> = {
    confident: 'Strong match',
    lean: 'Likely match',
    informational: 'Possible match',
    no_call: 'Insufficient data',
  }

  const axisLabel: Record<string, string> = {
    stability_change: 'stability vs. change',
    local_federal: 'local vs. federal',
    national_global: 'national vs. global',
    rules_outcomes: 'rules vs. outcomes',
    markets_governance: 'markets vs. governance',
    pragmatism_idealism: 'pragmatism vs. idealism',
    individual_collective: 'individual vs. collective',
    trust_skepticism: 'institutional trust',
  }

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      backgroundColor: 'var(--color-bg-surface)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
            {candidate.name}
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            {candidate.office} · {candidate.district.split('/').pop()?.replace('state:', '').replace('cd:', 'CD-').replace(':', ' ').toUpperCase() ?? candidate.district}
            {candidate.party ? ` · ${candidate.party}` : ''}
          </p>
        </div>
        <span style={{
          fontSize: 'var(--text-small)',
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-semibold)',
          color: confidence === 'confident' ? 'var(--color-green)' : confidence === 'lean' ? 'var(--color-blue-accent)' : 'var(--color-text-secondary)',
          backgroundColor: 'var(--color-bg-base)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
        }}>
          {confidenceLabel[confidence] ?? confidence}
        </span>
      </div>

      {/* Match score bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>Values alignment</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>{Math.round(score * 100)}%</span>
        </div>
        <div style={{ height: 6, backgroundColor: 'var(--color-border)', borderRadius: 3 }}>
          <div style={{ height: 6, width: `${Math.round(score * 100)}%`, backgroundColor: 'var(--color-blue-accent)', borderRadius: 3 }} />
        </div>
      </div>

      {/* Aligned / divergent axes */}
      {topAlignedAxes.length > 0 && (
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Aligns with you on:</strong>{' '}
          {topAlignedAxes.map((a) => axisLabel[a] ?? a).join(', ')}
          {topDivergentAxes.length > 0 && (
            <> · <strong style={{ color: 'var(--color-text-primary)' }}>Diverges on:</strong> {topDivergentAxes.map((a) => axisLabel[a] ?? a).join(', ')}</>
          )}
        </p>
      )}

      {/* ⚠ Dealbreaker crosses — yellow flag, NOT exclusion (§23.4) */}
      {crossedDealbreakers.length > 0 && (
        <div style={{
          backgroundColor: '#fef9c3',
          border: '1px solid #fde047',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-3)',
          display: 'flex',
          gap: 'var(--space-2)',
          alignItems: 'flex-start',
        }}>
          <span aria-hidden>⚠</span>
          <div>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: '#92400e' }}>
              Crosses one of your dealbreakers — you decide
            </p>
            <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: '#92400e' }}>
              {crossedDealbreakers.map(dealbreakerLabel).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* ⚠ Unknown dealbreakers (flagged but unverified) */}
      {unknownDealbreakers.length > 0 && (
        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-3)',
        }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Couldn&apos;t verify:</strong>{' '}
            {unknownDealbreakers.map((id) => dealbreakerLabel(parseInt(id.replace('DB-', ''), 10))).join(', ')} — research this yourself before deciding.
          </p>
        </div>
      )}

      {/* Links */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {c.campaignSite && (
          <a href={c.campaignSite} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
            Campaign site ↗
          </a>
        )}
        {c.donateLink && (
          <a href={c.donateLink} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
            Donate ↗
          </a>
        )}
      </div>

      {/* Feedback row */}
      {!submitted ? (
        <div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>Helpful?</span>
            <button
              onClick={() => handleThumb('up')}
              disabled={submitting || thumbState !== null}
              aria-label="Thumbs up"
              style={{ background: 'none', border: 'none', cursor: submitting ? 'default' : 'pointer', fontSize: 18, opacity: thumbState === 'down' ? 0.3 : 1 }}
            >
              👍
            </button>
            <button
              onClick={() => handleThumb('down')}
              disabled={submitting || thumbState === 'up'}
              aria-label="Thumbs down"
              style={{ background: 'none', border: 'none', cursor: submitting ? 'default' : 'pointer', fontSize: 18, opacity: thumbState === 'up' ? 0.3 : 1 }}
            >
              👎
            </button>
          </div>

          {/* Thumbs-down expansion */}
          {thumbState === 'down' && (
            <form onSubmit={handleFormSubmit} style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {FEEDBACK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setChips((prev) => prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip])}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-small)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: chips.includes(chip) ? '2px solid var(--color-blue-accent)' : '1px solid var(--color-border)',
                      backgroundColor: chips.includes(chip) ? 'var(--color-bg-surface)' : 'transparent',
                      cursor: 'pointer',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Tell us more (optional)"
                rows={2}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-small)',
                  padding: 'var(--space-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-base)',
                  color: 'var(--color-text-primary)',
                  resize: 'vertical',
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-small)',
                  fontWeight: 'var(--weight-semibold)',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'var(--color-blue-accent)',
                  color: '#fff',
                  cursor: submitting ? 'default' : 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                {submitting ? 'Sending…' : 'Send feedback'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
          Thanks — we read every response.
        </p>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BeyondYourBallotPage() {
  const session = useQuizStore((s) => s.session)
  const hasProfile = Boolean(session?.result)

  const [address, setAddress] = useState('')
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)
  const [userOcdIds, setUserOcdIds] = useState<string[]>([])
  const [addressError, setAddressError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Build MatchKey once (stable per session)
  const matchKey = useMemo(() => {
    if (!session?.result) return null
    return buildMatchKey(session.result, session)
  }, [session])

  // Part 1: candidates in user's own district that clear the governance gate
  const part1Ranked = useMemo<RankedCandidate[]>(() => {
    if (!matchKey || userOcdIds.length === 0) return []
    const inDistrict = candidates.filter(
      (c) => userOcdIds.includes(c.district) && (c.independentMindedScore ?? 0) >= 2
    )
    if (inDistrict.length === 0) return []
    const result = matchRace({
      raceId: 'beyond-ballot-part1',
      candidates: inDistrict,
      key: matchKey,
      dealbreakersAsFlags: true,  // §23.4 — dealbreakers are flags not exclusions here
    })
    return result.ranked
  }, [matchKey, userOcdIds])

  // Part 2: out-of-district candidates, both pre-filters applied, ranked by distance
  const part2Ranked = useMemo<RankedCandidate[]>(() => {
    if (!matchKey) return []
    const filtered = filterBeyondBallotCandidates(candidates, userOcdIds)
    if (filtered.length === 0) return []
    const result = matchRace({
      raceId: 'beyond-ballot-part2',
      candidates: filtered,
      key: matchKey,
      dealbreakersAsFlags: true,  // §23.4 — dealbreakers are flags not exclusions here
    })
    return result.ranked
  }, [matchKey, userOcdIds])

  const userId = session?.userId ?? null
  const mantleType = session?.result?.primaryType ?? null
  const completionPercent = session?.result?.completionPercent ?? 0

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = address.trim()
    if (!trimmed) return
    setAddressError(null)
    startTransition(async () => {
      try {
        const { ocdIds, normalizedAddress } = await resolveDistrict(trimmed)
        setUserOcdIds(ocdIds)
        setResolvedAddress(normalizedAddress)
      } catch {
        setAddressError('Could not find that address. Try including your city and state.')
      }
    })
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      {/* Page title */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
        Beyond Your Ballot
      </h1>

      {/* Intro copy — verbatim from §23.1 */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
        Congress runs on margins. The difference between a legislature that occasionally solves problems
        and one that never does is often a handful of seats — and right now, the list of members willing
        to cross the aisle for a pragmatic solution is vanishingly small. Beyond Your Ballot surfaces
        the races outside your district where that margin is actually at stake. You can&apos;t vote in
        these races. But you can pay attention, and you can help.
      </p>

      {/* How this works — Claude's role disclosure (§25.1) */}
      <div style={{ marginBottom: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
        <button
          onClick={() => setShowHowItWorks((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-blue-accent)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
          aria-expanded={showHowItWorks}
        >
          <span>{showHowItWorks ? '▾' : '▸'}</span> How this works
        </button>
        {showHowItWorks && (
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
              The analysis behind these recommendations is generated by Claude, Anthropic&apos;s AI. Claude
              reads the public record, scores each candidate on the eight dimensions, and drafts the
              explanation you see on each card. Humans review placements before they go live and can
              override Claude&apos;s scoring when the evidence warrants it. We also look at thumbs up and
              thumbs down feedback regularly — when users systematically disagree with a recommendation,
              that&apos;s a signal we take seriously and investigate. The AI does the analysis. Humans stay
              in the loop.
            </p>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Governance filter:</strong> Four
              criteria, must meet at least two: no party-line voting rate above 85% for incumbents;
              history of co-sponsoring bipartisan legislation; publicly committed to specific structural
              reforms (gerrymandering, campaign finance, filibuster reform — not vague unity language);
              endorsed by a documented cross-partisan organization whose membership includes elected
              officials from both parties acting in a non-party capacity (for example, the Problem
              Solvers Caucus or Unite America) or explicitly contested their own party&apos;s position with
              a recorded vote or statement. This filter is editorial. We define it, we apply it, we
              publish the criteria so you can evaluate our judgment.
            </p>
          </div>
        )}
      </div>

      {/* ── Quiz gate ─────────────────────────────────────────────────────────── */}
      {!hasProfile ? (
        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-surface)',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Take the quiz to see your matches.</strong>{' '}
            Beyond Your Ballot ranks candidates by how well they align with your specific values. Without a
            profile, there&apos;s nothing to match against.
          </p>
          <a
            href="/quiz"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              fontWeight: 'var(--weight-semibold)',
              color: '#fff',
              backgroundColor: 'var(--color-blue-accent)',
              textDecoration: 'none',
              padding: 'var(--space-3) var(--space-5)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Take the quiz →
          </a>
        </div>
      ) : (
        <>
          {/* ── Address input for Part 1 ──────────────────────────────────────── */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            {resolvedAddress ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Showing results for <strong style={{ color: 'var(--color-text-primary)' }}>{resolvedAddress}</strong>{' '}
                <button
                  onClick={() => { setResolvedAddress(null); setUserOcdIds([]); setAddress('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue-accent)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 0 }}
                >
                  Change
                </button>
              </p>
            ) : (
              <form onSubmit={handleAddressSubmit} style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address to see Part 1"
                  aria-label="Your street address"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-small)',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-base)',
                    color: 'var(--color-text-primary)',
                    flex: '1 1 240px',
                    minWidth: 0,
                  }}
                />
                <button
                  type="submit"
                  disabled={isPending || !address.trim()}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-small)',
                    fontWeight: 'var(--weight-semibold)',
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: 'var(--color-blue-accent)',
                    color: '#fff',
                    cursor: isPending ? 'default' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isPending ? 'Looking up…' : 'Find my district'}
                </button>
              </form>
            )}
            {addressError && (
              <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)' }}>{addressError}</p>
            )}
          </div>

          {/* ── Part 1: On your ballot, worth extra support ───────────────────── */}
          {userOcdIds.length > 0 && (
            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
                On your ballot, worth extra support
              </h2>
              {/* Label copy verbatim from §23.2 */}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
                On your ballot and worth your support — these candidates are in your district and meet the
                same independent-minded governance criteria as the races below. Your vote is the most powerful
                thing you can give them. Your support beyond that matters too.
              </p>
              {part1Ranked.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
                  No candidates in your district currently meet the governance criteria. This will update as we add more data.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {part1Ranked.map((r) => (
                    <CandidateCard
                      key={r.candidate.id}
                      ranked={r}
                      beyondBallotFlag={false}
                      userId={userId}
                      mantleType={mantleType}
                      completionPercent={completionPercent}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Part 2: Beyond your ballot ───────────────────────────────────── */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
              Beyond your ballot
            </h2>
            {userOcdIds.length === 0 && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                Add your address above to also see Part 1 — candidates in your own district who meet the same criteria.
              </p>
            )}
            {part2Ranked.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
                No candidates currently meet the governance criteria for your values profile. Check back as we add more data.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {part2Ranked.map((r) => (
                  <CandidateCard
                    key={r.candidate.id}
                    ranked={r}
                    beyondBallotFlag={true}
                    userId={userId}
                    mantleType={mantleType}
                    completionPercent={completionPercent}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}
