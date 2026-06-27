// Layer intro / outro copy, verbatim from SPEC §6. Used by the flow between
// layers. Layer 1's intro lives in QuizFlow's own intro screen.

import type { QuizLayer } from '@/types/quiz'

export const LAYER_LABELS: Record<QuizLayer, string> = {
  1: 'What you believe',
  2: 'How you apply it',
  3: 'What drives your vote',
  4: 'Dealbreakers',
}

// Short topic label per question, for the results-page summaries (SPEC §8/§9
// question headers).
export const QUESTION_TOPICS: Record<string, string> = {
  'L2-Q1': 'Healthcare',
  'L2-Q2': 'Climate & Energy',
  'L2-Q3': 'Gun Policy',
  'L2-Q4': 'Education',
  'L2-Q5': 'Immigration',
  'L2-Q6': 'Fiscal Policy',
  'L2-Q7': 'Foreign Policy',
  'L2-Q8': 'Reproductive Healthcare',
  'L2-Q9': 'Technology & Privacy',
  'L3-Q1': 'Character vs. Policy',
  'L3-Q2': 'Crossing Party Lines',
  'L3-Q3': 'Electability',
  'L3-Q4': 'Down-Ballot Races',
  'L3-Q5': 'Incumbency',
  'L3-Q6': 'Party vs. Candidate',
  'L3-Q7': 'Time Horizon',
  'L3-Q8': 'The One Issue',
}

// Shown after a layer's questions, teasing the next layer.
export const LAYER_OUTRO: Record<QuizLayer, { heading: string; body: string; teaser: string }> = {
  1: {
    heading: 'You just did something most voters never do.',
    body: 'You articulated what you actually believe — not what your party believes, not what your feed believes. Yours. Your constellation is taking shape. But right now it’s based purely on values. The next layer connects those values to real policy debates happening right now.',
    teaser: 'Layer 2 — How You Apply It — takes about 4 minutes. Your ballot recommendations get significantly sharper.',
  },
  2: {
    heading: 'You just mapped your values onto the real world.',
    body: 'Anyone can hold values in the abstract. You just showed where yours actually land — healthcare, climate, guns, immigration, and the rest. Two people with identical values can still vote differently. Now we know exactly where you’d part ways.',
    teaser: 'Next is the most revealing layer: what actually moves you when you vote. About 4 minutes.',
  },
  3: {
    heading: 'Most people can’t explain why they vote the way they do.',
    body: 'You just did — character vs. policy, party vs. person, what you’d trade and what you won’t. This is what makes a recommendation genuinely yours, instead of a profile that vaguely resembles you.',
    teaser: 'One layer left, and it’s unlike the others. Your dealbreakers — about 5 minutes. The line between a good match and an airtight one.',
  },
  4: {
    heading: 'That’s the whole picture — and it’s entirely yours.',
    body: 'Values, positions, what drives your vote, and the lines you won’t cross. Most people never draw a civic self-portrait this sharp. You just did.',
    teaser: 'Your profile is 100% mapped.',
  },
}

// Shown before a layer's questions (Layers 2–4; Layer 1 has its own intro).
export const LAYER_INTRO: Record<2 | 3 | 4, { heading: string; body: string }> = {
  2: {
    heading: 'Now for the real world.',
    body: 'Layer 1 was about how you think. Layer 2 is about where that thinking leads when it meets actual policy debates — healthcare, climate, guns, education, immigration, and more. These are more concrete, more current, more likely to make you feel something. Nine questions, about four minutes. One note: each asks for your best first move — not your complete theory of the problem. We’re asking where you’d start.',
  },
  3: {
    heading: 'This one’s different.',
    body: 'Layers 1 and 2 were about what you believe. Layer 3 is about what you’ll do with it — how you actually make voting decisions. What you prioritize. What you’ll trade off. What would make you cross party lines. Eight questions, about four minutes. Probably the most revealing layer of all.',
  },
  4: {
    heading: 'These aren’t preferences. They’re lines.',
    body: 'Not party lines — your lines. A candidate can be 90% aligned with your values and still be disqualified by one position, one vote, or one behavior. This is where you tell us yours. Select as many or as few as apply, and add your own at the bottom. Optional — but if you have real lines, drawing them here means we’ll never recommend someone who crosses them.',
  },
}
