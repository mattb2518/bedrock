import { inngest } from '@/lib/inngest'
import { requireAdminRole } from '@/lib/auth/requireRole'

export async function POST() {
  try {
    await requireAdminRole()
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await inngest.send({ name: 'bedrock/sources.classify', data: {} })
    return Response.json({ ok: true, message: 'Classification job started' })
  } catch (e) {
    console.error('inngest.send error:', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
