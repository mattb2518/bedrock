// Layer 2 — the 9 issue-position questions, verbatim from SPEC §8.
// Stem on every question: "Of the following, what's the right first move?"
//
// These capture POSITIONS for the recommendation engine; they do not re-score
// the 8-dimension profile (that's Layer 1's job), so options carry empty
// `scores` and `dimensions`. See research/pillar-1-ballot-design.md (L2 refines,
// it doesn't replace).

import type { QuizQuestion } from '@/types/quiz'

export const LAYER2_QUESTIONS: QuizQuestion[] = [
  {
    id: 'L2-Q1',
    layer: 2,
    text: 'The United States spends more on healthcare per person than any other wealthy country and gets middling results. Of the following, what’s the right first move?',
    dimensions: [],
    options: [
      { id: 'L2-Q1-a', text: 'Force price transparency and real competition — publish what hospitals charge, end surprise billing, break up regional monopolies.', microReaction: 'When was the last time you comparison-shopped for a hospital? Markets need prices to work, and American healthcare has deliberately hidden them.', scores: {} },
      { id: 'L2-Q1-b', text: 'Expand public coverage and give government real negotiating power — extend Medicare, let it bargain on drug prices, cover the gaps private insurance won’t.', microReaction: 'Forty million Americans have inadequate or no insurance. The most efficient intervention is the one that reaches them first — and private markets have had decades to do it.', scores: {} },
      { id: 'L2-Q1-c', text: 'Redesign how we pay — move from fee-for-service to outcomes-based payment so providers make money when patients stay healthy, not when they get sick.', microReaction: 'Fee-for-service medicine is like paying a mechanic by the part replaced rather than whether your car runs.', scores: {} },
      { id: 'L2-Q1-d', text: 'Move toward single-payer or Medicare-for-All — every other wealthy democracy covers everyone for less per capita, and the patchwork of private insurance is what makes American healthcare uniquely expensive.', microReaction: 'The simplifying answer. Administrative overhead consumes about 30 cents of every American healthcare dollar — a cost most other systems don’t carry.', scores: {} },
    ],
    dependsFollowUp: { type: 'open_text', prompt: 'What do you think is the most broken part — costs, access, quality, insurance complexity?' },
    easterEgg: 'American healthcare spends roughly $1 trillion a year on administrative costs alone — more than the entire GDP of Sweden or Switzerland. A 2021 federal rule required hospitals to publish their prices. Most still haven’t.',
  },
  {
    id: 'L2-Q2',
    layer: 2,
    text: 'Climate and energy policy is one of the major questions of the era. Of the following, what’s the right first move?',
    dimensions: [],
    options: [
      { id: 'L2-Q2-a', text: 'Get the prices right — put a price on carbon, remove fossil fuel subsidies, and let markets drive the transition without picking winners.', microReaction: 'The acid rain cap-and-trade program cut emissions 50% at a fraction of projected cost. Make pollution expensive and people find cheaper ways to avoid it.', scores: {} },
      { id: 'L2-Q2-b', text: 'Set mandatory standards and fund the transition — the scale and urgency require government to move faster than markets will on their own.', microReaction: 'The electric grid, the interstate highway system, and the internet all required public investment to get built at necessary scale.', scores: {} },
      { id: 'L2-Q2-c', text: 'Win the technology race — the country that leads on solar, battery storage, and next-generation nuclear wins both the climate and the economic competition.', microReaction: 'Solar cost $75 per watt in 1977. It costs less than $0.20 today. That’s the learning curve. The question is how fast we want to accelerate it.', scores: {} },
      { id: 'L2-Q2-d', text: 'Slow down — the science is more contested than presented, the costs of aggressive transition fall heaviest on working families and energy-intensive industries, and prudence argues for waiting on clearer evidence before locking in expensive policy.', microReaction: 'The cost-benefit caution. Energy transitions are real, but so is the price of getting them wrong — and the people paying that price aren’t usually the people making the decisions.', scores: {} },
    ],
    dependsFollowUp: { type: 'multiple_choice', prompt: 'What shapes your view?', choices: ['How fast you think the transition needs to happen', 'How much you trust government to pick the right technologies', 'Whether international competitiveness matters as much as domestic emissions', 'How you weigh costs on current energy users against future generations'] },
    easterEgg: 'The United States has more wind energy capacity than any country except China — enough to power about 46 million homes. Texas alone generates more wind power than most countries. The state that built its economy on oil is now one of the largest wind energy producers in the world.',
  },
  {
    id: 'L2-Q3',
    layer: 2,
    text: 'The Second Amendment protects an individual right to own firearms. The debate is about where that right has limits. Of the following, what’s the right first move?',
    dimensions: [],
    options: [
      { id: 'L2-Q3-a', text: 'Enforce what’s already on the books — fix the background check database, fund mental health reporting, prosecute straw purchases.', microReaction: 'Background check gaps go unfilled. Most states underfund mental health reporting. Prosecution rates for straw purchases are near zero. The existing system has room before reaching for a new one.', scores: {} },
      { id: 'L2-Q3-b', text: 'Close the gaps with targeted new laws — universal background checks, red flag laws, and safe storage requirements don’t infringe the core right to self-defense.', microReaction: 'Every constitutional right has limits where it imposes serious costs on others. The question is where those limits are, not whether they exist.', scores: {} },
      { id: 'L2-Q3-c', text: 'Address the root causes — gun violence is concentrated in communities with high poverty, low opportunity, and inadequate mental health resources.', microReaction: 'The countries with the lowest gun violence rates aren’t just countries with stricter laws — they’re countries with stronger safety nets and less concentrated poverty.', scores: {} },
      { id: 'L2-Q3-d', text: 'Pass major new restrictions — universal background checks, a federal permit-to-purchase requirement, restrictions on military-style weapons, and stricter limits on who can carry where.', microReaction: 'The structural-change answer. Most other wealthy democracies treat firearms more like vehicles — licensed, regulated, and limited by type — and have dramatically lower gun violence rates.', scores: {} },
    ],
    dependsFollowUp: { type: 'multiple_choice', prompt: 'What shapes your view?', choices: ['Whether you think more laws would actually be enforced', 'Whether the focus should be on handguns or military-style rifles', 'Whether mental health is more central than access'] },
    easterEgg: 'Dodge City — the most iconic frontier town in American history — had a strict ordinance requiring all visitors to check their firearms at the sheriff’s office upon arrival. The sign at the city limits read “The Carrying of Firearms Strictly Prohibited.” Wyatt Earp enforced it. The Old West was more complicated than the legend.',
  },
  {
    id: 'L2-Q4',
    layer: 2,
    text: 'American public education produces wildly unequal outcomes depending almost entirely on zip code. Of the following, what’s the right first move?',
    dimensions: [],
    options: [
      { id: 'L2-Q4-a', text: 'Fix the funding model — schools funded by local property taxes will always produce unequal outcomes. Equalize funding first.', microReaction: 'A district where median home value is $800,000 will always outspend one where it’s $150,000. That’s not a teacher quality problem — it’s arithmetic.', scores: {} },
      { id: 'L2-Q4-b', text: 'Expand choice within the public system — magnet schools, charter schools, and open enrollment give families options without defunding the schools most students attend.', microReaction: 'The strongest school systems in the world all have meaningful choice built in. Choice and public education don’t have to be in conflict.', scores: {} },
      { id: 'L2-Q4-c', text: 'Invest in early childhood — dollar for dollar, pre-K investment produces better long-term outcomes than almost any other education spending.', microReaction: 'By the time a child enters kindergarten, the gaps that will define their educational trajectory are already forming.', scores: {} },
      { id: 'L2-Q4-d', text: 'Expand school choice broadly — vouchers, education savings accounts, and tax credits that let public funds follow students to the school their parents choose, public or private, secular or religious.', microReaction: 'The parent-power answer. The premise: parents allocate education resources better than school districts do, and competition raises quality across the board.', scores: {} },
    ],
    dependsFollowUp: { type: 'multiple_choice', prompt: 'What shapes your view?', choices: ['Whether your concern is primarily equity or quality', 'Whether you distinguish between charter schools and private vouchers', 'Whether you think the problem starts before kindergarten'] },
    easterEgg: 'The Perry Preschool Project, launched in 1962 in Ypsilanti, Michigan, enrolled 58 low-income children in a high-quality preschool and tracked them for 40 years. Those who attended were more likely to graduate high school, hold steady jobs, own homes, and stay out of prison. One of the most studied interventions in American social policy.',
  },
  {
    id: 'L2-Q5',
    layer: 2,
    text: 'Setting aside border enforcement, the legal immigration system determines who gets to come to America and how. Of the following, what’s the right first move?',
    dimensions: [],
    options: [
      { id: 'L2-Q5-a', text: 'Shift to a skills-based points system — select immigrants primarily for education, skills, and economic potential. Canada and Australia do this.', microReaction: 'About two-thirds of American green cards go to family members of existing residents — a policy designed in 1965 that changed the composition of immigration considerably.', scores: {} },
      { id: 'L2-Q5-b', text: 'Clear the backlog and fix the wait times — before redesigning the system, make the existing one function. People who followed the rules deserve an answer in their lifetime.', microReaction: 'The average wait for a green card from certain countries exceeds 50 years. That’s not a backlog — that’s a closed door with a waiting room.', scores: {} },
      { id: 'L2-Q5-c', text: 'Significantly raise the overall numbers — the United States has an aging population, a below-replacement birth rate, and industries that can’t find enough workers.', microReaction: 'Japan chose restriction and is now managing a shrinking, aging population with severe labor shortages. The United States has a different option — but the window may be narrower than most people realize.', scores: {} },
      { id: 'L2-Q5-d', text: 'Reduce overall numbers — current levels exceed what the labor market, public services, and assimilation infrastructure can absorb. Lower numbers would raise wages for existing workers and ease pressure on housing.', microReaction: 'The level-the-curve answer. Labor unions and environmentalists have historically held versions of this position alongside restrictionist conservatives — the coalition is older and stranger than it looks.', scores: {} },
    ],
    dependsFollowUp: { type: 'multiple_choice', prompt: 'What shapes your view?', choices: ['Whether you prioritize economic contribution or family unity', 'Whether current overall levels are too high, too low, or about right', 'Whether immigration levels affect wages for existing workers'] },
    easterEgg: 'In 1977 ABC aired a Schoolhouse Rock segment called “The Great American Melting Pot” — a three-minute animated song about immigration that ended with the Statue of Liberty serving soup. Watched by roughly every American child of that generation.',
  },
  {
    id: 'L2-Q6',
    layer: 2,
    text: 'The federal debt is approximately $34 trillion and growing. Of the following, what’s the right first move?',
    dimensions: [],
    options: [
      { id: 'L2-Q6-a', text: 'Cut spending — the federal government does too many things poorly and funds too many programs that have outlived their purpose.', microReaction: 'The federal budget has never actually shrunk in nominal terms — not once in modern history. Not because every program is essential. Because every program has a constituency.', scores: {} },
      { id: 'L2-Q6-b', text: 'Raise revenue — the United States collects less in taxes as a share of the economy than most comparable wealthy countries.', microReaction: 'American federal tax revenue as a share of GDP is lower than Germany, France, Canada, the UK, and Japan. The gap isn’t just a spending problem.', scores: {} },
      { id: 'L2-Q6-c', text: 'A bipartisan grand bargain that takes both seriously — every serious deficit reduction plan in American history has required both revenue increases and spending cuts.', microReaction: 'The deficit is the gap between revenue and spending. Every commission that has studied this seriously — Simpson-Bowles, Domenici-Rivlin — has reached the same conclusion: you need both.', scores: {} },
    ],
    dependsFollowUp: { type: 'multiple_choice', prompt: 'What shapes your view?', choices: ['Whether you think the debt is an immediate crisis or a long-term problem', 'Whether tax increases or spending cuts should lead', 'Whether you think the political system is capable of a grand bargain'] },
  },
  {
    id: 'L2-Q7',
    layer: 2,
    text: 'The United States spends more on its military than the next ten countries combined and maintains alliances and commitments on every continent. Of the following, what’s the right first move?',
    dimensions: [],
    options: [
      { id: 'L2-Q7-a', text: 'Recommit to the alliances and institutions — the post-WWII order America built has produced the longest period of great-power peace in modern history.', microReaction: 'NATO has existed for 75 years without a single Article 5 invocation. That’s not luck. That’s the alliance working as designed.', scores: {} },
      { id: 'L2-Q7-b', text: 'Demand more from partners and less from our treasury — allies who can afford to spend more on their own defense should.', microReaction: 'Most NATO members still don’t meet the 2% of GDP spending target they committed to in 2006. American taxpayers have been subsidizing European security for decades.', scores: {} },
      { id: 'L2-Q7-c', text: 'Rebalance toward economic and diplomatic tools — military superiority hasn’t produced the outcomes in Afghanistan, Iraq, or Libya that justified the investment.', microReaction: 'The United States has the most powerful military in human history and has fought four major wars since 1950 with mixed results. At some point the question isn’t whether we can win militarily — it’s whether winning militarily solves the problem.', scores: {} },
    ],
    dependsFollowUp: { type: 'multiple_choice', prompt: 'What shapes your view?', choices: ['Whether great-power competition with China changes the calculus', 'Whether military strength deters conflict or invites it', 'Whether domestic investment should take priority'] },
    easterEgg: 'Iceland is a full NATO member with no standing army. Its contribution to collective defense is primarily its geography and its Coast Guard, which has fought three “Cod Wars” against the United Kingdom over fishing rights. The alliance that has kept the peace in Europe for 75 years includes a country whose most recent military conflict was about fish.',
  },
  {
    id: 'L2-Q8',
    layer: 2,
    text: 'Since the Supreme Court overturned Roe v. Wade in 2022, abortion policy has been set by state legislatures, producing a patchwork that varies dramatically by geography. Of the following, what’s the right first move?',
    dimensions: [],
    options: [
      { id: 'L2-Q8-a', text: 'Pass a national ban with limited exceptions — a federal framework restricting abortion broadly, with carve-outs for rape, incest, and the life of the mother. The position that the government’s role here is the same as on murder: uniform national protection.', microReaction: 'The view that this is the question and the answer is no — and that no level of federalism makes it acceptable for the answer to be yes somewhere.', scores: {} },
      { id: 'L2-Q8-b', text: 'Let the democratic process work at the state level — the Court returned this question to elected legislatures, and different states reaching different conclusions reflects genuine moral disagreement no national consensus can resolve right now.', microReaction: 'When the Court settled this nationally for fifty years it didn’t resolve the disagreement — it suppressed it.', scores: {} },
      { id: 'L2-Q8-c', text: 'Pass a national legislative framework — rights that vary by zip code aren’t really rights, and a functioning democracy should reach a durable compromise reflecting where most Americans actually are: access in early pregnancy, restrictions later.', microReaction: 'Polling consistently shows most Americans support access in early pregnancy and restrictions later — a position held by neither party’s base but by a significant majority of the country.', scores: {} },
      { id: 'L2-Q8-d', text: 'Codify federal protection with no gestational limits — abortion access as a constitutional right of bodily autonomy, no state restrictions, public funding for those who can’t afford it.', microReaction: 'The bodily-autonomy answer. The position that government’s proper role in pregnancy decisions is, ultimately, none.', scores: {} },
    ],
    dependsFollowUp: { type: 'open_text', prompt: 'What factors matter most — stage of pregnancy, specific circumstances, role of religious belief, federal vs. state authority, whether to focus on the narrower contraception and IVF protections that command broader consensus?' },
    easterEgg: 'In 1972 — the year before Roe — the Republican platform supported abortion access and the Democratic platform was silent on it. George H.W. Bush was pro-choice before becoming Reagan’s running mate. Al Gore was pro-life before running for president. Jesse Jackson opposed abortion until 1988. The sorting of both parties into hard positions happened gradually, then suddenly — entirely within living memory. The issue didn’t change. The parties around it did.',
  },
  {
    id: 'L2-Q9',
    layer: 2,
    text: 'Technology companies now know more about most Americans than the government does — what you read, who you talk to, where you go, what you buy. Of the following, what’s the right first move?',
    dimensions: [],
    options: [
      { id: 'L2-Q9-a', text: 'Break up the platforms — the concentration of data and market power in a handful of companies is the core problem. Standard Oil didn’t get regulated into submission. It got broken up.', microReaction: 'Google processes 8.5 billion searches a day. Meta has 3 billion monthly users. At some point “market dominance” becomes “infrastructure” — and infrastructure has historically been subject to different rules.', scores: {} },
      { id: 'L2-Q9-b', text: 'Give Americans control of their own data — you should be able to see what’s collected about you, correct it, and delete it. Europe’s GDPR did this in 2018. Americans still don’t have a federal equivalent.', microReaction: 'Your medical records are protected by HIPAA. Your browsing history and location data can be bought and sold without your knowledge. The asymmetry is a choice, not an accident.', scores: {} },
      { id: 'L2-Q9-c', text: 'Regulate the algorithms, not the data — the harm isn’t that companies collect information, it’s that they use it to maximize engagement in ways that damage mental health, spread misinformation, and polarize the electorate.', microReaction: 'Facebook’s own research showed its algorithms made users angrier and more polarized — and it deployed them anyway because engagement drove revenue.', scores: {} },
      { id: 'L2-Q9-d', text: 'Trust competition and exit — new platforms emerge when old ones overreach, and government tools tend to entrench whoever’s already large. Microsoft was supposed to be unstoppable in 1998; TikTok displaced Facebook for a generation; Bluesky and Mastodon are responses to Twitter.', microReaction: 'The market-correcting answer. Big Tech criticism is bipartisan, but so is concern that letting Washington pick winners and losers in technology has a worse track record than the problem it’s trying to fix.', scores: {} },
    ],
    dependsFollowUp: { type: 'multiple_choice', prompt: 'What shapes your view?', choices: ['Whether competition or regulation is the more effective tool', 'Whether you’re more concerned about privacy or algorithmic harm', 'Whether American tech dominance is a national security asset worth protecting'] },
    easterEgg: 'The United States has comprehensive federal privacy laws for video rental records, children’s online activity, and educational records. There is no comprehensive federal privacy law for anything else. The Video Privacy Protection Act of 1988 was passed specifically because a reporter got Robert Bork’s Blockbuster rental history during his Supreme Court confirmation. Your Blockbuster history has been federally protected for 35 years. Your location data has not.',
  },
]
