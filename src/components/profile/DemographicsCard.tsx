'use client'

// Political-background body for the profile accordion. Demographics live in the
// client quiz store (calibration data, SPEC §12); this is the obvious place to
// see, edit, or add them after the fact — including if they were skipped during
// the quiz. Mirrors the in-quiz demographic module's controls. Renders content
// only; the accordion supplies the tile/title.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuizStore } from '@/store/quizStore'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import { createClient } from '@/lib/supabase/client'
import {
  PARTY_RELATIONSHIP,
  CURRENT_REGISTRATION,
  UPBRINGING,
  POLITICAL_LINEAGE,
  LINEAGE_TRIGGERS,
  AGE_RANGES,
  GEOGRAPHIES,
  REGIONS,
  DEMOGRAPHIC_OTHER_PROMPT,
} from '@/lib/quiz/demographics'
import type { Demographics } from '@/types/quiz'

const fieldLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-1)',
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
const editLinkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-blue-accent)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  fontWeight: 'var(--weight-semibold)',
  cursor: 'pointer',
  padding: 0,
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
const heading = (text: string, top = true): React.CSSProperties => ({
  ...fieldLabel,
  color: 'var(--color-text-primary)',
  fontWeight: 'var(--weight-semibold)',
  marginTop: top ? 'var(--space-5)' : 0,
  marginBottom: 'var(--space-3)',
})

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p style={fieldLabel}>{label}</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
        {value || 'Not set'}
      </p>
    </div>
  )
}

export default function DemographicsBody() {
  const session = useQuizStore((s) => s.session)
  const setDemographics = useQuizStore((s) => s.setDemographics)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Demographics>({})
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (uid) {
        supabase.from('quiz_profiles').select('formatted_address').eq('user_id', uid).maybeSingle().then(({ data: row }) => {
          if (row?.formatted_address) setFormattedAddress(row.formatted_address)
        })
      }
    })
  }, [])

  async function handleAddressSelect(addr: string) {
    setFormattedAddress(addr)
    if (userId) {
      await createClient().from('quiz_profiles').upsert({ user_id: userId, formatted_address: addr }, { onConflict: 'user_id' })
    }
  }

  const demo = session?.demographics
  const hasAny = !!(
    formattedAddress ||
    (demo &&
      (demo.firstName ||
        demo.partyRelationship ||
        demo.currentRegistration ||
        demo.upbringing ||
        demo.lineage ||
        demo.ageRange ||
        demo.geography ||
        demo.region ||
        demo.regionGrewUp ||
        demo.note))
  )

  function startEdit() {
    setDraft(demo ?? {})
    setEditing(true)
  }
  function save() {
    setDemographics({ ...draft, completed: true })
    setEditing(false)
  }

  const showLineage = !!draft.partyRelationship && LINEAGE_TRIGGERS.includes(draft.partyRelationship)

  // No quiz session on this device — demographics attach to your quiz profile.
  if (!session) {
    return (
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
          Optional context that helps us calibrate your recommendations. It lives alongside your quiz profile — take the quiz to add it.
        </p>
        <Link href="/quiz" style={primaryBtn}>Take the quiz →</Link>
      </div>
    )
  }

  if (editing) {
    return (
      <div>
        {/* First name — optional, used for home page greeting */}
        <div style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
            What should we call you?
            <span style={{ fontWeight: 'normal', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>optional</span>
          </label>
          <input
            type="text"
            value={draft.firstName ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value || undefined }))}
            placeholder="First name…"
            style={{ width: '100%', backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md, 8px)', padding: 'var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', boxSizing: 'border-box' }}
          />
        </div>

        {/* Address — §22d: autocomplete */}
        <div style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
            Address
            <span style={{ fontWeight: 'normal', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>optional</span>
          </label>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-relaxed)' }}>
            For U.S. voters — lets us match you to your actual districts. We only use this to find your districts.
          </p>
          <AddressAutocomplete
            initialValue={formattedAddress ?? ''}
            onSelect={handleAddressSelect}
          />
        </div>

        <p style={heading(PARTY_RELATIONSHIP.prompt, false)}>{PARTY_RELATIONSHIP.prompt}</p>
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
            <p style={heading(POLITICAL_LINEAGE.prompt)}>{POLITICAL_LINEAGE.prompt}</p>
            {POLITICAL_LINEAGE.options.map((o) => (
              <button key={o} onClick={() => setDraft((d) => ({ ...d, lineage: o }))} style={optionCard(draft.lineage === o)}>
                {o}
              </button>
            ))}
          </>
        )}

        <p style={heading(CURRENT_REGISTRATION.prompt)}>{CURRENT_REGISTRATION.prompt}</p>
        {CURRENT_REGISTRATION.options.map((o) => (
          <button key={o} onClick={() => setDraft((d) => ({ ...d, currentRegistration: o }))} style={optionCard(draft.currentRegistration === o)}>
            {o}
          </button>
        ))}

        <p style={heading(UPBRINGING.prompt)}>{UPBRINGING.prompt}</p>
        {UPBRINGING.options.map((o) => (
          <button key={o} onClick={() => setDraft((d) => ({ ...d, upbringing: o }))} style={optionCard(draft.upbringing === o)}>
            {o}
          </button>
        ))}

        {(
          [
            ['Age', AGE_RANGES, 'ageRange'],
            ['Where you live', GEOGRAPHIES, 'geography'],
            ['Region', REGIONS, 'region'],
            ['Region you grew up in', REGIONS, 'regionGrewUp'],
          ] as [string, string[], 'ageRange' | 'geography' | 'region' | 'regionGrewUp'][]
        ).map(([label, opts, key]) => (
          <div key={label} style={{ marginTop: 'var(--space-5)' }}>
            <p style={heading(label)}>{label}</p>
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

        <p style={heading(DEMOGRAPHIC_OTHER_PROMPT)}>{DEMOGRAPHIC_OTHER_PROMPT}</p>
        <textarea
          value={draft.note ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
          rows={3}
          placeholder="Optional…"
          style={{ width: '100%', backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md, 8px)', padding: 'var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', resize: 'vertical', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button style={primaryBtn} onClick={save}>Save</button>
          <button style={ghostBtn} onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    )
  }

  // View mode
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-3)' }}>
        <button onClick={startEdit} style={editLinkBtn}>{hasAny ? 'Edit' : 'Add'}</button>
      </div>
      {hasAny ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {demo?.firstName && <Row label="Name" value={demo.firstName} />}
          {formattedAddress && <Row label="Address" value={formattedAddress} />}
          <Row label="Relationship to parties" value={demo?.partyRelationship} />
          <Row label="Registered today as" value={demo?.currentRegistration} />
          <Row label="Grew up around" value={demo?.upbringing} />
          {demo?.lineage && <Row label="Political lineage" value={demo.lineage} />}
          <Row label="Age" value={demo?.ageRange} />
          <Row label="Where you live" value={demo?.geography} />
          <Row label="Region" value={demo?.region} />
          <Row label="Region grew up in" value={demo?.regionGrewUp} />
          {demo?.note && <Row label="In your words" value={demo.note} />}
        </div>
      ) : (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Optional context — your relationship to parties, where you're coming from, and basic geography. It's never used for anything but improving your recommendations, and you can change or remove it any time.
        </p>
      )}
    </div>
  )
}
