/**
 * POST /api/media-feedback
 * Writes a thumbs-up or thumbs-down to the source_feedback table (§24.4).
 * Article text is NOT stored — only the source_id and feedback metadata.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await req.json()
  const {
    sourceId,
    tier,
    feedbackType,
    freeText,
    chipsSelected,
    dimensionCoverageTags,
    userMantleType,
    userCompletionPercent,
  } = body

  if (!sourceId || !tier || !feedbackType) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await supabase.from('source_feedback').insert({
    user_id: user?.id ?? null,
    source_id: sourceId,
    tier,
    feedback_type: feedbackType,
    free_text: freeText ?? null,
    chips_selected: chipsSelected ?? [],
    dimension_coverage_tags: dimensionCoverageTags ?? [],
    user_mantle_type: userMantleType ?? null,
    user_completion_percent: userCompletionPercent ?? null,
    timestamp: new Date().toISOString(),
    app_version: '1.0.0',
    data_version: 'v1',
    beyond_ballot_flag: false,
  })

  if (error) {
    console.error('source_feedback insert error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
