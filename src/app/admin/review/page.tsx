import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function ReviewQueuePage({ searchParams }: Props) {
  const { type = 'candidate' } = await searchParams
  const activeType = type === 'source' ? 'source' : 'candidate'
  const admin = createAdminClient()

  const [candidateRows, sourceRows] =
    await Promise.all([
      admin.from('classified_candidates')
        .select('candidate_id, name, office, district, coverage_tier, status, created_at')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false }),
      admin.from('classified_sources')
        .select('source_id, name, kind, url, status, created_at')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false }),
    ])

  const candidates = candidateRows.data ?? []
  const sources = sourceRows.data ?? []

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
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>
        Review Queue
      </h1>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <Link href="/admin/review?type=candidate" style={tabStyle(activeType === 'candidate')}>
          Candidates ({candidates.length})
        </Link>
        <Link href="/admin/review?type=source" style={tabStyle(activeType === 'source')}>
          Sources ({sources.length})
        </Link>
      </div>

      {activeType === 'candidate' && (
        <EntryTable
          rows={candidates.map((c) => ({
            id: c.candidate_id,
            type: 'candidate' as const,
            primary: c.name,
            secondary: `${c.office} · ${c.district}`,
            meta: c.coverage_tier,
            createdAt: c.created_at,
          }))}
        />
      )}

      {activeType === 'source' && (
        <EntryTable
          rows={sources.map((s) => ({
            id: s.source_id,
            type: 'source' as const,
            primary: s.name,
            secondary: s.url,
            meta: s.kind,
            createdAt: s.created_at,
          }))}
        />
      )}
    </div>
  )
}

function EntryTable({ rows }: {
  rows: Array<{ id: string; type: 'candidate' | 'source'; primary: string; secondary: string; meta: string; createdAt: string }>
}) {
  if (rows.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-small)' }}>
        No pending entries.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {rows.map((row) => (
        <Link
          key={row.id}
          href={`/admin/review/${row.type}/${row.id}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-4)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.02)',
            textDecoration: 'none',
          }}
        >
          <div>
            <p style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 2 }}>
              {row.primary}
            </p>
            <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
              {row.secondary}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'var(--space-4)' }}>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {row.meta}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
              {new Date(row.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
