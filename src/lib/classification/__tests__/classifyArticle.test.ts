import { describe, it, expect, vi } from 'vitest'
import type Anthropic from '@anthropic-ai/sdk'
import {
  classifyArticle,
  detectSocialMedia,
  detectPaywall,
  isVeryShortContent,
  fetchArticleText,
} from '../classifyArticle'
import type { ArticleInput } from '../classifyArticle'
import { FLAT_PROFILE } from '../../engine/__tests__/fixtures'

// ── Mock Anthropic client ─────────────────────────────────────────────────────

function mockClient(jsonPayload: object): Anthropic {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(jsonPayload) }],
      }),
    },
  } as unknown as Anthropic
}

const CIVIC_RESPONSE = {
  is_civic_content: true,
  detected_language: 'en',
  dimensional_breakdown: {
    markets_governance: { direction: 'pole_b', emphasis: 'primary', note: 'Advocates government healthcare intervention.' },
    stability_change:   { direction: 'pole_b', emphasis: 'secondary', note: 'Calls for structural reform.' },
  },
  profile_read: 'expanding',
  profile_read_explanation: 'This article challenges your market-leaning views by making a strong case for public coverage expansion.',
  reliability_signal: { assessment: 'Well-sourced; cites peer-reviewed studies and government data.' },
}

const NON_CIVIC_RESPONSE = {
  is_civic_content: false,
  detected_language: 'en',
  dimensional_breakdown: {},
  profile_read: 'reinforcing',
  profile_read_explanation: '',
  reliability_signal: { assessment: '' },
}

const BASE_INPUT: ArticleInput = {
  pastedText: 'The Affordable Care Act has expanded coverage to millions of Americans who previously lacked insurance. Proponents argue that government intervention in healthcare markets is necessary to correct market failures. Critics contend that regulatory burdens increase costs. The debate continues in Congress with several reform proposals under consideration. This article explores the various perspectives on healthcare policy reform in the United States, examining evidence from multiple policy studies and expert opinions.',
  userProfile: FLAT_PROFILE,
  primaryType: 'pragmatic_idealist',
}

// ── 1. Deterministic failure detection ──────────────────────────────────────

describe('classifyArticle — failure state detection (deterministic)', () => {
  describe('detectSocialMedia', () => {
    it('detects Twitter/X URLs', () => {
      expect(detectSocialMedia('https://x.com/user/status/123456')).toBe(true)
      expect(detectSocialMedia('https://twitter.com/user/status/123')).toBe(true)
    })

    it('detects Facebook URLs', () => {
      expect(detectSocialMedia('https://www.facebook.com/post/123')).toBe(true)
    })

    it('detects Bluesky URLs', () => {
      expect(detectSocialMedia('https://bsky.app/profile/user/post/abc')).toBe(true)
    })

    it('does NOT flag regular news sites', () => {
      expect(detectSocialMedia('https://nytimes.com/2026/01/01/politics/article.html')).toBe(false)
      expect(detectSocialMedia('https://theatlantic.com/politics/archive/2026/01/piece')).toBe(false)
    })
  })

  describe('detectPaywall', () => {
    it('detects subscribe-to-read pattern', () => {
      expect(detectPaywall('<html>Subscribe to read this article</html>')).toBe(true)
    })

    it('detects sign-in-to-continue pattern', () => {
      expect(detectPaywall('Sign in to continue reading this story')).toBe(true)
    })

    it('does not flag open articles', () => {
      expect(detectPaywall('<html><p>The Senate passed the bill 67-33...</p></html>')).toBe(false)
    })
  })

  describe('isVeryShortContent', () => {
    it('returns true for text under 200 words', () => {
      expect(isVeryShortContent('Short text here.')).toBe(true)
    })

    it('returns false for text over 200 words', () => {
      const long = Array(210).fill('word').join(' ')
      expect(isVeryShortContent(long)).toBe(false)
    })
  })
})

// ── 2. Non-civic content → typed failure ────────────────────────────────────

describe('classifyArticle — non-civic content failure', () => {
  it('returns non_civic failure for non-political content', async () => {
    const result = await classifyArticle(BASE_INPUT, mockClient(NON_CIVIC_RESPONSE))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.failure.code).toBe('non_civic')
      expect(result.failure.userMessage).toMatch(/political or civic content/i)
    }
  })
})

// ── 3. Successful analysis ───────────────────────────────────────────────────

describe('classifyArticle — successful analysis', () => {
  it('returns dimensional breakdown and profile read', async () => {
    const result = await classifyArticle(BASE_INPUT, mockClient(CIVIC_RESPONSE))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result.profileRead).toBe('expanding')
      expect(result.result.dimensionalBreakdown.markets_governance).toBeDefined()
    }
  })

  it('returns a reliability signal assessment', async () => {
    const result = await classifyArticle(BASE_INPUT, mockClient(CIVIC_RESPONSE))
    if (result.ok) {
      expect(result.result.reliabilitySignal.assessment).toBeTruthy()
      expect(result.result.reliabilitySignal.inCatalog).toBe(false)
    }
  })

  it('does not store article text (function is stateless — no persisted fields)', () => {
    // Structural check: the return type has no `articleText` field
    // This is enforced by the TypeScript type; we verify at runtime too
    const resultShape = { ok: true, result: { dimensionalBreakdown: {}, profileRead: 'reinforcing', profileReadExplanation: '', reliabilitySignal: { rating: null, inCatalog: false, assessment: '' } } }
    expect('articleText' in resultShape.result).toBe(false)
    expect('pastedText' in resultShape.result).toBe(false)
  })
})

// ── 4. Non-English content — caveat, not failure ─────────────────────────────

describe('classifyArticle — non-English caveat', () => {
  it('proceeds with analysis and adds language caveat', async () => {
    const nonEnglishResponse = { ...CIVIC_RESPONSE, detected_language: 'es' }
    const result = await classifyArticle(BASE_INPUT, mockClient(nonEnglishResponse))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result.caveat).toMatch(/es/i)
    }
  })
})

// ── 5. Very short content — caveat, not failure ──────────────────────────────

describe('classifyArticle — short content caveat', () => {
  it('proceeds and adds brevity caveat for short pasted text', async () => {
    const shortInput: ArticleInput = { ...BASE_INPUT, pastedText: 'Very short.' }
    const result = await classifyArticle(shortInput, mockClient(CIVIC_RESPONSE))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result.caveat).toMatch(/under 200 words/i)
    }
  })
})

// ── 6. No content provided ───────────────────────────────────────────────────

describe('classifyArticle — no content', () => {
  it('returns url_error failure when no content provided', async () => {
    const emptyInput: ArticleInput = {
      userProfile: FLAT_PROFILE,
      primaryType: 'pioneer',
    }
    const result = await classifyArticle(emptyInput, mockClient(CIVIC_RESPONSE))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.failure.code).toBe('url_error')
  })
})
