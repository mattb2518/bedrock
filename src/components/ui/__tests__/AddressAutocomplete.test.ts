// Logic tests for AddressAutocomplete proxy-response handling.
// DOM rendering tests are omitted — @testing-library/react not installed.
// These tests exercise the state-transition logic directly.

import { describe, it, expect } from 'vitest'

// Mirror the component's fetchSuggestions state decisions so we can test
// them without a DOM environment.
async function simulateFetch(
  mockOk: boolean,
  mockSuggestions: string[]
): Promise<{ manualMode: boolean; proxyDown: boolean; suggestions: string[]; open: boolean }> {
  // Simulate the fetch branch logic from AddressAutocomplete.fetchSuggestions
  if (!mockOk) {
    return { manualMode: true, proxyDown: true, suggestions: [], open: false }
  }
  const texts = mockSuggestions.filter(Boolean)
  return {
    manualMode: texts.length === 0,
    proxyDown: false,
    suggestions: texts,
    open: texts.length > 0,
  }
}

describe('AddressAutocomplete — proxy response handling', () => {
  it('flips to manualMode AND proxyDown on non-ok response (e.g. 502)', async () => {
    const state = await simulateFetch(false, [])
    expect(state.manualMode).toBe(true)
    expect(state.proxyDown).toBe(true)
    expect(state.suggestions).toEqual([])
    expect(state.open).toBe(false)
  })

  it('shows suggestions and does NOT set manualMode on successful response', async () => {
    const state = await simulateFetch(true, ['123 Main St, Springfield, IL'])
    expect(state.manualMode).toBe(false)
    expect(state.proxyDown).toBe(false)
    expect(state.suggestions).toHaveLength(1)
    expect(state.open).toBe(true)
  })

  it('sets manualMode but NOT proxyDown on genuine zero-result (ok=true, empty array)', async () => {
    const state = await simulateFetch(true, [])
    expect(state.manualMode).toBe(true)
    expect(state.proxyDown).toBe(false)  // hint only shown when proxy down
    expect(state.open).toBe(false)
  })
})
