import { NextResponse } from 'next/server'
import { inngest } from '@/lib/inngest'
import { requireAdminRole } from '@/lib/auth/requireRole'

export async function POST() {
  try {
    await requireAdminRole()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await inngest.send({ name: 'bedrock/sources.classify', data: {} })
  return NextResponse.json({ ok: true })
}
