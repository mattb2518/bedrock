import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyWithPerplexity } from '../verifyWithPerplexity'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockPerplexityResponse(content: string) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      choices: [{ message: { content } }],
    }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Happy path ────────────────────────────────────────────────────────────────

describe('verifyWithPerplexity — happy path', () => {
  it('returns summary, checkedAt, and rawResponse', async () => {
    const content = 'This source is still active. No ownership changes detected. No reliability incidents found. URL is valid and resolves correctly. Editorial independence appears intact.'
    mockPerplexityResponse(content)

    const result = await verifyWithPerplexity(
      { type: 'source', name: 'Test Weekly', url: 'https://testweekly.com' },
      'test-api-key'
    )

    expect(result.rawResponse).toBe(content)
    expect(result.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)   // ISO date
    expect(result.summary).toBeTruthy()
    expect(typeof result.summary).toBe('string')
  })

  it('truncates summary to 500 chars and appends ellipsis for long responses', async () => {
    const longContent = 'A'.repeat(600)
    mockPerplexityResponse(longContent)

    const result = await verifyWithPerplexity({ type: 'source', name: 'X' }, 'key')
    expect(result.summary).toHaveLength(501)   // 500 chars + '…'
    expect(result.summary.endsWith('…')).toBe(true)
  })

  it('does not append ellipsis when response is short', async () => {
    const content = 'Short response.'
    mockPerplexityResponse(content)

    const result = await verifyWithPerplexity({ type: 'source', name: 'X' }, 'key')
    expect(result.summary).toBe('Short response.')
    expect(result.summary.endsWith('…')).toBe(false)
  })

  it('sends correct Authorization header', async () => {
    mockPerplexityResponse('ok')

    await verifyWithPerplexity({ type: 'source', name: 'X' }, 'my-perplexity-key')

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers['Authorization']).toBe('Bearer my-perplexity-key')
  })

  it('uses sonar model', async () => {
    mockPerplexityResponse('ok')
    await verifyWithPerplexity({ type: 'source', name: 'X' }, 'key')
    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.model).toBe('sonar')
  })
})

// ── Candidate vs source prompts ───────────────────────────────────────────────

describe('verifyWithPerplexity — prompt content', () => {
  it('candidate prompt mentions office and district', async () => {
    mockPerplexityResponse('ok')
    await verifyWithPerplexity({ type: 'candidate', name: 'Jane Smith', office: 'U.S. Senate', district: 'CO' }, 'key')
    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)
    const prompt = body.messages[1].content
    expect(prompt).toContain('Jane Smith')
    expect(prompt).toContain('U.S. Senate')
  })

  it('source prompt mentions URL', async () => {
    mockPerplexityResponse('ok')
    await verifyWithPerplexity({ type: 'source', name: 'The Dispatch', url: 'https://thedispatch.com' }, 'key')
    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)
    const prompt = body.messages[1].content
    expect(prompt).toContain('thedispatch.com')
  })
})

// ── Error handling ────────────────────────────────────────────────────────────

describe('verifyWithPerplexity — error handling', () => {
  it('throws when PERPLEXITY_API_KEY is not set and no key passed', async () => {
    // Don't pass apiKey; process.env.PERPLEXITY_API_KEY is not set in test env
    await expect(
      verifyWithPerplexity({ type: 'source', name: 'X' })
    ).rejects.toThrow('PERPLEXITY_API_KEY')
  })

  it('throws on non-ok HTTP response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
    })

    await expect(
      verifyWithPerplexity({ type: 'source', name: 'X' }, 'key')
    ).rejects.toThrow('429')
  })
})
