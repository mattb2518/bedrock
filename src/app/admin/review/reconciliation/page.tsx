import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function ReconciliationPage() {
  const admin = createAdminClient()

  const [{ data: candidates }, { data: sources }] = await Promise.all([
    admin.from('classified_candidates')
      .select('candidate_id, name, office, district, axis_placement, reconciliation_diff, created_at, updated_at')
      .eq('flagged_for_reconciliation', true)
      .order('updated_at', { ascending: false }),
    admin.from('classified_sources')
      .select('source_id, name, kind, url, axis_placement, reconciliation_diff, created_at, updated_at')
      .eq('flagged_for_reconciliation', true)
      .order('updated_at', { ascending: false }),
  ])

  const all = [
    ...(candidates ?? []).map((c) => ({ ...c, type: 'candidate' as const, id: c.candidate_id, label: `${c.name} — ${c.office}` })),
    ...(sources ?? []).map((s) => ({ ...s, type: 'source' as const, id: s.source_id, label: `${s.name} (${s.kind})` })),
  ]

  return (
    <div>
      <Link href="/admin/review" style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        ← Back to queue
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', margin: 'var(--space-6) 0 var(--space-2)' }}>
        Reconciliation Queue
      </h1>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        These entries have a re-classification that diverges &gt;20 points from the current approved version on at least one axis. Review the delta and decide which version is correct before approving.
      </p>

      {all.length === 0 && (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>No entries need reconciliation.</p>
      )}

      {all.map((entry) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const diff = (entry.reconciliation_diff ?? {}) as Record<string, { oldScore: number; newScore: number; delta: number; flagged: boolean }>
        const flaggedAxes = Object.entries(diff).filter(([, v]) => v.flagged)

        return (
          <div key={entry.id} style={{ marginBottom: 'var(--space-6)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: 'var(--space-5)', background: 'rgba(245,158,11,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  {entry.type}
                </p>
                <h2 style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  {entry.label}
                </h2>
                <p style={{ fontSize: 11, color: '#f59e0b' }}>
                  {flaggedAxes.length} axis{flaggedAxes.length !== 1 ? 'es' : ''} diverge &gt;20 pts
                </p>
              </div>
              <Link href={`/admin/review/${entry.type}/${entry.id}`}
                style={{ fontSize: 'var(--text-small)', color: '#60a5fa', textDecoration: 'none', alignSelf: 'flex-start' }}>
                View full entry →
              </Link>
            </div>

            {/* Side-by-side axis comparison — only flagged axes */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-small)' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '6px 12px', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-semibold)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Axis</th>
                    <th style={{ textAlign: 'center', padding: '6px 12px', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-semibold)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Current (approved)</th>
                    <th style={{ textAlign: 'center', padding: '6px 12px', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-semibold)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>New (re-classified)</th>
                    <th style={{ textAlign: 'center', padding: '6px 12px', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-semibold)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(diff).map(([axis, v]) => (
                    <tr key={axis} style={{ background: v.flagged ? 'rgba(245,158,11,0.07)' : 'transparent' }}>
                      <td style={{ padding: '6px 12px', color: 'var(--color-text-primary)', fontWeight: v.flagged ? 'var(--weight-semibold)' : 'var(--weight-normal)' }}>
                        {axis.replace(/_/g, ' ')}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 12px', color: 'var(--color-text-primary)' }}>
                        {v.oldScore}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 12px', color: 'var(--color-text-primary)' }}>
                        {v.newScore}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 12px', color: v.flagged ? '#f59e0b' : 'var(--color-text-secondary)', fontWeight: v.flagged ? 'var(--weight-semibold)' : 'var(--weight-normal)' }}>
                        {v.flagged ? `⚠ ${v.delta}` : v.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
