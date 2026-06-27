import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Demographics,
  Dimension,
  QuizAnswer,
  QuizLayer,
  QuizResult,
  QuizSession,
} from '@/types/quiz'

interface QuizStore {
  session: QuizSession | null

  // Start a fresh quiz (anonymous)
  startSession: () => void

  // Record/replace an answer (keyed by questionId) and advance one step
  submitAnswer: (answer: QuizAnswer) => void

  // Step back one question (no-op at the start)
  goBack: () => void

  // The Layer 1 importance closer — up to 3 dimensions
  setTopDimensions: (dims: Dimension[]) => void

  // Layer 4 dealbreakers
  setDealbreakers: (ids: string[]) => void
  setDealbreakerOther: (text: string) => void

  // Post-quiz demographic module (optional calibration)
  setDemographics: (demo: Demographics) => void

  // User opted out of the between-question easter-egg beats
  setSkipEasterEggs: (skip: boolean) => void

  // Mark a layer complete and advance to the next
  completeLayer: (layer: QuizLayer) => void

  // Store the computed result
  setResult: (result: QuizResult) => void

  // Clear everything (e.g. user wants to retake)
  resetQuiz: () => void

  // Attach a user ID after account creation
  attachUser: (userId: string) => void
}

function newSession(): QuizSession {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    currentLayer: 1,
    currentQuestionIndex: 0,
    answers: [],
    topDimensions: [],
    dealbreakers: [],
    completedLayers: [],
    startedAt: now,
    updatedAt: now,
  }
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      session: null,

      startSession: () => set({ session: newSession() }),

      submitAnswer: (answer) =>
        set((state) => {
          if (!state.session) return state
          // Replace any prior answer to this question, else append.
          const existing = state.session.answers.findIndex(
            (a) => a.questionId === answer.questionId
          )
          const answers = [...state.session.answers]
          if (existing >= 0) answers[existing] = answer
          else answers.push(answer)
          return {
            session: {
              ...state.session,
              answers,
              currentQuestionIndex: state.session.currentQuestionIndex + 1,
              updatedAt: new Date().toISOString(),
            },
          }
        }),

      goBack: () =>
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              currentQuestionIndex: Math.max(
                0,
                state.session.currentQuestionIndex - 1
              ),
              updatedAt: new Date().toISOString(),
            },
          }
        }),

      setTopDimensions: (dims) =>
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              topDimensions: dims.slice(0, 3),
              updatedAt: new Date().toISOString(),
            },
          }
        }),

      setDealbreakers: (ids) =>
        set((state) =>
          state.session
            ? { session: { ...state.session, dealbreakers: ids, updatedAt: new Date().toISOString() } }
            : state
        ),

      setDealbreakerOther: (text) =>
        set((state) =>
          state.session
            ? { session: { ...state.session, dealbreakerOther: text, updatedAt: new Date().toISOString() } }
            : state
        ),

      setDemographics: (demo) =>
        set((state) =>
          state.session
            ? { session: { ...state.session, demographics: demo, updatedAt: new Date().toISOString() } }
            : state
        ),

      setSkipEasterEggs: (skip) =>
        set((state) =>
          state.session
            ? { session: { ...state.session, skipEasterEggs: skip, updatedAt: new Date().toISOString() } }
            : state
        ),

      completeLayer: (layer) =>
        set((state) => {
          if (!state.session) return state
          const completedLayers = state.session.completedLayers.includes(layer)
            ? state.session.completedLayers
            : [...state.session.completedLayers, layer]
          const nextLayer = (layer + 1) as QuizLayer
          return {
            session: {
              ...state.session,
              completedLayers,
              currentLayer: nextLayer <= 4 ? nextLayer : layer,
              currentQuestionIndex: 0,
              updatedAt: new Date().toISOString(),
            },
          }
        }),

      setResult: (result) =>
        set((state) => {
          if (!state.session) return state
          return {
            session: { ...state.session, result, updatedAt: new Date().toISOString() },
          }
        }),

      resetQuiz: () => set({ session: null }),

      attachUser: (userId) =>
        set((state) => {
          if (!state.session) return state
          return { session: { ...state.session, userId } }
        }),
    }),
    {
      name: 'bedrock-quiz', // key in browser localStorage
    }
  )
)
