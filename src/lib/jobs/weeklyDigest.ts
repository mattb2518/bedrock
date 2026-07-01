import { inngest } from '@/lib/inngest'
import { sendWeeklyDigest } from '@/lib/admin/weeklyDigest'

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? 'matt@myblumberg.com'

export const weeklyDigestJob = inngest.createFunction(
  {
    id: 'weekly-digest',
    name: 'Send weekly digest email',
    triggers: [{ cron: 'TZ=America/New_York 0 8 * * MON' }],
  },
  async () => {
    const result = await sendWeeklyDigest(SUPER_ADMIN_EMAIL)
    return result
  }
)
