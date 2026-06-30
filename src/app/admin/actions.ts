'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdminRole, requireSuperAdminRole } from '@/lib/auth/requireRole'
import { classifySource } from '@/lib/classification/classifySources'
import { classifyCandidate } from '@/lib/classification/classifyCandidates'
import { computeDisagreementDiff } from '@/lib/admin/disagreementFlag'
import { verifyWithPerplexity } from '@/lib/admin/verifyWithPerplexity'
import { sendWeeklyDigest } from '@/lib/admin/weeklyDigest'
import Anthropic from '@anthropic-ai/sdk'

type EntryType = 'candidate' | 'source'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getActorUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

async function writeAuditLog(params: {
  entryType: EntryType
  entryId: string
  action: string
  actorUserId: string | null
  previousStatus?: string | null
  newStatus?: string | null
  notes?: string
}) {
  const admin = createAdminClient()
  await admin.from('classification_audit_log').insert({
    entry_type: params.entryType,
    entry_id: params.entryId,
    action: params.action,
    actor_user_id: params.actorUserId,
    previous_status: params.previousStatus ?? null,
    new_status: params.newStatus ?? null,
    notes: params.notes ?? null,
  })
}

// ── Approve ───────────────────────────────────────────────────────────────────

export async function approveEntry(type: EntryType, id: string) {
  await requireAdminRole()
  const actorId = await getActorUserId()
  const admin = createAdminClient()
  const table = type === 'candidate' ? 'classified_candidates' : 'classified_sources'
  const idCol = type === 'candidate' ? 'candidate_id' : 'source_id'

  const { data: existing } = await admin.from(table).select('status').eq(idCol, id).single()

  await admin.from(table).update({
    status: 'approved',
    reviewed_by: actorId,
    last_reviewed: new Date().toISOString().slice(0, 10),
  }).eq(idCol, id)

  await writeAuditLog({
    entryType: type,
    entryId: id,
    action: 'approved',
    actorUserId: actorId,
    previousStatus: existing?.status ?? null,
    newStatus: 'approved',
  })

  revalidatePath('/admin/review')
  revalidatePath(`/admin/review/${type}/${id}`)
  revalidatePath('/admin')
}

// ── Reject ────────────────────────────────────────────────────────────────────

export async function rejectEntry(type: EntryType, id: string, reason: string) {
  await requireAdminRole()
  if (!reason.trim()) throw new Error('Rejection reason is required.')
  const actorId = await getActorUserId()
  const admin = createAdminClient()
  const table = type === 'candidate' ? 'classified_candidates' : 'classified_sources'
  const idCol = type === 'candidate' ? 'candidate_id' : 'source_id'

  const { data: existing } = await admin.from(table).select('status').eq(idCol, id).single()

  await admin.from(table).update({
    status: 'rejected',
    rejection_reason: reason.trim(),
    reviewed_by: actorId,
    last_reviewed: new Date().toISOString().slice(0, 10),
  }).eq(idCol, id)

  await writeAuditLog({
    entryType: type,
    entryId: id,
    action: 'rejected',
    actorUserId: actorId,
    previousStatus: existing?.status ?? null,
    newStatus: 'rejected',
    notes: `Reason: ${reason.trim()}`,
  })

  revalidatePath('/admin/review')
  revalidatePath(`/admin/review/${type}/${id}`)
  revalidatePath('/admin')
}

// ── Edit ──────────────────────────────────────────────────────────────────────
// `fields` is the full updated jsonb blob for axis_placement (and any other top-level
// scalar overrides). Field-level diff is computed here and stored in the audit log.

export async function editEntry(
  type: EntryType,
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedFields: Record<string, any>
) {
  await requireAdminRole()
  const actorId = await getActorUserId()
  const admin = createAdminClient()
  const table = type === 'candidate' ? 'classified_candidates' : 'classified_sources'
  const idCol = type === 'candidate' ? 'candidate_id' : 'source_id'

  // Fetch current row to compute diff
  const { data: existing } = await admin.from(table).select('*').eq(idCol, id).single()

  // Build field-level diff for audit log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diff: Record<string, { before: any; after: any }> = {}
  for (const [key, after] of Object.entries(updatedFields)) {
    const before = existing?.[key]
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      diff[key] = { before, after }
    }
  }

  await admin.from(table).update({
    ...updatedFields,
    reviewed_by: actorId,
    last_reviewed: new Date().toISOString().slice(0, 10),
  }).eq(idCol, id)

  await writeAuditLog({
    entryType: type,
    entryId: id,
    action: 'overridden',
    actorUserId: actorId,
    previousStatus: existing?.status ?? null,
    newStatus: existing?.status ?? null,
    notes: JSON.stringify({ changed_fields: diff }),
  })

  revalidatePath('/admin/review')
  revalidatePath(`/admin/review/${type}/${id}`)
}

// ── Re-classify ───────────────────────────────────────────────────────────────
// Reconstructs input from stored DB fields and re-runs the Stage 3 classifier.
// Note: this uses available stored metadata (name, url, sourced_from, etc.).
// If original content pieces (voting record text, article excerpts) are not in
// source_evidence, the re-classification runs from public record only.

export async function reclassifyEntry(type: EntryType, id: string) {
  await requireAdminRole()
  const actorId = await getActorUserId()
  const admin = createAdminClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  if (type === 'source') {
    const { data: row } = await admin
      .from('classified_sources')
      .select('*')
      .eq('source_id', id)
      .single()
    if (!row) throw new Error(`Source not found: ${id}`)

    const result = await classifySource(
      {
        sourceId: row.source_id,
        name: row.name,
        url: row.url,
        contentPieces: (row.source_evidence as string[]).map((e: string) =>
          e.startsWith('http') ? { url: e } : { text: e }
        ),
        taggedBy: row.tagged_by,
      },
      anthropic
    )

    // Disagreement detection — §21.5
    const disagree = computeDisagreementDiff(row.axis_placement ?? {}, result.axisPlacement)

    await admin.from('classified_sources').update({
      // Only overwrite axis_placement if no significant disagreement; otherwise keep
      // the old approved scores live and let reconciliation resolve the conflict.
      ...(disagree.flagged ? {} : { axis_placement: result.axisPlacement }),
      source_evidence: result.sourceEvidence,
      raw_classification: { ...result.rawClassification, new_axis_placement: result.axisPlacement },
      status: 'pending_review',
      methodology_version: result.methodologyVersion,
      flagged_for_reconciliation: disagree.flagged,
      reconciliation_diff: disagree.flagged ? disagree.diff : null,
    }).eq('source_id', id)

    await writeAuditLog({
      entryType: 'source',
      entryId: id,
      action: disagree.flagged ? 'flagged' : 'reclassified',
      actorUserId: actorId,
      previousStatus: row.status,
      newStatus: 'pending_review',
      notes: disagree.flagged ? `Reconciliation needed: ${Object.keys(disagree.diff).filter((a) => disagree.diff[a].flagged).join(', ')}` : undefined,
    })
  } else {
    const { data: row } = await admin
      .from('classified_candidates')
      .select('*')
      .eq('candidate_id', id)
      .single()
    if (!row) throw new Error(`Candidate not found: ${id}`)

    const result = await classifyCandidate(
      {
        candidateId: row.candidate_id,
        name: row.name,
        office: row.office,
        officeType: row.office_type,
        district: row.district,
        party: row.party ?? undefined,
        coverageTier: row.coverage_tier,
        sourcedFrom: row.sourced_from as string[],
        taggedBy: row.tagged_by,
      },
      anthropic
    )

    // Disagreement detection — §21.5
    const disagree = computeDisagreementDiff(row.axis_placement ?? {}, result.candidateData.axisPlacement)

    await admin.from('classified_candidates').update({
      ...(disagree.flagged ? {} : {
        axis_placement: result.candidateData.axisPlacement,
        dealbreakers: result.candidateData.dealbreakers,
        rhetorical_only: result.candidateData.rhetoricalOnly ?? false,
      }),
      raw_classification: { ...result.rawClassification, new_axis_placement: result.candidateData.axisPlacement },
      status: 'pending_review',
      methodology_version: result.methodologyVersion,
      flagged_for_reconciliation: disagree.flagged,
      reconciliation_diff: disagree.flagged ? disagree.diff : null,
    }).eq('candidate_id', id)

    await writeAuditLog({
      entryType: 'candidate',
      entryId: id,
      action: disagree.flagged ? 'flagged' : 'reclassified',
      actorUserId: actorId,
      previousStatus: row.status,
      newStatus: 'pending_review',
      notes: disagree.flagged ? `Reconciliation needed: ${Object.keys(disagree.diff).filter((a) => disagree.diff[a].flagged).join(', ')}` : undefined,
    })
  }

  revalidatePath('/admin/review')
  revalidatePath(`/admin/review/${type}/${id}`)
}

// ── Promote / Demote user (Super Admin only) ──────────────────────────────────

export async function promoteToAdmin(userId: string) {
  await requireSuperAdminRole()
  const actorId = await getActorUserId()
  const admin = createAdminClient()

  await admin.from('user_roles').update({ role: 'admin' }).eq('user_id', userId)

  await writeAuditLog({
    entryType: 'candidate', // reusing audit log; entry_id is the target user id
    entryId: userId,
    action: 'user_promoted',
    actorUserId: actorId,
    notes: 'Role changed to admin',
  })

  revalidatePath('/admin/users')
}

export async function demoteToUser(userId: string) {
  await requireSuperAdminRole()
  const actorId = await getActorUserId()
  const admin = createAdminClient()

  await admin.from('user_roles').update({ role: 'user' }).eq('user_id', userId)

  await writeAuditLog({
    entryType: 'candidate',
    entryId: userId,
    action: 'user_demoted',
    actorUserId: actorId,
    notes: 'Role changed to user',
  })

  revalidatePath('/admin/users')
}

// ── Bulk approve ──────────────────────────────────────────────────────────────

export async function bulkApprove(type: EntryType, ids: string[]) {
  await requireAdminRole()
  const actorId = await getActorUserId()
  const admin = createAdminClient()
  const table = type === 'candidate' ? 'classified_candidates' : 'classified_sources'
  const idCol = type === 'candidate' ? 'candidate_id' : 'source_id'

  // Write one audit log row per entry — not one for the whole batch (§21.4)
  for (const id of ids) {
    const { data: existing } = await admin.from(table).select('status').eq(idCol, id).single()
    await admin.from(table).update({
      status: 'approved',
      reviewed_by: actorId,
      last_reviewed: new Date().toISOString().slice(0, 10),
    }).eq(idCol, id)
    await writeAuditLog({
      entryType: type,
      entryId: id,
      action: 'approved',
      actorUserId: actorId,
      previousStatus: existing?.status ?? null,
      newStatus: 'approved',
      notes: 'bulk_approve',
    })
  }

  revalidatePath('/admin/review')
  revalidatePath('/admin')
}

// ── Bulk re-classify ──────────────────────────────────────────────────────────
// Runs each entry through Stage 3 classifier sequentially.
// Returns a progress array — callers can stream this via repeated server actions
// or simply await the full batch (simpler, fine for small queues).

export async function bulkReclassify(type: EntryType, ids: string[]) {
  await requireAdminRole()
  const results: Array<{ id: string; ok: boolean; error?: string }> = []
  for (const id of ids) {
    try {
      await reclassifyEntry(type, id)
      results.push({ id, ok: true })
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof Error ? e.message : 'unknown' })
    }
  }
  return results
}

// ── Perplexity verify (single entry) ─────────────────────────────────────────

export async function verifyEntry(type: EntryType, id: string) {
  await requireAdminRole()
  const admin = createAdminClient()
  const table = type === 'candidate' ? 'classified_candidates' : 'classified_sources'
  const idCol = type === 'candidate' ? 'candidate_id' : 'source_id'

  const { data: row } = await admin.from(table).select('*').eq(idCol, id).single()
  if (!row) throw new Error(`Entry not found: ${id}`)

  const result = await verifyWithPerplexity({
    type,
    name: row.name,
    url: type === 'source' ? row.url : undefined,
    office: type === 'candidate' ? row.office : undefined,
    district: type === 'candidate' ? row.district : undefined,
  })

  await admin.from(table).update({
    last_reviewed: result.checkedAt,
    perplexity_last_check: { checkedAt: result.checkedAt, summary: result.summary, rawResponse: result.rawResponse },
  }).eq(idCol, id)

  revalidatePath(`/admin/review/${type}/${id}`)
  return result
}

// ── Bulk Perplexity verify ────────────────────────────────────────────────────
// Targets entries where last_reviewed is null OR > 90 days old.

export async function bulkVerify(type: EntryType) {
  await requireAdminRole()
  const admin = createAdminClient()
  const table = type === 'candidate' ? 'classified_candidates' : 'classified_sources'
  const idCol = type === 'candidate' ? 'candidate_id' : 'source_id'

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoff = ninetyDaysAgo.toISOString().slice(0, 10)

  const { data: stale } = await admin
    .from(table)
    .select(idCol)
    .or(`last_reviewed.is.null,last_reviewed.lt.${cutoff}`)
    .eq('status', 'approved')
    .limit(50)   // cap per run to avoid rate limits

  const ids = (stale ?? []).map((r: Record<string, string>) => r[idCol] as string)
  const results: Array<{ id: string; ok: boolean; error?: string }> = []

  for (const id of ids) {
    try {
      await verifyEntry(type, id)
      results.push({ id, ok: true })
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof Error ? e.message : 'unknown' })
    }
  }

  return results
}

// ── Checklist toggle (Super Admin only) ──────────────────────────────────────

export async function toggleChecklistItem(itemId: string, checked: boolean) {
  await requireSuperAdminRole()
  const actorId = await getActorUserId()
  const admin = createAdminClient()

  await admin.from('admin_checklist').update({
    checked,
    checked_by: actorId,
    checked_at: checked ? new Date().toISOString() : null,
  }).eq('item_id', itemId)

  revalidatePath('/admin')
  revalidatePath('/admin/checklist')
}

// ── Classify auto-ingested pending candidates ─────────────────────────────────
// Processes up to 20 auto_ingested pending candidates through the Stage 3
// classifier. Manual trigger only — no cron. Batch cap prevents runaway cost.

export async function classifyAutoIngested() {
  await requireAdminRole()
  const admin = createAdminClient()

  const { data: rows } = await admin
    .from('classified_candidates')
    .select('candidate_id')
    .eq('status', 'pending_review')
    .eq('attribution', 'auto_ingested')
    .limit(20)

  const ids = (rows ?? []).map((r) => r.candidate_id as string)
  return bulkReclassify('candidate', ids)
}

// ── Weekly digest (Super Admin only) ─────────────────────────────────────────

export async function triggerWeeklyDigest() {
  await requireSuperAdminRole()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('No email for current user')

  return sendWeeklyDigest(user.email)
}
