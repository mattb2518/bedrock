/**
 * Generates per-Mantle, per-tier media-diet blurbs via the Anthropic API.
 * Run: npx tsx scripts/generate-media-blurbs.ts
 * Requires ANTHROPIC_API_KEY in env.
 * Outputs: src/data/media-blurbs.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync } from 'fs'

const MANTLES = [
  { type: 'honest_broker',    name: 'The Honest Broker',    oneLiner: 'The rules are the freedom' },
  { type: 'system_fixer',     name: 'The System Fixer',     oneLiner: 'Not left or right — building better machinery' },
  { type: 'long_gamer',       name: 'The Long Gamer',       oneLiner: 'Thinks in decades and across borders' },
  { type: 'good_neighbor',    name: 'The Good Neighbor',    oneLiner: 'Believes the best solutions start closest to home' },
  { type: 'missourian',       name: 'The Missourian',       oneLiner: "You'll believe it when you see it — and you're usually right" },
  { type: 'eternal_optimist', name: 'The Eternal Optimist', oneLiner: "Democracy is messy and you're here for all of it" },
  { type: 'steward',          name: 'The Steward',          oneLiner: "Knows what's worth conserving — and what isn't" },
  { type: 'free_agent',       name: 'The Free Agent',       oneLiner: 'Never fit a box and stopped trying' },
  { type: 'standard_bearer',  name: 'The Standard Bearer',  oneLiner: 'The institutions are imperfect — and worth defending' },
  { type: 'pioneer',          name: 'The Pioneer',          oneLiner: 'Progress is possible, and you know how to build it' },
] as const

type CivicType = typeof MANTLES[number]['type']
type MediaTier = 'confirming' | 'expanding' | 'challenging'

const TIER_LABEL: Record<MediaTier, string> = {
  confirming:  'Deepen',
  expanding:   'Expand',
  challenging: 'Challenge',
}

const TIER_PURPOSE: Record<MediaTier, string> = {
  confirming:  'sources that align with and deepen how they already see the world',
  expanding:   'adjacent sources that add coverage on dimensions they are less certain about — broadening their view without opposing it',
  challenging: 'high-integrity sources that make the strongest honest case against their most-held views',
}

async function generateBlurb(
  client: Anthropic,
  name: string,
  oneLiner: string,
  tier: MediaTier,
): Promise<string> {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 220,
    system:
      'You write personalized media-diet explanations for Bedrock, a civic-identity tool for independent-minded voters. Warm, confident, nonpartisan. Never use the words "algorithm" or "score" — say "your values profile" or "how you think about X". Be grounded and specific about values, not generic.',
    messages: [
      {
        role: 'user',
        content:
          `The reader's Civic Mantle is ${name} — ${oneLiner}. ` +
          `Write exactly TWO complete sentences for their "${TIER_LABEL[tier]}" media tier. ` +
          `This tier's purpose: ${TIER_PURPOSE[tier]}. ` +
          `Write in second person, open with "As ${name},", and explain why this kind of journalism matters for how a ${name} thinks — reference their values in plain language. ` +
          `Do NOT name any specific outlets; a sentence naming their actual sources will be appended after yours. ` +
          `Return only the two sentences, no preamble.`,
      },
    ],
  })

  let text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  // Strip markdown fences or surrounding quotes
  text = text.replace(/^```[\w]*\n?/m, '').replace(/```\s*$/m, '').trim()
  text = text.replace(/^["']|["']$/g, '').trim()
  return text
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })
  const tiers: MediaTier[] = ['confirming', 'expanding', 'challenging']
  const result: Partial<Record<CivicType, { confirming: string; expanding: string; challenging: string }>> = {}

  for (const mantle of MANTLES) {
    console.log(`\n${mantle.name}…`)
    const blurbs = { confirming: '', expanding: '', challenging: '' } as { confirming: string; expanding: string; challenging: string }

    for (const tier of tiers) {
      blurbs[tier] = await generateBlurb(client, mantle.name, mantle.oneLiner, tier)
      console.log(`  [${tier}] ${blurbs[tier].slice(0, 80)}…`)
    }

    result[mantle.type] = blurbs
  }

  // Emit src/data/media-blurbs.ts
  const lines: string[] = [
    `import type { CivicType } from '@/types/quiz'`,
    ``,
    `export const MANTLE_TIER_BLURBS: Record<CivicType, { confirming: string; expanding: string; challenging: string }> = {`,
  ]

  for (const mantle of MANTLES) {
    const b = result[mantle.type]!
    lines.push(`  ${mantle.type}: {`)
    lines.push(`    confirming:  ${JSON.stringify(b.confirming)},`)
    lines.push(`    expanding:   ${JSON.stringify(b.expanding)},`)
    lines.push(`    challenging: ${JSON.stringify(b.challenging)},`)
    lines.push(`  },`)
  }

  lines.push(`}`)

  const outPath = 'src/data/media-blurbs.ts'
  writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8')
  console.log(`\nWrote ${outPath}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
