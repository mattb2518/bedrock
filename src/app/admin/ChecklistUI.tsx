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

  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', opacity: isPending ? 0.7 : 1 }}>
      {items.map(({ id, label }) => {
        const done = checked.has(id)
        return (
          <li
            key={id}
            onClick={() => toggle(id)}
            style={{
              display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start',
              fontSize: 'var(--text-small)',
              color: done ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
              cursor: isSuperAdmin ? 'pointer' : 'default',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 6,
              background: done ? 'transparent' : 'rgba(255,255,255,0.01)',
              userSelect: 'none',
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 1, color: done ? '#22c55e' : 'var(--color-text-tertiary)', fontWeight: done ? 700 : 400 }}>
              {done ? '✓' : '○'}
            </span>
            <span style={{ textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1, lineHeight: 1.5 }}>
              {label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
