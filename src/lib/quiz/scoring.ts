// Provisional Phase-A scoring: turn a set of answers into a DimensionalProfile,
// then into a full QuizResult via the Mantle classifier.
//
// Method: for each dimension, average the implied positions of every chosen
// option that touches it. "It depends" contributes a genuine-center 50 on the
// axes that question probes. A dimension with no evidence stays at 50 (neutral) —
// the honest default, not a fabricated lean.

import type {
  Dimension,
  DimensionalProfile,
  QuizAnswer,
  QuizLayer,
  QuizQuestion,
  QuizResult,
} from '@/types/quiz'
import { IT_DEPENDS } from '@/types/quiz'
import { DIMENSIONS } from '@/lib/quiz/dimensions'
import { classifyProfile } from '@/lib/quiz/mantles'

export function scoreProfile(
  questions: QuizQuestion[],
  answers: QuizAnswer[]
): DimensionalProfile {
  const byId = new Map(questions.map((q) => [q.id, q]))
  const acc = new Map<Dimension, { sum: number; count: number }>(
    DIMENSIONS.map((d) => [d.key, { sum: 0, count: 0 }])
  )

  const add = (dim: Dimension, value: number) => {
    const a = acc.get(dim)!
    a.sum += value
    a.count += 1
  }

  for (const answer of answers) {
    const q = byId.get(answer.questionId)
    if (!q) continue

    if (answer.optionId === IT_DEPENDS) {
      for (const dim of q.dimensions) add(dim, 50)
      continue
    }

    const opt = q.options.find((o) => o.id === answer.optionId)
    if (!opt) continue
    for (const [dim, value] of Object.entries(opt.scores)) {
      add(dim as Dimension, value as number)
    }
  }

  const profile = {} as DimensionalProfile
  for (const d of DIMENSIONS) {
    const a = acc.get(d.key)!
    profile[d.key] = a.count > 0 ? Math.round(a.sum / a.count) : 50
  }
  return profile
}

const COMPLETION_BY_LAYERS: Record<number, number> = { 0: 0, 1: 40, 2: 65, 3: 85, 4: 100 }

export function buildResult(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
  topDimensions: Dimension[],
  completedLayers: QuizLayer[]
): QuizResult {
  const profile = scoreProfile(questions, answers)
  const { primary, secondary } = classifyProfile(profile)
  return {
    primaryType: primary,
    secondaryTypes: secondary,
    profile,
    topDimensions: topDimensions.slice(0, 3),
    completedLayers,
    completionPercent: COMPLETION_BY_LAYERS[completedLayers.length] ?? 0,
  }
}
