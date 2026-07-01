import { requireAdminRole } from '@/lib/auth/requireRole'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({
  id: 'bedrock',
  eventKey: process.env.INNGEST_EVENT_KEY,
})

export async function POST() {
  try {
    await requireAdminRole()
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await inngestClient.send({
      name: 'bedrock/sources.classify',
      data: {},
    })
    return Response.json({ ok: true, message: 'Classification job started' })
  } catch (e) {
    return Response.json({
      error: String(e),
      eventKeyPrefix: process.env.INNGEST_EVENT_KEY?.substring(0, 12),
    }, { status: 500 })
  }
}
