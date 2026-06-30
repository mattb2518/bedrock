/**
 * On-demand candidate classification cache — getOrClassifyCandidate()
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10)
const STALE = new Date(Date.now() - 31 * 86_400_000).toISOString().slice(0, 10)

const ENTRY = {
  id: 'bio-001',
  name: 'Jane Smith',
  office: 'US Senate — MA',
  officeType: 'ideological' as const,
  district: 'ocd-division/country:us/state:ma',
  party: 'Democrat',
  coverageTier: 'federal' as const,
  sourcedFrom: ['congress.gov'],
}

const HIGH_CONF_PLACEMENT = Object.fromEntries(
  ['stability_change', 'local_federal', 'national_global', 'rules_outcomes',
   'markets_governance', 'pragmatism_idealism', 'individual_collective', 'trust_skepticism']
  .map((d) => [d, { score: 60, confidence: 0.8, rationale: 'Test', sources: [] }])
)

const LOW_CONF_PLACEMENT = {
  stability_change: { score: 50, confidence: 0.4, rationale: 'Test', sources: [] },
}

const MOCK_CLASSIFICATION = {
  candidateData: {
    name: ENTRY.name, office: ENTRY.office, officeType: 'ideological' as const,
    district: ENTRY.district, party: 'Democrat', coverageTier: 'federal' as const,
    axisPlacement: HIGH_CONF_PLACEMENT, dealbreakers: {}, sourcedFrom: ['congress.gov'],
    rhetoricalOnly: false,
  },
  taggedBy: 'auto_classify', reviewedBy: null, sourceEvidence: [],
  externalRefs: {}, lastReviewed: TODAY, methodologyVersion: '1.0',
  attribution: 'Bedrock classification v1.0', bedrockOriginated: true,
  rawClassification: { axes: {}, dealbreakers: {}, has_voting_record: true, overall_notes: '' },
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockSingle = vi.fn()
const mockUpsert = vi.fn().mockResolvedValue({ error: null })
const mockFrom = vi.fn(() => ({
  select: () => ({ eq: () => ({ single: mockSingle }) }),
  upsert: mockUpsert,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

const mockClassify = vi.fn().mockResolvedValue(MOCK_CLASSIFICATION)
vi.mock('@/lib/classification/classifyCandidates', () => ({
  classifyCandidate: (...args: unknown[]) => mockClassify(...args),
}))

vi.mock('anthropic', () => ({ default: vi.fn().mockImplementation(() => ({})) }))

import { getOrClassifyCandidate } from '../classificationQueue'

// ─────────────────────────────────────────────────────────────────────────────

describe('cache hit — approved + fresh + has placement', () => {
  beforeEach(() => {
    mockClassify.mockClear()
    mockSingle.mockResolvedValue({
      data: {
        candidate_id: ENTRY.id, name: ENTRY.name, office: ENTRY.office,
        office_type: 'ideological', district: ENTRY.district, party: 'Democrat',
        coverage_tier: 'federal', sourced_from: ['congress.gov'],
        axis_placement: HIGH_CONF_PLACEMENT, dealbreakers: {},
        status: 'approved', classified_at: TODAY, last_reviewed: TODAY,
        rhetorical_only: false,
      },
      error: null,
    })
  })

  it('returns stored record without calling classifyCandidate', async () => {
    const result = await getOrClassifyCandidate(ENTRY)
    expect(result).not.toBeNull()
    expect(result?.id).toBe(ENTRY.id)
    expect(mockClassify).not.toHaveBeenCalled()
  })

  it('same candidate fetched twice only classifies once (cache hit on second call)', async () => {
    await getOrClassifyCandidate(ENTRY)
    await getOrClassifyCandidate(ENTRY)
    expect(mockClassify).toHaveBeenCalledTimes(0)
  })
})

describe('cache miss — not found in DB', () => {
  beforeEach(() => {
    mockClassify.mockClear()
    mockUpsert.mockClear()
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    mockClassify.mockResolvedValue(MOCK_CLASSIFICATION)
  })

  it('calls classifyCandidate on cache miss', async () => {
    await getOrClassifyCandidate(ENTRY)
    expect(mockClassify).toHaveBeenCalledTimes(1)
  })

  it('stores the result via upsert', async () => {
    await getOrClassifyCandidate(ENTRY)
    expect(mockUpsert).toHaveBeenCalled()
    const stored = mockUpsert.mock.calls[0][0]
    expect(stored.candidate_id).toBe(ENTRY.id)
    expect(stored.classified_at).toBe(TODAY)
  })

  it('auto-approves when ≥ 4 axes have confidence > 0.6', async () => {
    await getOrClassifyCandidate(ENTRY)
    const stored = mockUpsert.mock.calls[0][0]
    expect(stored.status).toBe('approved')
    expect(stored.attribution).toBe('auto_classify')
  })

  it('returns pending_review when fewer than 4 high-confidence axes', async () => {
    mockClassify.mockResolvedValueOnce({
      ...MOCK_CLASSIFICATION,
      candidateData: {
        ...MOCK_CLASSIFICATION.candidateData,
        axisPlacement: LOW_CONF_PLACEMENT,
      },
    })
    await getOrClassifyCandidate(ENTRY)
    const stored = mockUpsert.mock.calls[0][0]
    expect(stored.status).toBe('pending_review')
  })
})

describe('stale cache — approved but > 30 days old', () => {
  beforeEach(() => {
    mockClassify.mockClear()
    mockUpsert.mockClear()
    mockSingle.mockResolvedValue({
      data: {
        candidate_id: ENTRY.id, name: ENTRY.name, office: ENTRY.office,
        office_type: 'ideological', district: ENTRY.district, party: 'Democrat',
        coverage_tier: 'federal', sourced_from: ['congress.gov'],
        axis_placement: HIGH_CONF_PLACEMENT, dealbreakers: {},
        status: 'approved', classified_at: STALE, last_reviewed: STALE,
        rhetorical_only: false,
      },
      error: null,
    })
    mockClassify.mockResolvedValue(MOCK_CLASSIFICATION)
  })

  it('re-classifies candidate classified > 30 days ago', async () => {
    await getOrClassifyCandidate(ENTRY)
    expect(mockClassify).toHaveBeenCalledTimes(1)
  })

  it('updates classified_at after re-classification', async () => {
    await getOrClassifyCandidate(ENTRY)
    const stored = mockUpsert.mock.calls[0][0]
    expect(stored.classified_at).toBe(TODAY)
  })
})

describe('graceful failure', () => {
  beforeEach(() => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    mockClassify.mockRejectedValue(new Error('Anthropic API error'))
  })

  it('returns null when classification throws — never crashes', async () => {
    const result = await getOrClassifyCandidate(ENTRY)
    expect(result).toBeNull()
  })

  it('does not re-throw the error', async () => {
    await expect(getOrClassifyCandidate(ENTRY)).resolves.not.toThrow()
  })
})

// ── Source-level contract checks ──────────────────────────────────────────────

describe('source code contracts', () => {
  it('federalCandidates uses getOrClassifyCandidate (not fire-and-forget)', () => {
    const src = readFileSync(
      path.join(process.cwd(), 'src/lib/civic/federalCandidates.ts'),
      'utf-8'
    )
    expect(src).toContain('getOrClassifyCandidate')
    expect(src).not.toContain('queueCandidateForClassification')
    expect(src).not.toContain('void queueCandidateForClassification')
  })

  it('stateLegCandidates uses getOrClassifyCandidate (not fire-and-forget)', () => {
    const src = readFileSync(
      path.join(process.cwd(), 'src/lib/civic/stateLegCandidates.ts'),
      'utf-8'
    )
    expect(src).toContain('getOrClassifyCandidate')
    expect(src).not.toContain('queueCandidateForClassification')
  })
})
