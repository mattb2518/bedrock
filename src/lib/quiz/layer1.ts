// Layer 1 — 14 values questions (8 anchor + 4 crossover + 2 synthesis),
// plus the importance closer (§ line 71).
// Trimmed from original 20: removed C1, C3, C7, C8, S2, S3.
//
// Each option carries an `id` (stable; scoring keys off it, never display order)
// and `scores` — its implied 0–100 position on each dimension it touches
// (0 = pole A, 100 = pole B per dimensions.ts). The score values are PROVISIONAL
// Phase-A weights: principled but hand-set, meant to produce a plausible profile
// so the constellation + Mantle output is playable. The real scoring model from
// SPEC replaces them later.

import type { QuizQuestion } from '@/types/quiz'

export const LAYER1_QUESTIONS: QuizQuestion[] = [
  // ── ANCHOR (8) ──────────────────────────────────────────────────────────
  {
    id: 'A1',
    layer: 1,
    text: "When something in society isn't working well, what's your instinct?",
    dimensions: ['stability_change'],
    options: [
      {
        id: 'A1-a',
        text: 'Fix it carefully — change that moves too fast creates new problems faster than it solves old ones.',
        microReaction:
          'The wisdom of caution. A lot of well-meaning reformers have learned this the hard way.',
        scores: { stability_change: 20 },
      },
      {
        id: 'A1-b',
        text: 'Change it boldly — the cost of moving too slowly is paid by the people the system is failing right now.',
        microReaction:
          "Urgency as a moral position. Hard to argue with when you're the one waiting.",
        scores: { stability_change: 85 },
      },
      {
        id: 'A1-c',
        text: 'Fix the system that produces the problem — change the rules and incentives, and better outcomes follow.',
        microReaction:
          'Systems thinking — change the rules instead of fighting the outcomes.',
        scores: { stability_change: 65 },
      },
      {
        id: 'A1-d',
        text: "Test whether it's really broken before changing anything — what looks broken from one angle is often working as intended from another.",
        microReaction:
          'Chesterton’s Fence — before tearing down what looks like an unnecessary obstacle, find out why it was put there in the first place.',
        scores: { stability_change: 8 },
      },
    ],
    dependsFollowUp: {
      type: 'open_text',
      prompt:
        'What shapes your answer — the stakes, who’s affected, the track record of change in that area?',
    },
    // No easterEgg on A1 by design: the first question must auto-advance straight
    // to Q2 so the very first interaction proves the quiz moves fast, rather than
    // landing on a "Did you know?" intermission.
    note: 'A1 carries four substantive options instead of the usual three — deliberate on the foundational dimension; the original three were all change-positive and missed the strong-stability position.',
  },
  {
    id: 'A2',
    layer: 1,
    text: 'Most problems affecting Americans day-to-day — housing, school quality, public safety — are best handled by:',
    dimensions: ['local_federal'],
    options: [
      {
        id: 'A2-a',
        text: 'Local and state governments — closer to the problem, more accountable, better at tailoring solutions.',
        microReaction:
          'Subsidiarity — decisions made at the lowest level capable of making them well. Older than America, but America made it famous.',
        scores: { local_federal: 15 },
      },
      {
        id: 'A2-b',
        text: 'The federal government — national problems need national solutions, and local governments too often protect local interests at the expense of people who need help most.',
        microReaction:
          "The equity argument — some protections, like child labor laws and food safety, needed a national floor because they weren't going to emerge state by state. The tradeoff is real: a national floor can flatten genuine local difference.",
        scores: { local_federal: 85 },
      },
      {
        id: 'A2-c',
        text: 'Whoever has the strongest track record on that specific problem — some things states have solved brilliantly, others have required federal action.',
        microReaction: "Federalism by track record — let the level that's working own it.",
        scores: { local_federal: 50 },
      },
    ],
    dependsFollowUp: {
      type: 'multiple_choice',
      prompt: 'What tips the balance?',
      choices: [
        'Whether the problem crosses state lines',
        'Whether local governments have already tried and failed',
        'Whether equal treatment across states matters for this issue',
      ],
    },
    easterEgg:
      "The 10th Amendment — 'powers not delegated to the United States are reserved to the States' — is the shortest and most fought-over sentence in the Bill of Rights. Invoked to defend slavery. Invoked to legalize marijuana. Same 28 words.",
  },
  {
    id: 'A3',
    layer: 1,
    text: 'When American and global interests conflict, the United States should generally:',
    dimensions: ['national_global'],
    options: [
      {
        id: 'A3-a',
        text: "Prioritize American interests — a government's first obligation is to its own citizens, and influence abroad is only sustainable when we're strong at home.",
        microReaction:
          "There's a reason we have a State Department and not a World Department — every government answers first to the people who can vote it out.",
        scores: { national_global: 15 },
      },
      {
        id: 'A3-b',
        text: "Weigh global interests seriously — in an interconnected world, what's bad for the world tends to become bad for America, and global leadership builds influence money can't buy.",
        microReaction:
          'The post-WWII alliance system has shaped the global order for 75 years — a period that has coincided with the longest absence of great-power war in modern history.',
        scores: { national_global: 85 },
      },
      {
        id: 'A3-c',
        text: "Lead by example rather than intervention — America's most durable influence has always come from being worth emulating.",
        microReaction:
          'John Winthrop called it a city on a hill in 1630. Still the most distinctly American theory of foreign policy.',
        scores: { national_global: 38 },
      },
    ],
    dependsFollowUp: {
      type: 'multiple_choice',
      prompt: 'What tips the balance?',
      choices: [
        'The type of issue — trade, security, and humanitarian crises feel different',
        'The cost to Americans',
        'Whether other nations are sharing the burden',
      ],
    },
  },
  {
    id: 'A4',
    layer: 1,
    text: 'A mandatory minimum sentencing law that many judges and legal scholars argue produces outcomes disproportionate to the actual crimes. What should happen?',
    dimensions: ['rules_outcomes'],
    options: [
      {
        id: 'A4-a',
        text: 'Follow the law while working to change it — rule of law only works if everyone respects it, even when it’s imperfect.',
        microReaction:
          "The moment people start picking which laws deserve respect, you've lost something hard to get back.",
        scores: { rules_outcomes: 15 },
      },
      {
        id: 'A4-b',
        text: 'Use every available tool to mitigate unjust outcomes now — a law that reliably produces injustice has forfeited its moral authority.',
        microReaction:
          'Not every legal thing is just, and not every just thing is legal. America has known this since before it was America.',
        scores: { rules_outcomes: 85 },
      },
      {
        id: 'A4-c',
        text: 'Adjust enforcement in the meantime — sentencing guidelines and prosecution priorities can be recalibrated without waiting for legislation.',
        microReaction:
          'The distance between a law on paper and a law in practice is where a lot of the real action happens.',
        scores: { rules_outcomes: 55 },
      },
    ],
    dependsFollowUp: {
      type: 'multiple_choice',
      prompt: 'What shapes your answer?',
      choices: [
        'How severe the injustice is',
        'How realistic near-term legislative change is',
        'Whether the harm is ongoing',
      ],
    },
  },
  {
    id: 'A5',
    layer: 1,
    text: 'When it comes to solving big economic and social problems — healthcare costs, housing shortages, environmental damage — your instinct is:',
    dimensions: ['markets_governance'],
    options: [
      {
        id: 'A5-a',
        text: 'Let markets lead, with guardrails where necessary — competition and price signals allocate resources better than government programs.',
        microReaction:
          'Prices carry information no central planner can replicate. Markets aggregate decentralized knowledge in ways government allocation can’t match.',
        scores: { markets_governance: 15 },
      },
      {
        id: 'A5-b',
        text: 'Government needs to lead, using market tools where they work — some problems are too important, too long-term, or too inequitable to leave to markets that have no incentive to solve them.',
        microReaction:
          'Markets are excellent at a lot of things. Problems where costs fall on people outside the transaction aren’t one of them.',
        scores: { markets_governance: 85 },
      },
      {
        id: 'A5-c',
        text: 'Build the market you want — design rules and incentives so doing the right thing is also the profitable thing.',
        microReaction:
          'Design the rules so the right thing is also the profitable thing. Cap and trade made pollution expensive without picking winners.',
        scores: { markets_governance: 50 },
      },
    ],
    dependsFollowUp: {
      type: 'multiple_choice',
      prompt: 'What shapes your answer?',
      choices: [
        'Whether the market has actually failed or just needs better rules',
        'Whether costs fall on people outside the transaction',
        'Whether government has a good track record on this specific problem',
      ],
    },
  },
  {
    id: 'A6',
    layer: 1,
    text: 'In politics and civic life, lasting change usually comes from:',
    dimensions: ['pragmatism_idealism'],
    options: [
      {
        id: 'A6-a',
        text: 'Taking the deal in front of you — half a loaf beats no loaf, and pursuing perfect outcomes has a long history of destroying good ones.',
        microReaction:
          "Not glamorous, but it's how Social Security, Medicare, and the Civil Rights Act got across the finish line — all compromised, all transformative.",
        scores: { pragmatism_idealism: 15 },
      },
      {
        id: 'A6-b',
        text: 'Holding the line until the world catches up — movements that settle for less rarely get more, and the way to expand the possible is to keep demanding what’s right.',
        microReaction:
          'The hold-the-line theory of change. Movements that settle for less rarely get more.',
        scores: { pragmatism_idealism: 85 },
      },
      {
        id: 'A6-c',
        text: 'Building the coalition first — the limiting factor is rarely the idea, it’s the political will, and you build will by bringing more people along before you ask for the vote.',
        microReaction:
          "The coalition-building theory of change — the limiting factor is rarely the idea, it's the will, and will gets built one person at a time. Madison called it the slow work of assembling majorities.",
        scores: { pragmatism_idealism: 45 },
      },
    ],
    dependsFollowUp: {
      type: 'open_text',
      prompt:
        'What shapes your answer — whether the moment is politically ripe, how much harm is accumulating, whether a partial win forecloses the fuller one?',
    },
    easterEgg:
      "In 1849 Thoreau went to jail rather than pay a tax funding the Mexican-American War. Emerson visited and asked 'Henry, what are you doing in there?' Thoreau replied: 'Waldo, what are you doing out there?' The essay he wrote — Civil Disobedience — later influenced Gandhi and Martin Luther King Jr.",
  },
  {
    id: 'A7',
    layer: 1,
    text: 'When individual freedom and community wellbeing genuinely conflict — one person’s choice imposes real costs on others — what should generally give way?',
    dimensions: ['individual_collective'],
    options: [
      {
        id: 'A7-a',
        text: 'Individual freedom should be the strong default — restrictions on what people can do require strong justification.',
        microReaction:
          'The burden of proof should always be on whoever wants to restrict what someone else can do.',
        scores: { individual_collective: 15 },
      },
      {
        id: 'A7-b',
        text: "Community wellbeing — we're shaped by and responsible to our communities, and a freedom that imposes serious costs on others isn't worth protecting.",
        microReaction: "Rights don't exist in a vacuum. The person downwind has interests too.",
        scores: { individual_collective: 85 },
      },
      {
        id: 'A7-c',
        text: 'Protect the individual from government, but not necessarily from community standards — your neighbors can ask more of you than your government can.',
        microReaction:
          "HOAs are annoying but they're not unconstitutional. There's actually a coherent philosophy in there.",
        scores: { individual_collective: 58 },
      },
    ],
    dependsFollowUp: {
      type: 'multiple_choice',
      prompt: 'What shapes your answer?',
      choices: [
        'How serious the cost to others is',
        'Whether the community norm is itself fair',
        'Whether government or community is doing the asking',
      ],
    },
    easterEgg:
      "Eighteen states still have laws requiring citizens to help a neighbor in distress. Vermont's is the most famous — you can be fined for walking past someone drowning. One of the few places American law says being a decent neighbor is mandatory.",
  },
  {
    id: 'A8',
    layer: 1,
    text: 'When a major American expert institution — a federal regulatory agency, a scientific body like the CDC or NIH, an established peer-reviewed consensus — reaches a conclusion you find surprising or uncomfortable, your first instinct is:',
    dimensions: ['trust_skepticism'],
    options: [
      {
        id: 'A8-a',
        text: 'Give it serious weight — institutions with long track records of rigor have earned some deference, even when their conclusions are inconvenient.',
        microReaction:
          'The accumulated expertise of thousands of people working on a problem for decades is not nothing.',
        scores: { trust_skepticism: 15 },
      },
      {
        id: 'A8-b',
        text: 'Scrutinize it hard — institutions have interests, blind spots, and failure modes, and healthy skepticism is what keeps them honest.',
        microReaction:
          'Major institutional failures in American history — from the Tuskegee study to early COVID guidance reversals to repeated FBI surveillance overreach — were preceded by too much deference.',
        scores: { trust_skepticism: 85 },
      },
      {
        id: 'A8-c',
        text: "Calibrate based on the institution's track record on this specific type of question — the CDC gets more benefit of the doubt on epidemiology than on nutrition.",
        microReaction:
          'Trust by track record — the same institution can be rigorous in one domain and out over its skis in another. Calibrate to the domain, not the logo.',
        scores: { trust_skepticism: 50 },
      },
    ],
    dependsFollowUp: {
      type: 'open_text',
      prompt:
        'What shapes how much trust you extend — the type of institution, whether you can see their reasoning, whether they have a stake in the outcome?',
    },
    easterEgg:
      'Gallup has tracked American confidence in major institutions since the 1970s. Confidence in the US military has roughly doubled over that period. Confidence in Congress has fallen by about three-quarters. Same country, same Americans — two federal institutions on opposite trajectories.',
  },

  // ── CROSSOVER (4) ───────────────────────────────────────────────────────
  {
    id: 'C2',
    layer: 1,
    text: 'The federal government is considering a large public investment — infrastructure, broadband, a green energy grid — paid for by higher taxes on higher earners. Your reaction:',
    dimensions: ['individual_collective', 'markets_governance'],
    options: [
      {
        id: 'C2-a',
        text: 'Skeptical — broad public investments rarely deliver efficiently, and taking more from individuals to fund programs government manages poorly is a bad trade.',
        microReaction:
          "Government programs have constituencies that outlive their usefulness. The question isn't whether government can invest well. It's whether it will.",
        scores: { individual_collective: 20, markets_governance: 20 },
      },
      {
        id: 'C2-b',
        text: "Supportive — some things markets won't build because the return is too diffuse or too long-term, and a society that can't make collective investments in shared infrastructure is slowly eating itself.",
        microReaction:
          'Broadband in rural America wasn’t going to happen through market incentives alone. Sometimes the only entity with the right time horizon is the public one.',
        scores: { individual_collective: 85, markets_governance: 85 },
      },
      {
        id: 'C2-c',
        text: "Fund it like a private investor would — only with clear milestones, hard sunset clauses, and clawbacks if it fails. Public money should face at least the discipline private capital demands before a dollar goes out.",
        microReaction:
          "The Hoover Dam and Solyndra were both 'government investments.' The difference wasn't the label — it was whether anyone built in a way to fail fast and cut losses.",
        scores: { individual_collective: 50, markets_governance: 50 },
      },
    ],
    dependsFollowUp: {
      type: 'multiple_choice',
      prompt: 'What shapes your view?',
      choices: [
        'Whether the private sector has already tried and failed',
        'Whether the benefits are genuinely broad',
        'Whether there’s a credible implementation plan',
        'Whether the tax burden is fairly distributed',
      ],
    },
  },
  {
    id: 'C4',
    layer: 1,
    text: 'Your town has a serious housing shortage. A state law would override local zoning and require significantly more dense development. Your reaction:',
    dimensions: ['local_federal', 'individual_collective'],
    options: [
      {
        id: 'C4-a',
        text: 'The state is overreaching — zoning is one of the most local decisions there is, and communities should shape their own growth.',
        microReaction:
          'The people who live somewhere should have meaningful say over what it becomes. That’s not nimbyism — that’s democracy at its most direct.',
        scores: { local_federal: 15, individual_collective: 38 },
      },
      {
        id: 'C4-b',
        text: 'The state is right to intervene — local zoning has been used for decades to exclude people by income and race, and the housing crisis is too severe to leave to the communities that created it.',
        microReaction:
          'When local decisions impose costs on people who have no vote in that locality — the worker who can’t afford to live near their job — local democracy has a legitimacy problem.',
        scores: { local_federal: 85, individual_collective: 85 },
      },
      {
        id: 'C4-c',
        text: 'Override the zoning but compensate the community — if the state imposes regional priorities on a local area, it should share the infrastructure costs that come with growth.',
        microReaction:
          'Power without responsibility is just imposition. If you mandate the growth, fund the schools and roads.',
        scores: { local_federal: 68, individual_collective: 60 },
      },
    ],
    dependsFollowUp: {
      type: 'multiple_choice',
      prompt: 'What shapes your answer?',
      choices: [
        'Whether the shortage affects people outside the community',
        'Whether the community created the problem through exclusionary zoning',
        'Whether the state is offering resources alongside the mandate',
      ],
    },
  },
  {
    id: 'C5',
    layer: 1,
    text: 'The United States has the opportunity to join a new international agreement on a problem requiring global coordination — pandemic preparedness, cyber security, nuclear proliferation. It requires real commitments and some loss of unilateral flexibility. Your instinct:',
    dimensions: ['national_global', 'pragmatism_idealism'],
    options: [
      {
        id: 'C5-a',
        text: 'Be cautious — international agreements erode American sovereignty, and the history of multilateral institutions is full of good intentions and poor execution.',
        microReaction:
          "When an international body gets it wrong, Americans don't get to vote the decision-makers out.",
        scores: { national_global: 15, pragmatism_idealism: 35 },
      },
      {
        id: 'C5-b',
        text: 'Engage seriously — problems that cross borders require solutions that cross borders, and a United States that won’t commit to multilateral frameworks loses the credibility to shape them.',
        microReaction: 'You either help write the rules or you live under rules written by others.',
        scores: { national_global: 85, pragmatism_idealism: 65 },
      },
      {
        id: 'C5-c',
        text: 'Join but negotiate hard for enforcement mechanisms with teeth — agreements without consequences are just press releases.',
        microReaction:
          'The Paris Agreement had beautiful goals and no enforcement. The Chemical Weapons Convention has inspection regimes and real consequences. One of these is not like the other.',
        scores: { national_global: 65, pragmatism_idealism: 28 },
      },
    ],
    dependsFollowUp: {
      type: 'multiple_choice',
      prompt: 'What shapes your answer?',
      choices: [
        'Whether the problem can’t be solved unilaterally',
        'Whether the agreement has real enforcement',
        'Whether other major powers are genuinely committed',
        'What America would have to give up',
      ],
    },
    easterEgg:
      'The United States proposed the League of Nations, championed it at Versailles, and refused to join it. Wilson won the Nobel Peace Prize for the idea and died having failed to ratify it at home. Twenty-seven years later, America helped write the Universal Declaration of Human Rights and has never ratified the treaty making it binding. Eleanor Roosevelt chaired the drafting committee. America’s relationship with its own ideals has always been complicated — and always will be.',
  },
  {
    id: 'C6',
    layer: 1,
    text: 'A candidate you broadly agree with has a real chance of winning — but only if they soften a position you care deeply about. They’re asking for your support. What do you do?',
    dimensions: ['pragmatism_idealism', 'trust_skepticism'],
    options: [
      {
        id: 'C6-a',
        text: 'Support them — a candidate who wins on 70% of your priorities does more good than a principled candidate who loses and does nothing.',
        microReaction: 'Politics is the art of the possible, and the possible requires winning.',
        scores: { pragmatism_idealism: 15, trust_skepticism: 40 },
      },
      {
        id: 'C6-b',
        text: 'Withhold support unless they hold the line — a candidate who softens under pressure before the election will soften further after it.',
        microReaction:
          'Campaign commitments are the only leverage voters have. A party that learns it can soften positions without losing support will keep softening them.',
        scores: { pragmatism_idealism: 85, trust_skepticism: 72 },
      },
      {
        id: 'C6-c',
        text: 'Support them publicly but organize to hold them accountable after — winning matters, but so does building infrastructure that makes backsliding costly.',
        microReaction:
          'Show up for the win, then make sure they remember who showed up. It’s how durable political coalitions actually work.',
        scores: { pragmatism_idealism: 38, trust_skepticism: 60 },
      },
    ],
    dependsFollowUp: {
      type: 'open_text',
      prompt:
        'What would determine whether you’d support them — the specific issue, how much they’re softening, something about the candidate?',
    },
    easterEgg:
      "In 1964 LBJ told aides that signing the Civil Rights Act would cost Democrats the South 'for a generation.' He signed it. Twenty-two years later Reagan struck a sweeping tax reform deal with Democratic leadership that cut rates and closed loopholes conservatives had argued about for decades. Both got their landmark bills because they could count votes. The legislation of idealists is usually written by pragmatists who got elected.",
  },
  // ── SYNTHESIS (2) ───────────────────────────────────────────────────────
  {
    id: 'S1',
    layer: 1,
    text: 'After a series of domestic attacks, a president declares a national emergency and invokes executive powers never used in peacetime — suspending certain civil liberties, directing agencies without congressional approval, restricting movement. The threats are real. The legal authority is genuinely ambiguous. Your position:',
    dimensions: ['stability_change', 'rules_outcomes', 'local_federal', 'trust_skepticism'],
    options: [
      {
        id: 'S1-a',
        text: 'The executive needs these tools — in a genuine emergency, the pace of congressional deliberation is a liability, and a president who can’t act decisively has failed the most basic obligation of the office.',
        microReaction:
          'Lincoln suspended habeas corpus without congressional authorization. The Union survived.',
        scores: { stability_change: 60, rules_outcomes: 80, local_federal: 78, trust_skepticism: 30 },
      },
      {
        id: 'S1-b',
        text: 'Congress must be involved immediately — emergency powers without legislative oversight are how democracies become something else.',
        microReaction:
          'Every president who has tested the limits of emergency power has left the office larger than they found it.',
        scores: { stability_change: 38, rules_outcomes: 22, local_federal: 52, trust_skepticism: 80 },
      },
      {
        id: 'S1-c',
        text: 'Allow the emergency action but require automatic expiration and mandatory reauthorization — give the executive the speed the moment requires, but build in a hard stop.',
        microReaction:
          "The problem with emergency powers isn't the emergency — it's the 'temporary' measures that outlast the crisis by decades.",
        scores: { stability_change: 48, rules_outcomes: 50, local_federal: 62, trust_skepticism: 55 },
      },
    ],
    dependsFollowUp: {
      type: ‘open_text’,
      prompt:
        ‘What would determine how much executive emergency authority you’d support — the nature of the threat, the specific powers, the track record of the president?’,
    },
    easterEgg:
      "The federal income tax was introduced in 1861 as a temporary Civil War measure. Repealed in 1872. Back in 1894. Struck down by the Supreme Court. Back via constitutional amendment in 1913. The United States has been arguing about a tax that was supposed to last four years for over 160 years. ‘Temporary’ is doing a lot of work in American governance.",
  },
  {
    id: 'S4',
    layer: 1,
    text: 'During a severe pandemic, the federal government mandates vaccines, masks, and business closures. The measures demonstrably reduce deaths. They also damage small businesses, disrupt children’s education, and restrict movement for an extended period. Looking back, the right balance was:',
    dimensions: ['stability_change', 'individual_collective', 'local_federal', 'trust_skepticism'],
    options: [
      {
        id: 'S4-a',
        text: 'The restrictions were justified — collective action problems require collective solutions, and individuals who refused to participate imposed real costs on people around them.',
        microReaction:
          'Your freedom to move through the world unvaccinated during a pandemic is not a purely personal choice — it has a transmission probability attached to it.',
        scores: { stability_change: 55, individual_collective: 85, local_federal: 70, trust_skepticism: 30 },
      },
      {
        id: 'S4-b',
        text: 'The restrictions went too far — costs fell heavily on specific groups while the people making decisions bore far fewer of those costs personally.',
        microReaction:
          'When the people making decisions bear fewer costs than the people subject to them, the legitimacy of those decisions deserves scrutiny regardless of the public health merits.',
        scores: { stability_change: 45, individual_collective: 25, local_federal: 35, trust_skepticism: 70 },
      },
      {
        id: 'S4-c',
        text: "The problem wasn't the restrictions but the lack of honest accounting — the public was told tradeoffs were simple when they weren't, and the erosion of trust came from the gap between what officials said and what was actually known.",
        microReaction:
          'Guidance that changed without explanation, and projections wrong in both directions, eroded the trust that effective crisis response depends on.',
        scores: { stability_change: 50, individual_collective: 50, local_federal: 50, trust_skepticism: 72 },
      },
    ],
    dependsFollowUp: {
      type: 'open_text',
      prompt:
        'What would have made the response feel more legitimate — different policies, more honest communication, more local control, clearer expiration dates?',
    },
    easterEgg:
      'The 1918 influenza pandemic killed an estimated 675,000 Americans — more than every U.S. war of the twentieth century combined. There was no national policy; every city decided for itself, and the country argued bitterly over masks, closures, and quarantines, just as it would a century later. Within a generation it had largely faded from public memory.',
  },
]

// The importance closer — SPEC line 71. Shown after all 14 questions, before the
// constellation reveal. User picks up to 3 dimensions most central to them.
export const IMPORTANCE_CLOSER = {
  maxPicks: 3,
  framing:
    "You've just mapped how you think. Before we show you your constellation — which of these feel most central to who you are as a voter?",
}
