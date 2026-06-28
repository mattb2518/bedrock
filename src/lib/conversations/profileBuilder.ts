import type { QuizSession } from '@/types/quiz'
import { mantleFor } from '@/lib/quiz/mantles'
import { LAYER2_QUESTIONS } from '@/lib/quiz/layer2'
import { LAYER3_QUESTIONS } from '@/lib/quiz/layer3'
import { DEALBREAKER_TEXT } from '@/lib/quiz/layer4'
import { DIMENSIONS } from '@/lib/quiz/dimensions'

export interface ProfilePlaceholders {
  hasProfile: boolean
  mantle_type: string
  mantle_oneliner: string
  dimensional_summary: string
  top_dimensions: string
  secondary_types: string
  layer2_positions: string
  layer3_drivers: string
  lineage: string
  layer4_dealbreakers: string
}

function leanPhrase(score: number, poleA: string, poleB: string): string {
  if (score <= 20) return `strongly ${poleA}`
  if (score <= 35) return `${poleA}-leaning`
  if (score <= 65) return `near-center`
  if (score <= 80) return `${poleB}-leaning`
  return `strongly ${poleB}`
}

export function buildProfilePlaceholders(session: QuizSession): ProfilePlaceholders {
  const {
    result,
    demographics,
    dealbreakers = [],
    dealbreakerOther,
    topDimensions = [],
    answers,
  } = session

  if (!result) {
    return {
      hasProfile: false,
      mantle_type: '',
      mantle_oneliner: '',
      dimensional_summary: '',
      top_dimensions: '',
      secondary_types: '',
      layer2_positions: '(not yet completed)',
      layer3_drivers: '(not yet completed)',
      lineage: '(not provided)',
      layer4_dealbreakers: '(none specified)',
    }
  }

  const mantle = mantleFor(result.primaryType)

  const dimPhrases = DIMENSIONS.map(d => {
    const score = result.profile[d.key]
    return `${d.poleA}↔${d.poleB}: ${leanPhrase(score, d.poleA, d.poleB)}`
  })

  const topDimStr =
    topDimensions.length > 0
      ? topDimensions
          .map(d => {
            const dim = DIMENSIONS.find(x => x.key === d)
            return dim ? `${dim.poleA}↔${dim.poleB}` : d
          })
          .join(', ')
      : 'not flagged'

  const secondaryStr =
    result.secondaryTypes?.length > 0
      ? `Also clusters near: ${result.secondaryTypes
          .slice(0, 2)
          .map(t => mantleFor(t).name)
          .join(' and ')}.`
      : ''

  // Layer 2 issue positions
  const l2Answers = answers.filter(a => a.questionId.startsWith('L2-'))
  let layer2Str = '(not yet completed)'
  if (l2Answers.length > 0) {
    const parts = l2Answers
      .map(a => {
        const q = LAYER2_QUESTIONS.find(q => q.id === a.questionId)
        const opt = q?.options.find(o => o.id === a.optionId)
        if (!q || !opt) return null
        const topic = q.text.split(' Of ')[0].replace(/\.$/, '').substring(0, 50)
        const answer =
          opt.text.substring(0, 80).trimEnd() + (opt.text.length > 80 ? '...' : '')
        return `[${topic}]: "${answer}"`
      })
      .filter((x): x is string => Boolean(x))
    if (parts.length > 0) layer2Str = `(${parts.join(' | ')})`
  }

  // Layer 3 voting drivers
  const l3Answers = answers.filter(a => a.questionId.startsWith('L3-'))
  let layer3Str = '(not yet completed)'
  if (l3Answers.length > 0) {
    const parts = l3Answers
      .slice(0, 5)
      .map(a => {
        const q = LAYER3_QUESTIONS.find(q => q.id === a.questionId)
        const opt = q?.options.find(o => o.id === a.optionId)
        if (!q || !opt) return null
        return `"${opt.text.substring(0, 80).trimEnd()}${opt.text.length > 80 ? '...' : ''}"`
      })
      .filter((x): x is string => Boolean(x))
    if (parts.length > 0) layer3Str = `(${parts.join(' | ')})`
  }

  // Lineage + party relationship — age/region/geography NEVER included
  const lineageParts: string[] = []
  if (demographics?.lineage) lineageParts.push(`grew up around: ${demographics.lineage}`)
  if (demographics?.partyRelationship)
    lineageParts.push(`relationship to parties: ${demographics.partyRelationship}`)
  const lineageStr =
    lineageParts.length > 0 ? `(${lineageParts.join('; ')})` : '(not provided)'

  // Dealbreakers
  const dbTexts = dealbreakers.map(id => DEALBREAKER_TEXT[id]).filter(Boolean)
  const dbAll = [...dbTexts]
  if (dealbreakerOther) dbAll.push(`(their words): "${dealbreakerOther}"`)
  const dbStr = dbAll.length > 0 ? `(${dbAll.join('; ')})` : '(none specified)'

  return {
    hasProfile: true,
    mantle_type: mantle.name,
    mantle_oneliner: mantle.oneLiner,
    dimensional_summary: dimPhrases.join('; '),
    top_dimensions: topDimStr,
    secondary_types: secondaryStr,
    layer2_positions: layer2Str,
    layer3_drivers: layer3Str,
    lineage: lineageStr,
    layer4_dealbreakers: dbStr,
  }
}
