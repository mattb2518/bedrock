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
import { createAdminClient } from '@/lib/supabase/admin'

function urlToId(url: string): string {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    return `suggestion_${hostname.replace(/^www\./, '').replace(/\./g, '_').replace(/[^a-z0-9_]/g, '')}`
  } catch {
    return `suggestion_${Date.now()}`
  }
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '').toLowerCase()
  } catch { return null }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()   // service role — bypasses RLS so the write actually lands

  const body = await req.json()
  const { name, url, note } = body
  if (!name || !url) {
    return NextResponse.json({ ok: false, error: 'Name and URL are required' }, { status: 400 })
  }

  // Already have it? Match on domain, tolerant of any path after the host.
  const host = hostnameOf(url)
  if (host) {
    const { data: approved } = await admin
      .from('classified_sources').select('name, url').eq('status', 'approved')
    const match = (approved ?? []).find((r) => hostnameOf(r.url) === host)
    if (match) {
      return NextResponse.json({ ok: true, alreadyHave: true, existingName: match.name })
    }
  }

  // New source — save to the review queue via the admin client (RLS would block the user client)
  const { error } = await admin.from('classified_sources').upsert({
    source_id: urlToId(url),
    name: name.trim(),
    url: url.trim(),
    status: 'pending_review',
    attribution: 'user_suggestion',
    tagged_by: user?.id ?? null,
    source_evidence: note ? [note.trim()] : [],
    axis_placement: null,
    methodology_version: null,
    last_reviewed: new Date().toISOString().slice(0, 10),
    flagged_for_reconciliation: false,
  }, { onConflict: 'source_id', ignoreDuplicates: true })

  if (error) {
    console.error('source suggestion insert error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  // Notify admin — best effort, never blocks the suggestion; skips cleanly if the key is unset
  try {
    const key = process.env.RESEND_API_KEY_ADMIN
    if (key) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Bedrock <admin@bedrock.guide>',
          to: ['hello@bedrock.guide'],
          subject: `New source suggestion: ${name.trim()}`,
          text: `Someone suggested a source for the catalog.\n\nName: ${name.trim()}\nURL: ${url.trim()}\nNote: ${note?.trim() || '(none)'}\nSuggested by (user id): ${user?.id ?? 'anonymous'}\n\nIt's in the admin review queue as pending_review.`,
        }),
      })
    } else {
      console.warn('source suggestion: RESEND_API_KEY_ADMIN not set — email skipped')
    }
  } catch (mailErr) {
    console.error('source suggestion email failed (suggestion still saved):', mailErr)
  }

  return NextResponse.json({ ok: true })
}
