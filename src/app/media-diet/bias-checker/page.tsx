'use client'

/**
 * Standalone Article Bias Checker — /media-diet/bias-checker
 * Now a thin wrapper around <BiasCheckerTool />.
 * The tool itself is embedded in the right rail of /media-diet in the same component.
 */

import { useQuizStore } from '@/store/quizStore'
import { BiasCheckerTool } from '@/components/media/BiasCheckerTool'

export default function BiasCheckerPage() {
  const session = useQuizStore((s) => s.session)
  const hasProfile = Boolean(session?.result)
  const userProfile = session?.result ? (session.result.profile as unknown as Record<string, number>) : undefined
  const primaryType = session?.result?.primaryType

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <BiasCheckerTool
        userProfile={userProfile}
        primaryType={primaryType}
        hasProfile={hasProfile}
        compact={false}
      />
    </main>
  )
}
