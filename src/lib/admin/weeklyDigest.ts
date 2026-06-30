// Weekly digest email — §21.8
// Callable function; the caller decides when to invoke (manual button or cron).
// Sends FROM admin@bedrock.guide via Resend.

import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

export interface DigestResult {
  sentTo: string
  subject: string
  previewText: string
  ok: boolean
  error?: string
}

interface TopEntity {
  entityId: string
  name: string
  type: 'candidate' | 'source'
  thumbsDownRate: number
  total: number
}

async function getTopDisagreedEntities(since: Date): Promise<TopEntity[]> {
  const admin = createAdminClient()

  // Fetch candidate feedback from the past week, grouped by candidate_id
  const { data: candidateFeedback } = await admin
    .from('candidate_feedback')
    .select('candidate_id, feedback_type')
    .gte('created_at', since.toISOString())

  const { data: sourceFeedback } = await admin
    .from('source_feedback')
    .select('source_id, feedback_type')
    .gte('created_at', since.toISOString())

  // Aggregate by entity
  const entityMap = new Map<string, { name: string; type: 'candidate' | 'source'; down: number; total: number }>()

  for (const row of candidateFeedback ?? []) {
    const key = `candidate:${row.candidate_id}`
    const existing = entityMap.get(key) ?? { name: row.candidate_id, type: 'candidate' as const, down: 0, total: 0 }
    existing.total++
    if (row.feedback_type === 'thumbs_down') existing.down++
    entityMap.set(key, existing)
  }

  for (const row of sourceFeedback ?? []) {
    const key = `source:${row.source_id}`
    const existing = entityMap.get(key) ?? { name: row.source_id, type: 'source' as const, down: 0, total: 0 }
    existing.total++
    if (row.feedback_type === 'thumbs_down') existing.down++
    entityMap.set(key, existing)
  }

  // Sort by thumbs-down rate, take top 5 (min 3 feedback events to count)
  return Array.from(entityMap.entries())
    .filter(([, v]) => v.total >= 3)
    .map(([key, v]) => ({
      entityId: key.split(':')[1],
      name: v.name,
      type: v.type,
      thumbsDownRate: v.down / v.total,
      total: v.total,
    }))
    .sort((a, b) => b.thumbsDownRate - a.thumbsDownRate)
    .slice(0, 5)
}

async function generateDigestEmail(
  top5: TopEntity[],
  weekStart: Date,
  anthropic: Anthropic
): Promise<string> {
  const hasData = top5.length > 0

  const dataSection = hasData
    ? top5.map((e, i) =>
        `${i + 1}. ${e.type === 'candidate' ? 'Candidate' : 'Source'}: ${e.name} — ${(e.thumbsDownRate * 100).toFixed(0)}% thumbs-down (${e.total} total responses)`
      ).join('\n')
    : 'No entities received enough feedback this week to report on.'

  const prompt = `You are writing the weekly admin digest for Bedrock (bedrock.guide), a civic identity platform for independent-minded voters.

Week ending: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Week starting: ${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

TOP MOST-DISAGREED-WITH RECOMMENDATIONS THIS WEEK:
${dataSection}

Write a 2-3 sentence paragraph for the Super Admin that:
1. Summarizes what this feedback pattern suggests (or notes it was a quiet week if no data)
2. Calls out the most actionable item (if any)
3. Ends with a concrete recommended next action

Write in plain prose, not bullets. Be direct and actionable. Do not use filler phrases. This email goes to a busy founder who wants the insight, not the raw numbers.`

  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  return res.content[0]?.type === 'text' ? res.content[0].text.trim() : 'No digest generated.'
}

export async function sendWeeklyDigest(superAdminEmail: string): Promise<DigestResult> {
  const resendKey = process.env.RESEND_API_KEY_ADMIN
  if (!resendKey) return { sentTo: superAdminEmail, subject: '', previewText: '', ok: false, error: 'RESEND_API_KEY_ADMIN not set' }

  const resend = new Resend(resendKey)
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)

  const top5 = await getTopDisagreedEntities(weekStart)
  const body = await generateDigestEmail(top5, weekStart, anthropic)

  const subject = `Bedrock weekly digest — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`

  const htmlBody = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <p style="font-size:12px;color:#888;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.05em">
    Bedrock Admin · Weekly Digest
  </p>
  <h1 style="font-size:20px;margin-bottom:16px">${subject}</h1>
  <p style="font-size:15px;line-height:1.6;color:#333">${body}</p>
  ${top5.length > 0 ? `
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:12px;color:#888;margin-bottom:8px">Raw numbers this week:</p>
  <ul style="font-size:13px;color:#444;padding-left:20px">
    ${top5.map((e) => `<li>${e.name} (${e.type}): ${(e.thumbsDownRate * 100).toFixed(0)}% thumbs-down · ${e.total} responses</li>`).join('')}
  </ul>` : ''}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:11px;color:#aaa">Sent from admin@bedrock.guide · Bedrock admin tool</p>
</div>`

  const { error } = await resend.emails.send({
    from: 'admin@bedrock.guide',
    to: superAdminEmail,
    subject,
    html: htmlBody,
  })

  if (error) {
    return { sentTo: superAdminEmail, subject, previewText: body.slice(0, 100), ok: false, error: error.message }
  }

  return { sentTo: superAdminEmail, subject, previewText: body.slice(0, 100), ok: true }
}
