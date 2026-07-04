'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuizStore } from '@/store/quizStore'
import { mantleFor } from '@/lib/quiz/mantles'
import type { QuizSession } from '@/types/quiz'
import LockedPillarGate from '@/components/ui/LockedPillarGate'
import { getUnlockState } from '@/lib/quiz/unlockState'

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = 'openers' | 'responses' | 'chat'

interface BlankState {
  value: string
  kind: 'topic' | 'posture' | 'free'
  isEmpty: boolean
}

interface ChipRow {
  key: string
  label: string
  chips: string[]
}

interface ConversationResponse {
  energy: string
  text: string
  doing: string
  recommended: boolean
  reason?: string
}

interface ConversationOutput {
  reflectBack: string
  surface: string
  worry: string
  opening: string
  responses: ConversationResponse[]
}

interface ChatMove {
  label: string
  tip: string
  phrase?: string
}

interface ChatHint {
  read: string
  moves: ChatMove[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  hint?: ChatHint
}

// ─── Static data ─────────────────────────────────────────────────────────────

const SB_WHO = ['my mom', 'my dad', 'my sister', 'my brother', 'my aunt', 'my uncle', 'my coworker', 'my neighbor']
const SB_TOPICS = ['immigration', 'guns', 'the election', 'abortion', 'the economy', 'climate', 'a specific politician']
const SB_POSTURES = [
  "they think people like me are the problem",
  "they think it's all rigged",
  "they've checked out entirely",
  "they only trust their own side's media",
  "they just want to fight",
  "they've stopped listening",
]
const SB_WRONG = ['we talk past each other', 'it gets heated fast', 'I freeze up', 'they shut down', "we've never actually tried"]
const SB_WORRY = ['get too heated', 'cave', 'freeze', 'say it wrong', 'blow up the relationship']
const SB_VIBE = ['genuinely curious', 'goading', 'angry', 'testing me', 'venting', 'trying to connect']

// Mode 2 keeps chip rows
const CHIP_ROWS_RESPONSES: ChipRow[] = [
  { key: 'vibe', label: "What's the vibe?", chips: [...SB_VIBE, 'something else…'] },
  { key: 'posture', label: "What's their posture?", chips: [...SB_POSTURES, 'something else…'] },
]

const EXAMPLES: Record<Mode, { left: string; right: string }[]> = {
  openers: [
    {
      left: "I want to talk to my brother-in-law about guns without it turning into the same fight we always have.",
      right: "I want to bring up immigration with my aunt, but she thinks anyone who wants border security is a racist.",
    },
  ],
  responses: [
    {
      left: "My uncle posted that the 2020 election was stolen and anyone who says otherwise is part of the cover-up.",
      right: "My sister says anyone who voted Republican is a threat to democracy and she can't respect them as a person.",
    },
  ],
  chat: [
    {
      left: "I'm going to tell my mom I think her church's politics are hurting people, and I know it's going to wreck Thanksgiving.",
      right: "I want to tell my college kid that I think their professors are feeding them propaganda, without them writing me off as a boomer.",
    },
  ],
}

const MODE_CARDS: { mode: Mode; title: string; desc: string; beta?: boolean }[] = [
  { mode: 'openers', title: 'Openers', desc: 'Open a conversation with someone who sees it differently.' },
  { mode: 'responses', title: 'Responses', desc: "Someone said the thing. Get a better answer than the one you'd fire back." },
  { mode: 'chat', title: 'Back-and-forth', desc: 'Practice with Claude playing the other person.' },
]

const ENERGY_COLORS: Record<string, string> = {
  'disarm with warmth': '#d97706',
  'get curious': '#2563eb',
  'name it lightly': '#16a34a',
  'find the shared question': '#c4b5fd',
}

// ─── Animations ──────────────────────────────────────────────────────────────

const ANIMATIONS = `
@keyframes bedrock-spin { to { transform: rotate(360deg); } }
@keyframes bedrock-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-6px); opacity: 1; }
}
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function emptyBlank(): BlankState {
  return { value: '', kind: 'free', isEmpty: true }
}

function classifyFreeInput(text: string): 'topic' | 'posture' {
  const t = text.toLowerCase().trim()
  const pronounStarts = ['they ', 'he ', 'she ', 'we ', "i'm", 'it ']
  const stanceWords = ['think', 'thinks', "won't", "can't", "doesn't", 'only', 'refuse', 'keeps', 'keep', 'always', 'never', 'want', 'wants']
  if (pronounStarts.some(p => t.startsWith(p))) return 'posture'
  if (stanceWords.some(w => t.includes(w))) return 'posture'
  return 'topic'
}

function assembleMode1(who: BlankState, topic: BlankState, posture: BlankState, wrong: BlankState): string {
  const w = who.isEmpty ? 'a family member' : who.value
  const wr = wrong.isEmpty ? 'it gets heated fast' : wrong.value
  if (!topic.isEmpty && !posture.isEmpty)
    return `I want to talk to ${w} about ${topic.value}, and the hard part is that ${posture.value}, and what usually goes wrong is ${wr}.`
  if (!topic.isEmpty)
    return `I want to talk to ${w} about ${topic.value}, and what usually goes wrong is ${wr}.`
  if (!posture.isEmpty)
    return `I want to talk to ${w}, and the hard part is that ${posture.value}, and what usually goes wrong is ${wr}.`
  return `I want to talk to ${w} about something we see differently, and what usually goes wrong is ${wr}.`
}

function assembleMode3(who: BlankState, topic: BlankState, posture: BlankState, worry: BlankState): string {
  const w = who.isEmpty ? 'a family member' : who.value
  const wo = worry.isEmpty ? 'get too heated' : worry.value
  if (!topic.isEmpty && !posture.isEmpty)
    return `I'm going to talk to ${w} about ${topic.value}, and the hard part is that ${posture.value}, and I'm worried I'll ${wo}.`
  if (!topic.isEmpty)
    return `I'm going to talk to ${w} about ${topic.value}, and I'm worried I'll ${wo}.`
  if (!posture.isEmpty)
    return `I'm going to talk to ${w}, and the hard part is that ${posture.value}, and I'm worried I'll ${wo}.`
  return `I'm going to talk to ${w} about something we see differently, and I'm worried I'll ${wo}.`
}

function parseExample(text: string, mode: Mode): { who: BlankState; topic: BlankState; posture: BlankState; wrong: BlankState; worry: BlankState } {
  const lower = text.toLowerCase()
  const who: BlankState = (() => {
    const m = SB_WHO.find(w => lower.includes(w))
    return m ? { value: m, kind: 'free', isEmpty: false } : emptyBlank()
  })()
  const topic: BlankState = (() => {
    const tm = SB_TOPICS.find(t => lower.includes(t))
    return tm ? { value: tm, kind: 'topic', isEmpty: false } : emptyBlank()
  })()
  const posture: BlankState = (() => {
    const pm = SB_POSTURES.find(p => lower.includes(p))
    return pm ? { value: pm, kind: 'posture', isEmpty: false } : emptyBlank()
  })()
  const wrong: BlankState = mode === 'openers'
    ? (() => { const m = SB_WRONG.find(w => lower.includes(w)); return m ? { value: m, kind: 'free', isEmpty: false } : emptyBlank() })()
    : emptyBlank()
  const worry: BlankState = mode === 'chat'
    ? (() => { const m = SB_WORRY.find(w => lower.includes(w)); return m ? { value: m, kind: 'free', isEmpty: false } : emptyBlank() })()
    : emptyBlank()
  return { who, topic, posture, wrong, worry }
}

// ─── localStorage custom chip helpers ────────────────────────────────────────

const LS_CAP = 8
const LS_CUSTOM_WHO = 'bedrock_custom_who'
const LS_CUSTOM_TOPIC = 'bedrock_custom_topic'
const LS_CUSTOM_POSTURE = 'bedrock_custom_posture'
const LS_CUSTOM_WRONGORWORRY = 'bedrock_custom_wrongOrWorry'
const LS_CUSTOM_VIBE = 'bedrock_custom_vibe'

function lsGet(key: string): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as string[] } catch { return [] }
}

function lsAdd(key: string, value: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const next = [value, ...lsGet(key).filter(v => v !== value)].slice(0, LS_CAP)
    localStorage.setItem(key, JSON.stringify(next))
    return next
  } catch { return lsGet(key) }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GuardrailsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', maxWidth: '520px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', margin: 0 }}>
            How Back-and-forth works
          </h2>
          <button onClick={onClose} style={{ fontFamily: 'var(--font-body)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '22px', lineHeight: 1, padding: '0 0 0 var(--space-3)' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {([
            { title: 'Claude plays the other person — charitably', body: "Not a caricature, not a pushover. A reasonable human being who actually holds those views and has real reasons for them. The point is practice against something real, not target practice." },
            { title: 'Guardrails are on', body: "No personal attacks. No conspiracy theories or fabricated facts — even in character. If the conversation drifts into unproductive territory, Claude will redirect it. It won’t help you “win” — the goal is a real conversation, not a debate victory." },
            { title: 'Your conversation stays private', body: "Nothing is saved. Each session starts clean — no memory of what you practiced before." },
            { title: 'Sessions end when they’re done', body: "Claude will close the session when the conversation reaches a natural landing, or after around ten exchanges. When it closes, it steps out of character briefly with one coaching observation. You can also end anytime with the “End practice” button." },
          ] as { title: string; body: string }[]).map(({ title, body }) => (
            <div key={title}>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)', fontSize: 'var(--text-body)', margin: '0 0 var(--space-1) 0' }}>{title}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 0 }}>
            Something off? We want to hear it.{' '}
            <a href="mailto:hello@bedrock.guide" style={{ color: 'var(--color-blue-accent)' }}>hello@bedrock.guide</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function BlankPill({ value, isOpen, onClick, onClear }: {
  value: string | null; isOpen: boolean; onClick: () => void; onClear?: () => void
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', verticalAlign: 'middle' }}>
      <button
        onClick={onClick}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'inherit',
          color: value ? 'var(--color-text-primary)' : 'rgba(37,99,235,0.5)',
          backgroundColor: 'rgba(37,99,235,0.10)',
          border: `1px solid ${isOpen ? 'var(--color-blue-accent)' : 'rgba(37,99,235,0.28)'}`,
          borderRadius: '999px',
          padding: '1px 12px',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
          display: 'inline-block',
          lineHeight: 'inherit',
          minWidth: value ? 'auto' : '90px',
          fontStyle: value ? 'normal' : 'italic',
        }}
      >
        {value ?? 'tap to select'}
      </button>
      {onClear && (
        <button
          onClick={e => { e.stopPropagation(); onClear() }}
          title="Clear"
          style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}
        >
          ×
        </button>
      )}
    </span>
  )
}

function PickerChip({ label, selected, onClick, muted }: { label: string; selected: boolean; onClick: () => void; muted?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        border: selected ? '1px solid var(--color-blue-accent)' : muted ? '1px dashed var(--color-border)' : '1px solid var(--color-border)',
        backgroundColor: selected ? 'var(--color-blue-accent)' : 'transparent',
        color: selected ? '#fff' : muted ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        fontStyle: muted ? 'italic' : 'normal',
      }}
    >
      {label}
    </button>
  )
}

interface SBProps {
  mode: 'openers' | 'chat'
  sbWho: BlankState; setSbWho: (v: BlankState) => void
  sbTopic: BlankState; setSbTopic: (v: BlankState) => void
  sbPosture: BlankState; setSbPosture: (v: BlankState) => void
  sbWrong: BlankState; setSbWrong: (v: BlankState) => void
  sbWorry: BlankState; setSbWorry: (v: BlankState) => void
  sbMirror: string; setSbMirror: (v: string) => void
  sbTail: string; setSbTail: (v: string) => void
  sbPickerOpen: string | null; setSbPickerOpen: (v: string | null) => void
  sbCustomFor: string | null; setSbCustomFor: (v: string | null) => void
  sbCustomText: string; setSbCustomText: (v: string) => void
  showExamples: boolean; onToggleExamples: () => void
  examples: { left: string; right: string }[]
  onLoadExample: (text: string) => void
  error: string | null
  submitLabel: string; onSubmit: () => void; submitDisabled: boolean
}

function SentenceBuilderSection({
  mode, sbWho, setSbWho, sbTopic, setSbTopic, sbPosture, setSbPosture,
  sbWrong, setSbWrong, sbWorry, setSbWorry,
  sbMirror, setSbMirror,
  sbTail, setSbTail, sbPickerOpen, setSbPickerOpen, sbCustomFor, setSbCustomFor, sbCustomText, setSbCustomText,
  showExamples, onToggleExamples, examples, onLoadExample,
  error, submitLabel, onSubmit, submitDisabled,
}: SBProps) {
  const customInputRef = useRef<HTMLInputElement>(null)

  const [customWho, setCustomWho] = useState<string[]>([])
  const [customTopic, setCustomTopic] = useState<string[]>([])
  const [customPosture, setCustomPosture] = useState<string[]>([])
  const [customWrong, setCustomWrong] = useState<string[]>([])

  useEffect(() => {
    setCustomWho(lsGet(LS_CUSTOM_WHO))
    setCustomTopic(lsGet(LS_CUSTOM_TOPIC))
    setCustomPosture(lsGet(LS_CUSTOM_POSTURE))
    setCustomWrong(lsGet(LS_CUSTOM_WRONGORWORRY))
  }, [])

  useEffect(() => {
    if (sbCustomFor && customInputRef.current) customInputRef.current.focus()
  }, [sbCustomFor])

  const wrongOrWorry = mode === 'openers' ? sbWrong : sbWorry
  const setWrongOrWorry = mode === 'openers' ? setSbWrong : setSbWorry
  const wrongOrWorryOptions = mode === 'openers' ? SB_WRONG : SB_WORRY
  const sentenceStart = mode === 'openers' ? 'I want to talk to' : "I'm going to talk to"
  const wrongOrWorryPrefix = mode === 'openers' ? ', and what usually goes wrong is' : ", and I'm worried I'll"

  function togglePicker(key: string) {
    setSbPickerOpen(sbPickerOpen === key ? null : key)
    setSbCustomFor(null)
    setSbCustomText('')
  }

  function selectWho(value: string) {
    const newWho = { value, kind: 'free' as const, isEmpty: false }
    setSbWho(newWho)
    setSbMirror(mode === 'openers'
      ? assembleMode1(newWho, sbTopic, sbPosture, sbWrong)
      : assembleMode3(newWho, sbTopic, sbPosture, sbWorry))
    setSbPickerOpen(null); setSbCustomFor(null); setSbCustomText('')
  }
  function selectTopic(value: string) {
    const newTopic = { value, kind: 'topic' as const, isEmpty: false }
    setSbTopic(newTopic)
    setSbMirror(mode === 'openers'
      ? assembleMode1(sbWho, newTopic, sbPosture, sbWrong)
      : assembleMode3(sbWho, newTopic, sbPosture, sbWorry))
    setSbPickerOpen(null); setSbCustomFor(null); setSbCustomText('')
  }
  function selectPosture(value: string) {
    const newPosture = { value, kind: 'posture' as const, isEmpty: false }
    setSbPosture(newPosture)
    setSbMirror(mode === 'openers'
      ? assembleMode1(sbWho, sbTopic, newPosture, sbWrong)
      : assembleMode3(sbWho, sbTopic, newPosture, sbWorry))
    setSbPickerOpen(null); setSbCustomFor(null); setSbCustomText('')
  }
  function selectWrongOrWorry(value: string) {
    const newBlank = { value, kind: 'free' as const, isEmpty: false }
    setWrongOrWorry(newBlank)
    setSbMirror(mode === 'openers'
      ? assembleMode1(sbWho, sbTopic, sbPosture, newBlank)
      : assembleMode3(sbWho, sbTopic, sbPosture, newBlank))
    setSbPickerOpen(null); setSbCustomFor(null); setSbCustomText('')
  }

  function clearBlank(key: string) {
    const newWho = key === 'who' ? emptyBlank() : sbWho
    const newTopic = key === 'topic' ? emptyBlank() : sbTopic
    const newPosture = key === 'posture' ? emptyBlank() : sbPosture
    const newWrong = (key === 'wrongOrWorry' && mode === 'openers') ? emptyBlank() : sbWrong
    const newWorry = (key === 'wrongOrWorry' && mode === 'chat') ? emptyBlank() : sbWorry
    if (key === 'who') setSbWho(emptyBlank())
    else if (key === 'topic') setSbTopic(emptyBlank())
    else if (key === 'posture') setSbPosture(emptyBlank())
    else if (key === 'wrongOrWorry') setWrongOrWorry(emptyBlank())
    setSbMirror(mode === 'openers'
      ? assembleMode1(newWho, newTopic, newPosture, newWrong)
      : assembleMode3(newWho, newTopic, newPosture, newWorry))
    setSbPickerOpen(null)
  }

  function normalizeWho(raw: string): string {
    const t = raw.trim()
    return t.toLowerCase().startsWith('my ') ? t : `my ${t}`
  }

  function submitCustom() {
    if (!sbCustomText.trim() || !sbCustomFor) return
    const raw = sbCustomText.trim()
    if (sbCustomFor === 'who') {
      const val = normalizeWho(raw)
      setCustomWho(lsAdd(LS_CUSTOM_WHO, val))
      selectWho(val)
    } else if (sbCustomFor === 'topic') {
      setCustomTopic(lsAdd(LS_CUSTOM_TOPIC, raw))
      selectTopic(raw)
    } else if (sbCustomFor === 'posture') {
      setCustomPosture(lsAdd(LS_CUSTOM_POSTURE, raw))
      selectPosture(raw)
    } else {
      setCustomWrong(lsAdd(LS_CUSTOM_WRONGORWORRY, raw))
      selectWrongOrWorry(raw)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* 1. Live sentence with blanks + 2. inline picker */}
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-primary)', lineHeight: 2, marginBottom: 'var(--space-3)' }}>
          {sentenceStart}{' '}
          <BlankPill value={sbWho.isEmpty ? null : sbWho.value} isOpen={sbPickerOpen === 'who'} onClick={() => togglePicker('who')} onClear={sbWho.isEmpty ? undefined : () => clearBlank('who')} />
          {' about '}
          <BlankPill value={sbTopic.isEmpty ? null : sbTopic.value} isOpen={sbPickerOpen === 'topic'} onClick={() => togglePicker('topic')} onClear={sbTopic.isEmpty ? undefined : () => clearBlank('topic')} />
          {', and the hard part is that '}
          <BlankPill value={sbPosture.isEmpty ? null : sbPosture.value} isOpen={sbPickerOpen === 'posture'} onClick={() => togglePicker('posture')} onClear={sbPosture.isEmpty ? undefined : () => clearBlank('posture')} />
          {wrongOrWorryPrefix}{' '}
          <BlankPill value={wrongOrWorry.isEmpty ? null : wrongOrWorry.value} isOpen={sbPickerOpen === 'wrongOrWorry'} onClick={() => togglePicker('wrongOrWorry')} onClear={wrongOrWorry.isEmpty ? undefined : () => clearBlank('wrongOrWorry')} />
          {'.'}
        </div>

        {sbPickerOpen && (
          <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-blue-accent)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
            {sbPickerOpen === 'who' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {SB_WHO.map(opt => (
                  <PickerChip key={opt} label={opt} selected={!sbWho.isEmpty && sbWho.value === opt} onClick={() => selectWho(opt)} />
                ))}
                {customWho.map(opt => (
                  <PickerChip key={`c-${opt}`} label={opt} selected={!sbWho.isEmpty && sbWho.value === opt} onClick={() => selectWho(opt)} />
                ))}
                <PickerChip label="something else…" selected={false} onClick={() => setSbCustomFor('who')} muted />
              </div>
            )}
            {sbPickerOpen === 'topic' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {SB_TOPICS.map(opt => (
                  <PickerChip key={opt} label={opt} selected={!sbTopic.isEmpty && sbTopic.value === opt} onClick={() => selectTopic(opt)} />
                ))}
                {customTopic.map(opt => (
                  <PickerChip key={`c-${opt}`} label={opt} selected={!sbTopic.isEmpty && sbTopic.value === opt} onClick={() => selectTopic(opt)} />
                ))}
                <PickerChip label="something else…" selected={false} onClick={() => setSbCustomFor('topic')} muted />
              </div>
            )}
            {sbPickerOpen === 'posture' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {SB_POSTURES.map(opt => (
                  <PickerChip key={opt} label={opt} selected={!sbPosture.isEmpty && sbPosture.value === opt} onClick={() => selectPosture(opt)} />
                ))}
                {customPosture.map(opt => (
                  <PickerChip key={`c-${opt}`} label={opt} selected={!sbPosture.isEmpty && sbPosture.value === opt} onClick={() => selectPosture(opt)} />
                ))}
                <PickerChip label="something else…" selected={false} onClick={() => setSbCustomFor('posture')} muted />
              </div>
            )}
            {sbPickerOpen === 'wrongOrWorry' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {wrongOrWorryOptions.map(opt => (
                  <PickerChip key={opt} label={opt} selected={!wrongOrWorry.isEmpty && wrongOrWorry.value === opt} onClick={() => selectWrongOrWorry(opt)} />
                ))}
                {customWrong.map(opt => (
                  <PickerChip key={`c-${opt}`} label={opt} selected={!wrongOrWorry.isEmpty && wrongOrWorry.value === opt} onClick={() => selectWrongOrWorry(opt)} />
                ))}
                <PickerChip label="something else…" selected={false} onClick={() => setSbCustomFor('wrongOrWorry')} muted />
              </div>
            )}
            {sbCustomFor && (
              <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  ref={customInputRef}
                  value={sbCustomText}
                  onChange={e => setSbCustomText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitCustom() }}
                  placeholder={
                    sbCustomFor === 'who' ? 'Type a name or relationship…' :
                    sbCustomFor === 'topic' ? 'Name the topic…' :
                    sbCustomFor === 'posture' ? 'Describe how they are about it…' :
                    'Describe what goes wrong…'
                  }
                  style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-blue-accent)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)' }}
                />
                <button
                  onClick={submitCustom}
                  disabled={!sbCustomText.trim()}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: '#fff', backgroundColor: sbCustomText.trim() ? 'var(--color-blue-accent)' : 'var(--color-text-muted)', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-4)', cursor: sbCustomText.trim() ? 'pointer' : 'not-allowed' }}
                >
                  Set
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Sentence box — chips always win; user may edit freely between chip clicks */}
      <div>
        <textarea
          value={sbMirror}
          onChange={e => setSbMirror(e.target.value)}
          rows={4}
          style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', lineHeight: 'var(--leading-relaxed)', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      {/* 4. Tail box */}
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2) 0', fontStyle: 'italic' }}>
          Anything else you want to add?
        </p>
        <textarea
          value={sbTail}
          onChange={e => setSbTail(e.target.value)}
          rows={2}
          style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', lineHeight: 'var(--leading-relaxed)', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      {/* 5. Examples (below both text boxes) */}
      <div>
        <button
          onClick={onToggleExamples}
          style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-2) 0', textDecoration: 'underline', textUnderlineOffset: '2px' }}
        >
          {showExamples ? 'Hide examples' : 'Want another example?'}
        </button>
        {showExamples && (
          <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginTop: 'var(--space-2)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontStyle: 'italic' }}>
              Real kinds of conversations people bring here &mdash; from every direction. Tap one to start, then make it yours.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {examples.map((pair, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  {[pair.left, pair.right].map((ex, j) => (
                    <button
                      key={j}
                      onClick={() => onLoadExample(ex)}
                      style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'left', cursor: 'pointer', lineHeight: 'var(--leading-relaxed)' }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Submit */}
      <div>
        {error && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)', marginBottom: 'var(--space-3)' }}>{error}</p>}
        <button
          onClick={onSubmit}
          disabled={submitDisabled}
          style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', color: '#fff', backgroundColor: submitDisabled ? 'var(--color-text-muted)' : 'var(--color-blue-accent)', border: 'none', borderRadius: 'var(--btn-radius)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', cursor: submitDisabled ? 'not-allowed' : 'pointer', transition: 'background-color 0.15s' }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

// Mode 2 — freeform quote box primary, optional vibe/posture chip tail
interface ResponseInputProps {
  freeform: string; onFreeformChange: (v: string) => void
  showExamples: boolean; onToggleExamples: () => void
  examples: { left: string; right: string }[]
  onLoadExample: (text: string) => void
  chips: Record<string, string[]>; onToggleChip: (key: string, chip: string) => void
  error: string | null; submitLabel: string; onSubmit: () => void; submitDisabled: boolean
}

function ResponseModeInput({
  freeform, onFreeformChange, showExamples, onToggleExamples, examples, onLoadExample,
  chips, onToggleChip, error, submitLabel, onSubmit, submitDisabled,
}: ResponseInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const customChipRef = useRef<HTMLInputElement>(null)
  const [customChipFor, setCustomChipFor] = useState<string | null>(null)
  const [customChipText, setCustomChipText] = useState('')
  const [customVibe, setCustomVibe] = useState<string[]>([])
  const [customRespPosture, setCustomRespPosture] = useState<string[]>([])

  useEffect(() => {
    setCustomVibe(lsGet(LS_CUSTOM_VIBE))
    setCustomRespPosture(lsGet(LS_CUSTOM_POSTURE))
  }, [])

  useEffect(() => {
    if (customChipFor && customChipRef.current) customChipRef.current.focus()
  }, [customChipFor])

  function submitCustomChip() {
    if (!customChipText.trim() || !customChipFor) return
    const val = customChipText.trim()
    onToggleChip(customChipFor, val)
    if (customChipFor === 'vibe') setCustomVibe(lsAdd(LS_CUSTOM_VIBE, val))
    else setCustomRespPosture(lsAdd(LS_CUSTOM_POSTURE, val))
    setCustomChipFor(null); setCustomChipText('')
  }

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (el) el.style.minHeight = `${el.scrollHeight}px`
  }, [])

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (el && el.value !== freeform) {
      el.value = freeform
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [freeform])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <textarea
          ref={textareaRef}
          defaultValue={freeform}
          onChange={e => {
            onFreeformChange(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = `${e.target.scrollHeight}px`
          }}
          placeholder="What did they say? Paste it, or describe it."
          rows={4}
          style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', lineHeight: 'var(--leading-relaxed)', resize: 'none', overflow: 'hidden', boxSizing: 'border-box' }}
        />
        <button
          onClick={onToggleExamples}
          style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-2) 0', textDecoration: 'underline', textUnderlineOffset: '2px' }}
        >
          {showExamples ? 'Hide examples' : 'Not sure what to type? Show me examples.'}
        </button>
        {showExamples && (
          <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginTop: 'var(--space-2)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontStyle: 'italic' }}>
              Real kinds of conversations people bring here &mdash; from every direction. Tap one to start, then make it yours.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {examples.map((pair, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  {[pair.left, pair.right].map((ex, j) => (
                    <button
                      key={j}
                      onClick={() => onLoadExample(ex)}
                      style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'left', cursor: 'pointer', lineHeight: 'var(--leading-relaxed)' }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vibe/posture chip tail */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {CHIP_ROWS_RESPONSES.map(row => {
          const rememberedCustom = row.key === 'vibe' ? customVibe : customRespPosture
          const staticChips = row.chips.filter(c => c !== 'something else…')
          const allBuiltin = new Set([...staticChips, ...rememberedCustom])
          return (
          <div key={row.key}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-semibold)', margin: '0 0 var(--space-2) 0' }}>{row.label}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
              {staticChips.map(chip => {
                const selected = (chips[row.key] ?? []).includes(chip)
                return (
                  <button key={chip} onClick={() => onToggleChip(row.key, chip)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: selected ? '1px solid var(--color-blue-accent)' : '1px solid var(--color-border)', backgroundColor: selected ? 'var(--color-blue-accent)' : 'transparent', color: selected ? '#fff' : 'var(--color-text-secondary)', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                  >
                    {chip}
                  </button>
                )
              })}
              {rememberedCustom.map(chip => {
                const selected = (chips[row.key] ?? []).includes(chip)
                return (
                  <button key={`c-${chip}`} onClick={() => onToggleChip(row.key, chip)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: selected ? '1px solid var(--color-blue-accent)' : '1px solid var(--color-border)', backgroundColor: selected ? 'var(--color-blue-accent)' : 'transparent', color: selected ? '#fff' : 'var(--color-text-secondary)', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                  >
                    {chip}
                  </button>
                )
              })}
              {/* Currently-selected custom chips not yet remembered */}
              {(chips[row.key] ?? []).filter(c => !allBuiltin.has(c)).map(customVal => (
                <button key={`sel-${customVal}`} onClick={() => onToggleChip(row.key, customVal)}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-blue-accent)', backgroundColor: 'var(--color-blue-accent)', color: '#fff', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                >
                  {customVal}
                </button>
              ))}
              {customChipFor !== row.key && (
                <button onClick={() => { setCustomChipFor(row.key); setCustomChipText('') }}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px dashed var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', fontStyle: 'italic', whiteSpace: 'nowrap' }}
                >
                  something else…
                </button>
              )}
            </div>
            {customChipFor === row.key && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <input
                  ref={customChipRef}
                  value={customChipText}
                  onChange={e => setCustomChipText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') submitCustomChip()
                    if (e.key === 'Escape') { setCustomChipFor(null); setCustomChipText('') }
                  }}
                  placeholder="Type your own…"
                  style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-blue-accent)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)' }}
                />
                <button
                  onClick={submitCustomChip}
                  disabled={!customChipText.trim()}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: '#fff', backgroundColor: customChipText.trim() ? 'var(--color-blue-accent)' : 'var(--color-text-muted)', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-4)', cursor: customChipText.trim() ? 'pointer' : 'not-allowed' }}
                >
                  Set
                </button>
                <button
                  onClick={() => { setCustomChipFor(null); setCustomChipText('') }}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-2)' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )
      })}
      </div>

      <div>
        {error && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)', marginBottom: 'var(--space-3)' }}>{error}</p>}
        <button
          onClick={onSubmit}
          disabled={submitDisabled}
          style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', color: '#fff', backgroundColor: submitDisabled ? 'var(--color-text-muted)' : 'var(--color-blue-accent)', border: 'none', borderRadius: 'var(--btn-radius)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', cursor: submitDisabled ? 'not-allowed' : 'pointer', transition: 'background-color 0.15s' }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

function ResponseCard({ r }: { r: ConversationResponse }) {
  const color = ENERGY_COLORS[r.energy] ?? 'var(--color-text-muted)'
  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', border: r.recommended ? `2px solid ${color}` : '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color, backgroundColor: `${color}18`, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{r.energy}</span>
        {r.recommended && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>recommended</span>
        )}
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-3)', fontStyle: 'italic' }}>&ldquo;{r.text}&rdquo;</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
        {r.doing}{r.recommended && r.reason && ` — ${r.reason}`}
      </p>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-text-muted)', animation: `bedrock-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  )
}

function HowItWorksAccordion() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash === '#how-it-works') {
      setOpen(true)
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [])

  return (
    <div id="how-it-works" ref={ref} style={{ marginTop: 'var(--space-16)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-2) 0', fontFamily: 'var(--font-display)', fontSize: 'var(--text-h4)', color: 'var(--color-text-primary)', textAlign: 'left' }}
      >
        How it Works
        <span aria-hidden="true" style={{ display: 'inline-block', color: 'var(--color-text-muted)', fontSize: '20px', lineHeight: 1, transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>›</span>
      </button>
      {open && (
        <div style={{ paddingTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            Your Conversations is built on a framework developed by Chris Argyris and popularized by Peter Senge in <em>The Fifth Discipline</em> — the Ladder of Inference. The idea is simple: most difficult conversations fail not because people disagree on facts but because each person is reasoning from a different set of assumptions they&apos;ve never made explicit.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            The Ladder of Inference maps how we move from observable data to conclusions to actions, usually without noticing the steps we skipped. Bedrock uses this framework to help you see the reasoning behind someone else&apos;s position — and your own — before you respond. The goal isn&apos;t agreement. It&apos;s a real conversation instead of a performative one.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            Conversation history is not stored. Each session starts fresh. What you explore while preparing for a difficult conversation is yours, not ours.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 0 }}>
            <a href="/methodology#conversations" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>Full methodology →</a>
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ConversationsPage() {
  const session = useQuizStore(s => s.session)
  const layersCompleted = session?.completedLayers?.length ?? 0
  const unlock = getUnlockState(layersCompleted)
  const hasProfile = Boolean(session?.result)
  const isAnonymous = hasProfile && !session?.userId
  const mantleName = session?.result?.primaryType ? mantleFor(session.result.primaryType).name : null
  const [convBannerDismissed, setConvBannerDismissed] = useState(false)

  const [activeMode, setActiveMode] = useState<Mode | null>(null)

  // Mode 2 state
  const [freeform, setFreeform] = useState('')
  const [chips, setChips] = useState<Record<string, string[]>>({})

  // Sentence builder state (Modes 1 and 3)
  const [sbWho, setSbWho] = useState<BlankState>(emptyBlank())
  const [sbTopic, setSbTopic] = useState<BlankState>(emptyBlank())
  const [sbPosture, setSbPosture] = useState<BlankState>(emptyBlank())
  const [sbWrong, setSbWrong] = useState<BlankState>(emptyBlank())
  const [sbWorry, setSbWorry] = useState<BlankState>(emptyBlank())
  const [sbMirror, setSbMirror] = useState('')
  const [sbTail, setSbTail] = useState('')
  const [sbPickerOpen, setSbPickerOpen] = useState<string | null>(null)
  const [sbCustomFor, setSbCustomFor] = useState<string | null>(null)
  const [sbCustomText, setSbCustomText] = useState('')

  // Shared UI
  const [showExamples, setShowExamples] = useState(false)
  const [output, setOutput] = useState<ConversationOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedText, setSubmittedText] = useState('')

  // Chat state
  const [chatStarted, setChatStarted] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatEnded, setChatEnded] = useState(false)
  const [chatEndMessage, setChatEndMessage] = useState('')
  const [chatContext, setChatContext] = useState('')

  const [showGuardrails, setShowGuardrails] = useState(false)
  const [expandedTipKey, setExpandedTipKey] = useState<string | null>(null)
  const [coachBrief, setCoachBrief] = useState<string | null>(null)
  const [coachBriefVisible, setCoachBriefVisible] = useState(true)
  const [showSensitiveBanner, setShowSensitiveBanner] = useState(false)

  const [printDate] = useState(() => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
  const [portalMounted, setPortalMounted] = useState(false)
  useEffect(() => { setPortalMounted(true) }, [])

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'bedrock-print-styles'
    style.textContent = `
      @media screen { .bedrock-print-layout { display: none !important; } }
      @media print {
        body > *:not(.bedrock-print-layout) { display: none !important; }
        .bedrock-print-layout { display: block !important; background: white; font-family: system-ui, sans-serif; color: #1a1a18; padding: 0; margin: 0; }
        @page { margin: 0.75in; }
      }
    `
    document.head.appendChild(style)
    return () => { document.getElementById('bedrock-print-styles')?.remove() }
  }, [])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [chatMessages, chatLoading])

  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    function handlePop(e: PopStateEvent) {
      const state = e.state as { bedrockStep?: string; mode?: Mode } | null
      const step = state?.bedrockStep
      if (step === 'mode') {
        setActiveMode(state?.mode ?? null)
        setOutput(null)
        setChatStarted(false); setChatMessages([]); setChatInput(''); setChatLoading(false)
        setChatEnded(false); setChatEndMessage(''); setChatContext('')
        setCoachBrief(null); setCoachBriefVisible(true); setShowSensitiveBanner(false)
        setExpandedTipKey(null); setError(null)
      } else if (step === 'output') {
        setOutput(null)
      } else {
        setActiveMode(null); setOutput(null)
        setFreeform(''); setChips({})
        setSbWho(emptyBlank()); setSbTopic(emptyBlank()); setSbPosture(emptyBlank()); setSbWrong(emptyBlank()); setSbWorry(emptyBlank())
        setSbMirror('')
        setSbTail(''); setSbPickerOpen(null); setSbCustomFor(null); setSbCustomText('')
        setShowExamples(false); setError(null)
        setChatStarted(false); setChatMessages([]); setChatInput(''); setChatLoading(false)
        setChatEnded(false); setChatEndMessage(''); setChatContext('')
        setCoachBrief(null); setCoachBriefVisible(true); setShowSensitiveBanner(false)
        setExpandedTipKey(null)
      }
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  const SENSITIVE_KEYWORDS = ['abuse', 'abusive', 'violence', 'violent', 'assault', 'hitting', 'hurt me', 'hurting me', 'threatening', 'stalking', 'harassment', 'suicid', 'self-harm', 'self harm', 'cutting myself', 'crisis', 'domestic', 'ptsd', 'trauma']
  function isSensitiveTopic(text: string) {
    const lower = text.toLowerCase()
    return SENSITIVE_KEYWORDS.some(kw => lower.includes(kw))
  }

  function toggleChip(rowKey: string, chip: string) {
    setChips(prev => {
      const current = prev[rowKey] ?? []
      const next = current.includes(chip) ? current.filter(c => c !== chip) : [...current, chip]
      return { ...prev, [rowKey]: next }
    })
  }

  function getSubmitString(): string {
    if (activeMode === 'openers' || activeMode === 'chat') {
      const fallback = activeMode === 'openers'
        ? assembleMode1(sbWho, sbTopic, sbPosture, sbWrong)
        : assembleMode3(sbWho, sbTopic, sbPosture, sbWorry)
      const main = sbMirror.trim() || fallback
      return sbTail.trim() ? `${main}\n${sbTail.trim()}` : main
    }
    return freeform
  }

  function resetSB() {
    setSbWho(emptyBlank()); setSbTopic(emptyBlank()); setSbPosture(emptyBlank())
    setSbWrong(emptyBlank()); setSbWorry(emptyBlank())
    setSbMirror('')
    setSbTail(''); setSbPickerOpen(null); setSbCustomFor(null); setSbCustomText('')
  }

  function selectMode(mode: Mode) {
    setActiveMode(mode); setOutput(null)
    setFreeform(''); setChips({}); resetSB()
    setShowExamples(false); setError(null)
    setChatStarted(false); setChatMessages([]); setChatInput(''); setChatLoading(false)
    setChatEnded(false); setChatEndMessage(''); setChatContext('')
    setCoachBrief(null); setCoachBriefVisible(true); setShowSensitiveBanner(false); setExpandedTipKey(null)
    window.history.pushState({ bedrockStep: 'mode', mode }, '')
  }

  function loadExample(text: string) {
    if (activeMode === 'responses') {
      setFreeform(text); setShowExamples(false); return
    }
    if (activeMode === 'openers' || activeMode === 'chat') {
      const p = parseExample(text, activeMode)
      setSbWho(p.who); setSbTopic(p.topic); setSbPosture(p.posture)
      setSbWrong(p.wrong); setSbWorry(p.worry)
      setSbMirror(text)
      setSbTail(''); setSbPickerOpen(null); setShowExamples(false)
    }
  }

  function reset() {
    setOutput(null); setFreeform(''); setChips({}); resetSB()
    setShowExamples(false); setError(null); setSubmittedText('')
    setChatStarted(false); setChatMessages([]); setChatInput(''); setChatLoading(false)
    setChatEnded(false); setChatEndMessage(''); setChatContext('')
    setCoachBrief(null); setCoachBriefVisible(true); setShowSensitiveBanner(false); setExpandedTipKey(null)
  }

  function goHome() { reset(); setActiveMode(null) }

  async function restartChat() {
    setChatMessages([]); setChatInput('')
    if (chatInputRef.current) chatInputRef.current.style.height = 'auto'
    setChatEnded(false); setChatEndMessage('')
    setCoachBrief(null); setCoachBriefVisible(true); setExpandedTipKey(null); setError(null)
    await handleStartChat()
  }

  async function handleSubmit() {
    if (!activeMode || activeMode === 'chat') return
    const submitStr = getSubmitString()
    if (!submitStr.trim()) return
    setLoading(true); setError(null); setOutput(null); setSubmittedText(submitStr)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: (session ?? null) as QuizSession | null, mode: activeMode, chips, freeform: submitStr }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? 'Request failed')
      }
      setOutput(await res.json() as ConversationOutput)
      window.history.pushState({ bedrockStep: 'output' }, '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong — try again')
    } finally {
      setLoading(false)
    }
  }

  async function handleStartChat() {
    const setupStr = getSubmitString()
    if (!setupStr.trim()) return
    const chipLines = Object.entries(chips).filter(([, vals]) => vals.length > 0).map(([key, vals]) => `${key}: ${vals.join(', ')}`)
    const context = [setupStr.trim(), ...(chipLines.length > 0 ? [`Context: ${chipLines.join(' | ')}`] : [])].join('\n')
    setChatContext(context); setChatLoading(true); setError(null)
    if (isSensitiveTopic(setupStr)) setShowSensitiveBanner(true)
    try {
      const res = await fetch('/api/conversations/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: (session ?? null) as QuizSession | null, context, messages: [{ role: 'user', content: '__START__' }], turnCount: 0 }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? 'Request failed')
      }
      const data = await res.json() as { brief?: string; reply: string; ended: boolean; endMessage?: string; hint?: ChatHint }
      setChatStarted(true); setCoachBrief(data.brief ?? null)
      setChatMessages([{ role: 'assistant', content: data.reply, hint: data.hint }])
      window.history.pushState({ bedrockStep: 'chatActive' }, '')
      if (data.ended) { setChatEnded(true); setChatEndMessage(data.endMessage ?? '') }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong — try again')
    } finally {
      setChatLoading(false)
    }
  }

  async function handleChatSend() {
    if (!chatInput.trim() || chatLoading || chatEnded) return
    const userMessage: ChatMessage = { role: 'user', content: chatInput.trim() }
    const updatedMessages = [...chatMessages, userMessage]
    setChatMessages(updatedMessages); setChatInput('')
    if (chatInputRef.current) chatInputRef.current.style.height = 'auto'
    setChatLoading(true); setError(null)
    const turnCount = updatedMessages.filter(m => m.role === 'assistant').length
    const apiMessages = [{ role: 'user' as const, content: '__START__' }, ...updatedMessages.map(m => ({ role: m.role, content: m.content }))]
    try {
      const res = await fetch('/api/conversations/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: (session ?? null) as QuizSession | null, context: chatContext, messages: apiMessages, turnCount }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? 'Request failed')
      }
      const data = await res.json() as { reply: string; ended: boolean; endMessage?: string; hint?: ChatHint }
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply, hint: data.hint }])
      if (data.ended) { setChatEnded(true); setChatEndMessage(data.endMessage ?? '') }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong — try again')
    } finally {
      setChatLoading(false)
      setTimeout(() => chatInputRef.current?.focus(), 50)
    }
  }

  function endChat() { setChatEnded(true); setChatEndMessage('(You ended the practice session.)') }

  const examples = activeMode ? EXAMPLES[activeMode] : []

  // ── Unlock gate (SPEC §2 Unlock Ladder) ──────────────────────────────────
  if (!unlock.conversations) {
    return (
      <LockedPillarGate
        pillarName="Your Conversations"
        description="Claude-powered prep for difficult conversations across political difference. Knows your values, your bridge, and the gaps — before you say a word. Unlocks when you complete Layer 1 of the quiz."
        unlocksAfterLayer={1}
        accentColor="var(--color-blue-accent)"
      />
    )
  }

  return (
    <>
    <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-16) var(--space-6)' }}>
      <style>{ANIMATIONS}</style>
      {showGuardrails && <GuardrailsModal onClose={() => setShowGuardrails(false)} />}

      {isAnonymous && !convBannerDismissed && (
        <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-gold)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <p style={{ flex: 1, margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            Your results are temporary. <a href="/signup" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none', fontWeight: 'var(--weight-semibold)' }}>Create a free account</a> to save them.
          </p>
          <button onClick={() => setConvBannerDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', padding: 0, flexShrink: 0 }}>Dismiss</button>
        </div>
      )}

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-blue-accent)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>
        Your Conversations
      </p>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-tight)' }}>
        There&apos;s got to be a better way to talk to the people you disagree with.
      </h1>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
        Most cross-partisan blowups aren&apos;t really disagreements. They&apos;re failed translations &mdash; someone says a thing in tribal shorthand that trips the other side&apos;s alarm, the other side trips it back, and now you&apos;re fighting about gas prices when neither of you was ever really talking about gas prices.
      </p>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
        So this pillar does one thing first, before anything else: it <strong style={{ color: 'var(--color-text-primary)' }}>decodes</strong>. It reads past the surface to the thing underneath &mdash; the worry, the value, the fear actually driving what got said. Then it finds the opening: the place where what you believe and what they believe actually touch. And hands you a few ways in, in your own voice.
      </p>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
        It won&apos;t help you win. That&apos;s the point. No zingers, no gotchas. Firm on what you believe, genuinely open to the person across from you. Curious, not combative. Both at once.
      </p>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-10)' }}>
        Built on the Ladder of Inference (Argyris / Senge).{' '}
        <a href="#how-it-works" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>How it works &rarr;</a>
      </p>

      {!hasProfile && (
        <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', flex: 1, margin: 0 }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Take the quiz and this gets sharper.</strong>{' '}
            Right now it works from what you type. Once you have a profile, it knows your bridge before you say a word.
          </p>
          <a href="/quiz" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-blue-accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Take the quiz &rarr;</a>
        </div>
      )}

      {/* Mode cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {MODE_CARDS.map(({ mode, title, desc, beta }) => (
          <button
            key={mode}
            onClick={() => selectMode(mode)}
            style={{ fontFamily: 'var(--font-body)', textAlign: 'left', background: activeMode === mode ? 'var(--color-bg-surface)' : 'transparent', border: activeMode === mode ? '2px solid var(--color-blue-accent)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h4)', color: 'var(--color-text-primary)', margin: 0 }}>{title}</p>
              {beta && <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-gold)', backgroundColor: 'rgba(196,150,53,0.1)', border: '1px solid var(--color-gold)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>Beta</span>}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{desc}</p>
          </button>
        ))}
      </div>

      {/* Mode 1 — Openers: sentence builder */}
      {activeMode === 'openers' && !output && !loading && (
        <SentenceBuilderSection
          mode="openers"
          sbWho={sbWho} setSbWho={setSbWho}
          sbTopic={sbTopic} setSbTopic={setSbTopic}
          sbPosture={sbPosture} setSbPosture={setSbPosture}
          sbWrong={sbWrong} setSbWrong={setSbWrong} sbWorry={sbWorry} setSbWorry={setSbWorry}
          sbMirror={sbMirror} setSbMirror={setSbMirror}
          sbTail={sbTail} setSbTail={setSbTail}
          sbPickerOpen={sbPickerOpen} setSbPickerOpen={setSbPickerOpen}
          sbCustomFor={sbCustomFor} setSbCustomFor={setSbCustomFor}
          sbCustomText={sbCustomText} setSbCustomText={setSbCustomText}
          showExamples={showExamples} onToggleExamples={() => setShowExamples(s => !s)}
          examples={examples} onLoadExample={loadExample}
          error={error} submitLabel={loading ? 'Decoding…' : 'Decode this →'}
          onSubmit={() => void handleSubmit()} submitDisabled={loading}
        />
      )}

      {/* Mode 2 — Responses */}
      {activeMode === 'responses' && !output && !loading && (
        <ResponseModeInput
          freeform={freeform} onFreeformChange={setFreeform}
          showExamples={showExamples} onToggleExamples={() => setShowExamples(s => !s)}
          examples={examples} onLoadExample={loadExample}
          chips={chips} onToggleChip={toggleChip}
          error={error} submitLabel={loading ? 'Decoding…' : 'Decode this →'}
          onSubmit={() => void handleSubmit()} submitDisabled={!freeform.trim() || loading}
        />
      )}

      {/* Openers/Responses loading spinner */}
      {loading && activeMode !== 'chat' && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-blue-accent)', animation: 'bedrock-spin 0.75s linear infinite' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', margin: 0 }}>Reading past the surface…</p>
        </div>
      )}

      {/* Output */}
      {output && !loading && activeMode !== 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-5)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', fontStyle: 'italic', margin: 0 }}>{output.reflectBack}</p>
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
              The decode
              {hasProfile && mantleName && <span style={{ fontSize: '10px', fontStyle: 'italic', color: 'var(--color-text-muted)', marginLeft: '10px' }}>Read through the lens of {mantleName}</span>}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {([
                { label: 'The surface', text: output.surface },
                { label: 'The worry underneath', text: output.worry },
                { label: 'The opening', text: output.opening },
              ] as { label: string; text: string }[]).map(({ label, text }) => (
                <div key={label} style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <div style={{ width: '4px', backgroundColor: 'var(--color-gold)', borderRadius: 'var(--radius-full)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>{label}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>Ways in</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[...output.responses].sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0)).map((r, i) => <ResponseCard key={i} r={r} />)}
            </div>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
            These are starting points, not scripts. The words are yours to change.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
            <button onClick={reset} style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', color: '#fff', backgroundColor: 'var(--color-blue-accent)', border: 'none', borderRadius: 'var(--btn-radius)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', cursor: 'pointer' }}>New conversation &rarr;</button>
            <button onClick={() => setOutput(null)} style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--btn-radius)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', cursor: 'pointer' }}>Change the input</button>
            <button onClick={() => window.print()} style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--btn-radius)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', cursor: 'pointer' }}>Print / Save as PDF</button>
          </div>
        </div>
      )}

      {/* Mode 3 — Back-and-forth setup: sentence builder */}
      {activeMode === 'chat' && !chatStarted && !chatLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            Claude plays the other person — charitably, not as a caricature. Real practice against something real.{' '}
            <button onClick={() => setShowGuardrails(true)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-blue-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline' }}>How this works &rarr;</button>
          </p>
          <SentenceBuilderSection
            mode="chat"
            sbWho={sbWho} setSbWho={setSbWho}
            sbTopic={sbTopic} setSbTopic={setSbTopic}
            sbPosture={sbPosture} setSbPosture={setSbPosture}
            sbWrong={sbWrong} setSbWrong={setSbWrong} sbWorry={sbWorry} setSbWorry={setSbWorry}
            sbMirror={sbMirror} setSbMirror={setSbMirror}
            sbTail={sbTail} setSbTail={setSbTail}
            sbPickerOpen={sbPickerOpen} setSbPickerOpen={setSbPickerOpen}
            sbCustomFor={sbCustomFor} setSbCustomFor={setSbCustomFor}
            sbCustomText={sbCustomText} setSbCustomText={setSbCustomText}
            showExamples={showExamples} onToggleExamples={() => setShowExamples(s => !s)}
            examples={examples} onLoadExample={loadExample}
            error={error} submitLabel="Start chatting →"
            onSubmit={() => void handleStartChat()} submitDisabled={false}
          />
        </div>
      )}

      {/* Mode 3 — Starting spinner */}
      {activeMode === 'chat' && !chatStarted && chatLoading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-blue-accent)', animation: 'bedrock-spin 0.75s linear infinite' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', margin: 0 }}>Setting up your practice conversation…</p>
        </div>
      )}

      {/* Mode 3 — Chat UI (unchanged) */}
      {activeMode === 'chat' && chatStarted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>Back-and-forth</p>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-gold)', backgroundColor: 'rgba(196,150,53,0.1)', border: '1px solid var(--color-gold)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>Beta</span>
              <button onClick={() => setShowGuardrails(true)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', padding: 0 }}>How this works</button>
              {coachBrief && !coachBriefVisible && (
                <button onClick={() => setCoachBriefVisible(true)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-gold)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', padding: 0 }}>Coach&rsquo;s note</button>
              )}
            </div>
            {!chatEnded && (
              <button onClick={endChat} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--btn-radius)', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer' }}>End practice</button>
            )}
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 0 }}>
              <strong style={{ color: 'var(--color-text-secondary)' }}>Practicing:</strong>{' '}{chatContext}
            </p>
          </div>

          {showSensitiveBanner && (
            <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0, flex: 1 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>This sounds like a sensitive situation.</strong>{' '}
                Back-and-forth is a conversation practice tool, not a substitute for professional support. If you or someone you know needs help, please reach out to a counselor or crisis line.
              </p>
              <button onClick={() => setShowSensitiveBanner(false)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>✕</button>
            </div>
          )}

          {coachBrief && coachBriefVisible && (
            <div style={{ backgroundColor: 'rgba(196,150,53,0.07)', border: '1px solid rgba(196,150,53,0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0, flex: 1 }}>
                <strong style={{ color: 'var(--color-gold)' }}>Coach&rsquo;s note:</strong>{' '}{coachBrief}
              </p>
              <button onClick={() => setCoachBriefVisible(false)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>✕</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', padding: 'var(--space-3) 0' }}>
            {chatMessages.map((msg, i) => (
              <div key={i}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', textAlign: msg.role === 'user' ? 'right' : 'left', margin: '0 4px var(--space-1)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase' }}>
                  {msg.role === 'user' ? 'You' : 'Them'}
                </p>
                <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '78%', backgroundColor: msg.role === 'user' ? 'var(--color-blue-accent)' : 'var(--color-bg-surface)', color: msg.role === 'user' ? '#fff' : 'var(--color-text-primary)', border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', lineHeight: 'var(--leading-relaxed)' }}>
                    {msg.content}
                  </div>
                </div>
                {msg.role === 'assistant' && msg.hint && (
                  <div style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-3)', marginLeft: '4px', backgroundColor: 'rgba(196,150,53,0.06)', border: '1px solid rgba(196,150,53,0.25)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', maxWidth: '78%' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-2) 0' }}>
                      <strong style={{ color: 'var(--color-gold)' }}>Decoding this:</strong>{' '}{msg.hint.read}
                    </p>
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase' }}>Try:</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)', fontStyle: 'italic' }}>tap any for coaching</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                      {msg.hint.moves.map((move, mi) => {
                        const tipKey = `${i}-${mi}`
                        const isOpen = expandedTipKey === tipKey
                        return (
                          <button
                            key={mi}
                            onClick={() => setExpandedTipKey(isOpen ? null : tipKey)}
                            style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: isOpen ? '#fff' : 'var(--color-text-secondary)', backgroundColor: isOpen ? 'var(--color-gold)' : 'var(--color-bg)', border: `1px solid ${isOpen ? 'var(--color-gold)' : 'rgba(196,150,53,0.3)'}`, borderRadius: 'var(--radius-full)', padding: '2px 10px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {typeof move === 'string' ? move : move.label}
                            <span style={{ fontSize: '9px', opacity: 0.7 }}>{isOpen ? '▲' : '▼'}</span>
                          </button>
                        )
                      })}
                    </div>
                    {msg.hint.moves.map((move, mi) => {
                      const tipKey = `${i}-${mi}`
                      const tip = typeof move === 'string' ? null : move.tip
                      return expandedTipKey === tipKey && tip ? (
                        <div key={mi} style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid rgba(196,150,53,0.2)' }}>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-2) 0', fontStyle: 'italic' }}>{tip}</p>
                          <button
                            onClick={() => {
                              const phrase = move.phrase ?? tip
                              setChatInput(phrase)
                              setExpandedTipKey(null)
                              setTimeout(() => {
                                if (chatInputRef.current) {
                                  chatInputRef.current.style.height = 'auto'
                                  chatInputRef.current.style.height = `${chatInputRef.current.scrollHeight}px`
                                  chatInputRef.current.focus()
                                }
                              }, 0)
                            }}
                            style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-blue-accent)', backgroundColor: 'transparent', border: '1px solid var(--color-blue-accent)', borderRadius: 'var(--radius-full)', padding: '2px 10px', cursor: 'pointer', transition: 'all 0.15s' }}
                          >
                            Add to chat
                          </button>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '4px' }}>
                <TypingIndicator />
              </div>
            )}

            {chatEnded && chatEndMessage && (
              <div style={{ backgroundColor: 'rgba(196,150,53,0.08)', border: '1px solid var(--color-gold)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)', marginTop: 'var(--space-3)' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', fontStyle: 'italic', margin: 0 }}>
                  {chatEndMessage.replace(/^\(|\)$/g, '')}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)', margin: 0 }}>{error}</p>}

          {!chatEnded ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={e => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px` }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleChatSend() } }}
                  placeholder="Your response… (Enter to send, Shift+Enter for new line)"
                  rows={2}
                  disabled={chatLoading}
                  style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', lineHeight: 'var(--leading-relaxed)', resize: 'none', overflow: 'hidden', boxSizing: 'border-box', opacity: chatLoading ? 0.6 : 1, minHeight: '64px' }}
                />
                <button
                  onClick={() => void handleChatSend()}
                  disabled={!chatInput.trim() || chatLoading}
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', color: '#fff', backgroundColor: !chatInput.trim() || chatLoading ? 'var(--color-text-muted)' : 'var(--color-blue-accent)', border: 'none', borderRadius: 'var(--btn-radius)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', cursor: !chatInput.trim() || chatLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Send &rarr;
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={endChat} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--btn-radius)', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer' }}>End practice</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
              <button onClick={reset} style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', color: '#fff', backgroundColor: 'var(--color-blue-accent)', border: 'none', borderRadius: 'var(--btn-radius)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', cursor: 'pointer' }}>Try another &rarr;</button>
              <button onClick={() => void restartChat()} style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--btn-radius)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', cursor: 'pointer' }}>Practice same conversation again</button>
              <button onClick={goHome} style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--btn-radius)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', cursor: 'pointer' }}>Back to Conversations</button>
              <button onClick={() => window.print()} style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--btn-radius)', padding: 'var(--btn-padding-y) var(--btn-padding-x)', cursor: 'pointer' }}>Print / Save as PDF</button>
            </div>
          )}
        </div>
      )}

      {!output && !loading && !(activeMode === 'chat' && chatStarted) && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginTop: 'var(--space-12)', fontStyle: 'italic' }}>
          One thing this doesn&apos;t do yet: remember. Each conversation starts fresh &mdash; it won&apos;t recall that you talked to your brother-in-law last week and ask how it went. That&apos;s coming.
        </p>
      )}

      <HowItWorksAccordion />
    </div>

    {/* Print layout */}
    {portalMounted && createPortal(
      <div className="bedrock-print-layout" style={{ fontFamily: 'system-ui, sans-serif', color: '#1a1a18', background: 'white' }}>
        {output && activeMode && activeMode !== 'chat' && (() => {
          const modeTitle = activeMode === 'openers' ? 'Your Openers' : 'Your Responses'
          const situationLabel = activeMode === 'openers' ? 'The situation' : 'What was said'
          const descriptor = activeMode === 'openers'
            ? 'This is a simulated, AI-generated analysis from bedrock.guide to help you start a difficult conversation. The situation has been decoded and several ways in are surfaced below. These are starting points, not scripts — the words are yours to change.'
            : 'This is a simulated, AI-generated analysis from bedrock.guide to help you respond to something that was said. The subtext has been decoded and several response options are surfaced below. These are starting points, not scripts — the words are yours to change.'
          const chipLines = Object.entries(chips).filter(([, v]) => v.length > 0).map(([k, v]) => `${k}: ${v.join(', ')}`)
          const printSituation = activeMode === 'openers' ? submittedText : freeform
          return (
            <>
              <div style={{ borderBottom: '1.5px solid #1a1a18', paddingBottom: '18px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="26" height="26" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                    <clipPath id="op-peak"><polygon points="4,52 24,14 38,30 48,20 56,52"/></clipPath>
                    <g clipPath="url(#op-peak)">
                      <rect x="0" y="14" width="60" height="14" fill="#6B9FEA"/>
                      <rect x="0" y="28" width="60" height="13" fill="#D44035"/>
                      <rect x="0" y="41" width="60" height="13" fill="#E8E4DA"/>
                    </g>
                  </svg>
                  <span style={{ fontSize: '20px', fontWeight: 500, fontStyle: 'italic', letterSpacing: '-0.3px' }}>Bedrock<span style={{ fontStyle: 'normal', fontWeight: 400, color: '#888', fontSize: '17px' }}>.guide</span></span>
                </div>
                <span style={{ fontSize: '12px', color: '#888' }}>{printDate}</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.2px', color: '#1a1a18', marginBottom: '6px' }}>{modeTitle}</p>
              <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.65, marginBottom: '20px' }}>{descriptor}</p>
              <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>{situationLabel}</p>
              <div style={{ background: '#f6f5f2', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', color: '#1a1a18', lineHeight: 1.65, margin: 0 }}>{printSituation}</p>
                {chipLines.length > 0 && <p style={{ fontSize: '12px', color: '#888', marginTop: '8px', marginBottom: 0 }}>{chipLines.join(' · ')}</p>}
              </div>
              <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '28px', paddingBottom: '24px', borderBottom: '0.5px solid #ddd' }}>{output.reflectBack}</p>
              <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b8922a', marginBottom: '16px' }}>
                The decode{hasProfile && mantleName && <span style={{ fontSize: '10px', fontStyle: 'italic', color: '#888', marginLeft: '10px' }}>Read through the lens of {mantleName}</span>}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '0.5px solid #ddd' }}>
                {([{ label: 'The surface', text: output.surface }, { label: 'The worry underneath', text: output.worry }, { label: 'The opening', text: output.opening }] as { label: string; text: string }[]).map(({ label, text }) => (
                  <div key={label} style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ width: '3px', background: '#b8922a', borderRadius: '2px', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a1a18', marginBottom: '4px' }}>{label}</p>
                      <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.65, margin: 0 }}>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b8922a', marginBottom: '16px' }}>Ways in</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                {[...output.responses].sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0)).map((r, i) => {
                  const color = ENERGY_COLORS[r.energy] ?? '#888'
                  return (
                    <div key={i} style={{ border: r.recommended ? `2px solid ${color}` : '1px solid #ddd', borderRadius: '8px', padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color, background: `${color}18`, padding: '2px 8px', borderRadius: '12px' }}>{r.energy}</span>
                        {r.recommended && <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#555', border: '1px solid #ddd', padding: '2px 8px', borderRadius: '12px' }}>recommended</span>}
                      </div>
                      <p style={{ fontSize: '14px', color: '#1a1a18', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '8px' }}>&ldquo;{r.text}&rdquo;</p>
                      <p style={{ fontSize: '12.5px', color: '#666', lineHeight: 1.6, margin: 0 }}>{r.doing}{r.recommended && r.reason ? ` — ${r.reason}` : ''}</p>
                    </div>
                  )
                })}
              </div>
              <hr style={{ border: 'none', borderTop: '0.5px solid #ddd', marginBottom: '28px' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <svg width="18" height="18" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                    <clipPath id="op-peak-foot"><polygon points="4,52 24,14 38,30 48,20 56,52"/></clipPath>
                    <g clipPath="url(#op-peak-foot)"><rect x="0" y="14" width="60" height="14" fill="#6B9FEA"/><rect x="0" y="28" width="60" height="13" fill="#D44035"/><rect x="0" y="41" width="60" height="13" fill="#E8E4DA"/></g>
                  </svg>
                  <span style={{ fontSize: '15px', fontWeight: 500, fontStyle: 'italic' }}>Bedrock<span style={{ fontStyle: 'normal', fontWeight: 400, color: '#888', fontSize: '13px' }}>.guide</span></span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#555', lineHeight: 1.75, marginBottom: '14px' }}>Hard conversations don&rsquo;t get easier by avoiding them — but they get more manageable with practice. Bedrock.guide is a free civic tool that helps you understand where you actually stand on the issues, see how your values connect to real policy choices, and rehearse the conversations that matter before they happen in real life.</p>
                <p style={{ fontSize: '13px', color: '#1a1a18', lineHeight: 1.75, marginBottom: '14px' }}>Most civic tools are built to tell you what to think. Bedrock.guide is built to help you think — starting with your own values, not a party line or an algorithm&rsquo;s agenda. A short quiz maps your civic identity (your &ldquo;mantle&rdquo;), then four tools put it to work: your ballot and your current officials, matched to your values, a curated media diet, a window into Congress beyond your own races, and practice for the hard conversations before they happen. All grounded in how you actually think, not someone else&rsquo;s agenda.</p>
                <p style={{ fontSize: '12.5px', color: '#555', lineHeight: 1.75, marginBottom: '16px' }}>If someone shared this with you, you can try it yourself — it&rsquo;s free and takes about five minutes to get started.</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#185FA5' }}>bedrock.guide</p>
              </div>
            </>
          )
        })()}

        {chatStarted && chatMessages.length > 0 && (
          <>
            <div style={{ borderBottom: '1.5px solid #1a1a18', paddingBottom: '18px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="26" height="26" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                  <clipPath id="print-peak"><polygon points="4,52 24,14 38,30 48,20 56,52"/></clipPath>
                  <g clipPath="url(#print-peak)"><rect x="0" y="14" width="60" height="14" fill="#6B9FEA"/><rect x="0" y="28" width="60" height="13" fill="#D44035"/><rect x="0" y="41" width="60" height="13" fill="#E8E4DA"/></g>
                </svg>
                <span style={{ fontSize: '20px', fontWeight: 500, fontStyle: 'italic', letterSpacing: '-0.3px' }}>Bedrock<span style={{ fontStyle: 'normal', fontWeight: 400, color: '#888', fontSize: '17px' }}>.guide</span></span>
              </div>
              <span style={{ fontSize: '12px', color: '#888' }}>{printDate}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.65, marginBottom: '20px' }}>
              This is a simulated, AI-generated practice transcript from <strong>bedrock.guide</strong>. The responses attributed to &ldquo;Them&rdquo; are entirely fabricated by an AI and do not represent any real person&rsquo;s words or views. This is a conversation rehearsal tool — not a record of any actual exchange. Coaching notes appear below each AI response.
            </p>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Your setup</p>
            <div style={{ background: '#f6f5f2', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', color: '#1a1a18', lineHeight: 1.65, margin: 0 }}>{chatContext}</p>
            </div>
            {coachBrief && (
              <div style={{ background: '#fdf8ee', border: '1px solid #e8d49a', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.6, margin: 0 }}><strong style={{ color: '#8a6c1a' }}>Coach&rsquo;s note:</strong> {coachBrief}</p>
              </div>
            )}
            <hr style={{ border: 'none', borderTop: '0.5px solid #ddd', marginBottom: '24px' }} />
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: msg.role === 'user' ? '#185FA5' : '#888', marginBottom: '5px' }}>{msg.role === 'user' ? 'You' : 'Them'}</p>
                <p style={{ fontSize: '14px', color: '#1a1a18', lineHeight: 1.65, marginBottom: msg.role === 'assistant' && msg.hint ? '8px' : 0 }}>{msg.content}</p>
                {msg.role === 'assistant' && msg.hint && (
                  <div style={{ background: '#f6f5f2', borderRadius: '8px', padding: '12px 16px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#555', marginBottom: '5px' }}>Decoding this</p>
                    <p style={{ fontSize: '12.5px', color: '#444', lineHeight: 1.6, fontStyle: 'italic', marginBottom: msg.hint.moves.length ? '8px' : 0 }}>{msg.hint.read}</p>
                    {msg.hint.moves.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {msg.hint.moves.map((move, mi) => (
                          <span key={mi} style={{ fontSize: '11px', color: '#185FA5', background: '#e6f1fb', borderRadius: '4px', padding: '3px 8px' }}>{typeof move === 'string' ? move : move.label}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {chatEndMessage && chatEndMessage !== '(You ended the practice session.)' && (
              <div style={{ background: '#fdf8ee', border: '1px solid #e8d49a', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px', marginTop: '8px' }}>
                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>{chatEndMessage}</p>
              </div>
            )}
            <hr style={{ border: 'none', borderTop: '0.5px solid #ddd', marginTop: '32px', marginBottom: '28px' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <svg width="18" height="18" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                  <clipPath id="print-peak-foot"><polygon points="4,52 24,14 38,30 48,20 56,52"/></clipPath>
                  <g clipPath="url(#print-peak-foot)"><rect x="0" y="14" width="60" height="14" fill="#6B9FEA"/><rect x="0" y="28" width="60" height="13" fill="#D44035"/><rect x="0" y="41" width="60" height="13" fill="#E8E4DA"/></g>
                </svg>
                <span style={{ fontSize: '15px', fontWeight: 500, fontStyle: 'italic' }}>Bedrock<span style={{ fontStyle: 'normal', fontWeight: 400, color: '#888', fontSize: '13px' }}>.guide</span></span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#555', lineHeight: 1.75, marginBottom: '14px' }}>Hard conversations don&rsquo;t get easier by avoiding them — but they get more manageable with practice. Bedrock.guide is a free civic tool that helps you understand where you actually stand on the issues, see how your values connect to real policy choices, and rehearse the conversations that matter before they happen in real life.</p>
              <p style={{ fontSize: '13px', color: '#1a1a18', lineHeight: 1.75, marginBottom: '14px' }}>Most civic tools are built to tell you what to think. Bedrock.guide is built to help you think — starting with your own values, not a party line or an algorithm&rsquo;s agenda. A short quiz maps your civic identity (your &ldquo;mantle&rdquo;), then four tools put it to work: your ballot and your current officials, matched to your values, a curated media diet, a window into Congress beyond your own races, and — as in this transcript — practice for the hard conversations before they happen. All grounded in how you actually think, not someone else&rsquo;s agenda.</p>
              <p style={{ fontSize: '12.5px', color: '#555', lineHeight: 1.75, marginBottom: '16px' }}>If someone shared this with you, you can try it yourself — it&rsquo;s free and takes about five minutes to get started.</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#185FA5' }}>bedrock.guide</p>
            </div>
          </>
        )}
      </div>,
      document.body
    )}
    </>
  )
}
