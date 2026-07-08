/**
 * Article Bias Checker — §24b
 * Server-side only. Article text is NEVER stored (§24b.5).
 * No logging of what articles users check.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { Dimension, DimensionalProfile } from '@/lib/engine/match'
import { ALL_DIMENSIONS } from '@/lib/engine/match'
import { logClaudeUsage } from '@/lib/ai/logUsage'

// ─────────────────────────────────────────────────────────────────────────────
// Input / output types
// ─────────────────────────────────────────────────────────────────────────────

export interface ArticleInput {
  url?: string
  pastedText?: string
  pdfBase64?: string          // base64-encoded PDF, extracted server-side
  userProfile: DimensionalProfile
  primaryType: string         // user's Civic Mantle type
}

export type ProfileRead = 'reinforcing' | 'expanding' | 'challenging'

export interface ArticleClassificationResult {
  dimensionalBreakdown: Partial<Record<Dimension, {
    direction: 'pole_a' | 'pole_b' | 'neutral'
    emphasis: 'primary' | 'secondary'
    note: string
  }>>
  profileRead: ProfileRead
  profileReadExplanation: string
  reliabilitySignal: {
    rating: number | null   // 0–100 if known; null if not in catalog
    inCatalog: boolean
    assessment: string
  }
  sourceUrl?: string
  caveat?: string             // brevity / language / social-media caveat
}

// Typed failure states — each maps to §24b.3 copy
export type ArticleFailureCode =
  | 'paywall'
  | 'url_error'
  | 'image_only_pdf'
  | 'non_civic'

export interface ArticleFailure {
  code: ArticleFailureCode
  userMessage: string
}

// Returned by classifyArticle — either success or a typed failure
export type ArticleAnalysis =
  | { ok: true; result: ArticleClassificationResult }
  | { ok: false; failure: ArticleFailure }

// ─────────────────────────────────────────────────────────────────────────────
// §24b.3  Failure state detection (deterministic — no Claude needed)
// ─────────────────────────────────────────────────────────────────────────────

const SOCIAL_MEDIA_PATTERNS = [
  /twitter\.com/i,
  /x\.com\/[^/]+\/status/i,
  /facebook\.com/i,
  /instagram\.com/i,
  /tiktok\.com/i,
  /threads\.net/i,
  /bsky\.app/i,
  /mastodon\./i,
]

export function detectSocialMedia(url: string): boolean {
  return SOCIAL_MEDIA_PATTERNS.some((p) => p.test(url))
}

// Paywall signals in HTTP response
const PAYWALL_SIGNALS = [
  /subscribe to read/i,
  /this article is for subscribers/i,
  /create a free account/i,
  /sign in to continue/i,
  /paywall/i,
  /metered access/i,
]

export function detectPaywall(html: string): boolean {
  return PAYWALL_SIGNALS.some((p) => p.test(html))
}

// Very short content (under 200 words) — proceed with caveat
export function isVeryShortContent(text: string): boolean {
  return text.split(/\s+/).filter(Boolean).length < 200
}

// Non-English detection heuristic — checked by Claude inline (not here)
// Social media → caveat, not failure (§24b.3: "proceed with analysis")
// Very short text → caveat, not failure

// ISO 639-1 → display name for the non-English caveat (§24b.3)
const ISO_LANGUAGE_NAMES: Record<string, string> = {
  ar: 'Arabic',
  de: 'German',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
}

export function isoToLanguageName(code: string): string {
  return ISO_LANGUAGE_NAMES[code.toLowerCase()] ?? 'another language'
}

// ─────────────────────────────────────────────────────────────────────────────
// URL fetching — server-side via native fetch
// ─────────────────────────────────────────────────────────────────────────────

export type FetchResult =
  | { ok: true; text: string; url: string; isSocialMedia: boolean }
  | { ok: false; failure: ArticleFailure }

export async function fetchArticleText(url: string): Promise<FetchResult> {
  // Social media check before fetching
  const isSocialMedia = detectSocialMedia(url)

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'BedrockBiasChecker/1.0 (https://bedrock.guide; not a scraper)',
      },
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    return {
      ok: false,
      failure: {
        code: 'url_error',
        userMessage: "We couldn't reach that URL. Try pasting the text directly.",
      },
    }
  }

  if (response.status === 402 || response.status === 403) {
    return {
      ok: false,
      failure: {
        code: 'paywall',
        userMessage:
          "We can't access this article — it's behind a paywall. Paste the text instead and we'll analyze it.",
      },
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      failure: {
        code: 'url_error',
        userMessage: "We couldn't reach that URL. Try pasting the text directly.",
      },
    }
  }

  const html = await response.text()

  if (detectPaywall(html)) {
    return {
      ok: false,
      failure: {
        code: 'paywall',
        userMessage:
          "We can't access this article — it's behind a paywall. Paste the text instead and we'll analyze it.",
      },
    }
  }

  // Strip HTML tags for analysis (simple approach; Claude handles the rest)
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  return { ok: true, text, url: response.url, isSocialMedia }
}

// ─────────────────────────────────────────────────────────────────────────────
// Claude prompt
// ─────────────────────────────────────────────────────────────────────────────

const AXIS_LABELS: Record<Dimension, string> = {
  stability_change:      'Stability ↔ Change',
  local_federal:         'Local ↔ Federal authority',
  national_global:       'National ↔ Global outlook',
  rules_outcomes:        'Rules ↔ Outcomes',
  markets_governance:    'Markets ↔ Governance',
  pragmatism_idealism:   'Pragmatism ↔ Idealism',
  individual_collective: 'Individual ↔ Collective',
  trust_skepticism:      'Institutional Trust ↔ Skepticism',
}

function buildArticlePrompt(
  content: string,
  userProfile: DimensionalProfile,
  primaryType: string,
  isSocialMedia: boolean,
  isShort: boolean
): string {
  const profileLines = ALL_DIMENSIONS
    .map((d) => `  ${d}: ${userProfile[d]}/100`)
    .join('\n')

  const contextNote = [
    isSocialMedia ? 'Note: This appears to be a social media post — brevity is expected.' : null,
    isShort ? 'Note: This is a short piece (under 200 words) — precision will be limited.' : null,
  ].filter(Boolean).join(' ')

  return `You are analyzing an article for Bedrock's Article Bias Checker. Your job:
1. Identify which of 8 civic dimensions this article emphasizes and in what direction.
2. Determine how this article maps to THIS SPECIFIC USER's values profile.
3. Provide a reliability signal.
4. Detect non-civic content and flag it.
5. Detect non-English content and note it.

${contextNote ? `CONTEXT: ${contextNote}\n` : ''}
USER PROFILE (${primaryType}):
${profileLines}
(0 = pole A, 100 = pole B; near 50 = centered or mixed)

ARTICLE CONTENT:
${content.slice(0, 6000)}

DIMENSIONS TO ANALYZE:
${ALL_DIMENSIONS.map((d) => `  - ${d}: ${AXIS_LABELS[d]}`).join('\n')}

Return ONLY a valid JSON object:
{
  "is_civic_content": <true|false>,
  "detected_language": "<ISO 639-1 code, e.g. 'en'>",
  "dimensional_breakdown": {
    "<dimension>": {
      "direction": "<'pole_a' | 'pole_b' | 'neutral'>",
      "emphasis": "<'primary' | 'secondary'>",
      "note": "<one sentence on how this dimension appears in the article>"
    }
  },
  "profile_read": "<'reinforcing' | 'expanding' | 'challenging'>",
  "profile_read_explanation": "<2-3 sentences explaining what this article is doing to THIS user's thinking>",
  "reliability_signal": {
    "assessment": "<brief assessment of factual grounding, sourcing quality, and editorial standards visible in the text>"
  }
}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────────────────────────────────────

export async function classifyArticle(
  input: ArticleInput,
  client?: Anthropic
): Promise<ArticleAnalysis> {
  const anthropic = client ?? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let content = ''
  let sourceUrl: string | undefined
  let isSocialMedia = false
  const caveats: string[] = []

  // ── Resolve content source ────────────────────────────────────────────────

  if (input.url) {
    const fetched = await fetchArticleText(input.url)
    if (!fetched.ok) return { ok: false, failure: fetched.failure }
    content = fetched.text
    sourceUrl = fetched.url
    isSocialMedia = fetched.isSocialMedia
    if (isSocialMedia) {
      caveats.push(
        'Social media post detected — brevity may limit analysis precision, but we\'ve done our best.'
      )
    }
  } else if (input.pastedText) {
    content = input.pastedText
  } else if (input.pdfBase64) {
    // Pass PDF directly to Claude as a document block (Claude can read PDFs natively)
    // We'll detect image-only PDFs by checking if Claude returns empty breakdown
    const pdfResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: input.pdfBase64 },
          },
          { type: 'text', text: 'Extract all readable text from this PDF. If the PDF is a scanned image with no extractable text, reply with exactly: IMAGE_ONLY_PDF' },
        ] as Parameters<typeof anthropic.messages.create>[0]['messages'][0]['content'],
      }],
    })
    logClaudeUsage({ route: 'classifyArticle/pdf-extract', model: 'claude-sonnet-4-6', usage: pdfResponse.usage })
    const extractedText = pdfResponse.content[0]?.type === 'text' ? pdfResponse.content[0].text : ''
    if (extractedText.trim() === 'IMAGE_ONLY_PDF') {
      return {
        ok: false,
        failure: {
          code: 'image_only_pdf',
          userMessage:
            'This PDF appears to be a scanned image rather than a text document. We can\'t extract text from it. Try copying and pasting the text manually.',
        },
      }
    }
    content = extractedText
  } else {
    return {
      ok: false,
      failure: { code: 'url_error', userMessage: 'No content provided.' },
    }
  }

  const isShort = isVeryShortContent(content)
  if (isShort) {
    caveats.push(
      'This piece is under 200 words — analysis is less precise on short content.'
    )
  }

  // ── Claude analysis ───────────────────────────────────────────────────────

  const prompt = buildArticlePrompt(
    content,
    input.userProfile,
    input.primaryType,
    isSocialMedia,
    isShort
  )

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: [
      {
        type: 'text',
        text: `User profile (${input.primaryType}) is cached context for Article Bias Checker analysis.`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: prompt }],
  })

  logClaudeUsage({ route: 'classifyArticle/analyze', model: 'claude-sonnet-4-6', usage: response.usage })
  const rawText = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: {
    is_civic_content: boolean
    detected_language: string
    dimensional_breakdown: Partial<Record<Dimension, {
      direction: 'pole_a' | 'pole_b' | 'neutral'
      emphasis: 'primary' | 'secondary'
      note: string
    }>>
    profile_read: ProfileRead
    profile_read_explanation: string
    reliability_signal: { assessment: string }
  }

  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('classifyArticle: failed to parse Claude response')
  }

  // Non-civic content failure
  if (!parsed.is_civic_content) {
    return {
      ok: false,
      failure: {
        code: 'non_civic',
        userMessage:
          "This doesn't appear to be political or civic content. The Article Bias Checker works best on journalism, opinion pieces, and policy writing. Want to try a different article?",
      },
    }
  }

  // Non-English caveat (proceed, per §24b.3)
  if (parsed.detected_language && parsed.detected_language !== 'en') {
    const langName = isoToLanguageName(parsed.detected_language)
    caveats.push(
      `This appears to be in ${langName}. Our analysis works best in English — we'll do our best but results may be less precise.`
    )
  }

  return {
    ok: true,
    result: {
      dimensionalBreakdown: parsed.dimensional_breakdown ?? {},
      profileRead: parsed.profile_read,
      profileReadExplanation: parsed.profile_read_explanation,
      reliabilitySignal: {
        rating: null,
        inCatalog: false,
        assessment: parsed.reliability_signal?.assessment ?? '',
      },
      sourceUrl,
      caveat: caveats.length > 0 ? caveats.join(' ') : undefined,
    },
  }
}
