'use client'

import { useState } from 'react'
import { useQuizStore } from '@/store/quizStore'
import type { QuizSession } from '@/types/quiz'

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = 'start' | 'respond' | 'rehearse'

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

// ─── Static data ─────────────────────────────────────────────────────────────

const WHO = ['spouse/partner', 'parent', 'in-law', 'sibling', 'adult child', 'friend', 'neighbor', 'coworker', 'someone online', 'other']
const TOPIC = ['immigration', 'climate', 'guns', 'abortion', 'economy', 'elections', 'race', 'foreign policy', 'healthcare', 'something local', 'other']
const POSTURE = ["they've checked out entirely", "they think it's all rigged", "they only trust their own side's media", "they think people like me are the problem", "they just want to fight", "they've stopped listening", 'other']
const WRONG = ['we talk past each other', 'it gets heated fast', 'I freeze up', 'they shut down', "we've never actually tried", 'other']
const VIBE = ['genuinely curious', 'goading', 'angry', 'testing me', 'venting', 'trying to connect', 'other']
const SAID_TO = ['me', 'someone I care about']
const WORRIED = ["I'll get too heated", "I'll cave", "I'll freeze", "I'll say it wrong", "it'll blow up the relationship", 'other']

const CHIP_ROWS: Record<Mode, ChipRow[]> = {
  start: [
    { key: 'who', label: 'Who are you talking to?', chips: WHO },
    { key: 'topic', label: 'Topic', chips: TOPIC },
    { key: 'posture', label: 'Or is it more of a posture?', chips: POSTURE },
    { key: 'wrong', label: 'What usually goes wrong?', chips: WRONG },
  ],
  respond: [
    { key: 'who', label: 'Who said it?', chips: WHO },
    { key: 'saidTo', label: 'Said to whom?', chips: SAID_TO },
    { key: 'vibe', label: "What's the vibe?", chips: VIBE },
    { key: 'topic', label: 'Topic', chips: TOPIC },
    { key: 'posture', label: 'Or is it more of a posture?', chips: POSTURE },
  ],
  rehearse: [
    { key: 'who', label: 'Who are you rehearsing for?', chips: WHO },
    { key: 'worried', label: 'What are you worried about?', chips: WORRIED },
    { key: 'topic', label: 'Topic', chips: TOPIC },
    { key: 'posture', label: 'Or is it more of a posture?', chips: POSTURE },
  ],
}

const FREEFORM_PLACEHOLDER: Record<Mode, string> = {
  start: 'What do you want to talk about — and what’s making it hard?',
  respond: 'What did they say? Paste it, or describe it.',
  rehearse: 'What do you want to say — and who’s it going to?',
}

// Examples always ship in pairs — one left-leaning, one right-leaning
const EXAMPLES: Record<Mode, { left: string; right: string }[]> = {
  start: [
    {
      left: "I want to talk to my brother-in-law about guns without it turning into the same fight we always have.",
      right: "I want to bring up immigration with my aunt, but she thinks anyone who wants border security is a racist.",
    },
  ],
  respond: [
    {
      left: "My uncle posted that the 2020 election was stolen and anyone who says otherwise is part of the cover-up.",
      right: "My sister says anyone who voted Republican is a threat to democracy and she can’t respect them as a person.",
    },
    {
      left: "A coworker told me that defunding the police is the only way to stop racist violence.",
      right: "A coworker told me undocumented immigrants are driving the crime wave and we need mass deportations now.",
    },
    {
      left: "My dad says billionaires don’t pay their fair share and the whole system is rigged for the rich.",
      right: "My dad says we’re becoming a socialist country and people just want handouts instead of working.",
    },
  ],
  rehearse: [
    {
      left: "I’m going to tell my mom I think her church’s politics are hurting people, and I know it’s going to wreck Thanksgiving.",
      right: "I want to tell my college kid that I think their professors are feeding them propaganda, without them writing me off as a boomer.",
    },
  ],
}

const MODE_CARDS: { mode: Mode; title: string; desc: string }[] = [
  { mode: 'start', title: 'Start one', desc: 'Open a conversation with someone who sees it differently.' },
  { mode: 'respond', title: 'Respond to one', desc: 'Someone said the thing. Get a better answer than the one you’d fire back.' },
  { mode: 'rehearse', title: 'Rehearse one', desc: 'The conversation’s coming. Practice it here first.' },
]

const ENERGY_COLORS: Record<string, string> = {
  'disarm with warmth': '#d97706',
  'get curious': '#2563eb',
  'name it lightly': '#16a34a',
  'find the shared question': '#7c3aed',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        }}
      >
        {r.doing}
        {r.recommended && r.reason && ` — ${r.reason}`}
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const SPIN_STYLE = `@keyframes bedrock-spin { to { transform: rotate(360deg); } }`

export default function ConversationsPage() {
  const session = useQuizStore(s => s.session)
  const hasProfile = Boolean(session?.result)

  const [activeMode, setActiveMode] = useState<Mode | null>(null)
  const [freeform, setFreeform] = useState('')
  const [chips, setChips] = useState<Record<string, string[]>>({})
  const [showExamples, setShowExamples] = useState(false)
  const [output, setOutput] = useState<ConversationOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  }

  async function handleSubmit() {
    if (!freeform.trim() || !activeMode) return
    setLoading(true)
    setError(null)
    setOutput(null)

    const sessionPayload: QuizSession | null = session ?? null

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: sessionPayload, mode: activeMode, chips, freeform }),
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

  const chipRows = activeMode ? CHIP_ROWS[activeMode] : []
  const examples = activeMode ? EXAMPLES[activeMode] : []

  return (
    <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-16) var(--space-6)' }}>
      <style>{SPIN_STYLE}</style>

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
        {MODE_CARDS.map(({ mode, title, desc }) => (
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
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h4)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)', margin: '0 0 var(--space-2) 0' }}>
              {title}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
              {desc}
            </p>
          </button>
        ))}
      </div>

      {/* Input section */}
      {activeMode && !output && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          {/* Freeform */}
          <div>
            <textarea
              value={freeform}
              onChange={e => setFreeform(e.target.value)}
              placeholder={FREEFORM_PLACEHOLDER[activeMode]}
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
              onClick={() => setShowExamples(s => !s)}
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
                          onClick={() => loadExample(ex)}
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

          {/* Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {chipRows.map(row => (
              <div key={row.key}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', fontWeight: 'var(--weight-semibold)', margin: '0 0 var(--space-2) 0' }}>
                  {row.label}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {row.chips.map(chip => (
                    <ChipButton
                      key={chip}
                      label={chip}
                      selected={(chips[row.key] ?? []).includes(chip)}
                      onClick={() => toggleChip(row.key, chip)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div>
            {error && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-red)', marginBottom: 'var(--space-3)' }}>
                {error}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!freeform.trim() || loading}
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-body)',
                color: '#fff',
                backgroundColor: !freeform.trim() || loading ? 'var(--color-text-muted)' : 'var(--color-blue-accent)',
                border: 'none',
                borderRadius: 'var(--btn-radius)',
                padding: 'var(--btn-padding-y) var(--btn-padding-x)',
                cursor: !freeform.trim() || loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s',
              }}
            >
              {loading ? 'Decoding…' : 'Decode this →'}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
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

      {/* Output */}
      {output && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

          {/* Reflect-back */}
          <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-5)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', fontStyle: 'italic', margin: 0 }}>
              {output.reflectBack}
            </p>
          </div>

          {/* Decode block */}
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

          {/* Response cards */}
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

          {/* Footer line */}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
            These are starting points, not scripts. The words are yours to change.
          </p>

          {/* Action buttons */}
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

      {/* Clean-slate footer note */}
      {!output && !loading && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginTop: 'var(--space-12)', fontStyle: 'italic' }}>
          One thing this doesn&apos;t do yet: remember. Each conversation starts fresh &mdash; it won&apos;t recall that you talked to your brother-in-law last week and ask how it went. That&apos;s coming.
        </p>
      )}

    </div>
  )
}
