"use client"

import { useEffect } from "react"
import { useQuizStore } from "@/store/quizStore"
import { saveProfileDebounced } from "@/lib/quiz/sync"

// Subscribes to quiz store changes and debounce-writes to Supabase for
// signed-in users. Anonymous sessions are silently skipped by saveProfileDebounced.
export default function SyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsub = useQuizStore.subscribe((state) => {
      if (state.session?.userId) {
        saveProfileDebounced(state.session)
      }
    })
    return unsub
  }, [])

  return <>{children}</>
}
