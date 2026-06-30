'use client'

import { useState, useTransition } from 'react'
import { bulkApprove, bulkReclassify, bulkVerify } from '@/app/admin/actions'

type EntryType = 'candidate' | 'source'

interface Props {
  type: EntryType
  entries: Array<{ id: string; primary: string }>
  staleCount: number
}

type BulkOp = 'approve' | 'reclassify' | 'verify'

export default function BulkActions({ type, entries, staleCount }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [activeOp, setActiveOp] = useState<BulkOp | null>(null)
  const [progress, setProgress] = useState<Array<{ id: string; label: string; ok: boolean | null }>>([])
  const [isPending, startTransition] = useTransition()

  function toggleAll() {
    setSelected(selected.size === entries.length ? new Set() : new Set(entries.map((e) => e.id)))
  }

  function toggle(id: string) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  function labelFor(id: string) {
    return entries.find((e) => e.id === id)?.primary ?? id
  }

  function runBulk(op: BulkOp) {
    const ids = Array.from(selected)
    if (ids.length === 0 && op !== 'verify') return

    setActiveOp(op)
    setProgress(op === 'verify' ? [] : ids.map((id) => ({ id, label: labelFor(id), ok: null })))

    startTransition(async () => {
      if (op === 'approve') {
        const results = await Promise.allSettled(
          ids.map((id) =>
            bulkApprove(type, [id]).then(() => ({ id, ok: true })).catch(() => ({ id, ok: false }))
          )
        )
        setProgress(results.map((r, i) => ({
          id: ids[i],
          label: labelFor(ids[i]),
          ok: r.status === 'fulfilled',
        })))
      } else if (op === 'reclassify') {
        const results = await bulkReclassify(type, ids)
        setProgress(results.map((r) => ({ id: r.id, label: labelFor(r.id), ok: r.ok })))
      } else {
        const results = await bulkVerify(type)
        setProgress(results.map((r) => ({ id: r.id, label: r.id, ok: r.ok })))
      }
    })
  }

  const btnBase: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: 5,
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--weight-semibold)',
    cursor: isPending ? 'not-allowed' : 'pointer',
    border: 'none',
    opacity: isPending ? 0.5 : 1,
  }

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      {/* Entry checkboxes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={selected.size === entries.length && entries.length > 0} onChange={toggleAll} />
          Select all ({entries.length})
        </label>
        {selected.size > 0 && (
          <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            {selected.size} selected
          </span>
        )}
      </div>

      {/* Per-row checkboxes — rendered by the parent, driven by this state via props pattern.
          Since App Router means the list is server-rendered, we re-render a client list here. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {entries.map((entry) => (
          <label key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-3) var(--space-4)', border: `1px solid ${selected.has(entry.id) ? 'rgba(234,179,8,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, background: selected.has(entry.id) ? 'rgba(234,179,8,0.06)' : 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
            <input type="checkbox" checked={selected.has(entry.id)} onChange={() => toggle(entry.id)} />
            <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-primary)' }}>{entry.primary}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>{entry.id}</span>
          </label>
        ))}
      </div>

      {/* Bulk action buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          disabled={isPending || selected.size === 0}
          onClick={() => runBulk('approve')}
          style={{ ...btnBase, background: selected.size === 0 ? 'rgba(255,255,255,0.04)' : '#22c55e', color: selected.size === 0 ? 'var(--color-text-tertiary)' : '#000' }}
        >
          Bulk Approve ({selected.size})
        </button>
        <button
          disabled={isPending || selected.size === 0}
          onClick={() => runBulk('reclassify')}
          style={{ ...btnBase, background: 'rgba(255,255,255,0.08)', color: selected.size === 0 ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}
        >
          Bulk Re-classify ({selected.size})
        </button>
        <button
          disabled={isPending}
          onClick={() => runBulk('verify')}
          style={{ ...btnBase, background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}
        >
          Verify Stale ({staleCount})
        </button>
        <a
          href={`/api/admin/export?type=${type}`}
          style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)', textDecoration: 'none', display: 'inline-block' }}
        >
          Export CSV
        </a>
      </div>

      {/* Progress display */}
      {activeOp && progress.length > 0 && (
        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
          <p style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            {activeOp} results:
          </p>
          {progress.map((p) => (
            <div key={p.id} style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: p.ok === null ? 'var(--color-text-tertiary)' : p.ok ? '#22c55e' : '#ef4444' }}>
                {p.ok === null ? '…' : p.ok ? '✓' : '✗'}
              </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{p.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
