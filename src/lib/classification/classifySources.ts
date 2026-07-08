/**
 * Source classification — §20.1
 * Human gates entry BEFORE this runs (admin marks "classify" in Stage 4 UI).
 * This function is called on-demand by admin action, not on any schedule.
 *
 * Output conforms to Partial<Record<Dimension, AxisPlacement>> from the engine
 * plus provenance fields from §20.4.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { Dimension, AxisPlacement } from '@/lib/engine/match'
import { ALL_DIMENSIONS } from '@/lib/engine/match'
import { logClaudeUsage } from '@/lib/ai/logUsage'

// ─────────────────────────────────────────────────────────────────────────────
// Input / output types
// ─────────────────────────────────────────────────────────────────────────────

export interface SourceClassificationInput {
  sourceId: string
  name: string
  url: string
  seedNotes?: string   // admin notes from catalog seed — primary context for podcast URLs
  // 5-10 recent content pieces: each is either a URL or raw text
  contentPieces: Array<{ url?: string; text?: string }>
  // Optional: existing external ratings to anchor the prompt (§20.3)
  externalRatings?: {
    adFontesUrl?: string
    allSidesRating?: string
    mbfcRating?: string
  }
  taggedBy: string
}

export interface AxisClassification {
  score: number         // 0–100, same polarity as user profile
  confidence: number    // 0–1
  rationale: string     // one-line source basis
  sources: string[]     // citation URLs to specific pieces
}

export interface SourceClassificationResult {
  sourceId: string
  axisPlacement: Partial<Record<Dimension, AxisPlacement>>
  // Metadata fields stored directly on classified_sources
  reliability: number | null       // 0–100
  independenceScore: number | null // 0–100
  goodFaith: 'high' | 'mixed' | 'low' | null
  coarseLean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'heterodox' | null
  topics: string[]
  // §20.4 provenance
  taggedBy: string
  reviewedBy: string | null   // null until admin approves
  sourceEvidence: string[]
  externalRefs: Record<string, string>
  lastReviewed: string        // ISO date
  methodologyVersion: string
  attribution: string
  bedrockOriginated: boolean
  // Raw Claude output preserved for admin review
  rawClassification: ClaudeSourceClassification
}

// Shape Claude must return — parsed from JSON response
interface ClaudeSourceClassification {
  axes: Partial<Record<Dimension, {
    score: number
    confidence: number
    rationale: string
    evidence_urls: string[]
  }>>
  reliability_score: number
  independence_score: number
  good_faith: 'high' | 'mixed' | 'low'
  coarse_lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'heterodox'
  topics: string[]
  overall_notes: string
  reliability_assessment: string
  independence_assessment: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt
// ─────────────────────────────────────────────────────────────────────────────

const METHODOLOGY_VERSION = '1.0'

const AXIS_DESCRIPTIONS: Record<Dimension, string> = {
  stability_change:      'Stability ↔ Change (0 = strongly favors stability/tradition; 100 = strongly favors change/reform)',
  local_federal:         'Local ↔ Federal authority (0 = strongly favors local/state; 100 = strongly favors federal)',
  national_global:       'National ↔ Global outlook (0 = America-first/nationalist; 100 = globalist/internationalist)',
  rules_outcomes:        'Rules ↔ Outcomes (0 = rule-of-law/process over results; 100 = outcomes/pragmatic results)',
  markets_governance:    'Markets ↔ Governance (0 = market-first/deregulation; 100 = government intervention/regulation)',
  pragmatism_idealism:   'Pragmatism ↔ Idealism (0 = hard-nosed pragmatist; 100 = principled idealist)',
  individual_collective: 'Individual ↔ Collective (0 = individual rights/liberty; 100 = collective welfare/community)',
  trust_skepticism:      'Institutional Trust ↔ Skepticism (0 = high trust in institutions; 100 = high skepticism)',
}

const PODCAST_URL_PATTERN = /podcasts\.apple\.com|open\.spotify\.com|spotify\.com\/show|anchor\.fm|buzzsprout\.com|podbean\.com|podcasts\.google\.com/i

function buildSourcePrompt(
  input: SourceClassificationInput,
  contentText: string
): string {
  const axisLines = ALL_DIMENSIONS
    .map((d) => `  - ${d}: ${AXIS_DESCRIPTIONS[d]}`)
    .join('\n')

  const externalAnchor = input.externalRatings
    ? `\n\nExternal ratings to use as anchors (map to the 8-axis framework and fill gaps):\n${JSON.stringify(input.externalRatings, null, 2)}`
    : ''

  const isPodcastUrl = PODCAST_URL_PATTERN.test(input.url)
  const hasContent = contentText.trim().length > 0 && !contentText.includes('(URL only — fetch during review)')

  const contentSection = isPodcastUrl
    ? `NOTE: The URL is a podcast platform link (${input.url}) — not a scrapeable content site. ` +
      `Use the source name and notes below as your primary context, supplemented by general knowledge of this specific show.\n` +
      (input.seedNotes ? `SOURCE NOTES: ${input.seedNotes}\n` : '')
    : hasContent
      ? `RECENT CONTENT TO ANALYZE:\n${contentText}`
      : `NO LIVE CONTENT AVAILABLE — score from general knowledge of this source's editorial identity, stated mission, ownership, known coverage patterns, and public reputation.` +
        (input.seedNotes ? `\n\nSEED NOTES (curator context): ${input.seedNotes}` : '')

  return `You are classifying a media source for Bedrock, a nonpartisan civic identity platform. Your job is to score this source on all 8 civic dimensions AND assess its reliability, independence, and good-faith level. Be precise, nonpartisan, and honest about your confidence — your scores should be defensible to both conservative and liberal critics.

SOURCE: ${input.name} (${input.url})${externalAnchor}

${contentSection}

SCORING FRAMEWORK — 8 dimensions, each 0–100:
${axisLines}

IMPORTANT RULES:
- Score ALL 8 axes. An honest low-confidence score (0.3–0.5) is always more useful than a missing axis.
- When live content is available, prefer it. When it isn't, score from general knowledge of the source's editorial identity, ownership, stated mission, and public reputation — this is valid and expected.
- Set confidence to reflect your evidence quality: 0.3–0.4 = general-knowledge only; 0.5–0.6 = partial content or mixed signals; 0.7–0.8 = clear pattern across multiple pieces; 0.9+ = very strong, consistent signal.
- rationale must be one sentence. If scoring from general knowledge (not specific article content), say so explicitly.
- evidence_urls should list specific article URLs or titles that support the score; leave empty [] when scoring from general knowledge.

Return ONLY a valid JSON object with this exact schema:
{
  "axes": {
    "<dimension_name>": {
      "score": <0-100>,
      "confidence": <0.0-1.0>,
      "rationale": "<one-line rationale, noting if from general knowledge vs. specific content>",
      "evidence_urls": ["<url or title>", ...]
    }
  },
  "reliability_score": <0-100 — factual accuracy and editorial standards: 0=unreliable/tabloid, 50=mixed, 75+=strong track record, 90+=exemplary>,
  "independence_score": <0-100 — editorial independence from owners/funders/political parties: 0=captured, 50=mixed, 90+=fully independent>,
  "good_faith": "<'high' | 'mixed' | 'low'> — high=engages opposing views charitably, corrects errors promptly; mixed=sometimes partisan/sensational; low=bad-faith framing, systematic distortion>",
  "coarse_lean": "<'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'heterodox'> — overall political lean of coverage and framing",
  "topics": ["<2-6 topic tags from: politics, policy, elections, economy, foreign-policy, culture, media-criticism, science, local, national, international, longform, breaking-news, opinion, data-journalism>"],
  "overall_notes": "<any cross-axis observations or caveats>",
  "reliability_assessment": "<one paragraph on factual accuracy and editorial standards>",
  "independence_assessment": "<one paragraph on ownership, funding, editorial independence>"
}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────────────────────────────────────

export async function classifySource(
  input: SourceClassificationInput,
  client?: Anthropic
): Promise<SourceClassificationResult> {
  const anthropic = client ?? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Assemble content text from provided pieces
  const contentText = input.contentPieces
    .map((piece, i) => {
      const label = piece.url ? `[${i + 1}] ${piece.url}` : `[${i + 1}] (pasted text)`
      const body = piece.text ? piece.text.slice(0, 3000) : '(URL only — fetch during review)'
      return `${label}\n${body}`
    })
    .join('\n\n---\n\n')

  const prompt = buildSourcePrompt(input, contentText)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }],
  })

  logClaudeUsage({ route: 'classifySource', model: 'claude-sonnet-4-6', usage: response.usage })
  const rawText = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: ClaudeSourceClassification
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error(`classifySource: failed to parse Claude response for source ${input.sourceId}`)
  }

  // Validate and shape into engine-compatible AxisPlacement
  const axisPlacement: Partial<Record<Dimension, AxisPlacement>> = {}
  const sourceEvidence: string[] = []

  for (const dim of ALL_DIMENSIONS) {
    const raw = parsed.axes[dim]
    if (!raw) continue
    if (typeof raw.score !== 'number' || raw.score < 0 || raw.score > 100) continue
    if (typeof raw.confidence !== 'number' || raw.confidence < 0 || raw.confidence > 1) continue

    axisPlacement[dim] = {
      score: raw.score,
      confidence: raw.confidence,
      rationale: raw.rationale ?? '',
      sources: raw.evidence_urls ?? [],
    }
    sourceEvidence.push(...(raw.evidence_urls ?? []))
  }

  const axisCount = Object.keys(axisPlacement).length
  if (axisCount < 3) {
    throw new Error(
      `classifySource: only ${axisCount} axes passed validation for source ${input.sourceId} — ` +
      `raw response: ${JSON.stringify(parsed.axes).slice(0, 300)}`
    )
  }

  // Validate metadata fields — fall back to null if Claude returns unexpected values
  const VALID_GOOD_FAITH = ['high', 'mixed', 'low'] as const
  const VALID_LEAN = ['left', 'lean-left', 'center', 'lean-right', 'right', 'heterodox'] as const

  const reliability = typeof parsed.reliability_score === 'number' && parsed.reliability_score >= 0 && parsed.reliability_score <= 100
    ? Math.round(parsed.reliability_score) : null
  const independenceScore = typeof parsed.independence_score === 'number' && parsed.independence_score >= 0 && parsed.independence_score <= 100
    ? Math.round(parsed.independence_score) : null
  const goodFaith = VALID_GOOD_FAITH.includes(parsed.good_faith as typeof VALID_GOOD_FAITH[number])
    ? parsed.good_faith as 'high' | 'mixed' | 'low' : null
  const coarseLean = VALID_LEAN.includes(parsed.coarse_lean as typeof VALID_LEAN[number])
    ? parsed.coarse_lean as typeof VALID_LEAN[number] : null
  const topics = Array.isArray(parsed.topics) ? parsed.topics.filter((t) => typeof t === 'string') : []

  return {
    sourceId: input.sourceId,
    axisPlacement,
    reliability,
    independenceScore,
    goodFaith,
    coarseLean,
    topics,
    taggedBy: input.taggedBy,
    reviewedBy: null,
    sourceEvidence: Array.from(new Set(sourceEvidence)),
    externalRefs: {
      ...(input.externalRatings?.adFontesUrl ? { ad_fontes_url: input.externalRatings.adFontesUrl } : {}),
      ...(input.externalRatings?.allSidesRating ? { allsides_rating: input.externalRatings.allSidesRating } : {}),
      ...(input.externalRatings?.mbfcRating ? { mbfc_rating: input.externalRatings.mbfcRating } : {}),
    },
    lastReviewed: new Date().toISOString().split('T')[0],
    methodologyVersion: METHODOLOGY_VERSION,
    attribution: `Bedrock classification v${METHODOLOGY_VERSION}`,
    bedrockOriginated: !input.externalRatings,
    rawClassification: parsed,
  }
}
