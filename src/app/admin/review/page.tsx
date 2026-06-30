import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import BulkActions from './BulkActions'
import ClassifyAutoIngestedButton from './ClassifyAutoIngestedButton'

interface Props {
  searchParams: Promise<{ type?: string; attribution?: string }>
}

export default async function ReviewQueuePage({ searchParams }: Props) {
  const { type = 'candidate', attribution } = await searchParams
  const activeType = type === 'source' ? 'source' : 'candidate'
  const filterAttribution = attribution === 'auto_ingested' ? 'auto_ingested' : null
  const admin = createAdminClient()

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoff = ninetyDaysAgo.toISOString().slice(0, 10)

  const [candidateRows, sourceRows, staleCandidates, staleSources, reconciliationCount] =
    await Promise.all([
      (() => {
        let q = admin.from('classified_candidates')
          .select('candidate_id, name, office, district, coverage_tier, status, attribution, created_at')
          .eq('status', 'pending_review')
          .eq('flagged_for_reconciliation', false)
        if (filterAttribution) q = q.eq('attribution', filterAttribution)
        return q.order('created_at', { ascending: false })
      })(),
      admin.from('classified_sources')
        .select('source_id, name, kind, url, status, attribution, created_at')
        .eq('status', 'pending_review')
        .eq('flagged_for_reconciliation', false)
        .order('created_at', { ascending: false }),
      admin.from('classified_candidates')
        .select('candidate_id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .or(`last_reviewed.is.null,last_reviewed.lt.${cutoff}`),
      admin.from('classified_sources')
        .select('source_id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .or(`last_reviewed.is.null,last_reviewed.lt.${cutoff}`),
      admin.from('classified_candidates')
        .select('candidate_id', { count: 'exact', head: true })
        .eq('flagged_for_reconciliation', true)
        .then(async (r1) => {
          const { count: c2 } = await admin.from('classified_sources')
            .select('source_id', { count: 'exact', head: true })
            .eq('flagged_for_reconciliation', true)
          return (r1.count ?? 0) + (c2 ?? 0)
        }),
    ])

  const candidates = candidateRows.data ?? []
  const sources = sourceRows.data ?? []
  const staleCount = activeType === 'candidate' ? (staleCandidates.count ?? 0) : (staleSources.count ?? 0)

  const autoIngestedCount = candidates.filter((c) => c.attribution === 'auto_ingested').length

  const candidateEntries = candidates.map((c) => ({ id: c.candidate_id, primary: `${c.name} — ${c.office}`, attribution: c.attribution as string | null }))
  const sourceEntries = sources.map((s) => ({ id: s.source_id, primary: s.name, attribution: s.attribution as string | null }))

  const tabStyle = (active: boolean) => ({
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 6,
    fontSize: 'var(--text-small)',
    fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-normal)',
    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    textDecoration: 'none',
    border: 'none',
  } as const)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)' }}>
          Review Queue
        </h1>
        {(reconciliationCount as number) > 0 && (
          <Link href="/admin/review/reconciliation" style={{ padding: '6px 14px', borderRadius: 6, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', textDecoration: 'none' }}>
            ⚠ Reconciliation queue ({reconciliationCount})
          </Link>
        )}
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Link href="/admin/review?type=candidate" style={tabStyle(activeType === 'candidate' && !filterAttribution)}>
          Candidates ({candidates.length})
        </Link>
        <Link href="/admin/review?type=source" style={tabStyle(activeType === 'source')}>
          Sources ({sources.length})
        </Link>
        {activeType === 'candidate' && (
          <Link
            href={filterAttribution ? '/admin/review?type=candidate' : '/admin/review?type=candidate&attribution=auto_ingested'}
            style={{
              ...tabStyle(!!filterAttribution),
              marginLeft: 'auto',
              background: filterAttribution ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.04)',
              color: filterAttribution ? '#60a5fa' : 'var(--color-text-secondary)',
            }}
          >
            {filterAttribution ? '✕ Clear filter' : `Auto-ingested (${autoIngestedCount})`}
          </Link>
        )}
      </div>

      {/* Classify auto-ingested batch trigger */}
      {activeType === 'candidate' && autoIngestedCount > 0 && (
        <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 8 }}>
          <p style={{ fontSize: 'var(--text-small)', color: '#60a5fa', marginBottom: 'var(--space-3)' }}>
            <strong>{autoIngestedCount}</strong> candidate{autoIngestedCount !== 1 ? 's' : ''} queued from live address lookups — not yet classified.
          </p>
          <ClassifyAutoIngestedButton count={autoIngestedCount} />
        </div>
      )}

      {activeType === 'candidate' && (
        <BulkActions
          type="candidate"
          entries={candidateEntries}
          staleCount={staleCount}
        />
      )}

      {activeType === 'source' && (
        <BulkActions
          type="source"
          entries={sourceEntries}
          staleCount={staleCount}
        />
      )}

      {/* Deep-link to individual entries */}
      <div style={{ marginTop: 'var(--space-4)' }}>
        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)' }}>
          Click an entry above to review individually, or use the checkboxes for bulk actions.
        </p>
        {activeType === 'candidate' && candidates.map((c) => (
          <Link key={c.candidate_id} href={`/admin/review/candidate/${c.candidate_id}`}
            style={{ display: 'block', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', textDecoration: 'none', padding: '2px 0' }}>
            → {c.name} ({c.office})
          </Link>
        ))}
        {activeType === 'source' && sources.map((s) => (
          <Link key={s.source_id} href={`/admin/review/source/${s.source_id}`}
            style={{ display: 'block', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', textDecoration: 'none', padding: '2px 0' }}>
            → {s.name}
          </Link>
        ))}
        {((activeType === 'candidate' && candidates.length === 0) || (activeType === 'source' && sources.length === 0)) && (
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>No pending entries.</p>
        )}
      </div>
    </div>
  )
}
