export async function GET() {
  const results: Record<string, string> = {}

  try {
    await import('@/lib/jobs/classifySources')
    results.classifySources = 'OK'
  } catch (e) {
    results.classifySources = String(e)
  }

  try {
    await import('@/lib/jobs/weeklyDigest')
    results.weeklyDigest = 'OK'
  } catch (e) {
    results.weeklyDigest = String(e)
  }

  try {
    await import('@/lib/jobs/classifyCandidates')
    results.classifyCandidates = 'OK'
  } catch (e) {
    results.classifyCandidates = String(e)
  }

  return Response.json(results)
}

export const PUT = GET
export const POST = GET
