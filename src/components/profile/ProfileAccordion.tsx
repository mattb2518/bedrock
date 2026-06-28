'use client'

// The profile page as a single-open accordion of thin tiles. Clicking a tile
// expands it and collapses whatever was open. Civic Profile and Political
// Background read the client-side quiz store, so they live here (a client
// component) rather than in the server page — which is also why the old static
// "you haven't taken the quiz" card was always wrong.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuizStore } from '@/store/quizStore'
import { mantleFor } from '@/lib/quiz/mantles'
import { LINEAGE_TRIGGERS } from '@/lib/quiz/demographics'
import type { Demographics } from '@/types/quiz'
import DemographicsBody from '@/components/profile/DemographicsCard'
import ChangePassword from '@/components/auth/ChangePassword'
import ChangeEmail from '@/components/auth/ChangeEmail'
import SignOutButton from '@/components/auth/SignOutButton'
import DeleteAccount from '@/components/auth/DeleteAccount'

const primaryBtn: React.CSSProperties = {
  backgroundColor: 'var(--color-red)',
  color: '#fff',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--weight-semibold)',
  fontSize: 'var(--text-body)',
  padding: 'var(--space-3) var(--space-5)',
  borderRadius: 'var(--btn-radius)',
  textDecoration: 'none',
  display: 'inline-block',
}
const ghostBtn: React.CSSProperties = {
  ...primaryBtn,
  backgroundColor: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border)',
}
const fieldLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-1)',
}
const fieldValue: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  color: 'var(--color-text-primary)',
}

// How many demographic items the user hasn't answered yet. Drives the "to add"
// flag on the collapsed tile. Lineage only counts when the relationship answer
// triggers it; the free-text note is a catch-all, not a required item.
const DEMO_FIELDS: (keyof Demographics)[] = [
  'partyRelationship',
  'currentRegistration',
  'upbringing',
  'ageRange',
  'geography',
  'region',
  'regionGrewUp',
]
function openDemoItems(demo?: Demographics): number {
  let open = DEMO_FIELDS.filter((f) => !demo?.[f]).length
  if (demo?.partyRelationship && LINEAGE_TRIGGERS.includes(demo.partyRelationship) && !demo.lineage) open += 1
  return open
}

function AccountBody({ email, provider, joinedAt }: { email: string; provider: string; joinedAt: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div>
        <p style={fieldLabel}>Email</p>
        <p style={fieldValue}>{email}</p>
      </div>
      <div>
        <p style={fieldLabel}>Signed in with</p>
        <p style={{ ...fieldValue, textTransform: 'capitalize' }}>{provider === 'google' ? 'Google' : 'Email & password'}</p>
      </div>
      <div>
        <p style={fieldLabel}>Member since</p>
        <p style={fieldValue}>{joinedAt}</p>
      </div>
    </div>
  )
}

function CivicProfileBody() {
  const result = useQuizStore((s) => s.session?.result)

  if (!result) {
    return (
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
          Your civic type and constellation will appear here once you complete the quiz.
        </p>
        <Link href="/quiz" style={primaryBtn}>Take the quiz →</Link>
      </div>
    )
  }

  const mantle = mantleFor(result.primaryType)
  return (
    <div>
      <p style={fieldLabel}>Your mantle · {result.completionPercent}% mapped</p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
        You are {mantle.name}.
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-5)' }}>
        {mantle.oneLiner}.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Link href="/your-mantle" style={primaryBtn}>View your mantle →</Link>
        <Link href="/results" style={ghostBtn}>Full results</Link>
      </div>
    </div>
  )
}

function AccountActionsBody({ email, provider }: { email: string; provider: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {provider === 'google' ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
          Your email and password are managed through your Google account.
        </p>
      ) : (
        <>
          <ChangePassword email={email} />
          <ChangeEmail currentEmail={email} />
        </>
      )}
      <SignOutButton />
      <DeleteAccount />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
        Trouble deleting? Email <a href="mailto:hello@bedrock.guide" style={{ color: 'var(--color-blue-accent)' }}>hello@bedrock.guide</a> and we&apos;ll handle it and confirm.
      </p>
    </div>
  )
}

export default function ProfileAccordion({ email, provider, joinedAt }: { email: string; provider: string; joinedAt: string }) {
  const [open, setOpen] = useState<string | null>(null)

  // Store-derived flags are gated on a mounted flag so the persisted store can't
  // cause a hydration mismatch on the collapsed tile.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const demographics = useQuizStore((s) => s.session?.demographics)
  const openItems = mounted ? openDemoItems(demographics) : 0

  const badge =
    openItems > 0 ? (
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-gold)',
          border: '1px solid var(--color-gold)',
          borderRadius: 'var(--radius-full)',
          padding: '2px 9px',
          letterSpacing: 'var(--tracking-wide, 0.02em)',
          whiteSpace: 'nowrap',
        }}
      >
        {openItems} to add
      </span>
    ) : null

  const sections: { id: string; title: string; body: React.ReactNode; badge?: React.ReactNode }[] = [
    { id: 'civic', title: 'Civic profile', body: <CivicProfileBody /> },
    { id: 'background', title: 'Political background', body: <DemographicsBody />, badge },
    { id: 'account', title: 'Account', body: <AccountBody email={email} provider={provider} joinedAt={joinedAt} /> },
    { id: 'actions', title: 'Account actions', body: <AccountActionsBody email={email} provider={provider} /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: '520px' }}>
      {sections.map((s) => {
        const isOpen = open === s.id
        return (
          <div key={s.id} style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <button
              onClick={() => setOpen(isOpen ? null : s.id)}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 'var(--space-4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-4) var(--space-5)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
                textAlign: 'left',
              }}
            >
              {s.title}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {s.badge}
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    color: 'var(--color-text-muted)',
                    fontSize: '18px',
                    lineHeight: 1,
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  ›
                </span>
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: '0 var(--space-5) var(--space-5)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)' }}>
                {s.body}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
