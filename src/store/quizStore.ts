import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuizAnswer, QuizLayer, QuizSession } from '@/types/quiz'

interface QuizStore {
  session: QuizSession | null
  isLoading: boolean

  // Start a fresh quiz (anonymous)
  startSession: () => void

  // Record an answer and advance
  submitAnswer: (answer: QuizAnswer) => void

  // Mark a layer complete
  completeLayer: (layer: QuizLayer) => void

  // Clear everything (e.g. user wants to retake)
  resetQuiz: () => void

  // Attach a user ID after account creation
  attachUser: (userId: string) => void
}

function newSession(): QuizSession {
  return {
    id: crypto.randomUUID(),
    currentLayer: 1,
    currentQuestionIndex: 0,
    answers: [],
    completedLayers: [],
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,

      startSession: () =>
        set({ session: newSession() }),

      submitAnswer: (answer) =>
        set((state) => {
          if (!state.session) return state
          const answers = [...state.session.answers, answer]
          return {
            session: {
              ...state.session,
              answers,
              currentQuestionIndex: state.session.currentQuestionIndex + 1,
              updatedAt: new Date().toISOString(),
            },
          }
        }),

      completeLayer: (layer) =>
        set((state) => {
          if (!state.session) return state
          const completedLayers = [...state.session.completedLayers, layer]
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

      resetQuiz: () => set({ session: null }),

      attachUser: (userId) =>
        set((state) => {
          if (!state.session) return state
          return {
            session: { ...state.session, userId },
          }
        }),
    }),
    {
      name: 'bedrock-quiz',  // key in browser localStorage
    }
  )
)
