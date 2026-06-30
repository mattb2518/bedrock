import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth/getRole'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/admin/export?type=candidate|source&status=...&tier=...
export async function GET(req: NextRequest) {
  const role = await getCurrentUserRole()
  if (role !== 'admin' && role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'candidate'
  const status = searchParams.get('status') ?? undefined
  const tier = searchParams.get('tier') ?? undefined   // coverage_tier or kind

  const admin = createAdminClient()

  let csv = ''

  if (type === 'source') {
    let query = admin.from('classified_sources').select('source_id, name, kind, url, active, coarse_lean, reliability, independence, good_faith, status, tagged_by, reviewed_by, last_reviewed, methodology_version, created_at, updated_at')
    if (status) query = query.eq('status', status)
    if (tier)   query = query.eq('kind', tier)

    const { data } = await query.order('name')
    const rows = data ?? []

    const headers = ['source_id', 'name', 'kind', 'url', 'active', 'coarse_lean', 'reliability', 'independence', 'good_faith', 'status', 'tagged_by', 'reviewed_by', 'last_reviewed', 'methodology_version', 'created_at', 'updated_at']
    csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => csvCell(r[h as keyof typeof r])).join(',')),
    ].join('\r\n')
  } else {
    let query = admin.from('classified_candidates').select('candidate_id, name, office, office_type, district, party, coverage_tier, rhetorical_only, independent_minded_score, status, tagged_by, reviewed_by, last_reviewed, methodology_version, created_at, updated_at')
    if (status) query = query.eq('status', status)
    if (tier)   query = query.eq('coverage_tier', tier)

    const { data } = await query.order('name')
    const rows = data ?? []

    const headers = ['candidate_id', 'name', 'office', 'office_type', 'district', 'party', 'coverage_tier', 'rhetorical_only', 'independent_minded_score', 'status', 'tagged_by', 'reviewed_by', 'last_reviewed', 'methodology_version', 'created_at', 'updated_at']
    csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => csvCell(r[h as keyof typeof r])).join(',')),
    ].join('\r\n')
  }

  const filename = `bedrock-${type}-catalog-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function csvCell(value: any): string {
  if (value == null) return ''
  const str = String(value)
  // Escape cells containing commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
