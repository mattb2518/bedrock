import { inngest } from '@/lib/inngest'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { classifySource } from '@/lib/classification/classifySources'
import { computeDisagreementDiff } from '@/lib/admin/disagreementFlag'

export const classifySourcesJob = inngest.createFunction(
  {
    id: 'classify-sources',
    name: 'Classify pending sources',
    timeouts: { finish: '5m' },
    triggers: [{ event: 'bedrock/sources.classify' }],
  },
  async ({ step }) => {
    const admin = createAdminClient()
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const rows = await step.run('fetch-unclassified', async () => {
      const { data } = await admin
        .from('classified_sources')
        .select('*')
        .is('axis_placement', null)
        .limit(20)
      return data ?? []
    })

    const results: Array<{ id: string; ok: boolean; error?: string }> = []

    for (const row of rows) {
      const id = row.source_id as string
      const result = await step.run(`classify-${id}`, async () => {
        try {
          const classification = await classifySource(
            {
              sourceId: id,
              name: row.name,
              url: row.url,
              seedNotes: row.seed_notes ?? undefined,
              contentPieces: ((row.source_evidence ?? []) as string[]).map((e: string) =>
                e.startsWith('http') ? { url: e } : { text: e }
              ),
              taggedBy: row.tagged_by ?? 'admin',
            },
            anthropic
          )

          const disagree = computeDisagreementDiff(row.axis_placement ?? {}, classification.axisPlacement)

          await admin.from('classified_sources').update({
            ...(disagree.flagged ? {} : { axis_placement: classification.axisPlacement }),
            reliability: classification.reliability,
            independence: classification.independenceScore,
            good_faith: classification.goodFaith,
            coarse_lean: classification.coarseLean,
            topics: classification.topics,
            source_evidence: classification.sourceEvidence,
            raw_classification: { ...classification.rawClassification, new_axis_placement: classification.axisPlacement },
            status: 'pending_review',
            methodology_version: classification.methodologyVersion,
            flagged_for_reconciliation: disagree.flagged,
            reconciliation_diff: disagree.flagged ? disagree.diff : null,
          }).eq('source_id', id)

          return { id, ok: true }
        } catch (e) {
          return { id, ok: false, error: e instanceof Error ? e.message : 'unknown' }
        }
      })
      results.push(result)
    }

    return results
  }
)
