"use client"

// Lightweight preview-mode store — never persisted, lives in memory only.
// Allows admins to simulate New User or any Mantle Type without touching
// real Supabase data or the persisted quiz store.

import { create } from 'zustand'
import type { CivicType, QuizSession } from '@/types/quiz'

export type PreviewMode = 'myself' | 'new_user' | 'mantle'

interface PreviewStore {
  mode: PreviewMode
  mantleType: CivicType | null
  // Snapshot of the real session taken before preview activates, so we can restore it.
  savedSession: QuizSession | null

  activate: (mode: PreviewMode, mantleType?: CivicType, currentSession?: QuizSession | null) => void
  exit: () => void
}

export const usePreviewStore = create<PreviewStore>()((set) => ({
  mode: 'myself',
  mantleType: null,
  savedSession: null,

  activate: (mode, mantleType = undefined, currentSession = null) =>
    set((s) => ({
      mode,
      mantleType: mantleType ?? null,
      // Only save the real session the first time we leave 'myself' mode
      savedSession: s.mode === 'myself' ? currentSession : s.savedSession,
    })),

  exit: () =>
    set({ mode: 'myself', mantleType: null }),
}))
