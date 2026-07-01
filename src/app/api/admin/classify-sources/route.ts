import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminRole } from '@/lib/auth/requireRole'
import { classifySource } from '@/lib/classification/classifySources'
import { computeDisagreementDiff } from '@/lib/admin/disagreementFlag'

export const maxDuration = 300

export async function POST() {
  try {
    await requireAdminRole()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const { data: rows } = await admin
    .from('classified_sources')
    .select('*')
    .is('axis_placement', null)
    .limit(20)

  const results: Array<{ id: string; ok: boolean; error?: string }> = []

  for (const row of rows ?? []) {
    const id = row.source_id as string
    try {
      const result = await classifySource(
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

      const disagree = computeDisagreementDiff(row.axis_placement ?? {}, result.axisPlacement)

      await admin.from('classified_sources').update({
        ...(disagree.flagged ? {} : { axis_placement: result.axisPlacement }),
        reliability: result.reliability,
        independence: result.independenceScore,
        good_faith: result.goodFaith,
        coarse_lean: result.coarseLean,
        topics: result.topics,
        source_evidence: result.sourceEvidence,
        raw_classification: { ...result.rawClassification, new_axis_placement: result.axisPlacement },
        status: 'pending_review',
        methodology_version: result.methodologyVersion,
        flagged_for_reconciliation: disagree.flagged,
        reconciliation_diff: disagree.flagged ? disagree.diff : null,
      }).eq('source_id', id)

      results.push({ id, ok: true })
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof Error ? e.message : 'unknown' })
    }
  }

  return NextResponse.json(results)
}
