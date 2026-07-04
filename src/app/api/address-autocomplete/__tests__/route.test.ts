import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Set a dummy API key so the 503 branch is never hit
vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-key')

async function callRoute(input: string) {
  // Dynamic import so env stubs are in place first
  const { POST } = await import('../route')
  const req = new NextRequest('http://localhost/api/address-autocomplete', {
    method: 'POST',
    body: JSON.stringify({ input }),
    headers: { 'Content-Type': 'application/json' },
  })
  return POST(req)
}

beforeEach(() => {
  vi.resetModules()
  mockFetch.mockReset()
})

describe('POST /api/address-autocomplete', () => {
  it('returns 502 (not 200) when upstream returns 400 INVALID_ARGUMENT', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'INVALID_ARGUMENT',
    })

    const res = await callRoute('123 Main Street')
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toBe('upstream')
    expect(body.suggestions).toBeUndefined()
  })

  it('returns 200 with suggestions array on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        suggestions: [
          { placePrediction: { text: { text: '123 Main St, Springfield, IL' } } },
        ],
      }),
    })

    const res = await callRoute('123 Main')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.suggestions).toHaveLength(1)
  })

  it('returns 200 with empty suggestions on genuine zero-result response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ suggestions: [] }),
    })

    const res = await callRoute('zzz nowhere')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.suggestions).toEqual([])
  })

  it('returns 200 with empty array for short input (< 3 chars)', async () => {
    const res = await callRoute('ab')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.suggestions).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
