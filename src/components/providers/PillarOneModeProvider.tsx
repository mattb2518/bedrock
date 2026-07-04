'use client'

import { createContext, useContext } from 'react'
import type { PillarOneMode } from '@/lib/config/pillarOne'

const PillarOneModeContext = createContext<PillarOneMode>('officials')

export function PillarOneModeProvider({
  mode,
  children,
}: {
  mode: PillarOneMode
  children: React.ReactNode
}) {
  return (
    <PillarOneModeContext.Provider value={mode}>
      {children}
    </PillarOneModeContext.Provider>
  )
}

export function usePillarOneMode(): PillarOneMode {
  return useContext(PillarOneModeContext)
}
