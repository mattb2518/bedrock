'use client'

// Political-background card for the profile page. Demographics live in the
// client quiz store (calibration data, SPEC §12); this is the obvious place to
// see, edit, or add them after the fact — including if they were skipped during
// the quiz. Mirrors the in-quiz demographic module's controls.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuizStore } from '@/store/quizStore'
import {
  PARTY_RELATIONSHIP,
  POLITICAL_LINEAGE,
  LINEAGE_TRIGGERS,
  AGE_RANGES,
  GEOGRAPHIES,
  REGIONS,
  DEMOGRAPHIC_OTHER_PROMPT,
} from '@/lib/quiz/demographics'
import type { Demographics } from '@/types/quiz'

const cardShell: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
}
const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  fontWeight: 'var(--weight-semibold)',
  color: 'var(--color-text-subtle)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--tracking-wider)',
}
const fieldLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-1)',
}
const fieldValue: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  color: 'var(--color-text-primary)',
}
const primaryBtn: React.CSSProperties = {
  backgroundColor: 'var(--color-red)',
  color: '#fff',
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--weight-semibold)',
  fontSize: 'var(--text-body)',
  padding: 'var(--space-3) var(--space-5)',
  borderRadius: 'var(--btn-radius)',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
}
const ghostBtn: React.CSSProperties = {
  ...primaryBtn,
  backgroundColor: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border)',
}
const optionCard = (selected: boolean): React.CSSProperties => ({
  width: '100%',
  textAlign: 'left',
  backgroundColor: selected ? 'rgba(107,159,234,0.08)' : 'var(--color-bg-input)',
  border: `1px solid ${selected ? 'var(--color-blue-accent)' : 'var(--color-border)'}`,
  borderRadius: 'var(--radius-md, 8px)',
  padding: 'var(--space-3) var(--space-4)',
  marginBottom: 'var(--space-2)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  lineHeight: 'var(--leading-relaxed)',
})
const pill = (selected: boolean): React.CSSProperties => ({
  backgroundColor: selected ? 'rgba(200,169,110,0.08)' : 'var(--color-bg-input)',
  border: `1px solid ${selected ? 'var(--color-gold)' : 'var(--color-border)'}`,
  borderRadius: 'var(--radius-full)',
  padding: 'var(--space-2) var(--space-4)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
})

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p style={fieldLabel}>{label}</p>
      <p style={{ ...fieldValue, color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
        {value || 'Not set'}
      </p>
    </div>
  )
}

export default function DemographicsCard() {
  const session = useQuizStore((s) => s.session)
  const setDemographics = useQuizStore((s) => s.setDemographics)

  // Avoid a hydration mismatch: the persisted store rehydrates on the client.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Demographics>({})

  const demo = session?.demographics
  const hasAny = !!(
    demo &&
    (demo.partyRelationship || demo.lineage || demo.ageRange || demo.geography || demo.region || demo.note)
  )

  function startEdit() {
    setDraft(demo ?? {})
    setEditing(true)
  }
  function save() {
    setDemographics({ ...draft, completed: true })
    setEditing(false)
  }
  function cancel() {
    setEditing(false)
  }

  const showLineage = !!draft.partyRelationship && LINEAGE_TRIGGERS.includes(draft.partyRelationship)

  // Stable placeholder until the store has hydrated.
  if (!mounted) {
    return (
      <div style={cardShell}>
        <p style={{ ...sectionLabel, marginBottom: 'var(--space-4)' }}>Political background</p>
      </div>
    )
  }

  // No quiz session on this device — demographics attach to your quiz profile.
  if (!session) {
    return (
      <div style={cardShell}>
        <p style={{ ...sectionLabel, marginBottom: 'var(--space-4)' }}>Political background</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
          Optional context that helps us calibrate your recommendations. It lives alongside your quiz profile — take the quiz to add it.
        </p>
        <Link href="/quiz" style={primaryBtn}>Take the quiz →</Link>
      </div>
    )
  }

  if (editing) {
    return (
      <div style={cardShell}>
        <p style={{ ...sectionLabel, marginBottom: 'var(--space-4)' }}>Political background</p>

        <p style={{ ...fieldLabel, color: 'var(--color-text-primary)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          {PARTY_RELATIONSHIP.prompt}
        </p>
        {PARTY_RELATIONSHIP.options.map((o) => (
          <button
            key={o}
            onClick={() =>
              setDraft((d) => ({ ...d, partyRelationship: o, lineage: LINEAGE_TRIGGERS.includes(o) ? d.lineage : undefined }))
            }
            style={optionCard(draft.partyRelationship === o)}
          >
            {o}
          </button>
        ))}

        {showLineage && (
          <>
            <p style={{ ...fieldLabel, color: 'var(--color-text-primary)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-5)', marginBottom: 'var(--space-3)' }}>
              {POLITICAL_LINEAGE.prompt}
            </p>
            {POLITICAL_LINEAGE.options.map((o) => (
              <button key={o} onClick={() => setDraft((d) => ({ ...d, lineage: o }))} style={optionCard(draft.lineage === o)}>
                {o}
              </button>
            ))}
          </>
        )}

        {(
          [
            ['Age', AGE_RANGES, 'ageRange'],
            ['Where you live', GEOGRAPHIES, 'geography'],
            ['Region', REGIONS, 'region'],
          ] as [string, string[], 'ageRange' | 'geography' | 'region'][]
        ).map(([label, opts, key]) => (
          <div key={label} style={{ marginTop: 'var(--space-5)' }}>
            <p style={{ ...fieldLabel, color: 'var(--color-text-primary)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-3)' }}>{label}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {opts.map((o) => {
                const on = draft[key] === o
                return (
                  <button key={o} onClick={() => setDraft((d) => ({ ...d, [key]: on ? undefined : o }))} style={pill(on)}>
                    {o}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <p style={{ ...fieldLabel, color: 'var(--color-text-primary)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-5)', marginBottom: 'var(--space-3)' }}>
          {DEMOGRAPHIC_OTHER_PROMPT}
        </p>
        <textarea
          value={draft.note ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
          rows={3}
          placeholder="Optional…"
          style={{ width: '100%', backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md, 8px)', padding: 'var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button style={primaryBtn} onClick={save}>Save</button>
          <button style={ghostBtn} onClick={cancel}>Cancel</button>
        </div>
      </div>
    )
  }

  // View mode
  return (
    <div style={cardShell}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <p style={sectionLabel}>Political background</p>
        <button onClick={startEdit} style={{ background: 'none', border: 'none', color: 'var(--color-blue-accent)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer', padding: 0 }}>
          {hasAny ? 'Edit' : 'Add'}
        </button>
      </div>

      {hasAny ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Row label="Relationship to parties" value={demo?.partyRelationship} />
          {demo?.lineage && <Row label="Political lineage" value={demo.lineage} />}
          <Row label="Age" value={demo?.ageRange} />
          <Row label="Where you live" value={demo?.geography} />
          <Row label="Region" value={demo?.region} />
          {demo?.note && <Row label="In your words" value={demo.note} />}
        </div>
      ) : (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Optional context — your relationship to parties, where you’re coming from, and basic geography. It’s never used for anything but improving your recommendations, and you can change or remove it any time.
        </p>
      )}
    </div>
  )
}
