'use client'

import { PEW_GROUPS, PEW_REPORT_TITLE, PEW_REPORT_URL, PEW_ATTRIBUTION } from '@/lib/quiz/pew-typology'

const SIDE_STYLE: Record<'left' | 'center' | 'right', React.CSSProperties> = {
  left:   { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' },
  center: { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' },
  right:  { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' },
}

export default function PewTypologyGrid() {
  const leftGroups   = PEW_GROUPS.filter((g) => g.side === 'left')
  const centerGroups = PEW_GROUPS.filter((g) => g.side === 'center')
  const rightGroups  = PEW_GROUPS.filter((g) => g.side === 'right')

  const totalLeft   = leftGroups.reduce((s, g) => s + g.share, 0)
  const totalCenter = centerGroups.reduce((s, g) => s + g.share, 0)
  const totalRight  = rightGroups.reduce((s, g) => s + g.share, 0)

  function Column({
    groups,
    total,
    label,
  }: {
    groups: typeof PEW_GROUPS[number][]
    total: number
    label: string
  }) {
    return (
      <div style={{ flex: total, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text-muted)',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          marginBottom: 4,
          textAlign: 'center',
        }}>
          {label} · {total}%
        </p>
        {groups.map((g) => (
          <div
            key={g.name}
            title={`${g.name} — ${g.share}% of U.S. adults`}
            style={{
              flex: g.share,
              minHeight: g.share * 3,
              border: '1px solid',
              borderRadius: 4,
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              ...SIDE_STYLE[g.side],
            }}
          >
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.35,
              display: 'block',
            }}>
              {g.name}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              marginTop: 2,
            }}>
              {g.share}%
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
        <Column groups={leftGroups}   total={totalLeft}   label="Left-leaning" />
        <Column groups={centerGroups} total={totalCenter} label="Center" />
        <Column groups={rightGroups}  total={totalRight}  label="Right-leaning" />
      </div>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        color: 'var(--color-text-muted)',
        lineHeight: 'var(--leading-relaxed)',
        margin: 0,
      }}>
        Source: {PEW_ATTRIBUTION}.{' '}
        <a
          href={PEW_REPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}
        >
          {PEW_REPORT_TITLE} →
        </a>
      </p>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        color: 'var(--color-text-secondary)',
        fontStyle: 'italic',
        margin: 0,
      }}>
        Bedrock&apos;s Civic Mantle types cut across these groups in multiple directions. That&apos;s the point.
      </p>
    </div>
  )
}
