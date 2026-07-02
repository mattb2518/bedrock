"use client"

import { useEffect } from "react"
import { useQuizStore } from "@/store/quizStore"
import { saveProfileDebounced } from "@/lib/quiz/sync"
import { createClient } from "@/lib/supabase/client"

// Subscribes to quiz store changes and debounce-writes to Supabase for
// signed-in users. Also re-attaches the auth user whenever a session exists
// without a userId (e.g. after retaking the quiz resets the session).
export default function SyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let authedUserId: string | null = null
    createClient().auth.getUser().then(({ data }) => {
      authedUserId = data.user?.id ?? null
      const s = useQuizStore.getState()
      if (authedUserId && s.session && !s.session.userId) s.attachUser(authedUserId)
    })
    const unsub = useQuizStore.subscribe((state) => {
      if (authedUserId && state.session && !state.session.userId) {
        // e.g. after a retake — relink so it saves and isn't treated as anonymous
        useQuizStore.getState().attachUser(authedUserId)
        return
      }
      if (state.session?.userId) saveProfileDebounced(state.session)
    })
    return unsub
  }, [])

  return <>{children}</>
}
