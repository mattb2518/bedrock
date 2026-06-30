import { createAdminClient } from '@/lib/supabase/admin'

export default async function AuditLogPage() {
  const admin = createAdminClient()

  const { data: entries } = await admin
    .from('classification_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const rows = entries ?? []

  const actionColor = (action: string) => {
    if (action === 'approved')   return '#22c55e'
    if (action === 'rejected')   return '#ef4444'
    if (action === 'overridden') return '#f59e0b'
    if (action.includes('reclassif')) return '#60a5fa'
    if (action.includes('promot') || action.includes('demot')) return '#c084fc'
    return 'var(--color-text-secondary)'
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
        Audit Log
      </h1>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        Append-only. Most recent 100 entries. No edits or deletes.
      </p>

      {rows.length === 0 && (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>No audit entries yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {rows.map((row) => (
          <div key={row.id} style={{
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: 'rgba(255,255,255,0.06)',
                    color: actionColor(row.action),
                  }}>
                    {row.action}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                    {row.entry_type}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', marginBottom: 2 }}>
                  {row.entry_id}
                </p>
                {row.previous_status && row.new_status && row.previous_status !== row.new_status && (
                  <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                    {row.previous_status} → {row.new_status}
                  </p>
                )}
                {row.notes && (
                  <details style={{ marginTop: 4 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 11, color: 'var(--color-text-tertiary)' }}>Notes</summary>
                    <pre style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {row.notes}
                    </pre>
                  </details>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  {new Date(row.created_at).toLocaleString()}
                </p>
                {row.actor_user_id && (
                  <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                    {row.actor_user_id.slice(0, 8)}…
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
