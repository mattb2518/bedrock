import { describe, it, expect, vi } from 'vitest'
import type Anthropic from '@anthropic-ai/sdk'
import { classifySource } from '../classifySources'
import type { SourceClassificationInput } from '../classifySources'

// ── Mock Anthropic client factory ─────────────────────────────────────────────

function mockClient(jsonPayload: object): Anthropic {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(jsonPayload) }],
      }),
    },
  } as unknown as Anthropic
}

const BASE_INPUT: SourceClassificationInput = {
  sourceId: 'src-test-1',
  name: 'Test Weekly',
  url: 'https://testweekly.example.com',
  contentPieces: [
    { text: 'Article 1: Markets should lead climate transition.' },
    { text: 'Article 2: Federal mandates slow innovation.' },
  ],
  taggedBy: 'admin-user-1',
}

// ── 1. Happy path — valid classification ────────────────────────────────────

describe('classifySource — happy path', () => {
  const VALID_RESPONSE = {
    axes: {
      markets_governance: {
        score: 25,
        confidence: 0.85,
        rationale: 'Consistently advocates market-led solutions across analyzed pieces.',
        evidence_urls: ['https://testweekly.example.com/article-1', 'https://testweekly.example.com/article-2'],
      },
      stability_change: {
        score: 35,
        confidence: 0.70,
        rationale: 'Slight preference for incremental change over structural reform.',
        evidence_urls: ['https://testweekly.example.com/article-2'],
      },
    },
    overall_notes: 'Clear center-right lean on economic regulation.',
    reliability_assessment: 'Sources are cited; minimal inflammatory language.',
    independence_assessment: 'Founder-owned; no disclosed major investors.',
  }

  it('returns axisPlacement matching engine AxisPlacement shape', async () => {
    const result = await classifySource(BASE_INPUT, mockClient(VALID_RESPONSE))
    expect(result.axisPlacement.markets_governance).toMatchObject({
      score: 25,
      confidence: 0.85,
      rationale: expect.any(String),
      sources: expect.any(Array),
    })
  })

  it('sets reviewedBy to null until admin approves', async () => {
    const result = await classifySource(BASE_INPUT, mockClient(VALID_RESPONSE))
    expect(result.reviewedBy).toBeNull()
  })

  it('sets bedrockOriginated true when no external ratings provided', async () => {
    const result = await classifySource(BASE_INPUT, mockClient(VALID_RESPONSE))
    expect(result.bedrockOriginated).toBe(true)
  })

  it('sets bedrockOriginated false when external ratings provided', async () => {
    const inputWithExternal: SourceClassificationInput = {
      ...BASE_INPUT,
      externalRatings: { allSidesRating: 'center' },
    }
    const result = await classifySource(inputWithExternal, mockClient(VALID_RESPONSE))
    expect(result.bedrockOriginated).toBe(false)
  })

  it('de-duplicates sourceEvidence across axes', async () => {
    const result = await classifySource(BASE_INPUT, mockClient(VALID_RESPONSE))
    const dupes = result.sourceEvidence.filter(
      (v, i, arr) => arr.indexOf(v) !== i
    )
    expect(dupes).toHaveLength(0)
  })

  it('skips axes with invalid score ranges', async () => {
    const responseWithBadAxis = {
      ...VALID_RESPONSE,
      axes: {
        ...VALID_RESPONSE.axes,
        trust_skepticism: { score: 150, confidence: 0.5, rationale: 'bad', evidence_urls: [] },
      },
    }
    const result = await classifySource(BASE_INPUT, mockClient(responseWithBadAxis))
    expect(result.axisPlacement.trust_skepticism).toBeUndefined()
    expect(result.axisPlacement.markets_governance).toBeDefined()
  })
})

// ── 2. Parse failure ─────────────────────────────────────────────────────────

describe('classifySource — parse failure', () => {
  it('throws when Claude returns non-JSON', async () => {
    const badClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Sorry, I cannot help with that.' }],
        }),
      },
    } as unknown as Anthropic

    await expect(classifySource(BASE_INPUT, badClient)).rejects.toThrow('classifySource')
  })
})
