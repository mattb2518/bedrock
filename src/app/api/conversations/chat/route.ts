import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildProfilePlaceholders } from '@/lib/conversations/profileBuilder'
import type { QuizSession } from '@/types/quiz'
import { createClient } from '@/lib/supabase/server'
import { aj } from '@/lib/arcjet'
import { logClaudeUsage } from '@/lib/ai/logUsage'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
})

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function buildChatSystemPrompt(session: QuizSession | null, context: string, turnCount: number): string {
  const p = session ? buildProfilePlaceholders(session) : null

  const profileHint = p?.hasProfile
    ? `You're playing back against someone whose values you know: their Mantle is ${p.mantle_type} (${p.mantle_oneliner}), and they lean ${p.dimensional_summary.split(';').slice(0, 3).join(';')}. Don't reference this directly — let it quietly shape how you play the other person: push where they tend to stretch, ease back where they're genuinely looking for common ground.`
    : `You're playing back against someone whose profile you don't have. Read the conversation itself — pay attention to where they're firm, where they're reaching, where they're uncertain.`

  const turnNote = turnCount >= 8
    ? `\n\n**You are at exchange ${turnCount}. The session is approaching its natural end. If this conversation has found a landing — real connection, a moment of genuine hearing, or a natural close — end it here. You must end by exchange 10.**`
    : ''

  return `You are a practice partner in Back-and-forth — an experimental mode on Bedrock where people rehearse hard civic conversations. You play the "other person" in their practice session.

**The setup:** ${context}

**${profileHint}**

**Your role:** Play this person charitably and realistically — a genuine human being who actually holds these views and has real reasons for them. Not a cartoon, not a pushover. Make the practice feel like a real conversation.

**In practice:**
- Stay in character as the person described — a reasonable version, not a caricature
- Push back where a real person would. Don't let weak arguments slide unchallenged
- Stay on topic. If the user drifts off-topic more than once, redirect in character: "I feel like we're getting off track — can we get back to [topic]?"
- No personal attacks. If you feel the pull in character, redirect to the substance instead
- No conspiracy theories or demonstrably false claims — even in character
- Never reference the practice session, the exercise, or the fact that you're playing a role — stay fully in the fiction at all times
- Short, natural responses: 2–4 sentences. Conversation, not essay
- Don't help the user "win" — the point is practice, not a debate victory

**If the user's message is "__START__":** Open the conversation naturally — start in-character with something the other person might plausibly say to kick things off. Brief, realistic, maybe a little pointed (that's why they're practicing). Exception: if the setup suggests the user doesn't know how to initiate or bring up the topic ("don't know how to bring up", "haven't talked about it", "need to start the conversation", "want to bring it up"), have the other person open with something neutral and inviting — "What's on your mind?" or a natural social opener — so the user has the first real move. Also include a "brief" field: 1–2 sentences as the coach (stepping fully out of character), orienting the user before the conversation begins — what to expect from this person, where they tend to push or soften. Keep it crisp and specific to the setup.

**Ending the session:** You can and should end when the time is right:
- After 8–10 exchanges, close naturally if the conversation has run its course
- If there's a genuine moment of connection or landing, close on it — don't keep going past the peak
- If the user keeps drifting off-topic (3+ times), step out: "(Feels like we keep circling — a good moment to pause?)"
- When you close, step briefly out of character with a coach's note in parentheses: what the user did that worked, one specific observation${turnNote}

**Response format:** Return ONLY valid JSON, no markdown fences:
{"reply": "your in-character response", "ended": false, "hint": {"read": "one sentence: what you (as the other person) are really signaling or doing in this line — the real subtext, not just the surface", "moves": [{"label": "energy name", "tip": "one sentence of specific coaching — what to do or how to approach it (coaching voice, third person)", "phrase": "the actual words to say — first person, natural, 5–15 words, ready to use in a real conversation"}, {"label": "energy name", "tip": "...", "phrase": "..."}]}}

On the first turn only (when the user message is "__START__"), prepend a "brief" field:
{"brief": "1-2 sentences as coach orienting the user — what to expect from this person, where they'll push or soften", "reply": "...", "ended": false, "hint": {...}}

The "hint" steps outside the fiction after your reply. "read" is your honest decode of what you just did as the other person — the real signal or tactic underneath the line. "moves" are 2–3 response options, each with: a "label" from the palette above, a "tip" (coaching voice — what to do and why, one sentence, specific to this exchange), and a "phrase" (the actual words the user would say — first person, natural, 5–15 words, something they could speak or paste directly into the conversation).

When ending the session:
{"reply": "your final in-character line or reaction", "ended": true, "endMessage": "(Coach's note: what worked, one specific thing the user did well or could try next time)", "hint": {"read": "what this closing line is doing", "moves": [{"label": "...", "tip": "..."}]}}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('quiz_profiles')
      .select('completed_layers')
      .eq('user_id', user.id)
      .maybeSingle()

    const completedLayers: number[] = profile?.completed_layers ?? []
    if (!completedLayers.includes(1)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decision = await aj.protect(request, { requested: 1 })
    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const {
      session,
      context,
      messages,
      turnCount,
    }: {
      session: QuizSession | null
      context: string
      messages: ChatMessage[]
      turnCount: number
    } = body

    if (!context?.trim()) {
      return NextResponse.json({ error: 'No context provided' }, { status: 400 })
    }
    if (!messages?.length) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }
    if (context.length > 2000) {
      return NextResponse.json({ error: 'Context too long' }, { status: 400 })
    }
    for (const msg of messages) {
      if (msg.content.length > 1000) {
        return NextResponse.json({ error: 'Message too long' }, { status: 400 })
      }
    }

    const forceEnd = turnCount >= 10
    const systemPrompt = buildChatSystemPrompt(session, context, turnCount)

    const finalSystem = forceEnd
      ? systemPrompt + `\n\n**HARD LIMIT: This is exchange ${turnCount}. You MUST close the session now — end warmly in character, add your coach's note, and set "ended": true.**`
      : systemPrompt

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      system: [{ type: 'text', text: finalSystem, cache_control: { type: 'ephemeral' } }],
      messages,
    })

    logClaudeUsage({ route: '/api/conversations/chat', model: 'claude-sonnet-4-6', usage: response.usage, userId: user.id })

    const rawText = response.content[0]?.type === 'text' ? response.content[0].text : ''

    // Extract JSON — handle leading text, markdown fences, or both
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    const jsonText = start !== -1 && end > start
      ? rawText.slice(start, end + 1)
      : rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      return NextResponse.json({ reply: rawText, ended: false })
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Something went wrong — try again' }, { status: 500 })
  }
}
