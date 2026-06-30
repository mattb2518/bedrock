'use server'

import { requireAdminRole } from '@/lib/auth/requireRole'
import { analyzeFeedback } from '@/lib/admin/feedbackAnalysis'
import { createAdminClient } from '@/lib/supabase/admin'
import type { FeedbackAnalysisResult } from '@/lib/admin/feedbackAnalysis'

export async function analyzeFeedbackAction(
  type: 'candidate' | 'source',
  entityId: string,
  freeTextResponses: string[],
  chips: string[]
): Promise<FeedbackAnalysisResult> {
  await requireAdminRole()

  const admin = createAdminClient()
  const table = type === 'candidate' ? 'classified_candidates' : 'classified_sources'
  const idCol = type === 'candidate' ? 'candidate_id' : 'source_id'

  const { data: row } = await admin
    .from(table)
    .select('name, axis_placement, source_evidence, status')
    .eq(idCol, entityId)
    .single()

  // Compute chip frequency from the array
  const chipFrequency: Record<string, number> = {}
  for (const chip of chips) {
    chipFrequency[chip] = (chipFrequency[chip] ?? 0) + 1
  }

  // Fetch total/thumbsDown counts
  const feedbackTable = type === 'candidate' ? 'candidate_feedback' : 'source_feedback'
  const feedbackIdCol = type === 'candidate' ? 'candidate_id' : 'source_id'

  const { data: feedbackRows } = await admin
    .from(feedbackTable)
    .select('feedback_type')
    .eq(feedbackIdCol, entityId)

  const total = feedbackRows?.length ?? 0
  const thumbsDown = feedbackRows?.filter((r) => r.feedback_type === 'thumbs_down').length ?? 0

  return analyzeFeedback({
    entityId,
    entityName: row?.name ?? entityId,
    entityType: type,
    totalFeedback: total,
    thumbsDown,
    thumbsUp: total - thumbsDown,
    axisPlacement: row?.axis_placement ?? {},
    confidenceBandOrTier: row?.status ?? 'unknown',
    sourceEvidence: row?.source_evidence ?? [],
    freeTextResponses,
    chipFrequency,
  })
}
