// Layer 3 — the 8 voting-behavior questions, verbatim from SPEC §9.
// Behavioral register. These feed engine modifiers (character weight,
// electability tolerance, downballot salience, issue priority), not the
// 8-dimension profile — so options carry empty `scores`/`dimensions`.
//
// Q8 is the capstone: four sibling options, no micro-reactions, no easter egg,
// and option D opens its own text field (followUpPrompt) rather than routing
// through "It depends".

import type { QuizQuestion } from '@/types/quiz'

export const LAYER3_QUESTIONS: QuizQuestion[] = [
  {
    id: 'L3-Q1',
    layer: 3,
    text: 'A candidate you mostly agree with has a serious, credible character problem. How much does that matter to your vote?',
    dimensions: [],
    options: [
      { id: 'L3-Q1-a', text: 'It’s disqualifying — character and conduct in office are inseparable; how someone behaves in private predicts how they’ll wield power.', microReaction: 'The most reliable predictor of how someone will exercise power is how they’ve exercised it before — in relationships, in business, in private moments when they thought no one was watching.', scores: {} },
      { id: 'L3-Q1-b', text: 'Policy mostly wins — I’m electing someone to do a job, not a role model; strong record can outweigh personal flaws.', microReaction: 'FDR had a famously complicated personal life. LBJ was legendarily cruel to his staff. Nixon opened China while keeping an enemies list. Personal flaws and consequential records have coexisted in plenty of presidents.', scores: {} },
      { id: 'L3-Q1-c', text: 'Depends whether the flaw is relevant to the job — fraud predicts handling public money; a messy divorce doesn’t.', microReaction: 'Not all character flaws are created equal.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What would push you to “disqualifying”?', chips: ['The type of conduct', 'How recent it is', 'The volume of incidents', 'Whether they’ve acknowledged it'] },
  },
  {
    id: 'L3-Q2',
    layer: 3,
    text: 'Most voters have a general partisan lean. What would most reliably make you vote against it?',
    dimensions: [],
    options: [
      { id: 'L3-Q2-a', text: 'A candidate who crosses a policy line — one or two issues where the wrong answer disqualifies them regardless of party.', microReaction: 'Knowing your non-negotiables in advance is more principled than deciding after the fact.', scores: {} },
      { id: 'L3-Q2-b', text: 'Someone genuinely unfit — not a candidate I disagree with, but one lacking the competence, temperament, or integrity the job needs.', microReaction: 'Policy disagreements are normal. A candidate who can’t tell the truth, manage a team, or handle pressure is a different category of problem.', scores: {} },
      { id: 'L3-Q2-c', text: 'A genuinely strong candidate across the aisle — record, character, judgment compelling enough to earn your vote regardless of party.', microReaction: 'Ticket-splitting used to be common. It declined as parties sorted. The instinct — vote for the person, not the jersey — is still alive in a lot of voters.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'Is there a combination of factors that would flip your vote?', chips: ['A mix of policy and character concerns', 'The stakes of that particular race', 'How weak my own party’s candidate is', 'The strength of the alternative'] },
  },
  {
    id: 'L3-Q3',
    layer: 3,
    text: 'In a primary, your favorite matches you best but is a long shot; a moderate is more electable but less aligned. How do you vote?',
    dimensions: [],
    options: [
      { id: 'L3-Q3-a', text: 'Vote for who I actually want — primaries are for genuine preference; strategic voting yields a nominee nobody’s excited about.', microReaction: 'The expressive-preference answer — vote your actual view in the primary, save strategic voting for the general.', scores: {} },
      { id: 'L3-Q3-b', text: 'Vote for who can win — losing the general helps nobody, and winning is the prerequisite for everything else.', microReaction: 'The perfect candidate who loses has zero influence on policy. The imperfect candidate who wins has enormous influence.', scores: {} },
      { id: 'L3-Q3-c', text: 'Depends how big the electability gap is — slightly less electable, I vote my conscience; genuinely unelectable, the math changes.', microReaction: 'There’s a difference between “harder to elect” and “unelectable.” The first is worth accepting for a candidate you believe in.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What shapes your thinking?', chips: ['How important the office is', 'How different the candidates are on policy', 'How reliable electability polling tends to be'] },
  },
  {
    id: 'L3-Q4',
    layer: 3,
    text: 'Most ballots carry a dozen or more decisions below the top of the ticket. How do you approach them?',
    dimensions: [],
    options: [
      { id: 'L3-Q4-a', text: 'I research them seriously — downballot races often have more direct impact on daily life than federal ones.', microReaction: 'Your state legislature sets your tax rates, your school board sets curriculum, your county sheriff sets enforcement priorities. Local government is more present.', scores: {} },
      { id: 'L3-Q4-b', text: 'I vote the top of the ticket and do my best below — no time to research every downballot race thoroughly.', microReaction: 'Most voters are here. The information environment for downballot races is genuinely poor — local journalism has collapsed and candidate websites are sparse.', scores: {} },
      { id: 'L3-Q4-c', text: 'I focus on ballot measures and skip what I don’t know — better to leave a race blank than vote uninformed.', microReaction: 'An uninformed vote isn’t necessarily better than no vote. Leaving a race blank is a defensible choice — one the instructions on most ballots explicitly permit.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What shapes how much you engage?', chips: ['The office itself', 'Whether the race is contested', 'Whether good information is available'] },
    easterEgg: 'The average American voter faces 15 to 30 separate decisions on a general election ballot. In California in 2016, voters decided 17 statewide propositions alone — covering marijuana legalization, death penalty repeal, and workplace rules for adult film actors. That was before the candidates. A fully engaged California voter in a presidential year can face 40 or more distinct choices. Most voters research about three of them thoroughly.',
  },
  {
    id: 'L3-Q5',
    layer: 3,
    text: 'When an incumbent is running for reelection, how does that affect your thinking?',
    dimensions: [],
    options: [
      { id: 'L3-Q5-a', text: 'Meaningful advantage — a track record is real information. I know what they’ve actually done, not just what they’ve promised.', microReaction: 'Campaign promises are cheap. Voting records, budget decisions, and constituent services are evidence.', scores: {} },
      { id: 'L3-Q5-b', text: 'Mild disadvantage — incumbents accumulate obligations and the habits of power, and fresh perspective gets harder to hold.', microReaction: 'The longer someone holds office, the more relationships, obligations, and institutional habits accumulate.', scores: {} },
      { id: 'L3-Q5-c', text: 'Entirely depends on the record — incumbency itself is neutral. A strong record deserves reelection. A weak one deserves a challenger.', microReaction: 'Incumbency is neither a credential nor a scarlet letter. The question is always the same: did they do the job well?', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What shapes your view of incumbents?', chips: ['The office', 'How long they’ve served', 'What they did with the time'] },
    easterEgg: '“Throw out the bums — but not my bums.” Congressional reelection rates have been above 90% in every cycle since 1996. Public approval of Congress over the same period has averaged 20%. Americans don’t want to throw their bums out — just everyone else’s.',
  },
  {
    id: 'L3-Q6',
    layer: 3,
    text: 'Your party’s candidate is mediocre — not corrupt, just unremarkable. The other party’s is genuinely impressive. How do you vote?',
    dimensions: [],
    options: [
      { id: 'L3-Q6-a', text: 'Vote the party — even a mediocre member helps their caucus hold the chamber; majority control matters more than individual quality.', microReaction: 'Congress is a team sport. A brilliant independent-minded member of the minority has less influence than a mediocre member of the majority.', scores: {} },
      { id: 'L3-Q6-b', text: 'Vote the candidate — democracy works better when voters reward quality and punish mediocrity regardless of party.', microReaction: 'The sorting of Congress into two rigid teams where quality is irrelevant has produced exactly the Congress you’d expect.', scores: {} },
      { id: 'L3-Q6-c', text: 'Depends on the year — with chamber control at stake, party wins; in a safe seat, the better candidate costs nothing.', microReaction: 'Principles are easier to act on when the stakes are low.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What would push you toward the better candidate?', chips: ['How impressive they are', 'How weak my usual party’s candidate is', 'How safe the seat is'] },
  },
  {
    id: 'L3-Q7',
    layer: 3,
    text: 'When you vote, are you mainly thinking about the next two to four years, or the next ten to twenty?',
    dimensions: [],
    options: [
      { id: 'L3-Q7-a', text: 'The near term — elections have immediate consequences, and putting long-term abstractions over present impact is a luxury few can afford.', microReaction: 'People losing healthcare or watching their business close aren’t comforted by long-term thinking.', scores: {} },
      { id: 'L3-Q7-b', text: 'The long term — the most consequential decisions government makes — judicial appointments, infrastructure, constitutional norms — play out over decades, not years.', microReaction: 'The senators who confirmed Supreme Court justices in the 1980s shaped American law for forty years. Long-term thinking is how durable things get built.', scores: {} },
      { id: 'L3-Q7-c', text: 'Both, weighted by the office — presidential and judicial elections demand long-term thinking. Congressional and local elections often demand near-term accountability.', microReaction: 'A Supreme Court justice serves for life. A city council member serves two years. Your time horizon should match the time horizon of the office.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What shapes your time horizon?', chips: ['The specific issues at stake', 'Who’s most affected', 'The office being filled'] },
    easterEgg: 'The Constitution was written in 1787 by delegates whose average age was 42. Benjamin Franklin was 81 and had to be carried into the convention hall. Gouverneur Morris, who wrote the final draft, was 35. The document they produced in four months of a Philadelphia summer has outlasted every other national constitution written in the same century. Whatever they were doing in that room, the time horizon was definitely not “next election cycle.”',
  },
  {
    id: 'L3-Q8',
    layer: 3,
    text: 'If you could move the needle on exactly one issue in American public life — what would it be?',
    dimensions: [],
    options: [
      { id: 'L3-Q8-a', text: 'The machinery of democracy — gerrymandering, money in politics, voting access, judicial independence. The system behind every other decision.', scores: {} },
      { id: 'L3-Q8-b', text: 'Economic security and opportunity — healthcare, housing, wages, childcare. Everyday life is harder than it should be for most Americans.', scores: {} },
      { id: 'L3-Q8-c', text: 'National unity and civic health — the polarization and distrust that makes every other problem harder to solve.', scores: {} },
      { id: 'L3-Q8-d', text: 'Something else entirely — and it matters enough that I want to name it myself.', scores: {}, followUpPrompt: 'What’s the one issue you’d move if you could — in your own words. This becomes part of your Bedrock profile and helps us find the candidates and media that match what actually matters to you.' },
    ],
    // Capstone has no "It depends" — D serves that role. Empty prompt is the
    // sentinel the flow uses to hide the It-depends choice for this question.
    dependsFollowUp: { prompt: '', chips: [] },
  },
]
