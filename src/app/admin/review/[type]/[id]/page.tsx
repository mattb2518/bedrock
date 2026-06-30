import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import EntryActions from './EntryActions'
import VerifyButton from './VerifyButton'

interface Props {
  params: Promise<{ type: string; id: string }>
}

export default async function EntryDetailPage({ params }: Props) {
  const { type, id } = await params
  if (type !== 'candidate' && type !== 'source') notFound()

  const admin = createAdminClient()

  if (type === 'candidate') {
    const { data: row } = await admin
      .from('classified_candidates')
      .select('*')
      .eq('candidate_id', id)
      .single()

    if (!row) notFound()

    return (
      <div>
        <Link href="/admin/review?type=candidate" style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          ← Back to queue
        </Link>

        <div style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <p style={{ fontSize: 11, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
            Candidate · {row.coverage_tier} · {row.status}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
            {row.name}
          </h1>
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            {row.office} · {row.district} {row.party ? `· ${row.party}` : ''}
          </p>
          {row.rhetorical_only && (
            <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-small)', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: 4, display: 'inline-block' }}>
              Rhetoric-only — no voting record (confidence capped at 0.50)
            </p>
          )}
        </div>

        {/* Axis placements */}
        <Section title="Axis Placements">
          <AxisTable axisPlacement={row.axis_placement ?? {}} />
        </Section>

        {/* Dealbreakers */}
        {row.dealbreakers && Object.keys(row.dealbreakers).length > 0 && (
          <Section title="Dealbreaker Evaluations">
            <DealbreakerTable dealbreakers={row.dealbreakers} />
          </Section>
        )}

        {/* Provenance */}
        <Section title="Provenance">
          <KeyVal label="Tagged by" value={row.tagged_by} />
          <KeyVal label="Reviewed by" value={row.reviewed_by ?? 'Not yet reviewed'} />
          <KeyVal label="Last reviewed" value={row.last_reviewed ?? '—'} />
          <KeyVal label="Methodology version" value={row.methodology_version} />
          <KeyVal label="Sources" value={(row.sourced_from as string[]).join(', ')} />
          {row.attribution && <KeyVal label="Attribution" value={row.attribution} />}
        </Section>

        {/* Raw classification (collapsible debug) */}
        {row.raw_classification && (
          <Section title="Raw Classification (debug)">
            <details>
              <summary style={{ cursor: 'pointer', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                Show raw JSON
              </summary>
              <pre style={{ fontSize: 11, color: 'var(--color-text-secondary)', overflowX: 'auto', marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(0,0,0,0.3)', borderRadius: 6 }}>
                {JSON.stringify(row.raw_classification, null, 2)}
              </pre>
            </details>
          </Section>
        )}

        {/* Perplexity verification */}
        <VerifyButton
          type="candidate"
          id={id}
          lastCheck={row.perplexity_last_check as { checkedAt: string; summary: string } | null}
        />

        {/* Actions */}
        <EntryActions
          type="candidate"
          id={id}
          currentStatus={row.status}
          editableFields={{
            axis_placement: row.axis_placement ?? {},
            dealbreakers: row.dealbreakers ?? {},
            rhetorical_only: row.rhetorical_only,
            independent_minded_score: row.independent_minded_score,
          }}
        />
      </div>
    )
  }

  // type === 'source'
  const { data: row } = await admin
    .from('classified_sources')
    .select('*')
    .eq('source_id', id)
    .single()

  if (!row) notFound()

  return (
    <div>
      <Link href="/admin/review?type=source" style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        ← Back to queue
      </Link>

      <div style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <p style={{ fontSize: 11, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
          Source · {row.kind} · {row.status}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
          {row.name}
        </h1>
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
          <a href={row.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{row.url}</a>
        </p>
      </div>

      {/* Source metadata */}
      <Section title="Metadata">
        <KeyVal label="Reliability" value={row.reliability != null ? `${row.reliability}/100` : '—'} />
        <KeyVal label="Independence" value={row.independence != null ? `${row.independence}/100` : '—'} />
        <KeyVal label="Good faith" value={row.good_faith ?? '—'} />
        <KeyVal label="Coarse lean" value={row.coarse_lean ?? '—'} />
        <KeyVal label="Active status" value={row.active} />
        <KeyVal label="Topics" value={(row.topics as string[] ?? []).join(', ') || '—'} />
      </Section>

      <Section title="Axis Placements">
        <AxisTable axisPlacement={row.axis_placement ?? {}} />
      </Section>

      <Section title="Provenance">
        <KeyVal label="Tagged by" value={row.tagged_by} />
        <KeyVal label="Reviewed by" value={row.reviewed_by ?? 'Not yet reviewed'} />
        <KeyVal label="Last reviewed" value={row.last_reviewed ?? '—'} />
        <KeyVal label="Bias rating source" value={row.bias_rating_source ?? '—'} />
      </Section>

      {row.raw_classification && (
        <Section title="Raw Classification (debug)">
          <details>
            <summary style={{ cursor: 'pointer', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
              Show raw JSON
            </summary>
            <pre style={{ fontSize: 11, color: 'var(--color-text-secondary)', overflowX: 'auto', marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(0,0,0,0.3)', borderRadius: 6 }}>
              {JSON.stringify(row.raw_classification, null, 2)}
            </pre>
          </details>
        </Section>
      )}

      <VerifyButton
        type="source"
        id={id}
        lastCheck={row.perplexity_last_check as { checkedAt: string; summary: string } | null}
      />

      <EntryActions
        type="source"
        id={id}
        currentStatus={row.status}
        editableFields={{
          axis_placement: row.axis_placement ?? {},
          reliability: row.reliability,
          independence: row.independence,
          good_faith: row.good_faith,
          coarse_lean: row.coarse_lean,
          active: row.active,
        }}
      />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-8)' }}>
      <h2 style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function KeyVal({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-small)' }}>
      <span style={{ minWidth: 160, color: 'var(--color-text-secondary)', flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AxisTable({ axisPlacement }: { axisPlacement: Record<string, any> }) {
  const entries = Object.entries(axisPlacement)
  if (entries.length === 0) {
    return <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>No axis placements.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {entries.map(([axis, placement]) => (
        <div key={axis} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {axis.replace(/_/g, ' ')}
            </span>
            <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
              Score: <strong style={{ color: 'var(--color-text-primary)' }}>{placement.score}</strong>
              {' '} · Confidence: <strong style={{ color: 'var(--color-text-primary)' }}>{(placement.confidence * 100).toFixed(0)}%</strong>
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            {placement.rationale}
          </p>
          {(placement.sources ?? []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {(placement.sources as string[]).map((src: string) => (
                <a key={src} href={src} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: 'var(--color-gold)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                  {src}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DealbreakerTable({ dealbreakers }: { dealbreakers: Record<string, any> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {Object.entries(dealbreakers).map(([key, eval_]) => (
        <div key={key} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', fontSize: 'var(--text-small)', padding: 'var(--space-3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}>
          <span style={{ minWidth: 60, fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>DB-{key}</span>
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 11,
            background: eval_.status === 'crosses' ? 'rgba(239,68,68,0.15)' : eval_.status === 'unknown' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.1)',
            color: eval_.status === 'crosses' ? '#ef4444' : eval_.status === 'unknown' ? '#f59e0b' : '#22c55e',
            flexShrink: 0,
          }}>
            {eval_.status}
          </span>
          {eval_.evidence && <span style={{ color: 'var(--color-text-secondary)' }}>{eval_.evidence}</span>}
          {eval_.source && <a href={eval_.source} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', fontSize: 11 }}>{eval_.source}</a>}
          {eval_.note && <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{eval_.note}</span>}
        </div>
      ))}
    </div>
  )
}
