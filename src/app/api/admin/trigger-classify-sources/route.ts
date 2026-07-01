import { inngest } from '@/lib/inngest'
import { requireAdminRole } from '@/lib/auth/requireRole'

export async function POST() {
  try {
    await requireAdminRole()
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('INNGEST_EVENT_KEY exists:', !!process.env.INNGEST_EVENT_KEY)
    console.log('INNGEST_EVENT_KEY prefix:', process.env.INNGEST_EVENT_KEY?.substring(0, 8))
    console.log('INNGEST_SIGNING_KEY exists:', !!process.env.INNGEST_SIGNING_KEY)

    const result = await inngest.send({ name: 'bedrock/sources.classify', data: {} })

    console.log('Send result:', result)
    return Response.json({ ok: true })
  } catch (e) {
    console.error('Full error:', e)
    return Response.json({
      error: String(e),
      message: (e as Error).message,
      stack: (e as Error).stack,
    }, { status: 500 })
  }
}
