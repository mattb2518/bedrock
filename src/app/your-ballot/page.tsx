'use client'

import { useState, useTransition, useMemo } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { matchRace } from '@/lib/engine/match'
import { buildMatchKey } from '@/lib/engine/buildMatchKey'
import { resolveDistrict } from '@/lib/civic/resolveDistrict'
import { fetchFederalCandidates } from '@/lib/civic/federalCandidates'
import { fetchStateLegCandidates } from '@/lib/civic/stateLegCandidates'
import { createClient } from '@/lib/supabase/client'
import type { RankedCandidate, RaceResult, ConfidenceBand } from '@/lib/engine/match'
import type { FederalCandidate, FederalBallot } from '@/lib/civic/federalCandidates'
import type { StateLegCandidate, StateLegBallot } from '@/lib/civic/stateLegCandidates'

// ── Quiz completion → display percent ─────────────────────────────────────────

function completionIndicatorPct(completionPercent: number): number {
  if (completionPercent >= 95) return 100
  if (completionPercent >= 80) return 85
  if (completionPercent >= 60) return 65
  return 40
}

// ── Match indicator label (per §22.5 — NOT a number) ─────────────────────────

const MATCH_LABEL: Record<ConfidenceBand, string> = {
  confident:     'Strong match',
  lean:          'Moderate match',
  informational: 'Partial match',
  no_call:       'Insufficient data',
}

const MATCH_COLOR: Record<ConfidenceBand, string> = {
  confident:     'var(--color-green)',
  lean:          'var(--color-blue-accent)',
  informational: 'var(--color-text-secondary)',
  no_call:       'var(--color-text-secondary)',
}

const AXIS_LABEL: Record<string, string> = {
  stability_change:      'stability vs. change',
  local_federal:         'local vs. federal',
  national_global:       'national vs. global',
  rules_outcomes:        'rules vs. outcomes',
  markets_governance:    'markets vs. governance',
  pragmatism_idealism:   'pragmatism vs. idealism',
  individual_collective: 'individual vs. collective',
  trust_skepticism:      'institutional trust',
}

const AXIS_LABEL_FULL: Record<string, string> = {
  stability_change:      'Stability ↔ Change',
  local_federal:         'Local ↔ Federal authority',
  national_global:       'National ↔ Global outlook',
  rules_outcomes:        'Rules ↔ Outcomes',
  markets_governance:    'Markets ↔ Governance',
  pragmatism_idealism:   'Pragmatism ↔ Idealism',
  individual_collective: 'Individual ↔ Collective',
  trust_skepticism:      'Institutional Trust ↔ Skepticism',
}

// ── Feedback chips (§22.6) ────────────────────────────────────────────────────

const FEEDBACK_CHIPS = [
  "I know this candidate",
  "Missing context",
  "Wrong on a key issue",
  "Data seems off",
]

// ── Finance display helper ─────────────────────────────────────────────────────

function formatDollars(n: number | null): string {
  if (n === null) return 'N/A'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

// ── Candidate card ─────────────────────────────────────────────────────────────

function CandidateCard({
  ranked,
  userId,
  mantleType,
  completionPercent,
  dataVersion,
}: {
  ranked: RankedCandidate
  userId: string | null
  mantleType: string | null
  completionPercent: number
  dataVersion: string
}) {
  const { candidate, confidence, topAlignedAxes, topDivergentAxes, explanation, unknownDealbreakers } = ranked
  const c = candidate as FederalCandidate

  const [expanded, setExpanded] = useState(false)
  const [thumbState, setThumbState] = useState<'up' | 'down' | null>(null)
  const [chips, setChips] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
        data_version: dataVersion,
        beyond_ballot_flag: false,  // Your Ballot feedback always false
      })
      setSubmitted(true)
    } catch {
      // Silent fail — feedback is best-effort
    } finally {
      setSubmitting(false)
    }
  }

  function handleThumb(type: 'up' | 'down') {
    if (submitted) return
    setThumbState(type)
    if (type === 'up') void submitFeedback('thumbs_up')
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    void submitFeedback('thumbs_down')
  }

  // Hard exclusion is handled by the engine before cards are rendered — if a card
  // appears, it has not been excluded. unknownDealbreakers = items we couldn't verify.

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
            {candidate.office}{candidate.party ? ` · ${candidate.party}` : ''}
          </p>
        </div>
        <span style={{
          fontSize: 'var(--text-small)',
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-semibold)',
          color: MATCH_COLOR[confidence],
          backgroundColor: 'var(--color-bg-base)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
        }}>
          {MATCH_LABEL[confidence]}
        </span>
      </div>

      {/* One-sentence explanation */}
      {confidence !== 'no_call' && explanation && (
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          {explanation}
        </p>
      )}

      {/* no_call state — research links */}
      {confidence === 'no_call' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            We don&apos;t have enough information about this candidate to make a call. Research them yourself before deciding:
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <a
              href={`https://ballotpedia.org/Special:Search?search=${encodeURIComponent(candidate.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}
            >
              Ballotpedia ↗
            </a>
            <a
              href={`https://justfacts.votesmart.org/officials/search/?q=${encodeURIComponent(candidate.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}
            >
              Vote Smart ↗
            </a>
          </div>
        </div>
      )}

      {/* Top aligned axes (shown when not no_call) */}
      {confidence !== 'no_call' && topAlignedAxes.length > 0 && (
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Aligns with you on:</strong>{' '}
          {topAlignedAxes.map((a) => AXIS_LABEL[a] ?? a).join(', ')}
          {topDivergentAxes.length > 0 && (
            <> · <strong style={{ color: 'var(--color-text-primary)' }}>Diverges on:</strong>{' '}
            {topDivergentAxes.map((a) => AXIS_LABEL[a] ?? a).join(', ')}</>
          )}
        </p>
      )}

      {/* Unknown dealbreaker flags */}
      {unknownDealbreakers.length > 0 && (
        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-3)',
        }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Couldn&apos;t verify:</strong>{' '}
            {unknownDealbreakers.join(', ')} — research this yourself before deciding.
          </p>
        </div>
      )}

      {/* Links row — FederalCandidate uses campaignSite/donateLink; StateLegCandidate uses websiteUrl */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {(c as FederalCandidate).campaignSite && (
          <a href={(c as FederalCandidate).campaignSite!} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
            Campaign site ↗
          </a>
        )}
        {!(c as FederalCandidate).campaignSite && (c as unknown as StateLegCandidate).websiteUrl && (
          <a href={(c as unknown as StateLegCandidate).websiteUrl!} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
            Official site ↗
          </a>
        )}
        {(c as FederalCandidate).donateLink && (
          <a href={(c as FederalCandidate).donateLink!} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
            Donate ↗
          </a>
        )}
      </div>

      {/* "Learn more" expansion */}
      <div>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', padding: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
          aria-expanded={expanded}
        >
          <span>{expanded ? '▾' : '▸'}</span> Learn more — full axis breakdown, campaign finance, sources
        </button>

        {expanded && (
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Full axis breakdown */}
            {Object.keys(candidate.axisPlacement).length > 0 ? (
              <div>
                <p style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                  Axis-by-axis breakdown
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {Object.entries(candidate.axisPlacement).map(([axis, placement]) => (
                    <div key={axis} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                        {AXIS_LABEL_FULL[axis] ?? axis}
                      </p>
                      {placement && (
                        <>
                          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                            {placement.rationale}
                          </p>
                          {placement.sources.length > 0 && (
                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                              {placement.sources.map((src, i) => (
                                <a key={i} href={src} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
                                  Source {i + 1} ↗
                                </a>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                No axis-level scoring data yet for this candidate. Our classification pipeline is working through federal races. Check back closer to the election.
              </p>
            )}

            {/* Open States attribution for state legislative candidates */}
            {(c as unknown as StateLegCandidate).openStatesId && (
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                Legislator data sourced from <a href="https://openstates.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>Open States</a> (Plural Open Data). Campaign finance data for state legislative races is not yet available in this version.
              </p>
            )}

            {/* FEC finance summary — federal candidates only */}
            {(c as FederalCandidate).financeData && (
              <div>
                <p style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                  Campaign finance (FEC)
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>Total raised</p>
                    <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                      {formatDollars((c as FederalCandidate).financeData!.totalRaised)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>Cash on hand</p>
                    <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                      {formatDollars((c as FederalCandidate).financeData!.cashOnHand)}
                    </p>
                  </div>
                </div>
                <p style={{ margin: 'var(--space-2) 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                  Campaign finance data from openFEC. Contributor lists are not displayed per FEC license terms.
                </p>
              </div>
            )}

            {/* Unknown dealbreakers — research prompt */}
            {unknownDealbreakers.length > 0 && (
              <div style={{
                backgroundColor: '#fef9c3',
                border: '1px solid #fde047',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-2) var(--space-3)',
              }}>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: '#92400e' }}>
                  Research before deciding — we couldn&apos;t verify these items:
                </p>
                <ul style={{ margin: 'var(--space-1) 0 0 var(--space-4)', padding: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: '#92400e' }}>
                  {unknownDealbreakers.map((id) => (
                    <li key={id}>{id}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback (§22.6) */}
      {!submitted ? (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>Helpful?</span>
            <button
              onClick={() => handleThumb('up')}
              disabled={submitting || thumbState !== null}
              aria-label="Thumbs up"
              style={{ background: 'none', border: 'none', cursor: submitting ? 'default' : 'pointer', fontSize: 18, opacity: thumbState === 'down' ? 0.3 : 1 }}
            >👍</button>
            <button
              onClick={() => handleThumb('down')}
              disabled={submitting || thumbState === 'up'}
              aria-label="Thumbs down"
              style={{ background: 'none', border: 'none', cursor: submitting ? 'default' : 'pointer', fontSize: 18, opacity: thumbState === 'up' ? 0.3 : 1 }}
            >👎</button>
          </div>

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
                  >{chip}</button>
                ))}
              </div>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Tell us why (optional)"
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
              >{submitting ? 'Sending…' : 'Send feedback'}</button>
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

// ── Race section ───────────────────────────────────────────────────────────────

function RaceSection({
  raceResult,
  userId,
  mantleType,
  completionPercent,
}: {
  raceResult: RaceResult
  userId: string | null
  mantleType: string | null
  completionPercent: number
}) {
  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-heading)',
        fontWeight: 'var(--weight-semibold)',
        color: 'var(--color-text-primary)',
        margin: '0 0 var(--space-4)',
      }}>
        {raceResult.officeName}
      </h2>

      {raceResult.ranked.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
          No candidates found for this race. Check back closer to the election.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {raceResult.ranked.map((ranked) => (
            <CandidateCard
              key={ranked.candidate.id}
              ranked={ranked}
              userId={userId}
              mantleType={mantleType}
              completionPercent={completionPercent}
              dataVersion={ranked.candidate.lastUpdated}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function YourBallotPage() {
  const session = useQuizStore((s) => s.session)
  const hasProfile = Boolean(session?.result)
  const completionPercent = session?.result?.completionPercent ?? 0

  const [address, setAddress] = useState('')
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)
  const [ballot, setBallot] = useState<FederalBallot | null>(null)
  const [stateLegBallot, setStateLegBallot] = useState<StateLegBallot | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Build MatchKey once per session
  const matchKey = useMemo(() => {
    if (!session?.result) return null
    return buildMatchKey(session.result, session)
  }, [session])

  // Run engine over all races (federal + state leg) — ballot order: Senate, House, State Senate, State House
  const raceResults = useMemo<RaceResult[]>(() => {
    if (!matchKey || !ballot) return []

    const results: RaceResult[] = []

    // Federal Senate — statewide; group in case two seats are up simultaneously
    if (ballot.senate.length > 0) {
      const byDistrict = new Map<string, typeof ballot.senate>()
      for (const c of ballot.senate) {
        const existing = byDistrict.get(c.district) ?? []
        byDistrict.set(c.district, [...existing, c])
      }
      for (const [, senCandidates] of byDistrict) {
        results.push(matchRace({
          raceId: `fed-senate-${senCandidates[0].district}`,
          candidates: senCandidates,
          key: matchKey,
          dealbreakersAsFlags: false,
        }))
      }
    }

    // Federal House
    if (ballot.house.length > 0) {
      results.push(matchRace({
        raceId: `fed-house-${ballot.house[0].district}`,
        candidates: ballot.house,
        key: matchKey,
        dealbreakersAsFlags: false,
      }))
    }

    // State Senate (upper chamber)
    if (stateLegBallot && stateLegBallot.senate.length > 0) {
      results.push(matchRace({
        raceId: `state-senate-${stateLegBallot.senate[0].district}`,
        candidates: stateLegBallot.senate,
        key: matchKey,
        dealbreakersAsFlags: false,
      }))
    }

    // State House (lower chamber)
    if (stateLegBallot && stateLegBallot.house.length > 0) {
      results.push(matchRace({
        raceId: `state-house-${stateLegBallot.house[0].district}`,
        candidates: stateLegBallot.house,
        key: matchKey,
        dealbreakersAsFlags: false,
      }))
    }

    return results
  }, [matchKey, ballot, stateLegBallot])

  const userId = session?.userId ?? null
  const mantleType = session?.result?.primaryType ?? null
  const displayPct = completionIndicatorPct(completionPercent)

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = address.trim()
    if (!trimmed) return
    setAddressError(null)
    startTransition(async () => {
      try {
        const { normalizedAddress, state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict } = await resolveDistrict(trimmed)
        if (!state) {
          setAddressError('Could not determine your state from that address. Try including your city and state.')
          return
        }
        // Fetch federal and state legislative in parallel
        const [federalBallot, stateLeg] = await Promise.all([
          fetchFederalCandidates(state, congressionalDistrict),
          fetchStateLegCandidates(state, stateSenateDistrict, stateHouseDistrict).catch(() => null),
        ])
        setBallot(federalBallot)
        setStateLegBallot(stateLeg)
        setResolvedAddress(normalizedAddress ?? trimmed)
      } catch {
        setAddressError('Could not look up that address. Try including your city, state, and ZIP code.')
      }
    })
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>

      {/* Under construction banner — verbatim from §22.1 */}
      <div style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Your Ballot covers federal and state races for the fall 2026 general election. Local races and
          ballot measures are coming — we&apos;re working through them now. The reason they&apos;re not here yet:
          data on local candidates is patchy and inconsistent across jurisdictions, and we&apos;d rather show
          you nothing than show you something incomplete or unreliable. We&apos;ll tell you when they&apos;re ready.
        </p>
      </div>

      {/* Page title + completion indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
          Your Ballot
        </h1>
        {hasProfile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: 80, height: 6, backgroundColor: 'var(--color-border)', borderRadius: 3 }}>
              <div style={{ height: 6, width: `${displayPct}%`, backgroundColor: 'var(--color-blue-accent)', borderRadius: 3 }} />
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              {displayPct}% complete
            </span>
          </div>
        )}
      </div>

      {/* How this works — Claude's role disclosure (§25.1) */}
      <div style={{ marginBottom: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
        <button
          onClick={() => setShowHowItWorks((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', padding: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
          aria-expanded={showHowItWorks}
        >
          <span>{showHowItWorks ? '▾' : '▸'}</span> How this works
        </button>
        {showHowItWorks && (
          <p style={{ margin: 'var(--space-3) 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            The analysis behind these recommendations is generated by Claude, Anthropic&apos;s AI. Claude
            reads the public record, scores each candidate on the eight dimensions, and drafts the
            explanation you see on each card. Humans review placements before they go live and can
            override Claude&apos;s scoring when the evidence warrants it. We also look at thumbs up and
            thumbs down feedback regularly — when users systematically disagree with a recommendation,
            that&apos;s a signal we take seriously and investigate. The AI does the analysis. Humans stay
            in the loop.
          </p>
        )}
      </div>

      {/* ── Quiz gate (§22.3) ───────────────────────────────────────────────── */}
      {!hasProfile ? (
        // No quiz at all → no address field, just CTA
        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-surface)',
        }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
            Start with the quiz
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-5)', maxWidth: 480, margin: '0 auto var(--space-5)' }}>
            Your Ballot matches candidates to your specific values — not your party. Without a profile,
            there&apos;s nothing to match against. Generic ballots aren&apos;t a feature.
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
              padding: 'var(--space-3) var(--space-6)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Take the quiz →
          </a>
        </div>
      ) : (
        <>
          {/* ── Address form (Layer 1+ only — hasProfile is true here) ─────────── */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            {resolvedAddress ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Showing results for{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>{resolvedAddress}</strong>{' '}
                <button
                  onClick={() => { setResolvedAddress(null); setBallot(null); setStateLegBallot(null); setAddress('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue-accent)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 0 }}
                >
                  Change
                </button>
              </p>
            ) : (
              <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                  Your address — to find your federal races
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, Anytown, VA 22101"
                    aria-label="Your street address"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-small)',
                      padding: 'var(--space-2) var(--space-3)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg-base)',
                      color: 'var(--color-text-primary)',
                      flex: '1 1 280px',
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
                      opacity: !address.trim() ? 0.5 : 1,
                    }}
                  >
                    {isPending ? 'Looking up…' : 'Find my ballot'}
                  </button>
                </div>
                {addressError && (
                  <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)' }}>
                    {addressError}
                  </p>
                )}
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                  Your address is used only to identify your congressional district. It is not stored.
                </p>
              </form>
            )}
          </div>

          {/* ── Ballot results ─────────────────────────────────────────────────── */}
          {isPending && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
              Looking up your races…
            </p>
          )}

          {ballot && raceResults.length > 0 && (
            <>
              {/* Hedged results note for Layer 1 users */}
              {displayPct === 40 && (
                <div style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-3)',
                  marginBottom: 'var(--space-6)',
                }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                    These recommendations are based on your Layer 1 profile — your broad values orientation.
                    Completing more of the quiz gives us more to work with and increases confidence.
                  </p>
                </div>
              )}

              {raceResults.map((result) => (
                <RaceSection
                  key={result.raceId}
                  raceResult={result}
                  userId={userId}
                  mantleType={mantleType}
                  completionPercent={completionPercent}
                />
              ))}

              {/* Completion nudge — bottom of results, only for Layer 1 (§22.3 Option C) */}
              {displayPct === 40 && (
                <div style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-5)',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-bg-surface)',
                  marginTop: 'var(--space-8)',
                }}>
                  <p style={{ margin: '0 0 var(--space-3)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                    Get more precise recommendations
                  </p>
                  <p style={{ margin: '0 0 var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                    You&apos;re at 40% — finish the quiz to unlock issue-level positions and dealbreaker
                    filtering, which sharpen these recommendations significantly.
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
                    Continue the quiz →
                  </a>
                </div>
              )}
            </>
          )}

          {ballot && raceResults.length === 0 && !isPending && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
              No federal races found for this address. Check back closer to the 2026 general election.
            </p>
          )}
        </>
      )}
    </main>
  )
}
