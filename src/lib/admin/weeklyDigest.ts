// Weekly digest email — §21.8
// Callable function; the caller decides when to invoke (manual button or cron).
// Sends FROM admin@bedrock.guide via Resend.

import Anthropic from '@anthropic-ai/sdk'
import { logClaudeUsage } from '@/lib/ai/logUsage'
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

interface StatsSnapshot {
  newSignupsThisWeek: number
  newSignupsLastWeek: number
  quizCompletionsThisWeek: number
  quizStartsThisWeek: number
  completionRate: number
  mantleDistribution: { mantle_type: string; count: number }[]
  returningUsers: number
  pipelineErrors: number
}

interface NewUser {
  email: string
  createdAt: Date
}

function maskEmail(email: string): string {
  const [username, domain] = email.split('@')
  const dotIndex = domain.lastIndexOf('.')
  const domainBase = domain.slice(0, dotIndex)
  const masked = domainBase.length > 3 ? domainBase.slice(0, 3) + '***' : domainBase + '***'
  return `${username}@${masked}.***`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

async function getTopDisagreedEntities(since: Date): Promise<TopEntity[]> {
  const admin = createAdminClient()

  const { data: candidateFeedback } = await admin
    .from('candidate_feedback')
    .select('candidate_id, feedback_type')
    .gte('created_at', since.toISOString())

  const { data: sourceFeedback } = await admin
    .from('source_feedback')
    .select('source_id, feedback_type')
    .gte('created_at', since.toISOString())

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

async function getNewUsers(thisWeekStart: Date): Promise<NewUser[]> {
  const admin = createAdminClient()
  const newUsers: NewUser[] = []
  let page = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data: { users }, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error || !users?.length) break
    for (const user of users) {
      if (!user.email || !user.created_at) continue
      const createdAt = new Date(user.created_at)
      if (createdAt >= thisWeekStart) {
        newUsers.push({ email: user.email, createdAt })
      }
    }
    if (users.length < 1000) break
    page++
  }

  return newUsers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

async function getStatsSnapshot(thisWeekStart: Date, lastWeekStart: Date): Promise<StatsSnapshot> {
  const admin = createAdminClient()

  // New signups: count from listUsers filtered by created_at windows
  let thisWeekSignups = 0
  let lastWeekSignups = 0
  let page = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data: { users }, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error || !users?.length) break
    for (const user of users) {
      if (!user.created_at) continue
      const createdAt = new Date(user.created_at)
      if (createdAt >= thisWeekStart) thisWeekSignups++
      else if (createdAt >= lastWeekStart) lastWeekSignups++
    }
    if (users.length < 1000) break
    page++
  }

  // Quiz completions and starts
  const { count: completions } = await admin
    .from('quiz_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('completed', true)
    .gte('updated_at', thisWeekStart.toISOString())

  const { count: starts } = await admin
    .from('quiz_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thisWeekStart.toISOString())

  const quizCompletionsThisWeek = completions ?? 0
  const quizStartsThisWeek = starts ?? 0
  const completionRate = quizStartsThisWeek > 0 ? quizCompletionsThisWeek / quizStartsThisWeek : 0

  // Mantle distribution
  const { data: mantleRows } = await admin
    .from('quiz_profiles')
    .select('mantle_type')
    .eq('completed', true)
    .gte('updated_at', thisWeekStart.toISOString())

  const mantleCount = new Map<string, number>()
  for (const row of mantleRows ?? []) {
    if (!row.mantle_type) continue
    mantleCount.set(row.mantle_type, (mantleCount.get(row.mantle_type) ?? 0) + 1)
  }
  const mantleDistribution = Array.from(mantleCount.entries())
    .map(([mantle_type, count]) => ({ mantle_type, count }))
    .sort((a, b) => b.count - a.count)

  // Returning users: distinct user_ids active this week, excluding new signups this week
  const { data: activeRows } = await admin
    .from('quiz_profiles')
    .select('user_id, created_at')
    .gte('updated_at', thisWeekStart.toISOString())

  const returningSet = new Set<string>()
  for (const row of activeRows ?? []) {
    if (!row.user_id || !row.created_at) continue
    const userCreatedAt = new Date(row.created_at)
    if (userCreatedAt < thisWeekStart) {
      returningSet.add(row.user_id)
    }
  }
  const returningUsers = returningSet.size

  // Pipeline errors
  const { count: pipelineErrors } = await admin
    .from('classification_audit_log')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thisWeekStart.toISOString())
    .or("action.ilike.%error%,status.eq.error")

  return {
    newSignupsThisWeek: thisWeekSignups,
    newSignupsLastWeek: lastWeekSignups,
    quizCompletionsThisWeek,
    quizStartsThisWeek,
    completionRate,
    mantleDistribution,
    returningUsers,
    pipelineErrors: pipelineErrors ?? 0,
  }
}

async function generateDigestEmail(
  top5: TopEntity[],
  stats: StatsSnapshot,
  weekStart: Date,
  anthropic: Anthropic
): Promise<string> {
  const hasData = top5.length > 0

  const statsText = [
    `New signups this week: ${stats.newSignupsThisWeek} (last week: ${stats.newSignupsLastWeek})`,
    `Quiz completions: ${stats.quizCompletionsThisWeek} out of ${stats.quizStartsThisWeek} starts (${(stats.completionRate * 100).toFixed(0)}% completion rate)`,
    `Mantle distribution: ${stats.mantleDistribution.map(m => `${m.mantle_type}: ${m.count}`).join(', ') || 'none'}`,
    `Returning users: ${stats.returningUsers}`,
    `Classification pipeline errors: ${stats.pipelineErrors}`,
  ].join('\n')

  const dataSection = hasData
    ? top5.map((e, i) =>
        `${i + 1}. ${e.type === 'candidate' ? 'Candidate' : 'Source'}: ${e.name} — ${(e.thumbsDownRate * 100).toFixed(0)}% thumbs-down (${e.total} total responses)`
      ).join('\n')
    : 'No entities received enough feedback this week to report on.'

  const prompt = `You are writing the weekly admin digest for Bedrock (bedrock.guide), a civic identity platform for independent-minded voters.

Week ending: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Week starting: ${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

USAGE STATS THIS WEEK:
${statsText}

TOP MOST-DISAGREED-WITH RECOMMENDATIONS THIS WEEK:
${dataSection}

Write a 2-3 sentence paragraph for the Super Admin that:
1. Summarizes what both the usage patterns and feedback signals suggest
2. Calls out the most actionable item (if any)
3. Ends with a concrete recommended next action

If volume is low across both stats and feedback, say so in one sentence — no meta-commentary about thresholds. Write in plain prose, not bullets. Be direct and actionable. Do not use filler phrases. This email goes to a busy founder who wants the insight, not the raw numbers.`

  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  logClaudeUsage({ route: 'weeklyDigest', model: 'claude-sonnet-4-6', usage: res.usage })
  return res.content[0]?.type === 'text' ? res.content[0].text.trim() : 'No digest generated.'
}

export async function sendWeeklyDigest(superAdminEmail: string): Promise<DigestResult> {
  const resendKey = process.env.RESEND_API_KEY_ADMIN
  if (!resendKey) return { sentTo: superAdminEmail, subject: '', previewText: '', ok: false, error: 'RESEND_API_KEY_ADMIN not set' }

  const resend = new Resend(resendKey)
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const now = new Date()
  const thisWeekStart = new Date(now)
  thisWeekStart.setDate(now.getDate() - 7)
  const lastWeekStart = new Date(now)
  lastWeekStart.setDate(now.getDate() - 14)

  const [top5, newUsers, stats] = await Promise.all([
    getTopDisagreedEntities(thisWeekStart),
    getNewUsers(thisWeekStart),
    getStatsSnapshot(thisWeekStart, lastWeekStart),
  ])

  const body = await generateDigestEmail(top5, stats, thisWeekStart, anthropic)

  const subject = `Bedrock weekly digest — ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`

  // Section 1: new users (omitted if none)
  const newUsersSection = newUsers.length > 0 ? `
  <h2 style="font-size:16px;margin:24px 0 8px">New this week</h2>
  <ul style="font-size:13px;color:#444;padding-left:20px;margin:0">
    ${newUsers.map(u => `<li>${maskEmail(u.email)} — ${formatDate(u.createdAt)}</li>`).join('')}
  </ul>` : ''

  // Section 2: stats snapshot
  const signupDelta = stats.newSignupsThisWeek - stats.newSignupsLastWeek
  const signupDeltaStr = signupDelta >= 0 ? `+${signupDelta}` : `${signupDelta}`
  const mantleList = stats.mantleDistribution.length > 0
    ? stats.mantleDistribution.map(m => `${m.mantle_type}: ${m.count}`).join(', ')
    : 'none'

  const statsSection = `
  <h2 style="font-size:16px;margin:24px 0 8px">By the numbers</h2>
  <ul style="font-size:13px;color:#444;padding-left:20px;margin:0">
    <li>New signups: ${stats.newSignupsThisWeek} (${signupDeltaStr} vs. last week)</li>
    <li>Quiz completions: ${stats.quizCompletionsThisWeek} of ${stats.quizStartsThisWeek} starts (${(stats.completionRate * 100).toFixed(0)}% completion rate)</li>
    <li>Mantle distribution: ${mantleList}</li>
    <li>Returning users: ${stats.returningUsers}</li>
    <li>Classification pipeline errors: ${stats.pipelineErrors}</li>
  </ul>`

  const htmlBody = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <p style="font-size:12px;color:#888;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.05em">
    Bedrock Admin · Weekly Digest
  </p>
  <h1 style="font-size:20px;margin-bottom:16px">${subject}</h1>
  ${newUsersSection}
  ${statsSection}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:15px;line-height:1.6;color:#333">${body}</p>
  ${top5.length > 0 ? `
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
