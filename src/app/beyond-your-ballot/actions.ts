'use server'

import { getOrClassifyCandidate, type ClassificationQueueEntry } from '@/lib/civic/classificationQueue'

/**
 * Fire-and-forget classification for BYB candidates that lack axisPlacement.
 * Current static data is fully pre-classified, so this is a no-op today.
 * When real candidates are added to beyond-ballot-candidates.ts without
 * axisPlacement, they will be classified on first page access.
 */
export async function triggerBYBClassification(
  entries: ClassificationQueueEntry[]
): Promise<void> {
  await Promise.all(entries.map((e) => getOrClassifyCandidate(e)))
}
