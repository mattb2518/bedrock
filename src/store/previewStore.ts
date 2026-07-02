"use client"

// Lightweight preview-mode store — never persisted, lives in memory only.
// Allows admins to simulate New User or any Mantle Type without touching
// real Supabase data or the persisted quiz store.

import { create } from 'zustand'
import type { CivicType, QuizResult } from '@/types/quiz'

export type PreviewMode = 'myself' | 'new_user' | 'mantle'

interface PreviewStore {
  mode: PreviewMode
  mantleType: CivicType | null
  // Synthetic result for the active preview; null in 'myself' and 'new_user' modes.
  previewResult: QuizResult | null

  activate: (mode: PreviewMode, mantleType?: CivicType, previewResult?: QuizResult | null) => void
  exit: () => void
}

export const usePreviewStore = create<PreviewStore>()((set) => ({
  mode: 'myself',
  mantleType: null,
  previewResult: null,

  activate: (mode, mantleType = undefined, previewResult = null) =>
    set({ mode, mantleType: mantleType ?? null, previewResult: previewResult ?? null }),

  exit: () =>
    set({ mode: 'myself', mantleType: null, previewResult: null }),
}))
