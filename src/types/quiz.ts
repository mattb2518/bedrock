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

// Follow-up shown after the "It depends" choice
export type FollowUpType = 'open_text' | 'multiple_choice'

// One substantive answer option.
//
// `id` is STABLE and scoring keys off it — never off display order — because
// SPEC §5 randomizes option order on screen. `scores` is the option's implied
// position on each dimension it touches (0 = pole A, 100 = pole B). An anchor
// option usually touches one dimension; crossover two; synthesis three-plus.
export interface AnswerOption {
  id: string
  text: string
  microReaction?: string
  scores: Partial<Record<Dimension, number>>
  // Some options open their own text field on selection (e.g. the Layer 3
  // capstone's "name it yourself" option) — distinct from the It-depends route.
  followUpPrompt?: string
}

// One question. Every Layer 1 question also offers an implicit "It depends"
// choice (id `it_depends`) that routes to `dependsFollowUp` and scores neutral.
export interface QuizQuestion {
  id: string // e.g. "A1", "C3", "S2"
  layer: QuizLayer
  text: string
  dimensions: Dimension[] // axes this question informs
  options: AnswerOption[] // 3–4 substantive options
  dependsFollowUp: {
    type: FollowUpType
    prompt: string
    choices?: string[] // present only for multiple_choice
  }
  easterEgg?: string // shown to ALL users after they answer (SPEC [EE])
  note?: string // authoring note (e.g. A1's fourth-option rationale)
}

// The sentinel option id for "It depends"
export const IT_DEPENDS = 'it_depends' as const

// One user's answer to one question
export interface QuizAnswer {
  questionId: string
  optionId: string // a real option id, or IT_DEPENDS
  dependsText?: string // open-text follow-up response
  dependsChoices?: string[] // selected multiple-choice follow-up items
}

// Scores on all eight dimensions — each value 0–100
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
  secondaryTypes: CivicType[] // 0–3 secondary types
  profile: DimensionalProfile
  topDimensions: Dimension[] // up to 3 the user flagged most central
  completedLayers: QuizLayer[]
  completionPercent: number // 40 / 65 / 85 / 100
}

// Optional post-quiz demographic context (SPEC §12). Calibration only — never
// part of dimensional scoring. Every field is optional; the whole module is
// skippable.
export interface Demographics {
  zipCode?: string // U.S. ZIP — used to match local races in Your Ballot and Beyond Your Ballot
  partyRelationship?: string
  currentRegistration?: string // how the user is registered to vote today
  upbringing?: string // the political environment they grew up in (formative)
  lineage?: string
  ageRange?: string
  geography?: string
  region?: string
  regionGrewUp?: string // region they grew up in (formative, pairs with age + upbringing)
  note?: string
  mediaSources?: string // context_media_sources: news sources the user already reads (SPEC §12 A11)
  completed?: boolean // user reached and dismissed the module (answered or skipped)
}

// A quiz session — tracks where the user is
export interface QuizSession {
  id: string
  userId?: string // null if anonymous/guest
  currentLayer: QuizLayer
  currentQuestionIndex: number
  answers: QuizAnswer[]
  topDimensions: Dimension[] // from the Layer 1 importance closer (≤3)
  dealbreakers: string[] // selected Layer 4 item ids (hard exclusion filters)
  dealbreakerOther?: string // free-text dealbreaker
  demographics?: Demographics // optional post-quiz calibration context
  skipEasterEggs?: boolean // user opted out of the between-question "Did you know?" beats
  completedLayers: QuizLayer[]
  startedAt: string
  updatedAt: string
  result?: QuizResult
}
