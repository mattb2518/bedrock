import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { classifySourcesJob } from '@/lib/jobs/classifySources'
import { weeklyDigestJob } from '@/lib/jobs/weeklyDigest'
import { classifyCandidatesJob } from '@/lib/jobs/classifyCandidates'

const { GET: inngestGET, POST: inngestPOST, PUT: inngestPUT } = serve({
  client: inngest,
  functions: [classifySourcesJob, weeklyDigestJob, classifyCandidatesJob],
})

type AnyHandler = (...args: unknown[]) => Promise<Response>

async function withErrorLogging(handler: AnyHandler, ...args: unknown[]): Promise<Response> {
  try {
    return await handler(...args)
  } catch (e) {
    console.error('Inngest handler error:', e)
    return Response.json({ error: 'Handler failed', message: String(e) }, { status: 500 })
  }
}

export const GET = (...args: unknown[]) => withErrorLogging(inngestGET as AnyHandler, ...args)
export const POST = (...args: unknown[]) => withErrorLogging(inngestPOST as AnyHandler, ...args)
export const PUT = (...args: unknown[]) => withErrorLogging(inngestPUT as AnyHandler, ...args)
