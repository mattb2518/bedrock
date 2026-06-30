/**
 * Stage 10 — Methodology page content tests
 */

import { readFileSync } from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'

const PAGE_PATH = path.join(process.cwd(), 'src/app/methodology/page.tsx')
const source = readFileSync(PAGE_PATH, 'utf-8')

describe('Methodology page — pillar section content (§25)', () => {
  describe('Pillar IDs exist for cross-linking', () => {
    it('has id="quiz"', () => expect(source).toContain("id: 'quiz'"))
    it('has id="ballot"', () => expect(source).toContain("id: 'ballot'"))
    it('has id="media-diet"', () => expect(source).toContain("id: 'media-diet'"))
    it('has id="conversations"', () => expect(source).toContain("id: 'conversations'"))
    it('has id="beyond-ballot"', () => expect(source).toContain("id: 'beyond-ballot'"))
  })

  describe("Claude's role paragraphs are pillar-specific (§25.1)", () => {
    it('Media Diet section mentions Perplexity', () => {
      expect(source).toContain('Perplexity')
    })
    it('Conversations section mentions Ladder of Inference', () => {
      expect(source).toContain('Ladder of Inference')
    })
    it('Conversations section mentions Argyris (§25.2)', () => {
      expect(source).toContain('Argyris')
    })
    it('BYB section mentions governance filter criteria (§25.3)', () => {
      expect(source).toContain('party-line voting rate above 85%')
    })
    it('Quiz section says Claude has no role in the quiz engine', () => {
      expect(source).toContain('none. The quiz engine is deterministic')
    })
  })

  describe('GitHub link', () => {
    it('links to the public GitHub repo', () => {
      expect(source).toContain('github.com/mattb2518/bedrock')
    })
  })

  describe('FAQ cross-links', () => {
    it('links to faq-ballot', () => expect(source).toContain('faq-ballot'))
    it('links to faq-media-diet', () => expect(source).toContain('faq-media-diet'))
    it('links to faq-conversations', () => expect(source).toContain('faq-conversations'))
    it('links to faq-beyond-ballot', () => expect(source).toContain('faq-beyond-ballot'))
  })
})
