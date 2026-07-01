import { requireAdminRole } from '@/lib/auth/requireRole'
import { inngest } from '@/lib/inngest'

export async function POST() {
  try {
    await requireAdminRole()
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await inngest.send({
      name: 'bedrock/sources.classify',
      data: {},
    })
    return Response.json({ ok: true, message: 'Classification job started' })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
