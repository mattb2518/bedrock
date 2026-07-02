import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface BlurbsRequest {
  mantleType: string
  oneLiner: string
  topDimensions: string[]      // plain-English labels, ≤3
  bottomDimensions: string[]   // plain-English labels, 2 most uncertain
  confirming:  SourceSummary[]
  expanding:   SourceSummary[]
  challenging: SourceSummary[]
}

interface SourceSummary {
  name: string
  lean: string
  signatureAxes: string[] // top 2 dimension coverage labels
}

export interface BlurbsResult {
  confirming_blurb:  string
  expanding_blurb:   string
  challenging_blurb: string
  card_oneliners:    Record<string, string>
}

function formatSources(sources: SourceSummary[]): string {
  if (sources.length === 0) return '(none selected)'
  return sources
    .map((s) => `${s.name} (${s.lean}; covers: ${s.signatureAxes.join(', ') || 'general'})`)
    .join('; ')
}

export async function POST(req: NextRequest) {
  try {
    const body: BlurbsRequest = await req.json()

    const userPrompt = `The user's Civic Mantle is ${body.mantleType} — ${body.oneLiner}.

Their top dimensions (what defines them most): ${body.topDimensions.join(', ') || '(not yet identified)'}.

Their lowest dimensions (where they're less certain): ${body.bottomDimensions.join(', ') || '(not yet identified)'}.

Confirming tier sources selected: ${formatSources(body.confirming)}.
Why they're confirming: high agreement with user profile, low tension on held values.

Expanding tier sources selected: ${formatSources(body.expanding)}.
Why they're expanding: adjacent values, introduces novel coverage on dimensions the user is less certain about.

Challenging tier sources selected: ${formatSources(body.challenging)}.
Why they're challenging: high tension on held values, high reliability and good faith.

Write three blurbs, one per tier. Each blurb:
- 2-3 sentences
- Opens with 'As a ${body.mantleType}...'
- Names 1-2 specific sources from the tier
- References the specific axes that drove placement in plain language (not axis codes)
- Explains the WHY, not just the what

Also write one card-level one-liner per source across all three tiers. Each one-liner is one sentence explaining why this specific source landed in this tier for this user.

Return ONLY valid JSON, no markdown, no preamble:
{
  "confirming_blurb": "string",
  "expanding_blurb": "string",
  "challenging_blurb": "string",
  "card_oneliners": {
    "[source_name]": "string"
  }
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: `You write personalized explanations for a civic media recommendation tool called Bedrock. You explain to users why specific media sources have been recommended for them based on their eight-dimension civic values profile. Your tone is warm, confident, and nonpartisan. You never use the words "algorithm" or "score" — say "your values profile" or "how you think about X" instead. You are precise and specific — you name sources and dimensions, not generalities.`,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed: BlurbsResult = JSON.parse(raw)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('media-blurbs error:', err)
    return NextResponse.json({ error: 'generation_failed' }, { status: 500 })
  }
}
