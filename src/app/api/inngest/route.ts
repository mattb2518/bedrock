import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { classifySourcesJob } from '@/lib/jobs/classifySources'
import { weeklyDigestJob } from '@/lib/jobs/weeklyDigest'
import { classifyCandidatesJob } from '@/lib/jobs/classifyCandidates'

const { GET: inngestGET, POST: inngestPOST, PUT: inngestPUT } = serve({
  client: inngest,
  functions: [classifySourcesJob, weeklyDigestJob, classifyCandidatesJob],
})

async function withErrorLogging(
  handler: (req: Request) => Promise<Response>,
  req: Request
): Promise<Response> {
  try {
    return await handler(req)
  } catch (e) {
    console.error('Inngest handler error:', e)
    return Response.json({
      error: 'Handler failed',
      message: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    }, { status: 500 })
  }
}

export const GET = (req: Request) => withErrorLogging(inngestGET, req)
export const POST = (req: Request) => withErrorLogging(inngestPOST, req)
export const PUT = (req: Request) => withErrorLogging(inngestPUT, req)
