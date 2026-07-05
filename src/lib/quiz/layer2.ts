// Layer 2 — the 9 issue-position questions, verbatim from SPEC §8.
// Stem on every question: "Of the following, what's the right first move?"
//
// These capture POSITIONS for the recommendation engine; they do not re-score
// the 8-dimension profile (that's Layer 1's job), so options carry empty `scores`.
// Each question's `dimensions` field declares which axis/axes the question is
// EVIDENCE FOR in the engine's L2 bounded confidence boost (§19.4). These are
// corroborating dimensions, not scoring dimensions — filling them in here is what
// lets applyL2Boost() move from the structural proxy (Stage 2) to a real mapping.
// See research/pillar-1-ballot-design.md (L2 refines, it doesn't replace).

import type { QuizQuestion } from '@/types/quiz'

export const LAYER2_QUESTIONS: QuizQuestion[] = [
  {
    id: "L2-Q1",
    layer: 2,
    text: "The US spends the most per person on healthcare, for middling results. Of the following, what’s the right first move?",
    dimensions: ["markets_governance", "pragmatism_idealism"],
    options: [
      { id: 'L2-Q1-a', text: 'Force price transparency and real competition — publish what hospitals charge, end surprise billing, break up regional monopolies.', microReaction: 'When was the last time you comparison-shopped for a hospital? Markets need prices to work, and American healthcare has deliberately hidden them.', scores: {} },
      { id: 'L2-Q1-b', text: 'Expand public coverage and give government real negotiating power — extend Medicare, let it bargain on drug prices, cover the gaps.', microReaction: 'Forty million Americans have inadequate or no insurance. The most efficient intervention is the one that reaches them first — and private markets have had decades to do it.', scores: {} },
      { id: 'L2-Q1-c', text: 'Redesign how we pay — shift from fee-for-service to outcomes-based payment, so providers earn when patients stay healthy, not sick.', microReaction: 'Fee-for-service medicine is like paying a mechanic by the part replaced rather than whether your car runs.', scores: {} },
      { id: "L2-Q1-d", text: "Move toward single-payer or Medicare-for-All — every wealthy democracy covers everyone for less, and our private patchwork makes care uniquely expensive.", microReaction: "The simplifying answer. Administrative overhead consumes about 30 cents of every American healthcare dollar — a cost most other systems don’t carry.", scores: {} },
      { id: "L2-Q1-e", text: "Put patients in control of the dollars — health savings accounts, direct-pay care, insurance across state lines, and patients disciplining costs.", microReaction: "Cosmetic surgery and LASIK aren’t covered by insurance — and their prices have fallen for decades while everything insurance touches has risen. Make people the buyers and prices start behaving.", scores: {} },
    ],
    dependsFollowUp: { prompt: "What do you think is the most broken part?", chips: ["Costs", "Access", "Quality", "Insurance complexity"] },
    easterEgg: "American healthcare spends roughly $1 trillion a year on administrative costs alone — more than the entire GDP of Sweden or Switzerland. A 2021 federal rule required hospitals to publish their prices. Most still haven\’t.",
  },
  {
    id: "L2-Q2",
    layer: 2,
    text: "Climate and energy is one of the era’s defining questions. Of the following, what’s the right first move?",
    dimensions: ["markets_governance", "stability_change"],
    options: [
      { id: 'L2-Q2-a', text: 'Get the prices right — price carbon, end fossil fuel subsidies, and let markets drive the transition without picking winners.', microReaction: 'The acid rain cap-and-trade program cut emissions 50% at a fraction of projected cost. Make pollution expensive and people find cheaper ways to avoid it.', scores: {} },
      { id: 'L2-Q2-b', text: 'Set mandatory standards and fund the transition — the scale and urgency require government to move faster than markets will.', microReaction: 'The electric grid, the interstate highway system, and the internet all required public investment to get built at necessary scale.', scores: {} },
      { id: 'L2-Q2-c', text: 'Win the technology race — whoever leads on solar, storage, and next-gen nuclear wins both the climate and the economy.', microReaction: 'Solar cost $75 per watt in 1977. It costs less than $0.20 today. That’s the learning curve. The question is how fast we want to accelerate it.', scores: {} },
      { id: "L2-Q2-d", text: "Go slower and prioritize affordability and reliability — let proven technology and cost set the pace, not mandated deadlines.", microReaction: "The cost-benefit caution. Energy transitions are real, but so is the price of getting them wrong — and the people paying that price aren\’t usually the people making the decisions.", scores: {} },
    ],
    dependsFollowUp: { prompt: "What shapes your view?", chips: ["How fast you think the transition needs to happen", "How much you trust government to pick the right technologies", "Whether international competitiveness matters as much as domestic emissions", "How you weigh costs on current energy users against future generations"] },
    easterEgg: "The United States has more wind energy capacity than any country except China — enough to power about 46 million homes. Texas alone generates more wind power than most countries. The state that built its economy on oil is now one of the largest wind energy producers in the world.",
  },
  {
    id: "L2-Q3",
    layer: 2,
    text: "The Second Amendment protects gun ownership; the real debate is where its limits fall. Of the following, what’s the right first move?",
    dimensions: ["rules_outcomes", "individual_collective"],
    options: [
      { id: 'L2-Q3-a', text: 'Enforce what’s already on the books — fix the background check database, fund mental health reporting, prosecute straw purchases.', microReaction: 'Background check gaps go unfilled. Most states underfund mental health reporting. Prosecution rates for straw purchases are near zero. The existing system has room before reaching for a new one.', scores: {} },
      { id: 'L2-Q3-b', text: 'Close the gaps with targeted new laws — universal background checks, red flag laws, and safe storage don’t infringe self-defense.', microReaction: 'Every constitutional right has limits where it imposes serious costs on others. The question is where those limits are, not whether they exist.', scores: {} },
      { id: "L2-Q3-c", text: "Address the root causes — gun violence is concentrated in communities with high poverty, low opportunity, and inadequate mental health resources.", microReaction: "Gun violence tracks closely with concentrated poverty, untreated mental illness, and gang activity — the places with the least of it differ on more than their gun laws.", scores: {} },
      { id: 'L2-Q3-d', text: 'Pass major new restrictions — universal background checks, a federal permit-to-purchase, limits on military-style weapons, and stricter carry rules.', microReaction: 'The structural-change answer. Most other wealthy democracies treat firearms more like vehicles — licensed, regulated, and limited by type — and have dramatically lower gun violence rates.', scores: {} },
      { id: 'L2-Q3-e', text: 'Protect and expand gun rights — enforce existing laws on violent offenders, enact concealed-carry reciprocity, roll back restrictions on lawful owners.', microReaction: 'The rights-first answer. The premise: an armed, law-abiding citizenry is a constitutional baseline, and policy aimed at lawful owners tends to miss where violence actually concentrates.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What shapes your view?', chips: ['Whether you think more laws would actually be enforced', 'Whether the focus should be on handguns or military-style rifles', 'Whether mental health is more central than access'] },
    easterEgg: "The Second Amendment is twenty-seven words long and has produced some of the most contested litigation in American history — yet for most of that history it was barely litigated at all. The modern body of individual-rights jurisprudence is only about fifty years old. Americans have been arguing about those twenty-seven words for far longer than the courts have.",
  },
  {
    id: "L2-Q4",
    layer: 2,
    text: "American public schools produce wildly unequal outcomes, largely by zip code. Of the following, what’s the right first move?",
    dimensions: ["local_federal", "markets_governance"],
    options: [
      { id: 'L2-Q4-a', text: 'Fix the funding model — schools funded by local property taxes will always produce unequal outcomes. Equalize funding first.', microReaction: 'A district where median home value is $800,000 will always outspend one where it’s $150,000. That’s not a teacher quality problem — it’s arithmetic.', scores: {} },
      { id: 'L2-Q4-b', text: 'Expand choice within the public system — magnets, charters, and open enrollment give families options without defunding neighborhood schools.', microReaction: 'The strongest school systems in the world all have meaningful choice built in. Choice and public education don’t have to be in conflict.', scores: {} },
      { id: 'L2-Q4-c', text: 'Invest in early childhood — dollar for dollar, pre-K investment produces better long-term outcomes than almost any other education spending.', microReaction: 'By the time a child enters kindergarten, the gaps that will define their educational trajectory are already forming.', scores: {} },
      { id: 'L2-Q4-d', text: 'Expand school choice broadly — vouchers and tax credits that let public funds follow students to any school, private or religious.', microReaction: 'The parent-power answer. The premise: parents allocate education resources better than school districts do, and competition raises quality across the board.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What shapes your view?', chips: ['Whether your concern is primarily equity or quality', 'Whether you distinguish between charter schools and private vouchers', 'Whether you think the problem starts before kindergarten'] },
  },
  {
    id: "L2-Q5",
    layer: 2,
    text: "Setting aside border enforcement, the legal immigration system decides who gets to come. Of the following, what’s the right first move?",
    dimensions: ["national_global", "pragmatism_idealism"],
    options: [
      { id: 'L2-Q5-a', text: 'Shift to a skills-based points system — select immigrants primarily for education, skills, and economic potential. Canada and Australia do this.', microReaction: 'About two-thirds of American green cards go to family members of existing residents — a policy designed in 1965 that changed the composition of immigration considerably.', scores: {} },
      { id: 'L2-Q5-b', text: 'Clear the backlog and fix the wait times first — people who followed the rules deserve an answer in their lifetime.', microReaction: "A skilled worker from India can wait decades for a green card that takes months for someone from a smaller country. The line isn’t slow — for some nationalities it barely moves at all.", scores: {} },
      { id: 'L2-Q5-c', text: 'Significantly raise the overall numbers — an aging population, a below-replacement birth rate, and industries that can’t find enough workers.', microReaction: 'Japan chose restriction and is now managing a shrinking, aging population with severe labor shortages. The United States has a different option — but the window may be narrower than most people realize.', scores: {} },
      { id: 'L2-Q5-d', text: 'Reduce overall numbers — current levels strain the labor market, public services, and housing, and lower numbers would lift wages.', microReaction: 'The level-the-curve answer. Labor unions and environmentalists have historically held versions of this position alongside restrictionist conservatives — the coalition is older and stranger than it looks.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What shapes your view?', chips: ['Whether you prioritize economic contribution or family unity', 'Whether current overall levels are too high, too low, or about right', 'Whether immigration levels affect wages for existing workers'] },
    easterEgg: 'In 1977 ABC aired a Schoolhouse Rock segment called "The Great American Melting Pot" — a three-minute animated song about immigration that ended with the Statue of Liberty serving soup. Watched by roughly every American child of that generation.',
  },
  {
    id: "L2-Q6",
    layer: 2,
    text: "The federal debt is approximately $34 trillion and growing. Of the following, what’s the right first move?",
    dimensions: ["markets_governance", "pragmatism_idealism"],
    options: [
      { id: 'L2-Q6-a', text: 'Cut spending — the federal government does too many things poorly and funds too many programs that have outlived their purpose.', microReaction: 'The federal budget has never actually shrunk in nominal terms — not once in modern history. Not because every program is essential. Because every program has a constituency.', scores: {} },
      { id: 'L2-Q6-b', text: 'Raise revenue — the United States collects less in taxes as a share of the economy than most comparable wealthy countries.', microReaction: 'American federal tax revenue as a share of GDP is lower than Germany, France, Canada, the UK, and Japan. The gap isn’t just a spending problem.', scores: {} },
      { id: 'L2-Q6-c', text: 'A bipartisan grand bargain — every serious deficit plan in history has required both revenue increases and spending cuts.', microReaction: 'The deficit is the gap between revenue and spending. Every commission that has studied this seriously — Simpson-Bowles, Domenici-Rivlin — has reached the same conclusion: you need both.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What shapes your view?', chips: ['Whether you think the debt is an immediate crisis or a long-term problem', 'Whether tax increases or spending cuts should lead', 'Whether you think the political system is capable of a grand bargain'] },
  },
  {
    id: "L2-Q7",
    layer: 2,
    text: "The US outspends the next ten militaries combined and maintains alliances worldwide. Of the following, what’s the right first move?",
    dimensions: ["national_global", "trust_skepticism"],
    options: [
      { id: 'L2-Q7-a', text: 'Recommit to the alliances and institutions — the post-WWII order America built has produced the longest great-power peace in modern history.', microReaction: 'NATO has existed for 75 years without a single Article 5 invocation. That’s not luck. That’s the alliance working as designed.', scores: {} },
      { id: 'L2-Q7-b', text: 'Demand more from partners and less from our treasury — allies who can afford to spend more on their defense should.', microReaction: 'Most NATO members still don’t meet the 2% of GDP spending target they committed to in 2006. American taxpayers have been subsidizing European security for decades.', scores: {} },
      { id: 'L2-Q7-c', text: 'Rebalance toward economic and diplomatic tools — military superiority didn’t produce the outcomes in Afghanistan, Iraq, or Libya that justified it.', microReaction: 'The United States has the most powerful military in human history and has fought four major wars since 1950 with mixed results. At some point the question isn’t whether we can win militarily — it’s whether winning militarily solves the problem.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What shapes your view?', chips: ['Whether great-power competition with China changes the calculus', 'Whether military strength deters conflict or invites it', 'Whether domestic investment should take priority'] },
  },
  {
    id: "L2-Q8",
    layer: 2,
    text: "Since Roe was overturned in 2022, abortion policy is set state by state — a patchwork that varies sharply. Of the following, what’s the right first move?",
    dimensions: ["rules_outcomes", "local_federal"],
    options: [
      { id: 'L2-Q8-a', text: 'Pass a national ban with limited exceptions — broadly restricting abortion, with carve-outs for rape, incest, and the life of the mother.', microReaction: 'The view that this is the question and the answer is no — and that no level of federalism makes it acceptable for the answer to be yes somewhere.', scores: {} },
      { id: 'L2-Q8-b', text: 'Let the democratic process work state by state — genuine moral disagreement, no national consensus can resolve it right now.', microReaction: 'When the Court settled this nationally for fifty years it didn’t resolve the disagreement — it suppressed it.', scores: {} },
      { id: "L2-Q8-c", text: "Pass a national legislative framework — rights shouldn’t vary by zip code; reach a durable compromise of access early, restrictions later.", microReaction: "Polling tends to find more support for access early and limits later than either party’s base holds — though what counts as a fair compromise here varies enormously, and for some it isn’t a question that admits one.", scores: {} },
      { id: 'L2-Q8-d', text: 'Codify federal protection, no gestational limits — abortion as a right of bodily autonomy, publicly funded for those who can’t pay.', microReaction: 'The bodily-autonomy answer. The position that government’s proper role in pregnancy decisions is, ultimately, none.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What factors matter most?', chips: ['Stage of pregnancy', 'Specific circumstances', 'Role of religious belief', 'Federal vs. state authority', 'Focusing on contraception and IVF protections that command broader consensus'] },
  },
  {
    id: "L2-Q9",
    layer: 2,
    text: "Tech companies now know more about most Americans than the government does. Of the following, what’s the right first move?",
    dimensions: ["markets_governance", "individual_collective"],
    options: [
      { id: 'L2-Q9-a', text: 'Break up the platforms — the concentration of data and market power in a few companies is the core problem.', microReaction: 'Google processes 8.5 billion searches a day. Meta has 3 billion monthly users. At some point “market dominance” becomes “infrastructure” — and infrastructure has historically been subject to different rules.', scores: {} },
      { id: 'L2-Q9-b', text: 'Give Americans control of their own data — see, correct, and delete what’s collected, as Europe’s GDPR has allowed since 2018.', microReaction: 'Your medical records are protected by HIPAA. Your browsing history and location data can be bought and sold without your knowledge. The asymmetry is a choice, not an accident.', scores: {} },
      { id: 'L2-Q9-c', text: 'Regulate the algorithms, not the data — the harm isn’t collection, it’s maximizing engagement that harms mental health and polarizes us.', microReaction: 'Facebook’s own research showed its algorithms made users angrier and more polarized — and it deployed them anyway because engagement drove revenue.', scores: {} },
      { id: 'L2-Q9-d', text: 'Trust competition and exit — new platforms emerge when old ones overreach, and government tools tend to entrench whoever’s already big.', microReaction: 'The market-correcting answer. Big Tech criticism is bipartisan, but so is concern that letting Washington pick winners and losers in technology has a worse track record than the problem it’s trying to fix.', scores: {} },
    ],
    dependsFollowUp: { prompt: 'What shapes your view?', chips: ['Whether competition or regulation is the more effective tool', 'Whether you’re more concerned about privacy or algorithmic harm', 'Whether American tech dominance is a national security asset worth protecting'] },
    easterEgg: 'The United States has comprehensive federal privacy laws for video rental records, children’s online activity, and educational records. There is no comprehensive federal privacy law for anything else. The Video Privacy Protection Act of 1988 was passed specifically because a reporter got Robert Bork’s Blockbuster rental history during his Supreme Court confirmation. Your Blockbuster history has been federally protected for 35 years. Your location data has not.',
  },
]
