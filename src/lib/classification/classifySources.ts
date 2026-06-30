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

// ─────────────────────────────────────────────────────────────────────────────
// Input / output types
// ─────────────────────────────────────────────────────────────────────────────

export interface SourceClassificationInput {
  sourceId: string
  name: string
  url: string
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

  return `You are classifying a media source for Bedrock, a nonpartisan civic identity platform. Your job is to score this source on 8 civic dimensions based on its recent content. Be precise, evidence-based, and nonpartisan — your scores should be defensible to both conservative and liberal critics.

SOURCE: ${input.name} (${input.url})${externalAnchor}

RECENT CONTENT TO ANALYZE:
${contentText}

SCORING FRAMEWORK — 8 dimensions, each 0–100:
${axisLines}

IMPORTANT RULES:
- Only score axes where you have clear evidence from the content. Leave axes unscored if the content doesn't address them.
- Confidence should reflect how much content you analyzed and how clearly it signals the dimension (0.3 = thin/unclear; 0.7 = moderate; 0.9 = strong/consistent across multiple pieces).
- rationale must be one sentence citing specific evidence (e.g. "Consistently advocates federal climate mandates across 6 of 8 analyzed pieces").
- evidence_urls should list the specific pieces (URLs or titles) that most clearly justify the score.
- Do not infer ideology from the source's name, audience, or stated mission — score only from the content itself.

Return ONLY a valid JSON object with this exact schema:
{
  "axes": {
    "<dimension_name>": {
      "score": <0-100>,
      "confidence": <0.0-1.0>,
      "rationale": "<one-line evidence-based rationale>",
      "evidence_urls": ["<url or title>", ...]
    }
  },
  "overall_notes": "<any cross-axis observations or caveats>",
  "reliability_assessment": "<brief assessment of factual accuracy and editorial standards>",
  "independence_assessment": "<brief assessment of ownership, funding, editorial independence>"
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
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

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

  return {
    sourceId: input.sourceId,
    axisPlacement,
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
