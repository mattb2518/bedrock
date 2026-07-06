// POST /api/quiz/reflect — AI reflect-back for "It depends" open text.
// SPEC §5 AI Reflect-Back on "It depends" Open Text.
//
// Returns a one-sentence warm, nonpartisan reflection of the user's nuance.
// Timeout 2.5s; falls back silently to null on timeout or error.
// Not used in the homepage teaser.

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text } = await req.json() as { text?: string }
    if (!text?.trim()) return NextResponse.json({ reflection: null })

    const client = new Anthropic()

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 60,
      system: 'You reflect back the civic tension or condition the user described, in one warm, nonpartisan sentence. Never evaluate correctness. Never name parties or politicians. Never give advice. Reflect the nuance, not the position. Keep it under 40 tokens.',
      messages: [{ role: 'user', content: text }],
    }, { signal: controller.signal })

    clearTimeout(timeout)

    const reflection = message.content[0].type === 'text' ? message.content[0].text : null
    return NextResponse.json({ reflection })
  } catch {
    return NextResponse.json({ reflection: null })
  }
}
