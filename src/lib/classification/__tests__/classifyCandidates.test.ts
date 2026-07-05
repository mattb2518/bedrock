import { describe, it, expect, vi } from 'vitest'
import type Anthropic from '@anthropic-ai/sdk'
import { classifyCandidate } from '../classifyCandidates'
import type { CandidateClassificationInput } from '../classifyCandidates'

function mockClient(jsonPayload: object): Anthropic {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(jsonPayload) }],
      }),
    },
  } as unknown as Anthropic
}

const INCUMBENT_INPUT: CandidateClassificationInput = {
  candidateId: 'cand-incumbent-1',
  name: 'Sen. Jane Incumbent',
  office: 'U.S. Senate',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:co',
  party: 'Independent',
  coverageTier: 'federal',
  sourcedFrom: ['congress.gov'],
  legislativeRecord: [
    'Voted YES on bipartisan infrastructure bill 2021',
    'Voted NO on federal abortion restrictions 2022',
  ],
  campaignPlatform: 'Fiscal responsibility, climate action, electoral reform.',
  taggedBy: 'admin-1',
}

const CHALLENGER_INPUT: CandidateClassificationInput = {
  candidateId: 'cand-challenger-1',
  name: 'Jane Challenger',
  office: 'U.S. Senate',
  officeType: 'ideological',
  district: 'ocd-division/country:us/state:co',
  party: 'Independent',
  coverageTier: 'federal',
  sourcedFrom: ['campaign-website.com'],
  // No legislativeRecord — rhetoric only
  campaignPlatform: 'Fiscal responsibility, climate action, electoral reform.',
  taggedBy: 'admin-1',
}

const INCUMBENT_RESPONSE = {
  has_voting_record: true,
  axes: {
    markets_governance: { score: 60, confidence: 0.9, rationale: 'Voted for IRA spending.', evidence_urls: ['congress.gov/vote/1'], based_on: 'voting_record' },
    rules_outcomes:     { score: 45, confidence: 0.8, rationale: 'Mixed on procedural vs outcomes.', evidence_urls: [], based_on: 'both' },
  },
  dealbreakers: {
    'DB-1': { status: 'clear' },
    'DB-2': { status: 'unknown', note: 'No public record found.' },
    'DB-5': { status: 'crosses', evidence: 'Documented pattern of misleading statements.', source: 'politifact.com' },
  },
  overall_notes: 'Strong voting record; positions consistent with stated platform.',
}

const CHALLENGER_RESPONSE = {
  has_voting_record: false,
  axes: {
    markets_governance: { score: 60, confidence: 0.9, rationale: 'Platform favors regulation.', evidence_urls: ['campaign-website.com'], based_on: 'stated_position' },
  },
  dealbreakers: {
    'DB-1': { status: 'clear' },
  },
  overall_notes: 'Rhetoric-only; no legislative history.',
}

// ── 1. Incumbent — full confidence allowed ───────────────────────────────────

describe('classifyCandidate — incumbent with voting record', () => {
  it('allows confidence > 0.5 for axes when voting record exists', async () => {
    const result = await classifyCandidate(INCUMBENT_INPUT, mockClient(INCUMBENT_RESPONSE))
    expect(result.candidateData.axisPlacement.markets_governance?.confidence).toBe(0.9)
  })

  it('sets rhetoricalOnly to false', async () => {
    const result = await classifyCandidate(INCUMBENT_INPUT, mockClient(INCUMBENT_RESPONSE))
    expect(result.candidateData.rhetoricalOnly).toBe(false)
  })
})

// ── 2. Challenger — confidence capped at 0.5 ────────────────────────────────

describe('classifyCandidate — challenger without voting record', () => {
  it('caps axis confidence at 0.50 when no voting record', async () => {
    const result = await classifyCandidate(CHALLENGER_INPUT, mockClient(CHALLENGER_RESPONSE))
    const conf = result.candidateData.axisPlacement.markets_governance?.confidence ?? 1
    expect(conf).toBeLessThanOrEqual(0.5)
  })

  it('sets rhetoricalOnly to true', async () => {
    const result = await classifyCandidate(CHALLENGER_INPUT, mockClient(CHALLENGER_RESPONSE))
    expect(result.candidateData.rhetoricalOnly).toBe(true)
  })
})

// ── 3. Dealbreaker evidence standard ────────────────────────────────────────

describe('classifyCandidate — dealbreaker evaluation', () => {
  it('maps DB-1 clear to { status: clear }', async () => {
    const result = await classifyCandidate(INCUMBENT_INPUT, mockClient(INCUMBENT_RESPONSE))
    expect(result.candidateData.dealbreakers[1]).toEqual({ status: 'clear' })
  })

  it('maps DB-2 unknown with note', async () => {
    const result = await classifyCandidate(INCUMBENT_INPUT, mockClient(INCUMBENT_RESPONSE))
    expect(result.candidateData.dealbreakers[2]).toMatchObject({
      status: 'unknown',
      note: expect.any(String),
    })
  })

  it('maps DB-5 crosses with evidence and source', async () => {
    const result = await classifyCandidate(INCUMBENT_INPUT, mockClient(INCUMBENT_RESPONSE))
    expect(result.candidateData.dealbreakers[5]).toMatchObject({
      status: 'crosses',
      evidence: expect.any(String),
      source: expect.any(String),
    })
  })

  it('ignores crosses entries missing evidence or source', async () => {
    const badResponse = {
      ...INCUMBENT_RESPONSE,
      dealbreakers: {
        'DB-3': { status: 'crosses' },  // missing evidence/source → treated as clear
      },
    }
    const result = await classifyCandidate(INCUMBENT_INPUT, mockClient(badResponse))
    expect(result.candidateData.dealbreakers[3]).toEqual({ status: 'clear' })
  })
})

// ── 4. Dealbreaker backfill ──────────────────────────────────────────────────

describe('classifyCandidate — dealbreaker backfill', () => {
  it('backfills missing dealbreaker indices as unknown/Not evaluated', async () => {
    // INCUMBENT_RESPONSE only has DB-1, DB-2, DB-5. All others should be backfilled.
    const result = await classifyCandidate(INCUMBENT_INPUT, mockClient(INCUMBENT_RESPONSE))
    // Pick an index that is in LAYER4_SECTIONS but absent from INCUMBENT_RESPONSE (e.g. DB-6 → 6)
    const backfilled = result.candidateData.dealbreakers[6]
    expect(backfilled).toBeDefined()
    expect(backfilled?.status).toBe('unknown')
    expect((backfilled as { status: 'unknown'; note: string }).note).toBe('Not evaluated by classifier')
  })

  it('does not overwrite an entry the classifier already returned', async () => {
    const result = await classifyCandidate(INCUMBENT_INPUT, mockClient(INCUMBENT_RESPONSE))
    // DB-1 was returned as 'clear' — backfill must not overwrite it
    expect(result.candidateData.dealbreakers[1]).toEqual({ status: 'clear' })
  })
})

// ── 5. Parse failure ─────────────────────────────────────────────────────────

describe('classifyCandidate — parse failure', () => {
  it('throws on non-JSON response', async () => {
    const badClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'I cannot assist with this.' }],
        }),
      },
    } as unknown as Anthropic

    await expect(classifyCandidate(INCUMBENT_INPUT, badClient)).rejects.toThrow('classifyCandidate')
  })
})
