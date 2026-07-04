'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import { useQuizStore, savePendingAddress } from '@/store/quizStore'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import { PILLAR_ONE } from '@/lib/config/pillarOne'
import { usePillarOneMode } from '@/components/providers/PillarOneModeProvider'
import { matchRace, ALL_DIMENSIONS } from '@/lib/engine/match'
import { buildMatchKey } from '@/lib/engine/buildMatchKey'
import { resolveDistrict } from '@/lib/civic/resolveDistrict'
import { fetchFederalCandidates } from '@/lib/civic/federalCandidates'
import { fetchStateLegCandidates } from '@/lib/civic/stateLegCandidates'
import { fetchCurrentOfficials } from '@/lib/civic/currentOfficials'
import { createClient } from '@/lib/supabase/client'
import type { RankedCandidate, RaceResult, ConfidenceBand, Dimension } from '@/lib/engine/match'
import type { FederalCandidate, FederalBallot } from '@/lib/civic/federalCandidates'
import type { StateLegBallot } from '@/lib/civic/stateLegCandidates'
import type { CurrentOfficial, CurrentOfficialsBallot } from '@/lib/civic/currentOfficials'
import { isStateLegCandidate, type BallotCandidate } from '@/lib/civic/ballotTypes'
import Constellation from '@/components/ui/Constellation'

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
  // bc is the same object narrowed through the BallotCandidate union for type-guarded access
  const bc = candidate as unknown as BallotCandidate

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
        {isStateLegCandidate(bc) && bc.websiteUrl && (
          <a href={bc.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
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
            {isStateLegCandidate(bc) && bc.openStatesId && (
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

// ── Officials mode (§22b) ─────────────────────────────────────────────────────

// Dimension order matching Constellation.tsx DIMENSION_AXES.outer
const CONSTELLATION_DIMS: Dimension[] = [
  'stability_change',
  'local_federal',
  'national_global',
  'rules_outcomes',
  'markets_governance',
  'pragmatism_idealism',
  'individual_collective',
  'trust_skepticism',
]

function officialScoresForConstellation(official: CurrentOfficial): number[] {
  return CONSTELLATION_DIMS.map((dim) => {
    const ap = official.axisPlacement[dim]
    return ap ? ap.score / 100 : 0
  })
}

function userScoresForConstellation(dimensionScores: Record<Dimension, number>): number[] {
  return CONSTELLATION_DIMS.map((dim) => (dimensionScores[dim] ?? 50) / 100)
}

// ── OfficialCard ──────────────────────────────────────────────────────────────

function OfficialCard({
  official,
  ranked,
  userDimensionScores,
  officialName,
}: {
  official: CurrentOfficial
  ranked: RankedCandidate
  userDimensionScores: Record<Dimension, number>
  officialName: string
}) {
  const { topAlignedAxes, topDivergentAxes, unknownDealbreakers } = ranked

  // Dealbreaker crosses — flags only, never exclusion (§22b.4)
  const crossedDealbreakers = Object.entries(official.dealbreakers)
    .filter(([, v]) => v.status === 'crosses')
    .map(([k]) => k)

  const userScores = userScoresForConstellation(userDimensionScores)
  const officialScores = officialScoresForConstellation(official)

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      backgroundColor: 'var(--color-bg-surface)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      {/* Header */}
      <div>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
          {official.name}
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
          {official.office}{official.party ? ` · ${official.party}` : ''}
        </p>
      </div>

      {/* Constellation overlay */}
      <div style={{ maxWidth: 300, margin: '0 auto' }}>
        <Constellation
          scores={userScores}
          overlaySeries={{ scores: officialScores, label: officialName }}
          size={280}
          showLabels={true}
          showGrid={true}
        />
      </div>

      {/* Per-dimension convergence/divergence */}
      {(topAlignedAxes.length > 0 || topDivergentAxes.length > 0) && (
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          {topAlignedAxes.length > 0 && (
            <><strong style={{ color: 'var(--color-text-primary)' }}>Aligns with you on:</strong>{' '}
            {topAlignedAxes.map((a) => AXIS_LABEL[a] ?? a).join(', ')}</>
          )}
          {topAlignedAxes.length > 0 && topDivergentAxes.length > 0 && ' · '}
          {topDivergentAxes.length > 0 && (
            <><strong style={{ color: 'var(--color-text-primary)' }}>Diverges on:</strong>{' '}
            {topDivergentAxes.map((a) => AXIS_LABEL[a] ?? a).join(', ')}</>
          )}
        </p>
      )}

      {/* Crossed dealbreaker flag — flag only, no exclusion (§22b.4) */}
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
              {crossedDealbreakers.join(', ')}
            </p>
          </div>
        </div>
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

      {/* Low-confidence disclosure for state legislators with thin records (§22b.4) */}
      {official.lowConfidence && (
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          Limited voting record available — this comparison may be less precise than for other officials.
        </p>
      )}
    </div>
  )
}

// ── YourOfficialsMode ─────────────────────────────────────────────────────────

function YourOfficialsMode({
  completionPercent,
  userId,
  hasProfile,
}: {
  completionPercent: number
  userId: string | null
  hasProfile: boolean
}) {
  const session = useQuizStore((s) => s.session)
  const pillarOneMode = usePillarOneMode()
  const p1 = PILLAR_ONE[pillarOneMode]
  const [savedAddress, setSavedAddress] = useState<string | null>(null)
  const [showAddressInput, setShowAddressInput] = useState(false)
  const [officials, setOfficials] = useState<CurrentOfficialsBallot | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [loadingLong, setLoadingLong] = useState(false)

  // After ~9s of pending, show the extended loading message
  useEffect(() => {
    if (!isPending) { setLoadingLong(false); return }
    const t = setTimeout(() => setLoadingLong(true), 9000)
    return () => clearTimeout(t)
  }, [isPending])

  // Load saved address from profile on mount; auto-fetch officials if found
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    void supabase.from('quiz_profiles').select('formatted_address').eq('user_id', userId).maybeSingle().then(({ data }) => {
      const addr = data?.formatted_address
      if (addr) {
        setSavedAddress(addr)
        startTransition(async () => {
          try {
            const { state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict } = await resolveDistrict(addr)
            if (!state) return
            const result = await fetchCurrentOfficials(state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict)
            setOfficials(result)
          } catch { /* user can retry via Change */ }
        })
      }
    })
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddressSelect(formattedAddress: string) {
    setSavedAddress(formattedAddress)
    setShowAddressInput(false)
    setOfficials(null)
    setFetchError(null)
    savePendingAddress(formattedAddress)
    if (userId) {
      await createClient().from('quiz_profiles').upsert(
        { user_id: userId, formatted_address: formattedAddress },
        { onConflict: 'user_id' }
      )
    }
    startTransition(async () => {
      try {
        const { state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict } = await resolveDistrict(formattedAddress)
        if (!state) {
          setFetchError('Could not determine your state from that address. Try including your city and state.')
          return
        }
        const result = await fetchCurrentOfficials(state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict)
        setOfficials(result)
      } catch {
        setFetchError('Could not look up that address. Try including your city, state, and ZIP code.')
      }
    })
  }

  const matchKey = useMemo(() => {
    if (!session?.result) return null
    return buildMatchKey(session.result, session)
  }, [session])

  // Run each official through the match engine to get aligned/divergent axes
  const rankedByOfficialId = useMemo<Map<string, RankedCandidate>>(() => {
    if (!matchKey || !officials) return new Map()
    const allOfficials: (CurrentOfficial | null)[] = [
      ...officials.senators,
      officials.representative,
      officials.governor,
      officials.stateUpperLeg,
      officials.stateLowerLeg,
    ]
    const present = allOfficials.filter((o): o is CurrentOfficial => o !== null)
    const result = new Map<string, RankedCandidate>()
    for (const official of present) {
      const raceResult = matchRace({
        raceId: `official-${official.id}`,
        candidates: [official],
        key: matchKey,
        dealbreakersAsFlags: true,  // officials: flags only, never exclusion
      })
      if (raceResult.ranked[0]) {
        result.set(official.id, raceResult.ranked[0])
      }
    }
    return result
  }, [matchKey, officials])

  const userDimensionScores = (session?.result?.profile ?? {}) as Record<Dimension, number>

  const officialsToShow: { official: CurrentOfficial; label: string }[] = officials
    ? [
        ...officials.senators.map((o) => ({ official: o, label: o.name.split(',')[0] })),
        ...(officials.representative ? [{ official: officials.representative, label: officials.representative.name.split(',')[0] }] : []),
        ...(officials.governor ? [{ official: officials.governor, label: officials.governor.name.split(',')[0] }] : []),
        ...(officials.stateUpperLeg ? [{ official: officials.stateUpperLeg, label: officials.stateUpperLeg.name.split(',')[0] }] : []),
        ...(officials.stateLowerLeg ? [{ official: officials.stateLowerLeg, label: officials.stateLowerLeg.name.split(',')[0] }] : []),
      ]
    : []

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>

      {/* Eyebrow + headline (reads PILLAR_ONE[mode] per §22c Tier A) */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-red)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
        {p1.eyebrow}
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-5)' }}>
        {p1.h1}
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
        {p1.coverageNote}
      </p>

      {/* Quiz gate */}
      {!hasProfile ? (
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
            Your Officials matches your representatives to your specific values. Without a profile, there&apos;s nothing to match against.
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
          {/* Address — §22d: AddressAutocomplete or stored-address read path */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            {savedAddress && !showAddressInput ? (
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                Matched to{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>{savedAddress}</strong>
                {' · '}
                <button
                  onClick={() => { setShowAddressInput(true); setOfficials(null); setFetchError(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue-accent)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 0 }}
                >
                  Change
                </button>
              </p>
            ) : (
              <AddressAutocomplete
                placeholder="Start typing your street address…"
                onSelect={(addr) => { void handleAddressSelect(addr) }}
                initialValue={savedAddress ?? ''}
              />
            )}
            {fetchError && (
              <p style={{ margin: 'var(--space-2) 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)' }}>
                {fetchError}
              </p>
            )}
          </div>

          {/* Loading state */}
          {isPending && (
            <div style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <span style={{
                  display: 'inline-block', width: 18, height: 18, borderRadius: '50%',
                  border: '2px solid var(--color-border)',
                  borderTopColor: 'var(--color-blue-accent)',
                  animation: 'spin 0.8s linear infinite',
                  flexShrink: 0,
                }} aria-hidden />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                  Looking up your officials…
                </p>
              </div>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                {loadingLong
                  ? 'This can take up to a minute — we\'re reading their public record, not just their press releases.'
                  : 'Fetching your representatives and comparing them to your values profile.'}
              </p>
            </div>
          )}

          {/* Officials cards */}
          {officials && !isPending && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {officials.governorCoverageNote && (
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                  Note: {officials.governorCoverageNote}
                </p>
              )}
              {officialsToShow.length === 0 && officials.sourceErrors.length > 0 && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
                  We hit a problem loading your officials — this one&apos;s on us. Try again shortly.
                </p>
              )}
              {officialsToShow.length === 0 && officials.sourceErrors.length === 0 && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
                  No officials found for this address. Check back later.
                </p>
              )}
              {officialsToShow.map(({ official, label }) => {
                const ranked = rankedByOfficialId.get(official.id)
                if (!ranked) return null
                return (
                  <OfficialCard
                    key={official.id}
                    official={official}
                    ranked={ranked}
                    userDimensionScores={userDimensionScores}
                    officialName={label}
                  />
                )
              })}
              {/* Methodology link */}
              <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-surface)' }}>
                <a href="/methodology#ballot" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
                  How we classify officials →
                </a>
                <p style={{ margin: 'var(--space-2) 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                  This shows how your values compare to your representatives&apos; actual public record — not a rating or grade.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}

// ── Ballot data readiness flag ────────────────────────────────────────────────
// Flip to true when classified_candidates has approved rows for at least one state.
// When mode='ballot' and this is false, YourBallotHoldingState renders explicitly
// rather than silently falling back to officials mode.
const BALLOT_DATA_READY = false

// ── Sample watermark ──────────────────────────────────────────────────────────

function SampleWatermark() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 1,
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: '700',
        fontSize: '64px',
        color: 'var(--color-text-primary)',
        opacity: 0.1,
        transform: 'rotate(-30deg)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.1em',
      }}>
        SAMPLE
      </span>
    </div>
  )
}

// ── Sample candidate card (Your Ballot) ───────────────────────────────────────

interface SampleBallotCandidate {
  name: string
  party: string
  office: string
  confidence: 'confident' | 'lean'
  explanation: string
  alignedAxes: string[]
  dealbreaker?: string
  campaignSite: string
}

function SampleCandidateCard({ candidate }: { candidate: SampleBallotCandidate }) {
  const color = candidate.confidence === 'confident' ? 'var(--color-green)' : 'var(--color-blue-accent)'
  const label = candidate.confidence === 'confident' ? 'Strong match' : 'Moderate match'

  return (
    <div style={{
      position: 'relative',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      backgroundColor: 'var(--color-bg-surface)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}>
      <SampleWatermark />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
            {candidate.name}
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            {candidate.office} · {candidate.party}
          </p>
        </div>
        <span style={{ fontSize: 'var(--text-small)', fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color, backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '2px 8px', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>

      {/* Explanation */}
      <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
        {candidate.explanation}
      </p>

      {/* Aligned axes */}
      <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>Aligns with you on:</strong>{' '}
        {candidate.alignedAxes.join(', ')}
      </p>

      {/* Dealbreaker flag */}
      {candidate.dealbreaker && (
        <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-primary)' }}>
            🚩 <strong>Dealbreaker flagged:</strong> {candidate.dealbreaker}
          </p>
        </div>
      )}

      {/* Links */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <a href={candidate.campaignSite} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
          Campaign site ↗
        </a>
      </div>

      {/* Learn more (non-interactive in sample) */}
      <button disabled style={{ background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', padding: 0, textAlign: 'left', cursor: 'default' }}>
        ▸ Learn more — full axis breakdown, campaign finance, sources
      </button>
    </div>
  )
}

const SAMPLE_BALLOT_CANDIDATES: SampleBallotCandidate[] = [
  {
    name: 'Alex Rivera',
    party: 'Independent',
    office: 'U.S. Senate · Westfield',
    confidence: 'confident',
    explanation: 'Rivera\'s voting record on institutional reform and fiscal federalism closely tracks how you scored on the rules-vs-outcomes and local-vs-federal axes — the two dimensions where your profile is most defined.',
    alignedAxes: ['rules vs. outcomes', 'local vs. federal authority'],
    campaignSite: '#',
  },
  {
    name: 'Jordan Mitchell',
    party: 'Democrat',
    office: 'U.S. House · District 7, Lakeport',
    confidence: 'lean',
    explanation: 'Mitchell aligns on pragmatism and institutional trust but diverges from you on the markets-vs-governance axis — included because the overall distance is low and the divergence is on a dimension where you hold lighter views.',
    alignedAxes: ['pragmatism vs. idealism', 'institutional trust'],
    dealbreaker: 'Supported legislation restricting ballot access in 2022',
    campaignSite: '#',
  },
]

// ── Your Ballot holding state ─────────────────────────────────────────────────

function YourBallotHoldingState({
  completionPercent,
  userId,
  hasProfile,
}: {
  completionPercent: number
  userId: string | null
  hasProfile: boolean
}) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [savedAddress, setSavedAddress] = useState<string | null>(null)
  const [showAddressInput, setShowAddressInput] = useState(false)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
    supabase.from('quiz_profiles').select('formatted_address').eq('user_id', userId).maybeSingle().then(({ data }) => {
      if (data?.formatted_address) setSavedAddress(data.formatted_address)
    })
  }, [userId])

  const isRegistered = Boolean(userId)

  async function handleAddressSelect(formattedAddress: string) {
    setSavedAddress(formattedAddress)
    setShowAddressInput(false)
    savePendingAddress(formattedAddress)
    if (userId) {
      await createClient().from('quiz_profiles').upsert({ user_id: userId, formatted_address: formattedAddress }, { onConflict: 'user_id' })
    }
  }

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>

      {/* Page header */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>
          Your Ballot
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-5)' }}>
          Every race on your ballot, matched to your values.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
          From president to state legislature — we match every candidate against your eight-dimension civic values profile. Not by party. By how they actually think and vote.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-3)' }}>
          We&apos;re waiting for primary season to wrap before we classify candidates. General election recommendations will be ready in fall 2026. We&apos;d rather show you nothing now than show you something that changes next week.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          We&apos;re starting with federal and statewide races, where the data is most reliable. Local races and ballot measures are harder — the information is patchy and inconsistent across jurisdictions — but we&apos;re working through it and will add coverage as we find sources we trust.
        </p>
      </div>

      {/* Address — §22d: autocomplete or stored-address read path */}
      <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
        {savedAddress && !showAddressInput ? (
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            Matched to <strong style={{ color: 'var(--color-text-primary)' }}>{savedAddress}</strong>{' · '}
            <button onClick={() => setShowAddressInput(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue-accent)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 0 }}>Change</button>
          </p>
        ) : (
          <>
            <p style={{ margin: '0 0 var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
              {hasProfile
                ? 'Add your address so we can personalize your ballot when it\'s ready.'
                : 'Add your address to personalize your ballot. Then create an account so we can email you when your races go live.'}
            </p>
            <AddressAutocomplete
              placeholder="Start typing your street address…"
              onSelect={handleAddressSelect}
            />
          </>
        )}
      </div>

      {/* Sample cards */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Here&apos;s what your ballot will look like
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {SAMPLE_BALLOT_CANDIDATES.map((c) => (
            <SampleCandidateCard key={c.name} candidate={c} />
          ))}
        </div>
      </div>

      {/* Methodology callout */}
      <div style={{ marginBottom: 'var(--space-10)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-surface)' }}>
        <a href="/methodology" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
          Here&apos;s how we classify candidates →
        </a>
        <p style={{ margin: 'var(--space-2) 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
          Every placement is based on voting records, stated positions, and campaign platforms — never party affiliation. Human editors review every classification before it goes live.
        </p>
      </div>

      {/* CTA */}
      {isRegistered ? (
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-3)' }}>
            We&apos;ll email you at <strong>{userEmail ?? 'your address on file'}</strong> when your ballot is ready. No action needed — you&apos;re on the list.
          </p>
          {completionPercent < 100 && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginTop: 'var(--space-3)' }}>
              <a href="/quiz" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>Complete your quiz to sharpen your recommendations →</a>
            </p>
          )}
        </div>
      ) : (
        <div>
          <a href="/quiz" style={{ display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: '#fff', backgroundColor: 'var(--color-red)', textDecoration: 'none', padding: 'var(--space-4) var(--space-6)', borderRadius: 'var(--btn-radius)', marginBottom: 'var(--space-3)' }}>
            Take the quiz / Create an account →
          </a>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Already have an account?{' '}
            <a href="/signin" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>Sign in →</a>
          </p>
        </div>
      )}

    </main>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function YourBallotPage() {
  const session = useQuizStore((s) => s.session)
  const hasProfile = Boolean(session?.result)
  const completionPercent = session?.result?.completionPercent ?? 0
  const userId = session?.userId ?? null

  const pillarOneMode = usePillarOneMode()

  const [savedAddress, setSavedAddress] = useState<string | null>(null)
  const [showAddressInput, setShowAddressInput] = useState(false)
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)
  const [ballot, setBallot] = useState<FederalBallot | null>(null)
  const [stateLegBallot, setStateLegBallot] = useState<StateLegBallot | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Load saved address from profile on mount; auto-fetch ballot when data becomes ready
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    void supabase.from('quiz_profiles').select('formatted_address').eq('user_id', userId).maybeSingle().then(({ data }) => {
      const addr = data?.formatted_address
      if (addr) {
        setSavedAddress(addr)
        if (BALLOT_DATA_READY) {
          startTransition(async () => {
            try {
              const { normalizedAddress, state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict } = await resolveDistrict(addr)
              if (!state) return
              const [federalBallot, stateLeg] = await Promise.all([
                fetchFederalCandidates(state, congressionalDistrict),
                fetchStateLegCandidates(state, stateSenateDistrict, stateHouseDistrict).catch(() => null),
              ])
              setBallot(federalBallot)
              setStateLegBallot(stateLeg)
              setResolvedAddress(normalizedAddress ?? addr)
            } catch { /* user can retry via Change */ }
          })
        }
      }
    })
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const mantleType = session?.result?.primaryType ?? null
  const displayPct = completionIndicatorPct(completionPercent)

  async function handleAddressSelect(formattedAddress: string) {
    setSavedAddress(formattedAddress)
    setShowAddressInput(false)
    setBallot(null)
    setStateLegBallot(null)
    setResolvedAddress(null)
    setAddressError(null)
    savePendingAddress(formattedAddress)
    if (userId) {
      await createClient().from('quiz_profiles').upsert(
        { user_id: userId, formatted_address: formattedAddress },
        { onConflict: 'user_id' }
      )
    }
    startTransition(async () => {
      try {
        const { normalizedAddress, state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict } = await resolveDistrict(formattedAddress)
        if (!state) {
          setAddressError('Could not determine your state from that address. Try including your city and state.')
          return
        }
        const [federalBallot, stateLeg] = await Promise.all([
          fetchFederalCandidates(state, congressionalDistrict),
          fetchStateLegCandidates(state, stateSenateDistrict, stateHouseDistrict).catch(() => null),
        ])
        setBallot(federalBallot)
        setStateLegBallot(stateLeg)
        setResolvedAddress(normalizedAddress ?? formattedAddress)
      } catch {
        setAddressError('Could not look up that address. Try including your city, state, and ZIP code.')
      }
    })
  }

  // ── Season routing — driven by site_config.pillar_one_mode, not a hardcoded flag ──────────
  // Officials mode: always renders YourOfficialsMode.
  // Ballot mode + no data yet: renders YourBallotHoldingState (explicit "coming soon").
  // Ballot mode + data ready: falls through to full ballot render below.
  // Never silently overrides the admin's season choice.
  if (pillarOneMode === 'officials') {
    return <YourOfficialsMode completionPercent={completionPercent} userId={userId} hasProfile={hasProfile} />
  }

  if (!BALLOT_DATA_READY) {
    return <YourBallotHoldingState completionPercent={completionPercent} userId={userId} hasProfile={hasProfile} />
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>

      {/* Eyebrow + headline */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-red)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
        Your Ballot
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', margin: 0 }}>
          Every race, matched to your values.
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

      {/* Coverage note */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
        Covers federal and state races for the fall 2026 general election. Local races and ballot measures are coming — we&apos;d rather show you nothing than something incomplete or unreliable.
      </p>

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
            in the loop.{' '}
            <a href="/methodology#ballot" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>Full methodology →</a>
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
          {/* ── Address — §22d: AddressAutocomplete or stored-address read path ── */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            {resolvedAddress ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Showing results for{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>{resolvedAddress}</strong>
                {' · '}
                <button
                  onClick={() => { setResolvedAddress(null); setBallot(null); setStateLegBallot(null); setShowAddressInput(true) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue-accent)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 0 }}
                >
                  Change
                </button>
              </p>
            ) : savedAddress && !showAddressInput ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Matched to{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>{savedAddress}</strong>
                {' · '}
                <button
                  onClick={() => setShowAddressInput(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue-accent)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 0 }}
                >
                  Change
                </button>
              </p>
            ) : (
              <>
                <AddressAutocomplete
                  placeholder="Start typing your street address…"
                  onSelect={(addr) => { void handleAddressSelect(addr) }}
                  initialValue={savedAddress ?? ''}
                />
                {addressError && (
                  <p style={{ margin: 'var(--space-2) 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)' }}>
                    {addressError}
                  </p>
                )}
              </>
            )}
          </div>

          {/* ── Ballot results ─────────────────────────────────────────────────── */}
          {isPending && (
            <div style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface)' }}>
              <p style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                Building your personalized ballot…
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                Reading candidate records for your district. This takes a few seconds on first lookup — results are cached for everyone in the same district after that.
              </p>
            </div>
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
