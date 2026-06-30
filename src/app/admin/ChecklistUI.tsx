'use client'

import { useState, useTransition } from 'react'
import { toggleChecklistItem } from './actions'

interface Props {
  items: Array<{ id: string; label: string }>
  checkedSet: string[]
  isSuperAdmin: boolean
}

export default function ChecklistUI({ items, checkedSet, isSuperAdmin }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set(checkedSet))
  const [completedOpen, setCompletedOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function toggle(id: string) {
    if (!isSuperAdmin) return
    const next = !checked.has(id)
    setChecked((prev) => {
      const s = new Set(prev)
      next ? s.add(id) : s.delete(id)
      return s
    })
    startTransition(async () => {
      await toggleChecklistItem(id, next)
    })
  }

  const unchecked = items.filter(({ id }) => !checked.has(id))
  const done      = items.filter(({ id }) =>  checked.has(id))

  const rowStyle = (isDone: boolean): React.CSSProperties => ({
    display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start',
    fontSize: 'var(--text-small)',
    color: isDone ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
    cursor: isSuperAdmin ? 'pointer' : 'default',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 6,
    background: isDone ? 'transparent' : 'rgba(255,255,255,0.01)',
    userSelect: 'none',
  })

  return (
    <div style={{ opacity: isPending ? 0.7 : 1 }}>
      {/* ── Unchecked items ──────────────────────────────────────────────── */}
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', margin: 0 }}>
        {unchecked.map(({ id, label }) => (
          <li key={id} onClick={() => toggle(id)} style={rowStyle(false)}>
            <span style={{ flexShrink: 0, marginTop: 1, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>○</span>
            <span style={{ lineHeight: 1.5 }}>{label}</span>
          </li>
        ))}
      </ul>

      {/* ── Completed section (collapsed by default) ─────────────────────── */}
      {done.length > 0 && (
        <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
          <button
            onClick={() => setCompletedOpen((v) => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-1) var(--space-3)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)', userSelect: 'none',
            }}
          >
            <span style={{ display: 'inline-block', transform: completedOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease', lineHeight: 1 }}>›</span>
            <span style={{ color: '#22c55e' }}>{done.length} completed ✓</span>
          </button>

          {completedOpen && (
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              {done.map(({ id, label }) => (
                <li key={id} onClick={() => toggle(id)} style={rowStyle(true)}>
                  <span style={{ flexShrink: 0, marginTop: 1, color: '#22c55e', fontWeight: 700 }}>✓</span>
                  <span style={{ textDecoration: 'line-through', opacity: 0.55, lineHeight: 1.5 }}>{label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
