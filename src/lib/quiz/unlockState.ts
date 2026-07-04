// Unlock ladder — maps layer completion to unlocked pillars.
// SPEC §2 Unlock Ladder.

export interface UnlockState {
  conversations: boolean        // requires L1
  mediaDiet: boolean            // requires L2
  pillar1: boolean              // requires L3 for ballot face only; officials face is ladder-exempt (§22b.1)
  beyondYourBallot: boolean     // requires L3
}

export function getUnlockState(layersCompleted: number): UnlockState {
  return {
    conversations: layersCompleted >= 1,
    mediaDiet: layersCompleted >= 2,
    pillar1: layersCompleted >= 3,
    beyondYourBallot: layersCompleted >= 3,
  }
}

// Pillar unlock requirements (used by locked-state copy)
export const UNLOCK_REQUIREMENTS: Record<keyof UnlockState, number> = {
  conversations: 1,
  mediaDiet: 2,
  pillar1: 3,
  beyondYourBallot: 3,
}
