'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'
import { buildMatchKey } from '@/lib/engine/buildMatchKey'
import type { ArticleClassificationResult, ProfileRead, ArticleFailureCode } from '@/lib/classification/classifyArticle'
import type { Dimension } from '@/lib/engine/match'

// ── Types ─────────────────────────────────────────────────────────────────────

type InputMode = 'url' | 'paste' | 'pdf'

interface EnrichedResult extends ArticleClassificationResult {
  profileAvailable: boolean
  reliabilitySignal: ArticleClassificationResult['reliabilitySignal'] & {
    catalogName?: string
    catalogLean?: string
    catalogFlags?: string[]
  }
}

// ── Copy ──────────────────────────────────────────────────────────────────────

// Failure messages exactly match §24b.3 copy
const FAILURE_MESSAGES: Record<ArticleFailureCode, string> = {
  paywall:
    "We can't access this article — it's behind a paywall. Paste the text instead and we'll analyze it.",
  url_error:
    "We couldn't reach that URL. Try pasting the text directly.",
  image_only_pdf:
    "This PDF appears to be a scanned image rather than a text document. We can't extract text from it. Try copying and pasting the text manually.",
  non_civic:
    "This doesn't appear to be political or civic content. The Article Bias Checker works best on journalism, opinion pieces, and policy writing. Want to try a different article?",
}

const LOADING_SEQUENCE = [
  'Reading the framing…',
  'Mapping to your profile…',
]

const AXIS_LABELS: Record<Dimension, string> = {
  stability_change:      'Stability ↔ Change',
  local_federal:         'Local ↔ Federal authority',
  national_global:       'National ↔ Global outlook',
  rules_outcomes:        'Rules ↔ Outcomes',
  markets_governance:    'Markets ↔ Governance',
  pragmatism_idealism:   'Pragmatism ↔ Idealism',
  individual_collective: 'Individual ↔ Collective',
  trust_skepticism:      'Institutional trust ↔ Skepticism',
}

const PROFILE_READ_LABELS: Record<ProfileRead, { label: string; color: string; desc: string }> = {
  reinforcing: {
    label: 'Reinforcing',
    color: 'var(--color-blue-accent)',
    desc: 'This content aligns closely with how you already see things.',
  },
  expanding: {
    label: 'Expanding',
    color: '#16a34a',
    desc: 'This content introduces angles or perspectives outside your usual frame.',
  },
  challenging: {
    label: 'Challenging',
    color: '#d97706',
    desc: 'This content directly pushes back on where you stand.',
  },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DimensionalBreakdown({ breakdown }: { breakdown: EnrichedResult['dimensionalBreakdown'] }) {
  const axes = Object.entries(breakdown) as [Dimension, { direction: string; emphasis: string; note: string }][]
  if (axes.length === 0) return null

  return (
    <section style={{ marginBottom: 'var(--space-6)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-subheading)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
        Dimensional breakdown
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {axes.map(([dim, val]) => (
          <div key={dim} style={{
            padding: 'var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: val.emphasis === 'primary' ? 'var(--color-bg-surface)' : 'transparent',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                {AXIS_LABELS[dim] ?? dim}
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {val.emphasis === 'primary' && (
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1px 6px' }}>
                    primary
                  </span>
                )}
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-small)',
                  fontWeight: 'var(--weight-semibold)',
                  color: val.direction === 'neutral' ? 'var(--color-text-secondary)' : 'var(--color-blue-accent)',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1px 6px',
                }}>
                  {val.direction === 'pole_a' ? 'pole A' : val.direction === 'pole_b' ? 'pole B' : 'neutral'}
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
              {val.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProfileReadSection({ result }: { result: EnrichedResult }) {
  if (!result.profileAvailable) {
    return (
      <section style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Profile read not available.</strong>{' '}
          <a href="/quiz" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>Take the quiz</a> to see whether this article is reinforcing, expanding, or challenging for your specific values profile.
        </p>
      </section>
    )
  }

  const read = PROFILE_READ_LABELS[result.profileRead]

  return (
    <section style={{ marginBottom: 'var(--space-6)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-subheading)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
        For you, this is…
      </h3>
      <div style={{ padding: 'var(--space-4)', border: `2px solid ${read.color}`, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-surface)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', fontWeight: 'var(--weight-bold)', color: read.color, marginBottom: 'var(--space-2)' }}>
          {read.label}
        </div>
        <p style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
          {read.desc}
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-relaxed)' }}>
          {result.profileReadExplanation}
        </p>
      </div>
    </section>
  )
}

function ReliabilitySection({ result }: { result: EnrichedResult }) {
  const { reliabilitySignal } = result

  return (
    <section style={{ marginBottom: 'var(--space-6)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-subheading)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
        Reliability signal
      </h3>
      <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-surface)' }}>
        {reliabilitySignal.inCatalog ? (
          <>
            <p style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>{reliabilitySignal.catalogName}</strong>
              {' '}is in our media catalog.
              {reliabilitySignal.catalogLean && (
                <> Lean: <strong>{reliabilitySignal.catalogLean}</strong>.</>
              )}
              {reliabilitySignal.catalogFlags && reliabilitySignal.catalogFlags.length > 0 && (
                <> Flags: {reliabilitySignal.catalogFlags.join(', ')}.</>
              )}
            </p>
            {reliabilitySignal.assessment && (
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                {reliabilitySignal.assessment}
              </p>
            )}
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
              This source is not in our catalog.
            </p>
            {reliabilitySignal.assessment && (
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                {reliabilitySignal.assessment}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BiasCheckerPage() {
  const session = useQuizStore((s) => s.session)
  const hasProfile = Boolean(session?.result)

  const [mode, setMode] = useState<InputMode>('url')
  const [urlInput, setUrlInput] = useState('')
  const [pasteInput, setPasteInput] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_SEQUENCE[0])
  const [result, setResult] = useState<EnrichedResult | null>(null)
  const [failureCode, setFailureCode] = useState<ArticleFailureCode | null>(null)
  const [failureMessage, setFailureMessage] = useState<string | null>(null)
  const [caveat, setCaveat] = useState<string | null>(null)

  // Cycle through loading messages
  useEffect(() => {
    if (!loading) return
    setLoadingMsg(LOADING_SEQUENCE[0])
    const t = setTimeout(() => setLoadingMsg(LOADING_SEQUENCE[1]), 2500)
    return () => clearTimeout(t)
  }, [loading])

  // Auto-detect URL when user pastes into the paste tab
  function handlePasteChange(val: string) {
    setPasteInput(val)
    if (/^https?:\/\//i.test(val.trim())) {
      setMode('url')
      setUrlInput(val.trim())
      setPasteInput('')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPdfFile(file)
    setPdfName(file?.name ?? null)
  }

  function canSubmit(): boolean {
    if (loading) return false
    if (mode === 'url') return urlInput.trim().length > 0
    if (mode === 'paste') return pasteInput.trim().length > 0
    if (mode === 'pdf') return pdfFile !== null
    return false
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit()) return

    setResult(null)
    setFailureCode(null)
    setFailureMessage(null)
    setCaveat(null)
    setLoading(true)

    try {
      let pdfBase64: string | undefined
      if (mode === 'pdf' && pdfFile) {
        pdfBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result as string
            // Strip the data: prefix — Claude expects raw base64
            resolve(dataUrl.split(',')[1] ?? '')
          }
          reader.onerror = reject
          reader.readAsDataURL(pdfFile)
        })
      }

      // Build match key from quiz session if available
      const userProfile = session?.result ? session.result.profile : undefined
      const primaryType = session?.result ? session.result.primaryType : undefined

      const body = {
        url:        mode === 'url'   ? urlInput.trim()   : undefined,
        pastedText: mode === 'paste' ? pasteInput.trim() : undefined,
        pdfBase64:  mode === 'pdf'   ? pdfBase64         : undefined,
        userProfile,
        primaryType,
      }

      const res = await fetch('/api/bias-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!data.ok) {
        setFailureCode(data.failure?.code ?? 'url_error')
        setFailureMessage(data.failure?.userMessage ?? FAILURE_MESSAGES.url_error)
      } else {
        setResult(data.result)
        setCaveat(data.result.caveat ?? null)
      }
    } catch {
      setFailureCode('url_error')
      setFailureMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setFailureCode(null)
    setFailureMessage(null)
    setCaveat(null)
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-small)',
    fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-normal)',
    color: active ? 'var(--color-blue-accent)' : 'var(--color-text-secondary)',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-blue-accent)' : '2px solid transparent',
    padding: 'var(--space-2) var(--space-3)',
    cursor: 'pointer',
  })

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>

      {/* Header — §24b.7 */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
        Check any article.
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
        Paste a link or drop in the text from anything you&apos;re reading — a news story, an opinion piece, a social media post. The Article Bias Checker tells you exactly what it&apos;s doing to your thinking: which of the eight civic dimensions it&apos;s emphasizing, whether it&apos;s reinforcing or challenging your specific profile, and where it sits on the reliability spectrum. Not left or right. Not a generic bias label. A specific read on this article for you, based on who you are.
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-8)' }}>
        It&apos;s a different kind of media literacy tool. Most bias checkers tell you what an article is. This one tells you what it&apos;s doing to you.
      </p>

      {/* No-profile nudge */}
      {!hasProfile && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Take the quiz</strong> for a personalized profile read — whether this article is reinforcing, expanding, or challenging for you specifically.
          </p>
          <a href="/quiz" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-blue-accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Take the quiz →
          </a>
        </div>
      )}

      {/* Input card */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-8)' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
          <button style={tabStyle(mode === 'url')}   onClick={() => setMode('url')}>URL</button>
          <button style={tabStyle(mode === 'paste')} onClick={() => setMode('paste')}>Paste text</button>
          <button style={tabStyle(mode === 'pdf')}   onClick={() => setMode('pdf')}>PDF</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

          {/* URL input */}
          {mode === 'url' && (
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              aria-label="Article URL"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-base)',
                color: 'var(--color-text-primary)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          )}

          {/* Paste textarea */}
          {mode === 'paste' && (
            <textarea
              value={pasteInput}
              onChange={(e) => handlePasteChange(e.target.value)}
              placeholder="Paste article text here (or a URL — we'll detect it automatically)…"
              aria-label="Article text"
              rows={8}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-base)',
                color: 'var(--color-text-primary)',
                resize: 'vertical',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          )}

          {/* PDF upload */}
          {mode === 'pdf' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-label="Upload PDF"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body)',
                  padding: 'var(--space-3)',
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-base)',
                  color: pdfName ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                {pdfName ? `📄 ${pdfName}` : 'Click to upload a PDF'}
              </button>
              <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                Text PDFs only — scanned images can&apos;t be analyzed.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit()}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              fontWeight: 'var(--weight-semibold)',
              padding: 'var(--space-3) var(--space-5)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: canSubmit() ? 'var(--color-blue-accent)' : 'var(--color-border)',
              color: canSubmit() ? '#fff' : 'var(--color-text-secondary)',
              cursor: canSubmit() ? 'pointer' : 'default',
              alignSelf: 'flex-start',
              transition: 'background-color 0.15s',
            }}
          >
            Analyze
          </button>
        </form>
      </div>

      {/* Loading state — §24b.4 substantive sequence */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)' }}>
          <div style={{ marginBottom: 'var(--space-3)', fontSize: 24 }}>⟳</div>
          <p style={{ margin: 0, fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
            {loadingMsg}
          </p>
        </div>
      )}

      {/* Failure state */}
      {!loading && failureMessage && (
        <div style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface)' }}>
          <p style={{ margin: '0 0 var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-relaxed)' }}>
            {failureMessage}
          </p>
          {/* For paywall, auto-switch to paste mode on retry */}
          {failureCode === 'paywall' && (
            <button
              onClick={() => { reset(); setMode('paste') }}
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Switch to paste mode →
            </button>
          )}
          {failureCode !== 'paywall' && (
            <button
              onClick={reset}
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Try another article →
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div>
          {/* Caveat banner (non-English / short / social media) */}
          {caveat && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: '#fef9c3', border: '1px solid #fde047', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-5)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: '#92400e', lineHeight: 'var(--leading-relaxed)' }}>
              {caveat}
            </div>
          )}

          <DimensionalBreakdown breakdown={result.dimensionalBreakdown} />
          <ProfileReadSection result={result} />
          <ReliabilitySection result={result} />

          <button
            onClick={reset}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 'var(--space-2)' }}
          >
            ← Check another article
          </button>
        </div>
      )}
    </main>
  )
}
