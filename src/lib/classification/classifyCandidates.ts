/**
 * Candidate classification — §20.2
 * Triggered automatically on every new filing (congress.gov / Open States).
 * Human review happens AFTER classification, not before (unlike sources).
 *
 * Output conforms to CandidateRecord from the engine plus §20.4 provenance.
 * Rhetoric/record weighting (3:1) is applied at prompt time per §19.4.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { Dimension, AxisPlacement, CandidateRecord, DealbreakEval } from '@/lib/engine/match'
import { ALL_DIMENSIONS } from '@/lib/engine/match'
import { LAYER4_SECTIONS } from '@/lib/quiz/layer4'

// ─────────────────────────────────────────────────────────────────────────────
// Input / output types
// ─────────────────────────────────────────────────────────────────────────────

export interface CandidateClassificationInput {
  candidateId: string
  name: string
  office: string
  officeType: CandidateRecord['officeType']
  district: string
  party?: string
  coverageTier: CandidateRecord['coverageTier']
  sourcedFrom: string[]
  // Public record — everything available
  votingRecord?: string[]      // list of vote descriptions or URLs
  floorSpeeches?: string[]     // excerpts or URLs
  campaignPlatform?: string    // text or URL
  committePositions?: string[] // committee roles and stated positions
  pressStatements?: string[]   // public statements
  taggedBy: string
}

export interface CandidateClassificationResult {
  // Full CandidateRecord-compatible shape
  candidateData: Omit<CandidateRecord, 'id' | 'lastUpdated'>
  // §20.4 provenance
  taggedBy: string
  reviewedBy: string | null
  sourceEvidence: string[]
  externalRefs: Record<string, string>
  lastReviewed: string
  methodologyVersion: string
  attribution: string
  bedrockOriginated: boolean
  rawClassification: ClaudeCandidateClassification
}

interface ClaudeAxisResult {
  score: number
  confidence: number
  rationale: string
  evidence_urls: string[]
  based_on: 'voting_record' | 'stated_position' | 'both'
}

interface ClaudeDealbreakerResult {
  status: 'clear' | 'crosses' | 'unknown'
  evidence?: string
  source?: string
  note?: string
}

interface ClaudeCandidateClassification {
  axes: Partial<Record<Dimension, ClaudeAxisResult>>
  dealbreakers: Record<string, ClaudeDealbreakerResult>
  has_voting_record: boolean
  overall_notes: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the list of all Layer 4 dealbreaker items for the prompt
// ─────────────────────────────────────────────────────────────────────────────

function buildDealbreakerList(): string {
  const lines: string[] = []
  for (const section of LAYER4_SECTIONS) {
    if (section.items) {
      for (const item of section.items) {
        lines.push(`  - ${item.id}: ${item.text}`)
      }
    }
    if (section.pairs) {
      for (const pair of section.pairs) {
        lines.push(`  - ${pair.left.id}: ${pair.left.text}`)
        lines.push(`  - ${pair.right.id}: ${pair.right.text}`)
      }
    }
  }
  return lines.join('\n')
}

const DEALBREAKER_LIST = buildDealbreakerList()
const METHODOLOGY_VERSION = '1.0'

const AXIS_DESCRIPTIONS: Record<Dimension, string> = {
  stability_change:      'Stability ↔ Change (0 = strongly favors stability/tradition; 100 = strongly favors change/reform)',
  local_federal:         'Local ↔ Federal authority (0 = strongly favors local/state; 100 = strongly favors federal)',
  national_global:       'National ↔ Global outlook (0 = America-first/nationalist; 100 = globalist/internationalist)',
  rules_outcomes:        'Rules ↔ Outcomes (0 = rule-of-law/process; 100 = outcomes/pragmatic results)',
  markets_governance:    'Markets ↔ Governance (0 = market-first/deregulation; 100 = government intervention)',
  pragmatism_idealism:   'Pragmatism ↔ Idealism (0 = hard-nosed pragmatist; 100 = principled idealist)',
  individual_collective: 'Individual ↔ Collective (0 = individual rights/liberty; 100 = collective welfare)',
  trust_skepticism:      'Institutional Trust ↔ Skepticism (0 = high trust; 100 = high skepticism)',
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt
// ─────────────────────────────────────────────────────────────────────────────

function buildCandidatePrompt(input: CandidateClassificationInput): string {
  const hasRecord = (input.votingRecord?.length ?? 0) > 0

  const recordSection = hasRecord
    ? `VOTING RECORD (weight: 75%):\n${input.votingRecord!.map((v, i) => `  ${i + 1}. ${v}`).join('\n')}`
    : 'VOTING RECORD: None available (challenger/no legislative history)'

  const statementsSection = [
    input.campaignPlatform ? `Campaign platform: ${input.campaignPlatform}` : null,
    ...(input.floorSpeeches ?? []).map((s, i) => `Floor speech ${i + 1}: ${s}`),
    ...(input.pressStatements ?? []).map((s, i) => `Statement ${i + 1}: ${s}`),
    ...(input.committePositions ?? []).map((c, i) => `Committee position ${i + 1}: ${c}`),
  ].filter(Boolean).join('\n')

  const axisLines = ALL_DIMENSIONS.map((d) => `  - ${d}: ${AXIS_DESCRIPTIONS[d]}`).join('\n')

  return `You are classifying a political candidate for Bedrock, a nonpartisan civic platform. Score this candidate on 8 civic dimensions AND evaluate each of 29 potential dealbreakers. Be precise, evidence-based, and defensible to both conservative and liberal critics.

CANDIDATE: ${input.name}
OFFICE: ${input.office} (${input.district})
PARTY: ${input.party ?? 'unknown'} (display only — do not use party affiliation to infer positions)

${recordSection}

STATED POSITIONS (weight: ${hasRecord ? '25%' : '100%'}):
${statementsSection || '(none provided)'}

${hasRecord
  ? 'WEIGHTING RULE: When a candidate has a voting record, weight it 75% and stated positions 25%. Votes speak louder than words — when they conflict, the voting record wins. Reflect this in your confidence levels and rationale.'
  : 'WEIGHTING RULE: No voting record exists. Use stated positions only. ALL axis confidence scores must be capped at 0.50 regardless of how clear the stated position is — we cannot know follow-through.'}

SCORING FRAMEWORK — 8 dimensions, 0–100:
${axisLines}

DEALBREAKER ITEMS TO EVALUATE — for each, return clear / crosses / unknown:
Evidence standard for "crosses": must have (1) a public documented statement, (2) a recorded vote/official action, OR (3) credible reporting from 2+ independent named journalists at high-reliability outlets. If evidence is ambiguous or insufficient → "unknown".
${DEALBREAKER_LIST}

Return ONLY a valid JSON object:
{
  "has_voting_record": <true|false>,
  "axes": {
    "<dimension>": {
      "score": <0-100>,
      "confidence": <0.0-0.50 if rhetoric-only, 0.0-1.0 if record exists>,
      "rationale": "<one sentence, cite specific votes or statements>",
      "evidence_urls": ["<url or description>"],
      "based_on": "<'voting_record' | 'stated_position' | 'both'>"
    }
  },
  "dealbreakers": {
    "<DB-id>": {
      "status": "<'clear' | 'crosses' | 'unknown'>",
      "evidence": "<required if crosses>",
      "source": "<required if crosses>",
      "note": "<required if unknown>"
    }
  },
  "overall_notes": "<cross-axis observations, data quality caveats>"
}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse dealbreaker index from DB-N string
// ─────────────────────────────────────────────────────────────────────────────

function parseDealbreakerIndex(id: string): number | null {
  const match = id.match(/^DB-(\d+)$/)
  return match ? parseInt(match[1], 10) : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────────────────────────────────────

export async function classifyCandidate(
  input: CandidateClassificationInput,
  client?: Anthropic
): Promise<CandidateClassificationResult> {
  const anthropic = client ?? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = buildCandidatePrompt(input)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: ClaudeCandidateClassification
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error(`classifyCandidate: failed to parse Claude response for ${input.candidateId}`)
  }

  const hasRecord = parsed.has_voting_record ?? false

  // Build axis placements — enforce rhetoric-only confidence cap
  const axisPlacement: Partial<Record<Dimension, AxisPlacement>> = {}
  const sourceEvidence: string[] = []

  for (const dim of ALL_DIMENSIONS) {
    const raw = parsed.axes[dim]
    if (!raw) continue
    if (typeof raw.score !== 'number' || raw.score < 0 || raw.score > 100) continue

    const maxConf = hasRecord ? 1.0 : 0.5
    const confidence = Math.min(
      Math.max(typeof raw.confidence === 'number' ? raw.confidence : 0, 0),
      maxConf
    )

    axisPlacement[dim] = {
      score: raw.score,
      confidence,
      rationale: raw.rationale ?? '',
      sources: raw.evidence_urls ?? [],
    }
    sourceEvidence.push(...(raw.evidence_urls ?? []))
  }

  // Build dealbreaker evaluations
  const dealbreakers: Record<number, DealbreakEval> = {}

  for (const [dbId, rawEval] of Object.entries(parsed.dealbreakers ?? {})) {
    const idx = parseDealbreakerIndex(dbId)
    if (idx === null) continue

    if (rawEval.status === 'crosses' && rawEval.evidence && rawEval.source) {
      dealbreakers[idx] = {
        status: 'crosses',
        evidence: rawEval.evidence,
        source: rawEval.source,
      }
    } else if (rawEval.status === 'unknown') {
      dealbreakers[idx] = {
        status: 'unknown',
        note: rawEval.note ?? 'Could not verify',
      }
    } else {
      dealbreakers[idx] = { status: 'clear' }
    }
  }

  return {
    candidateData: {
      name: input.name,
      office: input.office,
      officeType: input.officeType,
      district: input.district,
      party: input.party,
      axisPlacement,
      dealbreakers,
      coverageTier: input.coverageTier,
      sourcedFrom: input.sourcedFrom,
      rhetoricalOnly: !hasRecord,
    },
    taggedBy: input.taggedBy,
    reviewedBy: null,
    sourceEvidence: Array.from(new Set(sourceEvidence)),
    externalRefs: {},
    lastReviewed: new Date().toISOString().split('T')[0],
    methodologyVersion: METHODOLOGY_VERSION,
    attribution: `Bedrock classification v${METHODOLOGY_VERSION}`,
    bedrockOriginated: true,
    rawClassification: parsed,
  }
}
