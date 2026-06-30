/**
 * POST /api/source-suggestion
 *
 * §24.5: "Goes to the classification pipeline ingestion queue — the same flow
 * as any new source addition. A human reviews before anything appears live."
 *
 * Judgment call: user suggestions are inserted directly into `classified_sources`
 * with status='pending_review' and attribution='user_suggestion'. This puts them
 * in the existing Stage 4a admin review queue alongside editorially-added sources
 * without building a parallel system. The admin can then click "Classify with Claude"
 * to run the full Stage 3 pipeline on the stub entry.
 *
 * The source_id is a URL-derived slug so duplicate suggestions for the same URL
 * naturally converge to the same row (upsert on conflict does nothing if already
 * pending or approved).
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function urlToId(url: string): string {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    return `suggestion_${hostname.replace(/^www\./, '').replace(/\./g, '_').replace(/[^a-z0-9_]/g, '')}`
  } catch {
    return `suggestion_${Date.now()}`
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await req.json()
  const { name, url, note } = body

  if (!name || !url) {
    return NextResponse.json({ ok: false, error: 'Name and URL are required' }, { status: 400 })
  }

  const sourceId = urlToId(url)

  const { error } = await supabase.from('classified_sources').upsert({
    source_id: sourceId,
    name: name.trim(),
    url: url.trim(),
    status: 'pending_review',
    attribution: 'user_suggestion',
    tagged_by: user?.id ?? null,
    source_evidence: note ? [note.trim()] : [],
    // Fields below will be populated by the classification pipeline after admin review
    axis_placement: null,
    methodology_version: null,
    last_reviewed: new Date().toISOString().slice(0, 10),
    flagged_for_reconciliation: false,
  }, { onConflict: 'source_id', ignoreDuplicates: true })

  if (error) {
    console.error('source suggestion insert error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
