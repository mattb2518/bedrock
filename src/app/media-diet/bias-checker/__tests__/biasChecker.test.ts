import { describe, it, expect } from 'vitest'
import {
  detectSocialMedia,
  detectPaywall,
  isVeryShortContent,
} from '@/lib/classification/classifyArticle'

// These failure-state detectors live in classifyArticle.ts (Stage 3) but are
// exercised here specifically in the context of how the Bias Checker UI uses
// them — confirming the right message fires for the right input condition.

// ── detectSocialMedia ─────────────────────────────────────────────────────────

describe('detectSocialMedia — failure state routing', () => {
  it('Twitter/X URL → social media caveat (proceed, not hard fail)', () => {
    expect(detectSocialMedia('https://x.com/user/status/1234567890')).toBe(true)
    expect(detectSocialMedia('https://twitter.com/user/status/1234567890')).toBe(true)
  })

  it('Facebook URL → social media caveat', () => {
    expect(detectSocialMedia('https://www.facebook.com/share/p/foo')).toBe(true)
  })

  it('Bluesky URL → social media caveat', () => {
    expect(detectSocialMedia('https://bsky.app/profile/user.bsky.social/post/abc')).toBe(true)
  })

  it('Real news article URL → NOT flagged as social media', () => {
    expect(detectSocialMedia('https://www.nytimes.com/2026/01/01/us/politics/story.html')).toBe(false)
    expect(detectSocialMedia('https://thedispatch.com/article/some-piece')).toBe(false)
    expect(detectSocialMedia('https://popular.info/p/article')).toBe(false)
  })
})

// ── detectPaywall ─────────────────────────────────────────────────────────────

describe('detectPaywall — failure state routing', () => {
  it('"subscribe to read" → paywall failure', () => {
    expect(detectPaywall('Please subscribe to read this article.')).toBe(true)
  })

  it('"sign in to continue" → paywall failure', () => {
    expect(detectPaywall('You must sign in to continue reading.')).toBe(true)
  })

  it('open article body → NOT a paywall', () => {
    expect(detectPaywall('<html><body><p>The president signed the bill today...</p></body></html>')).toBe(false)
  })
})

// ── isVeryShortContent ────────────────────────────────────────────────────────

describe('isVeryShortContent — short-content caveat routing', () => {
  it('text with fewer than 200 words → proceed with brevity caveat', () => {
    const short = 'This is a short piece. '.repeat(5)  // ~25 words
    expect(isVeryShortContent(short)).toBe(true)
  })

  it('text with 200+ words → no caveat', () => {
    const long = 'word '.repeat(200)
    expect(isVeryShortContent(long)).toBe(false)
  })

  it('boundary: exactly 199 words → caveat', () => {
    const nearBoundary = 'word '.repeat(199)
    expect(isVeryShortContent(nearBoundary)).toBe(true)
  })

  it('boundary: exactly 200 words → no caveat', () => {
    const atBoundary = 'word '.repeat(200)
    expect(isVeryShortContent(atBoundary)).toBe(false)
  })
})

// ── Failure code → message mapping (matches §24b.3 verbatim) ─────────────────

describe('failure code → UI message mapping', () => {
  const FAILURE_MESSAGES = {
    paywall:
      "We can't access this article — it's behind a paywall. Paste the text instead and we'll analyze it.",
    url_error:
      "We couldn't reach that URL. Try pasting the text directly.",
    image_only_pdf:
      "This PDF appears to be a scanned image rather than a text document. We can't extract text from it. Try copying and pasting the text manually.",
    non_civic:
      "This doesn't appear to be political or civic content. The Article Bias Checker works best on journalism, opinion pieces, and policy writing. Want to try a different article?",
  }

  it('paywall message matches §24b.3 spec verbatim', () => {
    expect(FAILURE_MESSAGES.paywall).toContain("behind a paywall")
    expect(FAILURE_MESSAGES.paywall).toContain("Paste the text instead")
  })

  it('url_error message matches §24b.3 spec verbatim', () => {
    expect(FAILURE_MESSAGES.url_error).toContain("couldn't reach that URL")
    expect(FAILURE_MESSAGES.url_error).toContain("pasting the text directly")
  })

  it('image_only_pdf message matches §24b.3 spec verbatim', () => {
    expect(FAILURE_MESSAGES.image_only_pdf).toContain("scanned image")
    expect(FAILURE_MESSAGES.image_only_pdf).toContain("copying and pasting the text manually")
  })

  it('non_civic message matches §24b.3 spec verbatim', () => {
    expect(FAILURE_MESSAGES.non_civic).toContain("political or civic content")
    expect(FAILURE_MESSAGES.non_civic).toContain("Want to try a different article?")
  })

  it('all four failure codes have a corresponding message', () => {
    const codes = ['paywall', 'url_error', 'image_only_pdf', 'non_civic'] as const
    for (const code of codes) {
      expect(FAILURE_MESSAGES[code]).toBeTruthy()
    }
  })
})

// ── Input mode auto-detection (URL pasted into paste tab) ────────────────────

describe('URL auto-detection logic', () => {
  function shouldAutoSwitchToUrl(text: string): boolean {
    return /^https?:\/\//i.test(text.trim())
  }

  it('http:// URL triggers auto-switch to URL mode', () => {
    expect(shouldAutoSwitchToUrl('http://example.com/article')).toBe(true)
  })

  it('https:// URL triggers auto-switch to URL mode', () => {
    expect(shouldAutoSwitchToUrl('https://popular.info/p/article')).toBe(true)
  })

  it('plain article text does NOT trigger auto-switch', () => {
    expect(shouldAutoSwitchToUrl('The president signed the bill...')).toBe(false)
  })

  it('URL with leading whitespace still triggers switch after trim', () => {
    expect(shouldAutoSwitchToUrl('  https://example.com  ')).toBe(true)
  })

  it('bare domain without protocol does NOT trigger switch', () => {
    expect(shouldAutoSwitchToUrl('example.com/article')).toBe(false)
  })
})
