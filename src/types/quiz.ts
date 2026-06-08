// The eight civic dimensions — each is a spectrum between two poles
export type Dimension =
  | 'stability_change'
  | 'local_federal'
  | 'national_global'
  | 'rules_outcomes'
  | 'markets_governance'
  | 'pragmatism_idealism'
  | 'individual_collective'
  | 'trust_skepticism'

// Which layer of the quiz
export type QuizLayer = 1 | 2 | 3 | 4

// A single answer option (A, B, C, or "It depends")
export type AnswerOption = 'A' | 'B' | 'C' | 'it_depends'

// Follow-up type after "It depends"
export type FollowUpType = 'open_text' | 'multiple_choice'

// One question in the quiz
export interface QuizQuestion {
  id: string               // e.g. "A1", "C3", "S2", "L2-Q4"
  layer: QuizLayer
  text: string
  optionA: string
  optionB: string
  optionC: string
  microReactionA?: string
  microReactionB?: string
  microReactionC?: string
  easterEgg?: { option: AnswerOption; text: string }
  followUpType: FollowUpType
  followUpPrompt: string
  followUpChoices?: string[]   // only for multiple_choice follow-ups
  primaryDimension: Dimension
  secondaryDimension?: Dimension
}

// One user's answer to one question
export interface QuizAnswer {
  questionId: string
  answer: AnswerOption
  followUpText?: string        // open text response
  followUpChoices?: string[]   // selected multiple choice items
}

// Scores on all eight dimensions — each value 0-100
// 0 = fully pole A (e.g. Stability), 100 = fully pole B (e.g. Change)
export interface DimensionalProfile {
  stability_change: number
  local_federal: number
  national_global: number
  rules_outcomes: number
  markets_governance: number
  pragmatism_idealism: number
  individual_collective: number
  trust_skepticism: number
}

// The ten civic types
export type CivicType =
  | 'honest_broker'
  | 'system_fixer'
  | 'long_gamer'
  | 'good_neighbor'
  | 'missourian'
  | 'eternal_optimist'
  | 'steward'
  | 'free_agent'
  | 'standard_bearer'
  | 'pioneer'

// Full quiz result for a user
export interface QuizResult {
  primaryType: CivicType
  secondaryTypes: CivicType[]   // 0-3 secondary types
  profile: DimensionalProfile
  completedLayers: QuizLayer[]
  completionPercent: number     // 40 / 65 / 85 / 100
}

// A quiz session — tracks where the user is
export interface QuizSession {
  id: string
  userId?: string              // null if anonymous/guest
  currentLayer: QuizLayer
  currentQuestionIndex: number
  answers: QuizAnswer[]
  completedLayers: QuizLayer[]
  startedAt: string
  updatedAt: string
  result?: QuizResult
}
