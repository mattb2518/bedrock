import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminOverviewPage() {
  const admin = createAdminClient()

  const [{ count: pendingCandidates }, { count: pendingSources }, { count: auditTotal }] =
    await Promise.all([
      admin.from('classified_candidates').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      admin.from('classified_sources').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      admin.from('classification_audit_log').select('*', { count: 'exact', head: true }),
    ])

  const stats = [
    { label: 'Candidates pending', value: pendingCandidates ?? 0, href: '/admin/review?type=candidate' },
    { label: 'Sources pending',    value: pendingSources ?? 0,    href: '/admin/review?type=source' },
    { label: 'Audit entries',      value: auditTotal ?? 0,        href: '/admin/audit' },
  ]

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-8)' }}>
        Overview
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
        {stats.map(({ label, value, href }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: 'var(--space-5)',
              background: 'rgba(255,255,255,0.03)',
            }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                {value}
              </p>
              <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                {label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
        Pre-launch checklist
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {[
          { done: false, label: 'Run bias check on all quiz questions (both passes: left critic, right critic)' },
          { done: false, label: 'Run Partisan Lean flag consistency check across media catalog' },
          { done: false, label: 'Run bias check on methodology and FAQ copy' },
          { done: false, label: 'Run bias check on Beyond Your Ballot governance-filter criteria' },
          { done: false, label: 'Confirm AllSides non-commercial eligibility in writing' },
          { done: false, label: 'Confirm Ad Fontes Data Platform pricing and access' },
          { done: false, label: 'Initiate Ballotpedia licensing conversation' },
          { done: true,  label: 'Cookie banner legal review: complete — no banner required' },
          { done: false, label: 'Scoring methodology published on the Methodology page' },
          { done: false, label: 'pew-typology.ts constants file built' },
          { done: false, label: 'Profile export working and tested' },
          { done: true,  label: 'Account deletion cascade verified (on delete cascade)' },
          { done: false, label: 'Demographics opt-out toggle in account settings' },
          { done: false, label: 'Anthropic API data-handling policy confirmed' },
          { done: false, label: 'Pricing/donation model confirmed' },
          { done: false, label: 'Open-source scoring code on GitHub, linked from Methodology page' },
          { done: false, label: 'Beyond Your Ballot static JSON populated before pillar goes live' },
        ].map(({ done, label }) => (
          <li key={label} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', fontSize: 'var(--text-small)', color: done ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>
            <span style={{ flexShrink: 0, marginTop: 2 }}>{done ? '✓' : '○'}</span>
            <span style={{ textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
