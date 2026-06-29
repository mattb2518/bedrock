import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildProfilePlaceholders } from '@/lib/conversations/profileBuilder'
import type { QuizSession } from '@/types/quiz'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
- Short, natural responses: 2–4 sentences. Conversation, not essay
- Don't help the user "win" — the point is practice, not a debate victory

**If the user's message is "__START__":** Open the conversation naturally — start in-character with something the other person might plausibly say to kick things off. Brief, realistic, maybe a little pointed (that's why they're practicing).

**Ending the session:** You can and should end when the time is right:
- After 8–10 exchanges, close naturally if the conversation has run its course
- If there's a genuine moment of connection or landing, close on it — don't keep going past the peak
- If the user keeps drifting off-topic (3+ times), step out: "(Feels like we keep circling — a good moment to pause?)"
- When you close, step briefly out of character with a coach's note in parentheses: what the user did that worked, one specific observation${turnNote}

**Response format:** Return ONLY valid JSON, no markdown fences:
{"reply": "your in-character response", "ended": false}

When ending the session:
{"reply": "your final in-character line or reaction", "ended": true, "endMessage": "(Coach's note: what worked, one specific thing the user did well or could try next time)"}`
}

export async function POST(request: NextRequest) {
  try {
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

    const forceEnd = turnCount >= 10
    const systemPrompt = buildChatSystemPrompt(session, context, turnCount)

    const finalSystem = forceEnd
      ? systemPrompt + `\n\n**HARD LIMIT: This is exchange ${turnCount}. You MUST close the session now — end warmly in character, add your coach's note, and set "ended": true.**`
      : systemPrompt

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: [{ type: 'text', text: finalSystem, cache_control: { type: 'ephemeral' } }],
      messages,
    })

    const rawText = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

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
