export async function GET() {
  try {
    const { Inngest } = await import('inngest')
    const { serve } = await import('inngest/next')
    const { classifySourcesJob } = await import('@/lib/jobs/classifySources')
    const { weeklyDigestJob } = await import('@/lib/jobs/weeklyDigest')
    const { classifyCandidatesJob } = await import('@/lib/jobs/classifyCandidates')

    const inngest = new Inngest({ id: 'bedrock' })

    const results: Record<string, string> = {}

    try {
      serve({ client: inngest, functions: [classifySourcesJob] })
      results.classifySourcesJob = 'OK'
    } catch (e) {
      results.classifySourcesJob = String(e)
    }

    try {
      serve({ client: inngest, functions: [weeklyDigestJob] })
      results.weeklyDigestJob = 'OK'
    } catch (e) {
      results.weeklyDigestJob = String(e)
    }

    try {
      serve({ client: inngest, functions: [classifyCandidatesJob] })
      results.classifyCandidatesJob = 'OK'
    } catch (e) {
      results.classifyCandidatesJob = String(e)
    }

    try {
      serve({ client: inngest, functions: [classifySourcesJob, weeklyDigestJob, classifyCandidatesJob] })
      results.allThree = 'OK'
    } catch (e) {
      results.allThree = String(e)
    }

    return Response.json(results)
  } catch (e) {
    return Response.json({ error: String(e) })
  }
}

export const PUT = GET
export const POST = GET
