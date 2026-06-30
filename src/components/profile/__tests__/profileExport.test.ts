/**
 * Stage 10 — Profile export tests (§27.2)
 */

import { readFileSync } from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'

const COMPONENT_PATH = path.join(process.cwd(), 'src/components/profile/ProfileAccordion.tsx')
const source = readFileSync(COMPONENT_PATH, 'utf-8')

// Isolate just the handleExport function body to scope the exclusion checks
const exportFnStart = source.indexOf('function handleExport()')
const exportFnEnd = source.indexOf('\n  }\n\n  if (!session?.result)', exportFnStart)
const exportFn = exportFnStart > -1 && exportFnEnd > -1
  ? source.slice(exportFnStart, exportFnEnd)
  : source

describe('Profile export — inclusion / exclusion (§27.2)', () => {
  describe('Required fields are included', () => {
    it('exports Civic Mantle', () => expect(source).toContain('YOUR CIVIC MANTLE'))
    it('loops over DIMENSIONS for scores', () => expect(source).toContain('for (const dim of DIMENSIONS)'))
    it('exports secondary types', () => {
      expect(source).toContain('SECONDARY TYPES')
      expect(source).toContain('result.secondaryTypes')
    })
    it('exports dealbreaker selections', () => {
      expect(source).toContain('YOUR DEALBREAKERS')
      expect(source).toContain('session.dealbreakers')
    })
    it('exports demographic responses', () => {
      expect(source).toContain('ABOUT YOU')
      expect(source).toContain('session.demographics')
    })
    it('exports completion percentage', () => expect(source).toContain('result.completionPercent'))
    it('includes required footer text', () => {
      expect(source).toContain('Bedrock does not retain a copy of this export')
    })
  })

  describe('Display-name substitution', () => {
    it('secondary types use mantleFor().name (not raw internal key)', () => {
      expect(source).toContain('mantleFor(t).name')
      expect(source).not.toContain('lines.push(`  ${t}`)')
    })

    it('dealbreakers use DEALBREAKER_TEXT lookup with raw-id fallback', () => {
      expect(source).toContain('DEALBREAKER_TEXT')
      expect(source).toContain('DEALBREAKER_TEXT[d] ?? d')
      expect(source).not.toContain('lines.push(`  • ${d}`)')
    })
  })

  describe('Excluded content (§27.2 — does NOT include)', () => {
    it('does not export conversation history', () => {
      expect(exportFn).not.toContain('conversationHistory')
      expect(exportFn).not.toContain('conversation_history')
    })
    it('does not export feedback data', () => {
      expect(exportFn).not.toContain('feedback')
      expect(exportFn).not.toContain('thumbs')
    })
  })

  describe('Download mechanics', () => {
    it('creates a text/plain Blob', () => expect(source).toContain('text/plain;charset=utf-8'))
    it('downloads as .txt', () => expect(source).toContain('.txt'))
    it('uses createObjectURL / a.click() / revokeObjectURL', () => {
      expect(source).toContain('createObjectURL')
      expect(source).toContain('a.click()')
      expect(source).toContain('revokeObjectURL')
    })
  })
})
