import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeFeedbackSummary } from '@/lib/admin/feedbackThreshold'
import FeedbackEntityRow from './FeedbackEntityRow'

export default async function FeedbackDashboardPage() {
  const admin = createAdminClient()

  // Fetch all feedback — both tables. Pages will be empty until pillars are built.
  const [{ data: candidateFeedback }, { data: sourceFeedback }] = await Promise.all([
    admin.from('candidate_feedback')
      .select('candidate_id, feedback_type, free_text, chips_selected, user_mantle_type, created_at'),
    admin.from('source_feedback')
      .select('source_id, feedback_type, free_text, chips_selected, user_mantle_type, created_at'),
  ])

  const cf = candidateFeedback ?? []
  const sf = sourceFeedback ?? []
  const totalFeedback = cf.length + sf.length

  // Aggregate candidate feedback by entity
  const candidateMap = new Map<string, { thumbsDown: number; total: number; freeText: string[]; chips: string[]; mantles: string[] }>()
  for (const row of cf) {
    const e = candidateMap.get(row.candidate_id) ?? { thumbsDown: 0, total: 0, freeText: [], chips: [], mantles: [] }
    e.total++
    if (row.feedback_type === 'thumbs_down') {
      e.thumbsDown++
      if (row.free_text) e.freeText.push(row.free_text)
      e.chips.push(...(row.chips_selected ?? []))
    }
    if (row.user_mantle_type) e.mantles.push(row.user_mantle_type)
    candidateMap.set(row.candidate_id, e)
  }

  // Aggregate source feedback by entity
  const sourceMap = new Map<string, { thumbsDown: number; total: number; freeText: string[]; chips: string[]; mantles: string[] }>()
  for (const row of sf) {
    const e = sourceMap.get(row.source_id) ?? { thumbsDown: 0, total: 0, freeText: [], chips: [], mantles: [] }
    e.total++
    if (row.feedback_type === 'thumbs_down') {
      e.thumbsDown++
      if (row.free_text) e.freeText.push(row.free_text)
      e.chips.push(...(row.chips_selected ?? []))
    }
    if (row.user_mantle_type) e.mantles.push(row.user_mantle_type)
    sourceMap.set(row.source_id, e)
  }

  // Build summaries, sorted by thumbs-down rate descending
  const candidateSummaries = Array.from(candidateMap.entries())
    .map(([id, v]) => ({ ...computeFeedbackSummary(id, v.total, v.thumbsDown), type: 'candidate' as const, freeText: v.freeText, chips: v.chips, mantles: v.mantles }))
    .sort((a, b) => b.thumbsDownRate - a.thumbsDownRate)

  const sourceSummaries = Array.from(sourceMap.entries())
    .map(([id, v]) => ({ ...computeFeedbackSummary(id, v.total, v.thumbsDown), type: 'source' as const, freeText: v.freeText, chips: v.chips, mantles: v.mantles }))
    .sort((a, b) => b.thumbsDownRate - a.thumbsDownRate)

  // Disagreement rate by mantle type (across all feedback)
  const mantleDisagreement = new Map<string, { total: number; thumbsDown: number }>()
  for (const row of [...cf, ...sf]) {
    if (!row.user_mantle_type) continue
    const e = mantleDisagreement.get(row.user_mantle_type) ?? { total: 0, thumbsDown: 0 }
    e.total++
    if (row.feedback_type === 'thumbs_down') e.thumbsDown++
    mantleDisagreement.set(row.user_mantle_type, e)
  }

  const autoFlaggedCount = [...candidateSummaries, ...sourceSummaries].filter((s) => s.autoFlagged).length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            Feedback Dashboard
          </h1>
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            {totalFeedback === 0
              ? 'No feedback yet — this dashboard will populate once Your Ballot and Media Diet pillars are live.'
              : `${totalFeedback} total feedback events`}
          </p>
        </div>
        {autoFlaggedCount > 0 && (
          <div style={{ padding: '6px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)' }}>
            {autoFlaggedCount} auto-flagged (&gt;30% thumbs-down)
          </div>
        )}
      </div>

      {totalFeedback === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Thumbs-down rate by mantle type */}
          {mantleDisagreement.size > 0 && (
            <Section title="Disagreement rate by Mantle type">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                {Array.from(mantleDisagreement.entries())
                  .sort((a, b) => (b[1].thumbsDown / b[1].total) - (a[1].thumbsDown / a[1].total))
                  .map(([mantle, { total, thumbsDown }]) => {
                    const rate = total > 0 ? thumbsDown / total : 0
                    return (
                      <div key={mantle} style={{ padding: 'var(--space-3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
                        <p style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 4 }}>{mantle}</p>
                        <p style={{ fontSize: 11, color: rate > 0.3 ? '#ef4444' : 'var(--color-text-secondary)' }}>
                          {(rate * 100).toFixed(0)}% thumbs-down · {total} total
                        </p>
                      </div>
                    )
                  })}
              </div>
            </Section>
          )}

          {/* Candidate feedback table */}
          {candidateSummaries.length > 0 && (
            <Section title="Candidates — by thumbs-down rate">
              {candidateSummaries.map((s) => (
                <FeedbackEntityRow key={s.entityId} summary={s} type="candidate" />
              ))}
            </Section>
          )}

          {/* Source feedback table */}
          {sourceSummaries.length > 0 && (
            <Section title="Sources — by thumbs-down rate">
              {sourceSummaries.map((s) => (
                <FeedbackEntityRow key={s.entityId} summary={s} type="source" />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-8)' }}>
      <h2 style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ padding: 'var(--space-10)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 10, textAlign: 'center' }}>
      <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
        No feedback data yet.
      </p>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto' }}>
        Feedback data will appear here once the Your Ballot (§22) and Media Diet (§24) pillars are live and users begin rating recommendations. The schema is in place — this dashboard is ready to populate.
      </p>
      <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'center', gap: 'var(--space-6)' }}>
        {[
          { label: 'Candidate feedback events', value: 0 },
          { label: 'Source feedback events', value: 0 },
          { label: 'Auto-flagged entities', value: 0 },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Suppress unused import warning — Link used conditionally
void Link
