'use client'

/**
 * §22b.6 — Public Lookup Mode: shows real officials/candidates to any visitor
 * (anonymous or signed-in without a profile) with zero classification calls.
 * Replaces the former hard "Start with the quiz" gate in Officials and Ballot modes.
 *
 * Behavior:
 * - AddressAutocomplete with no profile check blocking it.
 * - On select: savePendingAddress (no quiz_profiles write — no userId).
 * - Fetches officials via fetchCurrentOfficialsUnclassified (name/office/party/photo).
 * - Single CTA below the list: links to /quiz.
 * - Parameterized by mode so Officials and Ballot share one component.
 */

import { useState, useTransition } from 'react'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import { savePendingAddress } from '@/store/quizStore'
import { resolveDistrict } from '@/lib/civic/resolveDistrict'
import { fetchCurrentOfficialsUnclassified } from '@/lib/civic/currentOfficials'
import type { UnclassifiedOfficial, UnclassifiedOfficialsBallot } from '@/lib/civic/currentOfficials'

// ── LOCKED copy (§22b.6) ──────────────────────────────────────────────────────
const COPY = {
  officials: {
    intro: 'Find out who represents you — right now, no account needed.',
    cta: 'See how your values compare to the officials above — take the 5-minute quiz →',
  },
  ballot: {
    intro: "Find out who's on your ballot — right now, no account needed.",
    cta: 'See how your values compare to the candidates above — take the 5-minute quiz →',
  },
} as const

// ── Basic official card (name / party / office / district / optional photo) ───

function BasicOfficialCard({ official }: { official: UnclassifiedOfficial }) {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      backgroundColor: 'var(--color-bg-surface)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
    }}>
      {official.photoUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={official.photoUrl}
          alt=""
          aria-hidden
          width={56}
          height={56}
          style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      )}
      <div>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
          {official.name}
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
          {official.office}{official.party ? ` · ${official.party}` : ''}
        </p>
      </div>
    </div>
  )
}

// ── PublicLookupGate ──────────────────────────────────────────────────────────

export default function PublicLookupGate({ mode }: { mode: 'officials' | 'ballot' }) {
  const copy = COPY[mode]
  const [savedAddress, setSavedAddress] = useState<string | null>(null)
  const [showAddressInput, setShowAddressInput] = useState(false)
  const [results, setResults] = useState<UnclassifiedOfficialsBallot | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleAddressSelect(formattedAddress: string) {
    setSavedAddress(formattedAddress)
    setShowAddressInput(false)
    setResults(null)
    setFetchError(null)
    // Save to session (carries into quiz). No quiz_profiles write — no profile row exists.
    savePendingAddress(formattedAddress)
    startTransition(async () => {
      try {
        const { state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict } =
          await resolveDistrict(formattedAddress)
        if (!state) {
          setFetchError('Could not determine your state from that address. Try including your city and state.')
          return
        }
        const data = await fetchCurrentOfficialsUnclassified(
          state, congressionalDistrict, stateSenateDistrict, stateHouseDistrict
        )
        setResults(data)
      } catch {
        setFetchError('Could not look up that address. Try including your city, state, and ZIP code.')
      }
    })
  }

  // Flatten all non-null officials in display order: senators, rep, governor, state leg
  const officialsList: UnclassifiedOfficial[] = results
    ? [
        ...results.senators,
        ...(results.representative ? [results.representative] : []),
        ...(results.governor ? [results.governor] : []),
        ...(results.stateUpperLeg ? [results.stateUpperLeg] : []),
        ...(results.stateLowerLeg ? [results.stateLowerLeg] : []),
      ]
    : []

  return (
    <div>
      {/* Intro */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
        {copy.intro}
      </p>

      {/* Address input or stored address */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        {savedAddress && !showAddressInput ? (
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            Matched to{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>{savedAddress}</strong>
            {' · '}
            <button
              onClick={() => { setShowAddressInput(true); setResults(null); setFetchError(null) }}
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

      {/* Loading */}
      {isPending && (
        <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{
              display: 'inline-block', width: 16, height: 16, borderRadius: '50%',
              border: '2px solid var(--color-border)',
              borderTopColor: 'var(--color-blue-accent)',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0,
            }} aria-hidden />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
              Looking up your representatives…
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {results && !isPending && (
        <>
          {results.governorCoverageNote && (
            <p style={{ margin: '0 0 var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
              Note: {results.governorCoverageNote}
            </p>
          )}

          {officialsList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
              {officialsList.map((o) => (
                <BasicOfficialCard key={o.id} official={o} />
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
              No officials found for this address. Check back later.
            </p>
          )}

          {/* Single CTA — LOCKED copy */}
          <div style={{
            padding: 'var(--space-6)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-surface)',
            textAlign: 'center',
          }}>
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
              {copy.cta}
            </a>
          </div>
        </>
      )}
    </div>
  )
}
