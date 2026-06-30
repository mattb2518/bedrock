/**
 * Stage 11 — Auto-classification queue tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockUpsert = vi.fn().mockResolvedValue({ error: null })
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

import { queueCandidateForClassification } from '../classificationQueue'

const CANDIDATE = {
  id: 'bio-001',
  name: 'Jane Smith',
  office: 'US Senate — MA',
  district: 'ocd-division/country:us/state:ma',
  party: 'Democrat',
  coverageTier: 'federal',
  sourcedFrom: ['congress.gov'],
}

describe('queueCandidateForClassification', () => {
  beforeEach(() => {
    mockFrom.mockClear()
    mockUpsert.mockClear()
    mockUpsert.mockResolvedValue({ error: null })
  })

  it('inserts a pending_review stub with attribution=auto_ingested', async () => {
    await queueCandidateForClassification(CANDIDATE)
    expect(mockFrom).toHaveBeenCalledWith('classified_candidates')
    const insertedRow = mockUpsert.mock.calls[0][0]
    expect(insertedRow.status).toBe('pending_review')
    expect(insertedRow.attribution).toBe('auto_ingested')
    expect(insertedRow.candidate_id).toBe('bio-001')
  })

  it('uses ignoreDuplicates:true for idempotency', async () => {
    await queueCandidateForClassification(CANDIDATE)
    const options = mockUpsert.mock.calls[0][1]
    expect(options.ignoreDuplicates).toBe(true)
    expect(options.onConflict).toBe('candidate_id')
  })

  it('populates all fields required by reclassifyEntry', async () => {
    await queueCandidateForClassification(CANDIDATE)
    const row = mockUpsert.mock.calls[0][0]
    expect(row.name).toBe('Jane Smith')
    expect(row.office).toBe('US Senate — MA')
    expect(row.office_type).toBe('ideological')
    expect(row.district).toBe('ocd-division/country:us/state:ma')
    expect(row.party).toBe('Democrat')
    expect(row.coverage_tier).toBe('federal')
    expect(row.sourced_from).toEqual(['congress.gov'])
  })

  it('does not throw when the DB call fails (fire-and-forget resilience)', async () => {
    mockUpsert.mockRejectedValue(new Error('DB error'))
    await expect(queueCandidateForClassification(CANDIDATE)).resolves.toBeUndefined()
  })

  it('second call for the same candidate_id uses upsert with ignoreDuplicates — no second row', async () => {
    await queueCandidateForClassification(CANDIDATE)
    await queueCandidateForClassification(CANDIDATE)
    // Both calls use the same upsert with ignoreDuplicates — DB enforces exactly one row
    expect(mockUpsert).toHaveBeenCalledTimes(2)
    const opts1 = mockUpsert.mock.calls[0][1]
    const opts2 = mockUpsert.mock.calls[1][1]
    expect(opts1.ignoreDuplicates).toBe(true)
    expect(opts2.ignoreDuplicates).toBe(true)
  })
})

describe('federalCandidates integration — fire-and-forget pattern', () => {
  it('queue calls are void (not awaited) — confirmed by source code pattern', () => {
    const src = readFileSync(
      path.join(process.cwd(), 'src/lib/civic/federalCandidates.ts'),
      'utf-8'
    )
    expect(src).toContain('void queueCandidateForClassification(')
    const queueIdx = src.indexOf('void queueCandidateForClassification(')
    const returnIdx = src.lastIndexOf('return { senate: senateCandidates')
    expect(queueIdx).toBeLessThan(returnIdx)
  })

  it('stateLegCandidates also uses void queue call', () => {
    const src = readFileSync(
      path.join(process.cwd(), 'src/lib/civic/stateLegCandidates.ts'),
      'utf-8'
    )
    expect(src).toContain('void queueCandidateForClassification(')
  })
})
