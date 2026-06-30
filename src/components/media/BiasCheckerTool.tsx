'use client'

/**
 * BiasCheckerTool — the Article Bias Checker form + results (§24b).
 * Extracted from src/app/media-diet/bias-checker/page.tsx so it can be
 * embedded in the right rail of /media-diet without duplicating logic.
 *
 * The standalone /media-diet/bias-checker route wraps this component.
 * The /media-diet page embeds it in the sticky right rail.
 */

import { useState, useRef, useEffect } from 'react'
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

const LOADING_SEQUENCE = ['Reading the framing…', 'Mapping to your profile…']

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
  reinforcing: { label: 'Reinforcing', color: 'var(--color-blue-accent)', desc: 'This content aligns closely with how you already see things.' },
  expanding:   { label: 'Expanding',   color: '#16a34a', desc: 'This content introduces angles or perspectives outside your usual frame.' },
  challenging: { label: 'Challenging', color: '#d97706', desc: 'This content directly pushes back on where you stand.' },
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface BiasCheckerToolProps {
  userProfile?: Record<string, number>
  primaryType?: string
  hasProfile?: boolean
  /** When embedded in the rail, suppress the long intro copy */
  compact?: boolean
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DimensionalBreakdown({ breakdown }: { breakdown: EnrichedResult['dimensionalBreakdown'] }) {
  const axes = Object.entries(breakdown) as [Dimension, { direction: string; emphasis: string; note: string }][]
  if (axes.length === 0) return null
  return (
    <section style={{ marginBottom: 'var(--space-4)' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
        Dimensional breakdown
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {axes.map(([dim, val]) => (
          <div key={dim} style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: val.emphasis === 'primary' ? 'var(--color-bg-surface)' : 'transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                {AXIS_LABELS[dim] ?? dim}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {val.emphasis === 'primary' && (
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0 4px' }}>primary</span>
                )}
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 'var(--weight-semibold)', color: val.direction === 'neutral' ? 'var(--color-text-secondary)' : 'var(--color-blue-accent)', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0 4px' }}>
                  {val.direction === 'pole_a' ? 'pole A' : val.direction === 'pole_b' ? 'pole B' : 'neutral'}
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{val.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProfileReadSection({ result }: { result: EnrichedResult }) {
  if (!result.profileAvailable) {
    return (
      <section style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Profile read not available.</strong>{' '}
          <a href="/quiz" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>Take the quiz</a> to see how this article maps to your values.
        </p>
      </section>
    )
  }
  const read = PROFILE_READ_LABELS[result.profileRead]
  return (
    <section style={{ marginBottom: 'var(--space-4)' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>For you, this is…</h4>
      <div style={{ padding: 'var(--space-3)', border: `2px solid ${read.color}`, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-surface)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-body)', fontWeight: 'var(--weight-bold)', color: read.color, marginBottom: 4 }}>{read.label}</div>
        <p style={{ margin: '0 0 var(--space-1)', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{read.desc}</p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', lineHeight: '1.5' }}>{result.profileReadExplanation}</p>
      </div>
    </section>
  )
}

function ReliabilitySection({ result }: { result: EnrichedResult }) {
  const { reliabilitySignal } = result
  return (
    <section style={{ marginBottom: 'var(--space-4)' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>Reliability signal</h4>
      <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-surface)' }}>
        {reliabilitySignal.inCatalog ? (
          <>
            <p style={{ margin: '0 0 var(--space-1)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>{reliabilitySignal.catalogName}</strong> is in our media catalog.
              {reliabilitySignal.catalogLean && <> Lean: <strong>{reliabilitySignal.catalogLean}</strong>.</>}
              {reliabilitySignal.catalogFlags && reliabilitySignal.catalogFlags.length > 0 && <> Flags: {reliabilitySignal.catalogFlags.join(', ')}.</>}
            </p>
            {reliabilitySignal.assessment && <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{reliabilitySignal.assessment}</p>}
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 var(--space-1)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>This source is not in our catalog.</p>
            {reliabilitySignal.assessment && <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{reliabilitySignal.assessment}</p>}
          </>
        )}
      </div>
    </section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function BiasCheckerTool({ userProfile, primaryType, hasProfile = false, compact = false }: BiasCheckerToolProps) {
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

  useEffect(() => {
    if (!loading) return
    setLoadingMsg(LOADING_SEQUENCE[0])
    const t = setTimeout(() => setLoadingMsg(LOADING_SEQUENCE[1]), 2500)
    return () => clearTimeout(t)
  }, [loading])

  function handlePasteChange(val: string) {
    setPasteInput(val)
    if (/^https?:\/\//i.test(val.trim())) {
      setMode('url'); setUrlInput(val.trim()); setPasteInput('')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPdfFile(file); setPdfName(file?.name ?? null)
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
    setResult(null); setFailureCode(null); setFailureMessage(null); setCaveat(null); setLoading(true)
    try {
      let pdfBase64: string | undefined
      if (mode === 'pdf' && pdfFile) {
        pdfBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => { resolve((reader.result as string).split(',')[1] ?? '') }
          reader.onerror = reject
          reader.readAsDataURL(pdfFile)
        })
      }
      const res = await fetch('/api/bias-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url:        mode === 'url'   ? urlInput.trim()   : undefined,
          pastedText: mode === 'paste' ? pasteInput.trim() : undefined,
          pdfBase64:  mode === 'pdf'   ? pdfBase64         : undefined,
          userProfile,
          primaryType,
        }),
      })
      const data = await res.json()
      if (!data.ok) {
        setFailureCode(data.failure?.code ?? 'url_error')
        setFailureMessage(data.failure?.userMessage ?? FAILURE_MESSAGES.url_error)
      } else {
        setResult(data.result); setCaveat(data.result.caveat ?? null)
      }
    } catch {
      setFailureCode('url_error'); setFailureMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() { setResult(null); setFailureCode(null); setFailureMessage(null); setCaveat(null) }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)',
    fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-normal)',
    color: active ? 'var(--color-blue-accent)' : 'var(--color-text-secondary)',
    background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--color-blue-accent)' : '2px solid transparent',
    padding: 'var(--space-2) var(--space-3)', cursor: 'pointer',
  })

  return (
    <div>
      {/* Header (§24b.7) */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: compact ? 'var(--text-heading)' : 'var(--text-display)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
        Check any article.
      </h2>

      {!compact && (
        <>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
            Paste a link or drop in the text from anything you&apos;re reading — a news story, an opinion piece, a social media post. The Article Bias Checker tells you exactly what it&apos;s doing to your thinking: which of the eight civic dimensions it&apos;s emphasizing, whether it&apos;s reinforcing or challenging your specific profile, and where it sits on the reliability spectrum. Not left or right. Not a generic bias label. A specific read on this article for you, based on who you are.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
            It&apos;s a different kind of media literacy tool. Most bias checkers tell you what an article is. This one tells you what it&apos;s doing to you.
          </p>
        </>
      )}

      {compact && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: 'var(--space-3)' }}>
          Paste any URL or article text. We&apos;ll tell you what it&apos;s doing to your thinking — which dimensions it emphasizes and how it maps to your profile.
        </p>
      )}

      {/* No-profile nudge */}
      {!hasProfile && (
        <div style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Take the quiz</strong> for a personalized profile read.
          </p>
          <a href="/quiz" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-blue-accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Take the quiz →
          </a>
        </div>
      )}

      {/* Input card */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
          <button style={tabStyle(mode === 'url')}   onClick={() => setMode('url')}>URL</button>
          <button style={tabStyle(mode === 'paste')} onClick={() => setMode('paste')}>Paste text</button>
          <button style={tabStyle(mode === 'pdf')}   onClick={() => setMode('pdf')}>PDF</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {mode === 'url' && (
            <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article" aria-label="Article URL"
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)', width: '100%', boxSizing: 'border-box' }} />
          )}
          {mode === 'paste' && (
            <textarea value={pasteInput} onChange={(e) => handlePasteChange(e.target.value)}
              placeholder="Paste article text here (or a URL — we'll detect it)…" aria-label="Article text"
              rows={compact ? 5 : 8}
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)', resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
          )}
          {mode === 'pdf' && (
            <div>
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} aria-label="Upload PDF" />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', padding: 'var(--space-2)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-base)', color: pdfName ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', cursor: 'pointer', width: '100%', textAlign: 'center' }}>
                {pdfName ? `📄 ${pdfName}` : 'Click to upload a PDF'}
              </button>
              <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Text PDFs only — scanned images can&apos;t be analyzed.</p>
            </div>
          )}
          <button type="submit" disabled={!canSubmit()}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: canSubmit() ? 'var(--color-blue-accent)' : 'var(--color-border)', color: canSubmit() ? '#fff' : 'var(--color-text-secondary)', cursor: canSubmit() ? 'pointer' : 'default', alignSelf: 'flex-start', transition: 'background-color 0.15s' }}>
            Analyze
          </button>
        </form>
      </div>

      {/* Loading — §24b.4 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)' }}>
          <div style={{ marginBottom: 'var(--space-2)', fontSize: 20 }}>⟳</div>
          <p style={{ margin: 0, fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>{loadingMsg}</p>
        </div>
      )}

      {/* Failure */}
      {!loading && failureMessage && (
        <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface)' }}>
          <p style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-primary)', lineHeight: '1.5' }}>{failureMessage}</p>
          {failureCode === 'paywall' ? (
            <button onClick={() => { reset(); setMode('paste') }} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Switch to paste mode →</button>
          ) : (
            <button onClick={reset} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Try another article →</button>
          )}
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div>
          {caveat && (
            <div style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: '#fef9c3', border: '1px solid #fde047', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#92400e', lineHeight: '1.4' }}>
              {caveat}
            </div>
          )}
          <DimensionalBreakdown breakdown={result.dimensionalBreakdown} />
          <ProfileReadSection result={result} />
          <ReliabilitySection result={result} />
          <button onClick={reset} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-blue-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            ← Check another article
          </button>
        </div>
      )}

      {/* Claude's role disclosure — §25.1 Your Media Diet version */}
      {!loading && !result && (
        <details style={{ marginTop: 'var(--space-5)' }}>
          <summary style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-secondary)', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>▸</span> About this tool &amp; Claude&apos;s role
          </summary>
          <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              The analysis behind these recommendations is generated by Claude, Anthropic&apos;s AI.
              Claude reads the public record, scores each source on the eight dimensions, and drafts the explanation you see.
              Humans review placements before they go live and can override Claude&apos;s scoring when the evidence warrants it.
              We also use Perplexity to verify current ownership and status of sources in the catalog — Claude&apos;s knowledge has a cutoff date, and independent media changes ownership.
              Current-status verification is a systematic part of our quarterly review.
            </p>
          </div>
        </details>
      )}
    </div>
  )
}
