'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'
import type { QuizSession } from '@/types/quiz'

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = 'openers' | 'responses' | 'chat'

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

interface ChatHint {
  read: string
  moves: string[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  hint?: ChatHint
}

// ─── Static data ─────────────────────────────────────────────────────────────

const WHO = ['spouse/partner', 'parent', 'in-law', 'sibling', 'adult child', 'friend', 'neighbor', 'coworker', 'someone online', 'other']
const TOPIC = ['immigration', 'climate', 'guns', 'abortion', 'economy', 'elections', 'race', 'foreign policy', 'healthcare', 'something local', 'other']
const POSTURE = ["they've checked out entirely", "they think it's all rigged", "they only trust their own side's media", "they think people like me are the problem", "they just want to fight", "they've stopped listening", 'other']
const WRONG = ['we talk past each other', 'it gets heated fast', 'I freeze up', 'they shut down', "we've never actually tried", 'other']
const VIBE = ['genuinely curious', 'goading', 'angry', 'testing me', 'venting', 'trying to connect', 'other']
const SAID_TO = ['me', 'someone I care about']
const WORRIED = ["I'll get too heated", "I'll cave", "I'll freeze", "I'll say it wrong", "it'll blow up the relationship", 'other']

const CHIP_ROWS: Record<Mode, ChipRow[]> = {
  openers: [
    { key: 'who', label: 'Who are you talking to?', chips: WHO },
    { key: 'topic', label: 'Topic', chips: TOPIC },
    { key: 'posture', label: 'Or is it more of a posture?', chips: POSTURE },
    { key: 'wrong', label: 'What usually goes wrong?', chips: WRONG },
  ],
  responses: [
    { key: 'who', label: 'Who said it?', chips: WHO },
    { key: 'saidTo', label: 'Said to whom?', chips: SAID_TO },
    { key: 'vibe', label: "What's the vibe?", chips: VIBE },
    { key: 'topic', label: 'Topic', chips: TOPIC },
    { key: 'posture', label: 'Or is it more of a posture?', chips: POSTURE },
  ],
  chat: [
    { key: 'who', label: 'Who are you practicing with?', chips: WHO },
    { key: 'worried', label: 'What are you worried about?', chips: WORRIED },
    { key: 'topic', label: 'Topic', chips: TOPIC },
    { key: 'posture', label: 'Or is it more of a posture?', chips: POSTURE },
  ],
}

const FREEFORM_PLACEHOLDER: Record<Mode, string> = {
  openers: "What do you want to talk about — and what's making it hard?",
  responses: 'What did they say? Paste it, or describe it.',
  chat: "Describe the conversation you want to practice — who's the other person, what's the tension?",
}

// Examples always ship in pairs — one left-leaning, one right-leaning
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
    {
      left: "A coworker told me that defunding the police is the only way to stop racist violence.",
      right: "A coworker told me undocumented immigrants are driving the crime wave and we need mass deportations now.",
    },
    {
      left: "My dad says billionaires don't pay their fair share and the whole system is rigged for the rich.",
      right: "My dad says we're becoming a socialist country and people just want handouts instead of working.",
    },
  ],
  chat: [
    {
      left: "I need to practice talking to my uncle who thinks climate action is just an attack on working people.",
      right: "I need to practice talking to my college roommate who thinks fossil fuels should be banned tomorrow.",
    },
  ],
}

const MODE_CARDS: { mode: Mode; title: string; desc: string; beta?: boolean }[] = [
  { mode: 'openers', title: 'Openers', desc: 'Open a conversation with someone who sees it differently.' },
  { mode: 'responses', title: 'Responses', desc: "Someone said the thing. Get a better answer than the one you'd fire back." },
  { mode: 'chat', title: 'Back-and-forth', desc: 'Practice with Claude playing the other person.', beta: true },
]

const ENERGY_COLORS: Record<string, string> = {
  'disarm with warmth': '#d97706',
  'get curious': '#2563eb',
  'name it lightly': '#16a34a',
  'find the shared question': '#7c3aed',
}

// ─── Animations ───────────────────────────────────────────────────────────────

const ANIMATIONS = `
@keyframes bedrock-spin { to { transform: rotate(360deg); } }
@keyframes bedrock-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-6px); opacity: 1; }
}
`

// ─── Sub-components ───────────────────────────────────────────────────────────

function GuardrailsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', margin: 0 }}>
            How Back-and-forth works
          </h2>
          <button
            onClick={onClose}
            style={{ fontFamily: 'var(--font-body)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '22px', lineHeight: 1, padding: '0 0 0 var(--space-3)' }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)', fontSize: 'var(--text-body)', margin: '0 0 var(--space-1) 0' }}>
              Claude plays the other person — charitably
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
              Not a caricature, not a pushover. A reasonable human being who actually holds those views and has real reasons for them. The point is practice against something real, not target practice.
            </p>
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-body)' }}>
              Guardrails are on
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
              No personal attacks. No conspiracy theories or fabricated facts — even in character. If the conversation drifts into unproductive territory, Claude will redirect it. It won&apos;t help you &ldquo;win&rdquo; — the goal is a real conversation, not a debate victory.
            </p>
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-body)' }}>
              Your conversation stays private
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
              Nothing is saved. Each session starts clean — no memory of what you practiced before.
            </p>
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-body)' }}>
              Sessions end when they&apos;re done
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
              Claude will close the session when the conversation reaches a natural landing, or after around ten exchanges. When it closes, it steps out of character briefly with one coaching observation. You can also end anytime with the &ldquo;End practice&rdquo; button.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 0 }}>
            Something off? We want to hear it.{' '}
            <a href="mailto:hello@bedrock.guide" style={{ color: 'var(--color-blue-accent)' }}>
              hello@bedrock.guide
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function ChipButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        border: selected ? '1px solid var(--color-blue-accent)' : '1px solid var(--color-border)',
        backgroundColor: selected ? 'var(--color-blue-accent)' : 'transparent',
        color: selected ? '#fff' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function ResponseCard({ r }: { r: ConversationResponse }) {
  const color = ENERGY_COLORS[r.energy] ?? 'var(--color-text-muted)'
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: r.recommended ? `2px solid ${color}` : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 'var(--weight-semibold)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color,
            backgroundColor: `${color}18`,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {r.energy}
        </span>
        {r.recommended && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            recommended
          </span>
        )}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: 'var(--space-3)',
          fontStyle: 'italic',
        }}
      >
        &ldquo;{r.text}&rdquo;
      </p>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--leading-relaxed)',
          margin: 0,
        }}
      >
        {r.doing}
        {r.recommended && r.reason && ` — ${r.reason}`}
      </p>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      gap: '5px',
      alignItems: 'center',
      padding: 'var(--space-3) var(--space-4)',
      backgroundColor: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      width: 'fit-content',
    }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-text-muted)',
            animation: `bedrock-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Input section (standalone to avoid unmount-on-rerender focus loss) ─────

interface InputSectionProps {
  freeform: string
  onFreeformChange: (v: string) => void
  placeholder: string
  showExamples: boolean
  onToggleExamples: () => void
  examples: { left: string; right: string }[]
  onLoadExample: (text: string) => void
  chipRows: ChipRow[]
  chips: Record<string, string[]>
  onToggleChip: (rowKey: string, chip: string) => void
  error: string | null
  submitLabel: string
  onSubmit: () => void
  submitDisabled: boolean
}

function InputSection({
  freeform, onFreeformChange, placeholder,
  showExamples, onToggleExamples, examples, onLoadExample,
  chipRows, chips, onToggleChip,
  error, submitLabel, onSubmit, submitDisabled,
}: InputSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync textarea value when parent pushes a new value (mode reset, example load).
  // useLayoutEffect runs before paint to avoid a one-frame flash.
  useLayoutEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== freeform) {
      textareaRef.current.value = freeform
    }
  }, [freeform])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <textarea
          ref={textareaRef}
          defaultValue={freeform}
          onChange={e => onFreeformChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          style={{
            width: '100%',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            lineHeight: 'var(--leading-relaxed)',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={onToggleExamples}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-2) 0',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
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
                  {([pair.left, pair.right] as string[]).map((ex, j) => (
                    <button
                      key={j}
                      onClick={() => onLoadExample(ex)}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-small)',
                        color: 'var(--color-text-secondary)',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-3)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        lineHeight: 'var(--leading-relaxed)',
                      }}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {chipRows.map(row => (
          <div key={row.key}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', fontWeight: 'var(--weight-semibold)', margin: '0 0 var(--space-2) 0' }}>
              {row.label}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {row.chips.map(chip => (
                <ChipButton
                  key={chip}
                  label={chip}
                  selected={(chips[row.key] ?? []).includes(chip)}
                  onClick={() => onToggleChip(row.key, chip)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        {error && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)', marginBottom: 'var(--space-3)' }}>
            {error}
          </p>
        )}
        <button
          onClick={onSubmit}
          disabled={submitDisabled}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-body)',
            color: '#fff',
            backgroundColor: submitDisabled ? 'var(--color-text-muted)' : 'var(--color-blue-accent)',
            border: 'none',
            borderRadius: 'var(--btn-radius)',
            padding: 'var(--btn-padding-y) var(--btn-padding-x)',
            cursor: submitDisabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s',
          }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ConversationsPage() {
  const session = useQuizStore(s => s.session)
  const hasProfile = Boolean(session?.result)

  // Openers / Responses state
  const [activeMode, setActiveMode] = useState<Mode | null>(null)
  const [freeform, setFreeform] = useState('')
  const [chips, setChips] = useState<Record<string, string[]>>({})
  const [showExamples, setShowExamples] = useState(false)
  const [output, setOutput] = useState<ConversationOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Back-and-forth chat state
  const [chatStarted, setChatStarted] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatEnded, setChatEnded] = useState(false)
  const [chatEndMessage, setChatEndMessage] = useState('')
  const [chatContext, setChatContext] = useState('')

  // Modal
  const [showGuardrails, setShowGuardrails] = useState(false)

  // Auto-scroll chat to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  // Keep focus on chat input after each send so spacebar doesn't land on Send button
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  function toggleChip(rowKey: string, chip: string) {
    setChips(prev => {
      const current = prev[rowKey] ?? []
      const next = current.includes(chip)
        ? current.filter(c => c !== chip)
        : [...current, chip]
      return { ...prev, [rowKey]: next }
    })
  }

  function selectMode(mode: Mode) {
    setActiveMode(mode)
    setOutput(null)
    setFreeform('')
    setChips({})
    setShowExamples(false)
    setError(null)
    setChatStarted(false)
    setChatMessages([])
    setChatInput('')
    setChatLoading(false)
    setChatEnded(false)
    setChatEndMessage('')
    setChatContext('')
  }

  function loadExample(text: string) {
    setFreeform(text)
    setShowExamples(false)
  }

  function reset() {
    setOutput(null)
    setFreeform('')
    setChips({})
    setShowExamples(false)
    setError(null)
    setChatStarted(false)
    setChatMessages([])
    setChatInput('')
    setChatLoading(false)
    setChatEnded(false)
    setChatEndMessage('')
    setChatContext('')
  }

  async function handleSubmit() {
    if (!freeform.trim() || !activeMode || activeMode === 'chat') return
    setLoading(true)
    setError(null)
    setOutput(null)

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: (session ?? null) as QuizSession | null, mode: activeMode, chips, freeform }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? 'Request failed')
      }
      const data = await res.json()
      setOutput(data as ConversationOutput)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong — try again')
    } finally {
      setLoading(false)
    }
  }

  async function handleStartChat() {
    if (!freeform.trim()) return

    const chipLines = Object.entries(chips)
      .filter(([, vals]) => vals.length > 0)
      .map(([key, vals]) => `${key}: ${vals.join(', ')}`)

    const context = [
      freeform.trim(),
      ...(chipLines.length > 0 ? [`Context: ${chipLines.join(' | ')}`] : []),
    ].join('\n')

    setChatContext(context)
    setChatLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/conversations/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: (session ?? null) as QuizSession | null,
          context,
          messages: [{ role: 'user', content: '__START__' }],
          turnCount: 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? 'Request failed')
      }

      const data = await res.json() as { reply: string; ended: boolean; endMessage?: string; hint?: ChatHint }

      setChatStarted(true)
      setChatMessages([{ role: 'assistant', content: data.reply, hint: data.hint }])

      if (data.ended) {
        setChatEnded(true)
        setChatEndMessage(data.endMessage ?? '')
      }
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

    setChatMessages(updatedMessages)
    setChatInput('')
    setChatLoading(true)
    setError(null)

    // turnCount = number of assistant turns in history (before this response)
    const turnCount = updatedMessages.filter(m => m.role === 'assistant').length

    // Full API message history: __START__ + all displayed messages
    const apiMessages = [
      { role: 'user' as const, content: '__START__' },
      ...updatedMessages,
    ]

    try {
      const res = await fetch('/api/conversations/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: (session ?? null) as QuizSession | null,
          context: chatContext,
          messages: apiMessages,
          turnCount,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? 'Request failed')
      }

      const data = await res.json() as { reply: string; ended: boolean; endMessage?: string; hint?: ChatHint }

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply, hint: data.hint }])

      if (data.ended) {
        setChatEnded(true)
        setChatEndMessage(data.endMessage ?? '')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong — try again')
    } finally {
      setChatLoading(false)
      // Restore focus so the next keystroke (including space) goes to the textarea, not the Send button
      setTimeout(() => chatInputRef.current?.focus(), 50)
    }
  }

  function endChat() {
    setChatEnded(true)
    setChatEndMessage('(You ended the practice session.)')
  }

  const chipRows = activeMode ? CHIP_ROWS[activeMode] : []
  const examples = activeMode ? EXAMPLES[activeMode] : []

  return (
    <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-16) var(--space-6)' }}>
      <style>{ANIMATIONS}</style>
      {showGuardrails && <GuardrailsModal onClose={() => setShowGuardrails(false)} />}

      {/* Hero */}
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

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-10)' }}>
        It won&apos;t help you win. That&apos;s the point. No zingers, no gotchas. Firm on what you believe, genuinely open to the person across from you. Curious, not combative. Both at once.
      </p>

      {/* No-profile nudge */}
      {!hasProfile && (
        <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', flex: 1, margin: 0 }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Take the quiz and this gets sharper.</strong>{' '}
            Right now it works from what you type. Once you have a profile, it knows your bridge before you say a word.
          </p>
          <a href="/quiz" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-blue-accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Take the quiz &rarr;
          </a>
        </div>
      )}

      {/* Mode cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {MODE_CARDS.map(({ mode, title, desc, beta }) => (
          <button
            key={mode}
            onClick={() => selectMode(mode)}
            style={{
              fontFamily: 'var(--font-body)',
              textAlign: 'left',
              background: activeMode === mode ? 'var(--color-bg-surface)' : 'transparent',
              border: activeMode === mode ? '2px solid var(--color-blue-accent)' : '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h4)', color: 'var(--color-text-primary)', margin: 0 }}>
                {title}
              </p>
              {beta && (
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 'var(--weight-semibold)',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                  backgroundColor: 'rgba(196,150,53,0.1)',
                  border: '1px solid var(--color-gold)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  Beta
                </span>
              )}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
              {desc}
            </p>
          </button>
        ))}
      </div>

      {/* Openers / Responses — input */}
      {activeMode && activeMode !== 'chat' && !output && (
        <InputSection
          freeform={freeform}
          onFreeformChange={setFreeform}
          placeholder={FREEFORM_PLACEHOLDER[activeMode]}
          showExamples={showExamples}
          onToggleExamples={() => setShowExamples(s => !s)}
          examples={examples}
          onLoadExample={loadExample}
          chipRows={chipRows}
          chips={chips}
          onToggleChip={toggleChip}
          error={error}
          submitLabel={loading ? 'Decoding…' : 'Decode this →'}
          onSubmit={handleSubmit}
          submitDisabled={!freeform.trim() || loading}
        />
      )}

      {/* Openers / Responses — loading spinner */}
      {loading && activeMode !== 'chat' && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-blue-accent)',
            animation: 'bedrock-spin 0.75s linear infinite',
          }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', margin: 0 }}>
            Reading past the surface…
          </p>
        </div>
      )}

      {/* Openers / Responses — output */}
      {output && !loading && activeMode !== 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

          <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-5)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', fontStyle: 'italic', margin: 0 }}>
              {output.reflectBack}
            </p>
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
              The decode
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
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>
                      {label}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
              Ways in
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[...output.responses]
                .sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0))
                .map((r, i) => (
                  <ResponseCard key={i} r={r} />
                ))}
            </div>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
            These are starting points, not scripts. The words are yours to change.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={reset}
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-body)',
                color: '#fff',
                backgroundColor: 'var(--color-blue-accent)',
                border: 'none',
                borderRadius: 'var(--btn-radius)',
                padding: 'var(--btn-padding-y) var(--btn-padding-x)',
                cursor: 'pointer',
              }}
            >
              New conversation &rarr;
            </button>
            <button
              onClick={() => setOutput(null)}
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-body)',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--btn-radius)',
                padding: 'var(--btn-padding-y) var(--btn-padding-x)',
                cursor: 'pointer',
              }}
            >
              Change the input
            </button>
          </div>
        </div>
      )}

      {/* Back-and-forth — setup */}
      {activeMode === 'chat' && !chatStarted && !chatLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            Claude plays the other person — charitably, not as a caricature. Real practice against something real.{' '}
            <button
              onClick={() => setShowGuardrails(true)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-blue-accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'inline',
              }}
            >
              How this works &rarr;
            </button>
          </p>

          <InputSection
            freeform={freeform}
            onFreeformChange={setFreeform}
            placeholder={FREEFORM_PLACEHOLDER['chat']}
            showExamples={showExamples}
            onToggleExamples={() => setShowExamples(s => !s)}
            examples={examples}
            onLoadExample={loadExample}
            chipRows={chipRows}
            chips={chips}
            onToggleChip={toggleChip}
            error={error}
            submitLabel="Start chatting →"
            onSubmit={handleStartChat}
            submitDisabled={!freeform.trim()}
          />
        </div>
      )}

      {/* Back-and-forth — starting up spinner */}
      {activeMode === 'chat' && !chatStarted && chatLoading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-blue-accent)',
            animation: 'bedrock-spin 0.75s linear infinite',
          }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', margin: 0 }}>
            Setting up your practice conversation…
          </p>
        </div>
      )}

      {/* Back-and-forth — chat UI */}
      {activeMode === 'chat' && chatStarted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Chat header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>
                Back-and-forth
              </p>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: 'var(--weight-semibold)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                backgroundColor: 'rgba(196,150,53,0.1)',
                border: '1px solid var(--color-gold)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
              }}>
                Beta
              </span>
              <button
                onClick={() => setShowGuardrails(true)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  padding: 0,
                }}
              >
                How this works
              </button>
            </div>
            {!chatEnded && (
              <button
                onClick={endChat}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-small)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--btn-radius)',
                  padding: 'var(--space-2) var(--space-3)',
                  cursor: 'pointer',
                }}
              >
                End practice
              </button>
            )}
          </div>

          {/* Context strip */}
          <div style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 0 }}>
              <strong style={{ color: 'var(--color-text-secondary)' }}>Practicing:</strong>{' '}
              {chatContext.length > 120 ? chatContext.slice(0, 120) + '…' : chatContext}
            </p>
          </div>

          {/* Message area */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
            minHeight: '200px',
            maxHeight: '500px',
            overflowY: 'auto',
            padding: 'var(--space-3) 0',
          }}>
            {chatMessages.map((msg, i) => (
              <div key={i}>
                {/* Sender label */}
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-muted)',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                  margin: '0 4px var(--space-1)',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                }}>
                  {msg.role === 'user' ? 'You' : 'Them'}
                </p>

                {/* Bubble */}
                <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '78%',
                    backgroundColor: msg.role === 'user' ? 'var(--color-blue-accent)' : 'var(--color-bg-surface)',
                    color: msg.role === 'user' ? '#fff' : 'var(--color-text-primary)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: 'var(--space-3) var(--space-4)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-body)',
                    lineHeight: 'var(--leading-relaxed)',
                  }}>
                    {msg.content}
                  </div>
                </div>

                {/* Coaching hint (assistant messages only) */}
                {msg.role === 'assistant' && msg.hint && (
                  <div style={{
                    marginTop: 'var(--space-2)',
                    marginBottom: 'var(--space-3)',
                    marginLeft: '4px',
                    backgroundColor: 'rgba(196,150,53,0.06)',
                    border: '1px solid rgba(196,150,53,0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                    maxWidth: '78%',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 'var(--leading-relaxed)',
                      margin: '0 0 var(--space-2) 0',
                    }}>
                      <strong style={{ color: 'var(--color-gold)' }}>Reading this:</strong>{' '}
                      {msg.hint.read}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--color-gold)',
                        letterSpacing: 'var(--tracking-wider)',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}>
                        Try:
                      </span>
                      {msg.hint.moves.map(move => (
                        <span key={move} style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: 'var(--color-text-secondary)',
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid rgba(196,150,53,0.3)',
                          borderRadius: 'var(--radius-full)',
                          padding: '2px 10px',
                        }}>
                          {move}
                        </span>
                      ))}
                    </div>
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
              <div style={{
                backgroundColor: 'rgba(196,150,53,0.08)',
                border: '1px solid var(--color-gold)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4) var(--space-5)',
                marginTop: 'var(--space-3)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  {chatEndMessage}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat error */}
          {error && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)', margin: 0 }}>
              {error}
            </p>
          )}

          {/* Chat input or post-session actions */}
          {!chatEnded ? (
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
              <textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleChatSend()
                  }
                }}
                placeholder="Your response… (Enter to send, Shift+Enter for new line)"
                rows={2}
                disabled={chatLoading}
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  lineHeight: 'var(--leading-relaxed)',
                  resize: 'none',
                  boxSizing: 'border-box',
                  opacity: chatLoading ? 0.6 : 1,
                }}
              />
              <button
                onClick={() => void handleChatSend()}
                disabled={!chatInput.trim() || chatLoading}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-body)',
                  color: '#fff',
                  backgroundColor: !chatInput.trim() || chatLoading ? 'var(--color-text-muted)' : 'var(--color-blue-accent)',
                  border: 'none',
                  borderRadius: 'var(--btn-radius)',
                  padding: 'var(--btn-padding-y) var(--btn-padding-x)',
                  cursor: !chatInput.trim() || chatLoading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Send &rarr;
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={reset}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-body)',
                  color: '#fff',
                  backgroundColor: 'var(--color-blue-accent)',
                  border: 'none',
                  borderRadius: 'var(--btn-radius)',
                  padding: 'var(--btn-padding-y) var(--btn-padding-x)',
                  cursor: 'pointer',
                }}
              >
                Try another &rarr;
              </button>
              <button
                onClick={() => selectMode('chat')}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--btn-radius)',
                  padding: 'var(--btn-padding-y) var(--btn-padding-x)',
                  cursor: 'pointer',
                }}
              >
                Practice again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Clean-slate footer note */}
      {!output && !loading && !(activeMode === 'chat' && chatStarted) && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginTop: 'var(--space-12)', fontStyle: 'italic' }}>
          One thing this doesn&apos;t do yet: remember. Each conversation starts fresh &mdash; it won&apos;t recall that you talked to your brother-in-law last week and ask how it went. That&apos;s coming.
        </p>
      )}
    </div>
  )
}
