import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { classifySourcesJob } from '@/lib/jobs/classifySources'
import { weeklyDigestJob } from '@/lib/jobs/weeklyDigest'
import { classifyCandidatesJob } from '@/lib/jobs/classifyCandidates'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [classifySourcesJob, weeklyDigestJob, classifyCandidatesJob],
})
