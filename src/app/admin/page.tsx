import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUserRole } from '@/lib/auth/getRole'
import ChecklistUI from './ChecklistUI'
import DigestButton from './DigestButton'

const CHECKLIST_ITEMS: Array<{ id: string; label: string }> = [
  { id: 'bias_check_quiz',           label: 'Run a bias check on all quiz questions (both passes: left critic, right critic) — extends to methodology copy, media-catalog Partisan Lean flag consistency, and Beyond Your Ballot governance-filter criteria' },
  { id: 'partisan_lean_consistency', label: 'Run a Partisan Lean flag consistency check across the media catalog (same threshold applied left and right)' },
  { id: 'bias_check_methodology',    label: 'Run a bias check on all methodology and FAQ copy' },
  { id: 'bias_check_byb_criteria',   label: 'Run a bias check on the Beyond Your Ballot governance-filter criteria' },
  { id: 'allsides_eligibility',      label: 'Confirm AllSides non-commercial eligibility in writing (email drafted, pending send to partnerships@allsides.com)' },
  { id: 'ad_fontes_pricing',         label: 'Confirm Ad Fontes Data Platform pricing and access (email drafted, pending send to info@adfontesmedia.com)' },
  { id: 'ballotpedia_licensing',     label: 'Initiate the Ballotpedia licensing conversation (email drafted, pending send to data@ballotpedia.org)' },
  { id: 'cookie_banner_review',      label: 'Cookie banner legal review: COMPLETE — founder decision, no banner required (strictly necessary auth + cookieless Plausible). Document in the Privacy page.' },
  { id: 'methodology_published',     label: 'Scoring methodology published on the site Methodology page' },
  { id: 'pew_typology_constants',    label: 'pew-typology.ts constants file built (Pew group attribution on all ten Mantle cards)' },
  { id: 'profile_export',            label: 'Profile export working and tested' },
  { id: 'account_deletion_cascade',  label: 'Account deletion cascade verified (Supabase on delete cascade)' },
  { id: 'demographics_opt_out',      label: 'Demographics opt-out toggle in account settings' },
  { id: 'anthropic_data_handling',   label: 'Anthropic API data-handling policy confirmed' },
  { id: 'pricing_model',             label: 'Pricing/donation model confirmed' },
  { id: 'open_source_scoring',       label: 'Open-source scoring code on GitHub, linked from the Methodology page' },
  { id: 'byb_json_populated',        label: 'Beyond Your Ballot static JSON populated before the pillar goes live' },
]

export default async function AdminOverviewPage() {
  const admin = createAdminClient()
  const role = await getCurrentUserRole()

  const [{ count: pendingCandidates }, { count: pendingSources }, { count: auditTotal }, { count: autoIngestedPending }, { data: checklistRows }] =
    await Promise.all([
      admin.from('classified_candidates').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      admin.from('classified_sources').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      admin.from('classification_audit_log').select('*', { count: 'exact', head: true }),
      admin.from('classified_candidates').select('*', { count: 'exact', head: true }).eq('status', 'pending_review').eq('attribution', 'auto_ingested'),
      admin.from('admin_checklist').select('item_id, checked'),
    ])

  const checkedSet = new Set((checklistRows ?? []).filter((r) => r.checked).map((r) => r.item_id))
  const doneCount = checkedSet.size
  const totalCount = CHECKLIST_ITEMS.length

  const stats = [
    { label: 'Candidates pending', value: pendingCandidates ?? 0, href: '/admin/review?type=candidate' },
    { label: 'Sources pending',    value: pendingSources ?? 0,    href: '/admin/review?type=source' },
    { label: 'Auto-ingested pending', value: autoIngestedPending ?? 0, href: '/admin/review?type=candidate&attribution=auto_ingested' },
    { label: 'Audit entries',      value: auditTotal ?? 0,        href: '/admin/audit' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)' }}>
          Overview
        </h1>
        {role === 'super_admin' && <DigestButton />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
        {stats.map(({ label, value, href }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 'var(--space-5)', background: 'rgba(255,255,255,0.03)' }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{value}</p>
              <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
          Pre-launch checklist
        </h2>
        <p style={{ fontSize: 'var(--text-small)', color: doneCount === totalCount ? '#22c55e' : 'var(--color-text-secondary)' }}>
          {doneCount}/{totalCount} complete
        </p>
      </div>

      <ChecklistUI items={CHECKLIST_ITEMS} checkedSet={Array.from(checkedSet)} isSuperAdmin={role === 'super_admin'} />
    </div>
  )
}
