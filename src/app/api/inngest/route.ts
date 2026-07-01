export async function GET() {
  const results: Record<string, string> = {}

  try {
    await import('@/lib/inngest')
    results.inngest = 'ok'
  } catch (e) {
    results.inngest = String(e)
  }

  try {
    await import('@/lib/jobs/classifySources')
    results.classifySources = 'ok'
  } catch (e) {
    results.classifySources = String(e)
  }

  try {
    await import('@/lib/jobs/weeklyDigest')
    results.weeklyDigest = 'ok'
  } catch (e) {
    results.weeklyDigest = String(e)
  }

  try {
    await import('@/lib/jobs/classifyCandidates')
    results.classifyCandidates = 'ok'
  } catch (e) {
    results.classifyCandidates = String(e)
  }

  try {
    const { serve } = await import('inngest/next')
    const { inngest } = await import('@/lib/inngest')
    const { classifySourcesJob } = await import('@/lib/jobs/classifySources')
    const { weeklyDigestJob } = await import('@/lib/jobs/weeklyDigest')
    const { classifyCandidatesJob } = await import('@/lib/jobs/classifyCandidates')
    serve({ client: inngest, functions: [classifySourcesJob, weeklyDigestJob, classifyCandidatesJob] })
    results.serve = 'ok'
  } catch (e) {
    results.serve = String(e)
  }

  return Response.json(results)
}
