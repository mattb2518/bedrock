"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuizStore } from '@/store/quizStore'
import { usePreviewStore } from '@/store/previewStore'
import { MANTLES, classifyProfile } from '@/lib/quiz/mantles'
import type { CivicType, QuizResult } from '@/types/quiz'

// ── Synthetic QuizResult builder ──────────────────────────────────────────────

function syntheticResult(type: CivicType): QuizResult {
  const mantle = MANTLES.find((m) => m.type === type)!
  const ranked = classifyProfile(mantle.profile)
  return {
    primaryType: type,
    secondaryTypes: ranked.secondary.slice(0, 3),
    profile: mantle.profile,
    topDimensions: [],
    completedLayers: [1, 2, 3, 4],
    completionPercent: 100,
  }
}

// ── Mantle options (hardcoded — not fetched) ──────────────────────────────────

const MANTLE_OPTIONS: { type: CivicType; label: string }[] = [
  { type: 'honest_broker',   label: 'The Honest Broker' },
  { type: 'system_fixer',    label: 'The System Fixer' },
  { type: 'long_gamer',      label: 'The Long Gamer' },
  { type: 'good_neighbor',   label: 'The Good Neighbor' },
  { type: 'missourian',      label: 'The Missourian' },
  { type: 'eternal_optimist',label: 'The Eternal Optimist' },
  { type: 'steward',         label: 'The Steward' },
  { type: 'free_agent',      label: 'The Free Agent' },
  { type: 'standard_bearer', label: 'The Standard Bearer' },
  { type: 'pioneer',         label: 'The Pioneer' },
]

// ── Bar ───────────────────────────────────────────────────────────────────────

const BAR_HEIGHT = 38

export default function PreviewBar() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checked, setChecked] = useState(false)

  const resetQuiz = useQuizStore((s) => s.resetQuiz)

  const { mode, mantleType, activate, exit } = usePreviewStore()

  // Check role once on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setChecked(true); return }
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()
      setIsAdmin(roleRow?.role === 'admin' || roleRow?.role === 'super_admin')
      setChecked(true)
    })
  }, [])

  // Push the entire page down by bar height so the fixed bar doesn't overlap the nav
  useEffect(() => {
    if (!isAdmin) return
    document.body.style.paddingTop = `${BAR_HEIGHT}px`
    return () => { document.body.style.paddingTop = '' }
  }, [isAdmin])

  if (!checked || !isAdmin) return null

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleNewUser() {
    activate('new_user', undefined, null)
    resetQuiz()
  }

  function handleMantle(type: CivicType) {
    activate('mantle', type, syntheticResult(type))
  }

  function handleExit() {
    exit()
  }

  // ── Styles ───────────────────────────────────────────────────────────────────

  const isPreview = mode !== 'myself'
  const accentColor = '#E8A030'

  const barLabel =
    mode === 'myself'    ? 'Previewing as: Myself'
    : mode === 'new_user' ? 'PREVIEW MODE: New User'
    : `PREVIEW MODE: ${MANTLE_OPTIONS.find((m) => m.type === mantleType)?.label ?? mantleType}`

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: BAR_HEIGHT,
      backgroundColor: '#132238',
      borderLeft: isPreview ? `3px solid ${accentColor}` : 'none',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: '0 var(--space-5)',
      fontFamily: 'var(--font-body)',
      fontSize: '12px',
    }}>
      {/* Mode label */}
      <span style={{
        color: isPreview ? accentColor : 'rgba(255,255,255,0.35)',
        fontWeight: isPreview ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        letterSpacing: isPreview ? 'var(--tracking-wider)' : undefined,
        textTransform: isPreview ? 'uppercase' : undefined,
        whiteSpace: 'nowrap',
      }}>
        {barLabel}
      </span>

      {/* Divider */}
      <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 16, lineHeight: 1 }}>|</span>

      {/* Myself button */}
      <button
        onClick={() => { if (mode !== 'myself') handleExit() }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '12px',
          color: mode === 'myself' ? '#fff' : 'rgba(255,255,255,0.45)',
          fontWeight: mode === 'myself' ? 'var(--weight-semibold)' : 'var(--weight-medium)',
          padding: '2px 6px', borderRadius: 4,
          backgroundColor: mode === 'myself' ? 'rgba(255,255,255,0.1)' : 'transparent',
        }}
      >
        Myself
      </button>

      <button
        onClick={handleNewUser}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '12px',
          color: mode === 'new_user' ? accentColor : 'rgba(255,255,255,0.45)',
          fontWeight: mode === 'new_user' ? 'var(--weight-semibold)' : 'var(--weight-medium)',
          padding: '2px 6px', borderRadius: 4,
          backgroundColor: mode === 'new_user' ? 'rgba(232,160,48,0.12)' : 'transparent',
        }}
      >
        New User
      </button>

      {/* Mantle type dropdown */}
      <select
        value={mode === 'mantle' && mantleType ? mantleType : ''}
        onChange={(e) => e.target.value && handleMantle(e.target.value as CivicType)}
        style={{
          background: mode === 'mantle' ? 'rgba(232,160,48,0.12)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${mode === 'mantle' ? accentColor : 'rgba(255,255,255,0.15)'}`,
          borderRadius: 4,
          color: mode === 'mantle' ? accentColor : 'rgba(255,255,255,0.45)',
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          padding: '2px 6px',
          cursor: 'pointer',
        }}
      >
        <option value="" style={{ color: '#000', backgroundColor: '#fff' }}>Mantle type…</option>
        {MANTLE_OPTIONS.map((m) => (
          <option key={m.type} value={m.type} style={{ color: '#000', backgroundColor: '#fff' }}>{m.label}</option>
        ))}
      </select>

      {/* Exit button — right-aligned, only in preview modes */}
      {isPreview && (
        <button
          onClick={handleExit}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: `1px solid ${accentColor}`,
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: accentColor,
            padding: '2px 10px',
          }}
        >
          Exit preview
        </button>
      )}
    </div>
  )
}

export { BAR_HEIGHT }
