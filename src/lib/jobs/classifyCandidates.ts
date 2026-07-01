import { inngest } from '@/lib/inngest'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOrClassifyCandidate } from '@/lib/civic/classificationQueue'
import type { ClassificationQueueEntry } from '@/lib/civic/classificationQueue'

export const classifyCandidatesJob = inngest.createFunction(
  {
    id: 'classify-candidates',
    name: 'Classify pending candidates',
    timeouts: { finish: '5m' },
    triggers: [{ event: 'bedrock/candidates.classify' }],
  },
  async ({ event, step }) => {
    const candidateEntries: ClassificationQueueEntry[] = event.data?.candidates ?? []

    if (candidateEntries.length > 0) {
      const results = await step.run('classify-specific', async () => {
        const out: Array<{ id: string; ok: boolean }> = []
        for (const entry of candidateEntries) {
          try {
            await getOrClassifyCandidate(entry)
            out.push({ id: entry.id, ok: true })
          } catch {
            out.push({ id: entry.id, ok: false })
          }
        }
        return out
      })
      return results
    }

    // Otherwise classify all pending candidates from DB
    const admin = createAdminClient()
    const rows = await step.run('fetch-pending', async () => {
      const { data } = await admin
        .from('classified_candidates')
        .select('*')
        .eq('status', 'pending_review')
        .is('axis_placement', null)
        .limit(50)
      return data ?? []
    })

    const results: Array<{ id: string; ok: boolean }> = []
    for (const row of rows) {
      const entry: ClassificationQueueEntry = {
        id: row.candidate_id,
        name: row.name,
        office: row.office ?? '',
        officeType: row.office_type ?? 'federal',
        district: row.district ?? '',
        party: row.party ?? '',
        coverageTier: row.coverage_tier ?? 'standard',
        sourcedFrom: row.sourced_from ?? [],
      }
      const r = await step.run(`classify-candidate-${entry.id}`, async () => {
        try {
          await getOrClassifyCandidate(entry)
          return { id: entry.id, ok: true }
        } catch {
          return { id: entry.id, ok: false }
        }
      })
      results.push(r)
    }
    return results
  }
)
