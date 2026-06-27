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
    text: 'A candidate you mostly agree with has a serious and credible character issue — a pattern of personal dishonesty, a history of treating people badly, or conduct that would end most careers elsewhere. How much does that matter?',
    dimensions: [],
    options: [
      { id: 'L3-Q1-a', text: 'It’s disqualifying — character and conduct in office are inseparable, and a person who behaves badly in private will eventually behave badly in public.', microReaction: 'The most reliable predictor of how someone will exercise power is how they’ve exercised it before — in relationships, in business, in private moments when they thought no one was watching.', scores: {} },
      { id: 'L3-Q1-b', text: 'Policy mostly wins — I’m electing someone to do a job, not be a role model. If the record is strong and the alternative is worse, I can hold my nose.', microReaction: 'FDR had a famously complicated personal life. LBJ was legendarily cruel to his staff. Both transformed the country.', scores: {} },
      { id: 'L3-Q1-c', text: 'Depends on whether the character issue is relevant to the job — financial fraud tells you something about how someone will handle public money. A messy divorce probably doesn’t.', microReaction: 'Not all character flaws are created equal.', scores: {} },
    ],
    dependsFollowUp: { type: 'open_text', prompt: 'What would push you to “disqualifying” — the type of conduct, how recent, the volume of incidents, whether they’ve acknowledged it?' },
    easterEgg: 'Grover Cleveland was elected president in 1884 despite his opponents publicizing that he’d fathered a child out of wedlock. They chanted “Ma, ma, where’s my pa?” His supporters responded: “Gone to the White House, ha ha ha.” He won.',
  },
  {
    id: 'L3-Q2',
    layer: 3,
    text: 'Most voters have a general partisan lean. What would most reliably make you vote against it?',
    dimensions: [],
    options: [
      { id: 'L3-Q2-a', text: 'A candidate who crosses a specific policy line — there are one or two issues where my position is firm enough that the wrong answer disqualifies someone regardless of party.', microReaction: 'Knowing your non-negotiables in advance is more principled than deciding after the fact.', scores: {} },
      { id: 'L3-Q2-b', text: 'A candidate who seems genuinely unfit — not someone I disagree with, but someone who lacks the basic competence, temperament, or integrity the job requires.', microReaction: 'Policy disagreements are normal. A candidate who can’t tell the truth, manage a team, or handle pressure is a different category of problem.', scores: {} },
      { id: 'L3-Q2-c', text: 'An exceptionally strong candidate on the other side — someone whose record, character, and judgment are compelling enough to vote for regardless of the party label.', microReaction: 'Ticket-splitting used to be common. It declined as parties sorted. The instinct — vote for the person, not the jersey — is still alive in a lot of voters.', scores: {} },
    ],
    dependsFollowUp: { type: 'open_text', prompt: 'Is there a specific combination of factors that would flip your vote?' },
  },
  {
    id: 'L3-Q3',
    layer: 3,
    text: 'You’re in a primary. Your preferred candidate holds positions closest to yours but faces an uphill general election battle. A more moderate candidate is more electable but less aligned. How do you vote?',
    dimensions: [],
    options: [
      { id: 'L3-Q3-a', text: 'Vote for who I actually want — primaries exist to express genuine preference, and strategically voting for someone you don’t really want often produces a candidate nobody’s excited about.', microReaction: 'The expressive-preference answer — vote your actual view in the primary, save strategic voting for the general.', scores: {} },
      { id: 'L3-Q3-b', text: 'Vote for who can win — a candidate who loses the general helps nobody, and winning is the prerequisite for everything else.', microReaction: 'The perfect candidate who loses has zero influence on policy. The imperfect candidate who wins has enormous influence.', scores: {} },
      { id: 'L3-Q3-c', text: 'Depends on how big the electability gap is — if my preferred candidate is slightly less electable, I vote my conscience. If they’re genuinely unelectable, the math changes.', microReaction: 'There’s a difference between “harder to elect” and “unelectable.” The first is worth accepting for a candidate you believe in.', scores: {} },
    ],
    dependsFollowUp: { type: 'open_text', prompt: 'What factors shape your thinking — how important the office is, how different the candidates are on policy, how reliable the electability polling tends to be?' },
  },
  {
    id: 'L3-Q4',
    layer: 3,
    text: 'Most American ballots include state legislature, county commissioner, school board, judges, ballot measures — often a dozen or more decisions beyond the top of the ticket. How do you approach those?',
    dimensions: [],
    options: [
      { id: 'L3-Q4-a', text: 'I research them seriously — downballot races often have more direct impact on daily life than federal ones.', microReaction: 'Your state legislature sets your tax rates, your school board sets curriculum, your county sheriff sets enforcement priorities. Local government is more present.', scores: {} },
      { id: 'L3-Q4-b', text: 'I vote the top of the ticket and do my best on the rest — I follow the major races closely but don’t have time to research every downballot race thoroughly.', microReaction: 'Most voters are here. The information environment for downballot races is genuinely poor — local journalism has collapsed and candidate websites are sparse.', scores: {} },
      { id: 'L3-Q4-c', text: 'I focus on ballot measures and skip races where I don’t know enough — I’d rather leave a race blank than vote uninformed.', microReaction: 'An uninformed vote isn’t necessarily better than no vote. Leaving a race blank is a defensible choice — one the instructions on most ballots explicitly permit.', scores: {} },
    ],
    dependsFollowUp: { type: 'open_text', prompt: 'What shapes how much you engage — the office, whether it’s contested, whether you can find good information?' },
    easterEgg: 'The average American voter faces 15 to 30 separate decisions on a general election ballot. In California in 2016, voters decided 17 statewide propositions alone — covering marijuana legalization, death penalty repeal, and workplace rules for adult film actors. That was before the candidates. A fully engaged California voter in a presidential year can face 40 or more distinct choices. Most voters research about three of them thoroughly.',
  },
  {
    id: 'L3-Q5',
    layer: 3,
    text: 'When an incumbent is running for reelection, how does that affect your thinking?',
    dimensions: [],
    options: [
      { id: 'L3-Q5-a', text: 'Meaningful advantage — a track record is real information. I know what they’ve actually done, not just what they’ve promised.', microReaction: 'Campaign promises are cheap. Voting records, budget decisions, and constituent services are evidence.', scores: {} },
      { id: 'L3-Q5-b', text: 'Mild disadvantage — incumbents accumulate obligations and the habits of power over time. Fresh perspective is harder to maintain the longer someone has been in office.', microReaction: 'The longer someone holds office, the more relationships, obligations, and institutional habits accumulate.', scores: {} },
      { id: 'L3-Q5-c', text: 'Entirely depends on the record — incumbency itself is neutral. A strong record deserves reelection. A weak one deserves a challenger.', microReaction: 'Incumbency is neither a credential nor a scarlet letter. The question is always the same: did they do the job well?', scores: {} },
    ],
    dependsFollowUp: { type: 'open_text', prompt: 'What shapes how you think about incumbents — the office, how long they’ve served, what they did with the time?' },
    easterEgg: '“Throw out the bums — but not my bums.” Congressional reelection rates have been above 90% in every cycle since 1996. Public approval of Congress over the same period has averaged 20%. Americans don’t want to throw the bums out — just everyone else’s.',
  },
  {
    id: 'L3-Q6',
    layer: 3,
    text: 'The candidate from your usual party is mediocre — not corrupt, just unremarkable. The candidate from the other party is genuinely impressive. How do you vote?',
    dimensions: [],
    options: [
      { id: 'L3-Q6-a', text: 'Vote the party — a mediocre member of your own party still votes with that caucus, helps it control the chamber, and advances its agenda. Individual quality matters less than which team holds the majority.', microReaction: 'Congress is a team sport. A brilliant independent-minded member of the minority has less influence than a mediocre member of the majority.', scores: {} },
      { id: 'L3-Q6-b', text: 'Vote the candidate — democracy works better when voters reward quality and punish mediocrity regardless of party.', microReaction: 'The sorting of Congress into two rigid teams where quality is irrelevant has produced exactly the Congress you’d expect.', scores: {} },
      { id: 'L3-Q6-c', text: 'Depends on the stakes — in a year when chamber control is on the line, the structural argument wins. In a safe year, voting for the better candidate costs nothing and signals something.', microReaction: 'Principles are easier to act on when the stakes are low.', scores: {} },
    ],
    dependsFollowUp: { type: 'open_text', prompt: 'What would push you toward the better candidate — how impressive they are, how mediocre your usual party’s candidate is, how safe the seat is?' },
    easterEgg: 'In 2006 Joe Lieberman lost his Democratic primary in Connecticut, ran as an Independent, won the general, caucused with Democrats, and two years later delivered a keynote speech endorsing John McCain at the Republican National Convention.',
  },
  {
    id: 'L3-Q7',
    layer: 3,
    text: 'When deciding how to vote, are you primarily thinking about the next two to four years, or the next ten to twenty?',
    dimensions: [],
    options: [
      { id: 'L3-Q7-a', text: 'The near term — elections have immediate consequences for real people, and voting for abstract long-term considerations while ignoring present-day impact is a luxury not everyone can afford.', microReaction: 'People losing healthcare or watching their business close aren’t comforted by long-term thinking.', scores: {} },
      { id: 'L3-Q7-b', text: 'The long term — the most consequential decisions government makes — judicial appointments, infrastructure, constitutional norms — play out over decades, not years.', microReaction: 'The senators who confirmed Supreme Court justices in the 1980s shaped American law for forty years. Long-term thinking is how durable things get built.', scores: {} },
      { id: 'L3-Q7-c', text: 'Both, weighted by the office — presidential and judicial elections demand long-term thinking. Congressional and local elections often demand near-term accountability.', microReaction: 'A Supreme Court justice serves for life. A city council member serves two years. Your time horizon should match the time horizon of the office.', scores: {} },
    ],
    dependsFollowUp: { type: 'open_text', prompt: 'What shapes your time horizon — the specific issues, who’s most affected, the office being filled?' },
    easterEgg: 'The Constitution was written in 1787 by delegates whose average age was 42. Benjamin Franklin was 81 and had to be carried into the convention hall. Gouverneur Morris, who wrote the final draft, was 35. The document they produced in four months of a Philadelphia summer has outlasted every other national constitution written in the same century. Whatever they were doing in that room, the time horizon was definitely not “next election cycle.”',
  },
  {
    id: 'L3-Q8',
    layer: 3,
    text: 'If you could move the needle on exactly one issue in American public life — one thing that, if fixed, would matter most to you — what would it be?',
    dimensions: [],
    options: [
      { id: 'L3-Q8-a', text: 'The machinery of democracy itself — gerrymandering, money in politics, voting access, judicial independence. Fix the system that produces all the other decisions.', scores: {} },
      { id: 'L3-Q8-b', text: 'Economic security and opportunity — healthcare costs, housing affordability, wages, childcare. The material conditions of most Americans’ lives are harder than they should be.', scores: {} },
      { id: 'L3-Q8-c', text: 'National unity and civic health — the polarization and distrust that makes every other problem harder to solve.', scores: {} },
      { id: 'L3-Q8-d', text: 'Something else entirely — and it matters enough that I want to name it myself.', scores: {}, followUpPrompt: 'What’s the one issue you’d move if you could — in your own words. This becomes part of your Bedrock profile and helps us find the candidates and media that match what actually matters to you.' },
    ],
    // Capstone has no "It depends" — D serves that role. Prompt kept for type
    // completeness but the flow hides the It-depends choice for this question.
    dependsFollowUp: { type: 'open_text', prompt: '' },
  },
]
