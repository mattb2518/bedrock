// "Analyze this" — §21.8
// Fires a Claude call against the feedback dataset for a single entity,
// returning structured analysis for the admin to act on (or ignore).

import Anthropic from '@anthropic-ai/sdk'

export interface FeedbackDataset {
  entityId: string
  entityName: string
  entityType: 'candidate' | 'source'
  totalFeedback: number
  thumbsDown: number
  thumbsUp: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  axisPlacement: Record<string, any>
  confidenceBandOrTier: string
  sourceEvidence: string[]
  freeTextResponses: string[]
  chipFrequency: Record<string, number>
}

export interface FeedbackAnalysisResult {
  patternSummary: string
  likelyWrongAxes: string[]
  recommendedAction: 'reclassify' | 'lower_confidence' | 'flag' | 'no_action'
  recommendedActionReason: string
  draftUpdatedRationale: string | null
}

export async function analyzeFeedback(
  dataset: FeedbackDataset,
  client?: Anthropic
): Promise<FeedbackAnalysisResult> {
  const anthropic = client ?? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `You are an editorial assistant for Bedrock, a civic identity platform. A human admin is reviewing feedback data for a ${dataset.entityType} and needs your analysis.

## Entity
Name: ${dataset.entityName}
ID: ${dataset.entityId}
Type: ${dataset.entityType}
Confidence/Tier: ${dataset.confidenceBandOrTier}

## Feedback Summary
Total feedback: ${dataset.totalFeedback}
Thumbs up: ${dataset.thumbsUp}
Thumbs down: ${dataset.thumbsDown}
Thumbs-down rate: ${dataset.totalFeedback > 0 ? ((dataset.thumbsDown / dataset.totalFeedback) * 100).toFixed(1) : 0}%

## Chip Frequency (what users selected when giving thumbs-down)
${Object.entries(dataset.chipFrequency).map(([chip, count]) => `- "${chip}": ${count} times`).join('\n') || 'No chips selected'}

## Free-text responses (what users wrote)
${dataset.freeTextResponses.slice(0, 20).map((t, i) => `${i + 1}. "${t}"`).join('\n') || 'No free-text responses'}

## Current axis placements
${JSON.stringify(dataset.axisPlacement, null, 2)}

## Source evidence
${dataset.sourceEvidence.join(', ') || 'None listed'}

---

Based on this feedback data, provide a structured analysis. Respond ONLY with a JSON object matching this schema exactly:
{
  "patternSummary": "string — 2-3 sentences describing what the feedback pattern suggests about this ${dataset.entityType}'s classification",
  "likelyWrongAxes": ["array of axis names most likely to be miscalibrated, based on feedback patterns"],
  "recommendedAction": "reclassify" | "lower_confidence" | "flag" | "no_action",
  "recommendedActionReason": "string — one sentence explaining the recommendation",
  "draftUpdatedRationale": "string — a draft updated rationale if reclassification is warranted, null otherwise"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const parsed = JSON.parse(jsonMatch[0]) as FeedbackAnalysisResult
    return parsed
  } catch {
    throw new Error(`analyzeFeedback: failed to parse Claude response — ${text.slice(0, 200)}`)
  }
}
