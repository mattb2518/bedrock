import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { classifySourcesJob } from '@/lib/jobs/classifySources'
import { weeklyDigestJob } from '@/lib/jobs/weeklyDigest'
import { classifyCandidatesJob } from '@/lib/jobs/classifyCandidates'

const handlers = serve({
  client: inngest,
  functions: [classifySourcesJob, weeklyDigestJob, classifyCandidatesJob],
})

export async function GET(req: Request, ctx: unknown) {
  console.log('Inngest GET:', req.url, Object.fromEntries(req.headers))
  try {
    return await (handlers.GET as (req: Request, ctx: unknown) => Promise<Response>)(req, ctx)
  } catch (e) {
    console.error('Inngest GET error:', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: Request, ctx: unknown) {
  console.log('Inngest PUT:', req.url, Object.fromEntries(req.headers))
  try {
    return await (handlers.PUT as (req: Request, ctx: unknown) => Promise<Response>)(req, ctx)
  } catch (e) {
    console.error('Inngest PUT error:', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request, ctx: unknown) {
  console.log('Inngest POST:', req.url, Object.fromEntries(req.headers))
  try {
    return await (handlers.POST as (req: Request, ctx: unknown) => Promise<Response>)(req, ctx)
  } catch (e) {
    console.error('Inngest POST error:', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
