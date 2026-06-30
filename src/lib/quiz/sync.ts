"use client"

import { createClient } from "@/lib/supabase/client"
import type { QuizSession } from "@/types/quiz"

// Debounce handle — module-level so repeated calls share the timer
let _saveTimer: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 1500

// ────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────────────────────

function sessionToRow(userId: string, session: QuizSession) {
  return {
    user_id: userId,
    answers: session.answers,
    result: session.result ?? null,
    demographics: session.demographics ?? null,
    dealbreakers: session.dealbreakers,
    dealbreaker_other: session.dealbreakerOther ?? null,
    top_dimensions: session.topDimensions,
    primary_type: session.result?.primaryType ?? null,
    completion_percent: session.result?.completionPercent ?? completionFromLayers(session.completedLayers),
    completed_layers: session.completedLayers,
    started_at: session.startedAt,
  }
}

function completionFromLayers(completedLayers: number[]): number {
  // 40 / 65 / 85 / 100 per spec §5 — matches QuizResult.completionPercent values
  const map: Record<number, number> = { 1: 40, 2: 65, 3: 85, 4: 100 }
  if (completedLayers.length === 0) return 0
  return map[Math.max(...completedLayers)] ?? 0
}

// ────────────────────────────────────────────────────────────────────────────
// loadProfile — fetch the signed-in user's row and return it (or null)
// Callers hydrate the store from the returned session fields.
// ────────────────────────────────────────────────────────────────────────────
export async function loadProfile(): Promise<Partial<QuizSession> | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("quiz_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error || !data) return null

  return {
    answers: data.answers ?? [],
    result: data.result ?? undefined,
    demographics: data.demographics ?? undefined,
    dealbreakers: data.dealbreakers ?? [],
    dealbreakerOther: data.dealbreaker_other ?? undefined,
    topDimensions: data.top_dimensions ?? [],
    completedLayers: data.completed_layers ?? [],
    startedAt: data.started_at ?? new Date().toISOString(),
    updatedAt: data.updated_at,
    userId: user.id,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// saveProfile — upsert the current session to Supabase.
// Call directly at milestones (layer complete, reveal, dealbreakers, demographics).
// For continuous changes, use saveProfileDebounced.
// ────────────────────────────────────────────────────────────────────────────
export async function saveProfile(session: QuizSession): Promise<void> {
  if (!session.userId) return

  const supabase = createClient()
  const row = sessionToRow(session.userId, session)

  const { error } = await supabase
    .from("quiz_profiles")
    .upsert(row, { onConflict: "user_id" })

  if (error) {
    console.error("[sync] saveProfile failed:", error.message)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// saveProfileDebounced — debounced write for store subscriptions.
// Anonymous sessions are silently skipped.
// ────────────────────────────────────────────────────────────────────────────
export function saveProfileDebounced(session: QuizSession): void {
  if (!session.userId) return
  if (_saveTimer) clearTimeout(_saveTimer)
  _saveTimer = setTimeout(() => {
    saveProfile(session)
    _saveTimer = null
  }, DEBOUNCE_MS)
}

// ────────────────────────────────────────────────────────────────────────────
// mergeLocalIntoCloud — called on sign-in to reconcile anonymous local state
// with whatever exists in Supabase.
//
// Resolution rule: most-complete profile wins, then newest.
//
// NOTE: This conflict path is intentionally rare now that Supabase is the
// authoritative store for signed-in users. The meaningful case is the
// anonymous→account transition: someone did layers 1–3 on a device without an
// account, then signs in / creates an account. After that first merge, local
// state is just a cache — a true cloud-vs-cloud conflict can only happen if
// the user clears localStorage mid-session on a device they were already
// signed into, which is not a real scenario we need to guard against.
//
// Returns the winning session fragment for the caller to hydrate the store.
// ────────────────────────────────────────────────────────────────────────────
export async function mergeLocalIntoCloud(
  userId: string,
  localSession: QuizSession | null
): Promise<Partial<QuizSession> | null> {
  const supabase = createClient()

  // Fetch existing cloud row (may be absent on first sign-up)
  const { data: cloud } = await supabase
    .from("quiz_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  const localCompletion = localSession
    ? (localSession.result?.completionPercent ?? completionFromLayers(localSession.completedLayers))
    : 0
  const cloudCompletion = cloud?.completion_percent ?? 0

  // If local is strictly more complete, or equally complete but newer, push local up
  const localWins =
    localSession &&
    (localCompletion > cloudCompletion ||
      (localCompletion === cloudCompletion &&
        localSession.updatedAt > (cloud?.updated_at ?? "")))

  if (localWins && localSession) {
    await saveProfile({ ...localSession, userId })
    return { ...localSession, userId }
  }

  // Otherwise return cloud data (or null if nothing exists yet)
  if (!cloud) return null

  return {
    answers: cloud.answers ?? [],
    result: cloud.result ?? undefined,
    demographics: cloud.demographics ?? undefined,
    dealbreakers: cloud.dealbreakers ?? [],
    dealbreakerOther: cloud.dealbreaker_other ?? undefined,
    topDimensions: cloud.top_dimensions ?? [],
    completedLayers: cloud.completed_layers ?? [],
    startedAt: cloud.started_at ?? new Date().toISOString(),
    updatedAt: cloud.updated_at,
    userId,
  }
}
