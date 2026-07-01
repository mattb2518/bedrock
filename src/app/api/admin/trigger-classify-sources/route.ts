import { requireAdminRole } from '@/lib/auth/requireRole'

export async function POST() {
  try {
    await requireAdminRole()
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const eventKey = process.env.INNGEST_EVENT_KEY
  if (!eventKey) {
    return Response.json({ error: 'INNGEST_EVENT_KEY not set' }, { status: 500 })
  }

  try {
    const response = await fetch('https://inn.gs/e/' + eventKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'bedrock/sources.classify', data: {} }),
    })

    if (!response.ok) {
      const text = await response.text()
      return Response.json({ error: `Inngest HTTP error: ${response.status}`, body: text }, { status: 500 })
    }

    return Response.json({ ok: true, message: 'Classification job started' })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
