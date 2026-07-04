// PILLAR_ONE — locked copy for the seasonal ballot/officials pillar (§22c).
// The mode is controlled by site_config.pillar_one_mode via getPillarOneMode().
// All Tier A UI reads from this constant; flipping the flag touches zero copy files.

export type PillarOneMode = 'ballot' | 'officials'

export const PILLAR_ONE: Record<PillarOneMode, {
  navLabel: string; tileTitle: string; tileBlurb: string; eyebrow: string;
  h1: string; coverageNote: string; tourSubhead: string; tourBody: string;
}> = {
  ballot: {
    navLabel: 'Your Ballot',
    tileTitle: 'Your Ballot',
    tileBlurb: 'Every race, matched to your values. From president to school board.',
    eyebrow: 'YOUR BALLOT',
    h1: 'Every race, matched to your values.',
    coverageNote: "Covers federal and state races for the fall 2026 general election. Local races and ballot measures are coming — we'd rather show you nothing than something incomplete or unreliable.",
    tourSubhead: 'Every race. Matched to your values.',
    tourBody: 'Personalized ballot recommendations from president to school board — including the downballot races that shape your daily life and are hardest to research on your own. Candidate data is actively maintained and growing — coverage expands as we approach each election.',
  },
  officials: {
    navLabel: 'Your Officials',
    tileTitle: 'Your Officials',
    tileBlurb: 'The people already representing you, matched to your values. Senators to statehouse.',
    eyebrow: 'YOUR OFFICIALS',
    h1: 'Every office, matched to your values — right now.',
    coverageNote: "Covers your U.S. senators, House representative, governor, and state legislators. Where a state's data isn't reliable yet, we'll tell you that rather than guess. When election season arrives and the races are set, this becomes Your Ballot — same values, same engine, pointed at the people asking for your vote.",
    tourSubhead: 'The people representing you. Right now.',
    tourBody: "See how your values line up with your current senators, House rep, governor, and state legislators — based on their actual public record, not their press releases. When elections come around, this becomes Your Ballot: the same match, run on the people asking for your vote.",
  },
}
