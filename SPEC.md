# Bedrock — Master Product Specification
*Version 0.1 — In Progress — Started June 2026*
*This document is the single source of truth for Claude Code and all build decisions.*
*Updated incrementally as each section is completed.*

---

## 1. Platform Overview

**Name:** Bedrock
**Domains:** bedrock.guide (primary), bedrock.vote (companion)
**Registrars:** bedrock.guide at Cloudflare; bedrock.vote at Network Solutions (Cloudflare SSL/routing on both)
**Status:** Passion project, no incorporated entity. Moving toward nonprofit or public benefit corporation.

**What Bedrock is:** A civic identity platform for independent-minded voters. Three things, powered by one values quiz:
1. Help voters understand what they actually believe — underneath partisan noise
2. Translate those beliefs into personalized ballot recommendations for every race, top to bottom
3. Match voters to an independent media diet — journalists, Substacks, podcasts — that reflects how they actually think

**What Bedrock is not:** A party voter guide, a polling tool, a debate platform, an advocacy organization. Not the Bedrock at bedrock.us (different mission, different domain).

**Target audience:** Independent-minded voters — registered independents and soft partisans who don't vote the straight ticket. The largest and fastest-growing voter segment. Highly engaged but underserved by every existing civic tool.

**Founder:** Matt Blumberg — technology entrepreneur, civic institutionalist, creator of the Country Over Self podcast. Over 150 presidential biographies read. "I'm not red. I'm not blue. I'm red, white, and blue."

**Nonpartisan credibility:** Structural, not cosmetic. Every design, data, and copy decision must hold up to scrutiny from both sides.

---

## 2. Product Architecture

### Three Pillars, One Quiz, One Civic Identity

The quiz is the shared engine. It produces a civic identity — a named type and dimensional constellation — which is the overarching layer that powers everything else.

**Civic Identity** (overarching layer, not a pillar)
Values quiz → dimensional profile → named civic type (one of ten) + unique constellation radar chart. This is the foundation on which all three pillars rest. Displayed prominently above or around the three pillars on the homepage and results page — needs visual design treatment to make the hierarchy clear.

**Pillar 1 — Your Ballot**
Civic identity → personalized ballot recommendations for every race (president to school board) → printable guide → transparent sourcing

**Pillar 2 — Your Media Diet**
Civic identity → recommended independent journalists, Substacks, podcasts in three tiers (confirming, expanding, challenging)

**Pillar 3 — Your Conversations**
Civic identity → Claude-powered chat interface for preparing and navigating difficult civic conversations across political difference. Uses the user's dimensional profile as persistent context. Broad scope — any civic disagreement, any time, not limited to election season.

### Quiz Architecture — Four Layers

| Layer | Name | Questions | Type | Output |
|---|---|---|---|---|
| 1 | Who you are | 20 | Values tensions (8 anchor + 8 crossover + 4 synthesis) | Constellation + primary type |
| 2 | How you apply it | 8 | Issue positions | Sharper recommendations |
| 3 | What drives your vote | 8 | Voting behavior + priority intensity | Personalized matching |
| 4 | Where you draw the line | 12-15 | Binary dealbreaker filters | Exclusion rules for engine |

**Total:** ~48-51 items for full completion. Each layer has a distinct job and feel. Never a slog.

**Progressive depth model:** Users get real value from Layer 1 alone. Each subsequent layer deepens the profile and sharpens recommendations. Profile completeness indicator: ~40% after L1, ~65% after L2, ~85% after L3, ~100% after L4.

### Quiz Format Rules

- **3 options + "It depends"** on every question (not 4 options)
- No option should be the obviously "correct" answer — all three must be genuinely defensible
- Option C must have teeth — a real position with real consequences, not a bridge between A and B
- **"It depends"** is a first-class answer, never a cop-out
- Two follow-up mechanics for "It depends":
  - **Open text:** "Tell us more — what shapes your answer?" Used when nuance is personal and hard to pre-enumerate
  - **Choice follow-up (select all that apply):** 3-4 specific sub-cases. Used when sub-cases are predictable
- Each question gets one follow-up mechanic, decided at write time
- **Dimension importance rating:** Single question at the end of Layer 1 — after all 20 questions, before the constellation reveal. Shows all eight dimensions as selectable tiles; user picks up to 3 that feel most central to their civic identity. Framing: *"You've just mapped how you think. Before we show you your constellation — which of these feel most central to who you are as a voter?"* Output feeds the recommendation engine as a weighting signal. Pushes Layer 1 to 21 items total.
- **"Add context" on every question:** Small, subtle gray "+ add context" link below each answer. Expands an inline text field on click. No label saying "optional" — unobtrusiveness communicates that. Applies to all layers.
- **Micro-reactions** after each answer: brief, warm, occasionally surprising, never partisan, occasionally humorous. User must tap, click, or press Enter to advance — no auto-advance. Click target should be the full screen or answer area, not a labeled button.
- **Easter eggs:** American only — historical nuggets, serious trivia, or humor. Woven in naturally, roughly 1 per question. Mix of serious historical and lighter Americana.
- **Bias check rule:** All questions reviewed for political lean before finalizing. Micro-reactions and examples must be balanced — no option should feel like the "wrong" answer

### Account and Save/Return

- Mandatory account creation (not optional)
- **Account creation timing:** TBD — before quiz, after Layer 1, or at point of saving results. Decision needed before build.
- Email link as backup save mechanism
- System knows exactly where user is on return
- Profile persists across sessions with recursive learning via Claude API

### Returning User — Quiz Page Behavior

**Partial completion (any layer incomplete):**
Resume exactly where they left off. No retake screen. No branching. Just continue.

**Full completion (all four layers + context module done):**
Landing on the quiz page shows a retake screen with two options:

*Option A — Retake from scratch*
- Confirmation dialog required: "This will replace your current profile. Your previous answers will be permanently deleted. Are you sure?"
- On confirm: clears all existing responses, starts Layer 1 fresh
- Profile updates in full when new quiz is complete
- Constellation and civic type update on completion

*Option B — Edit responses*
- Shows quiz layer by layer — user navigates one layer at a time
- Within each layer, existing answers are pre-filled and individually editable
- No forced re-do of unchanged answers
- **Cascade behavior:** When a user changes one or more answers in Layer 1, on advancing to Layer 2 show a soft prompt: "You updated some foundational answers — your positions in this layer may be worth revisiting." Same prompt on Layer 3 if Layer 1 or 2 changed. No forced re-answer — user can dismiss and move on.
- Profile re-scores with updated inputs on save, whether or not downstream layers were revisited
- Constellation and civic type update immediately on save

**Design notes:**
- Retake screen should feel low-pressure — framed as growth ("Your thinking evolves. Your profile can too."), not as correction
- Both paths end with a profile update confirmation and refreshed results view
- Retake from scratch is the nuclear option; Edit responses is the expected path for most returning users

---

## 3. The Eight Civic Dimensions

The dimensional model is Bedrock's core IP. Eight axes, each a genuine spectrum between two poles:

| Dimension | Pole A | Pole B | What it measures |
|---|---|---|---|
| 1 | Stability | Change | Pace and risk tolerance for societal change |
| 2 | Local | Federal | Where governmental power should be concentrated |
| 3 | National | Global | America's orientation toward the world |
| 4 | Rules | Outcomes | Process vs. results in governance |
| 5 | Markets | Governance | Economic vs. government solutions |
| 6 | Pragmatism | Idealism | Achievable compromise vs. principled positions |
| 7 | Individual | Collective | Personal liberty vs. community obligation |
| 8 | Trust | Skepticism | Deference to vs. scrutiny of institutions |

**Stress-tested across five tests:** Partisan smell test, independence test, real person test, questionability test, output test. All eight dimensions passed.

---

## 4. The Ten Civic Types

The output of the quiz. Each user gets:
- **1 primary type** — dominant civic identity
- **1-3 secondary types** — based on scoring thresholds (surface if similarity score clears a meaningful gap from primary; 1-3 depending on clustering)
- Primary and secondary must always be different types
- Edge case: near-pure primary acknowledged in copy ("You're one of the purest [Type]s we've seen")
- Edge case: genuinely centered profile gets special treatment

### Type Directory

| Label | Working Name | Dimension Profile (dominant poles) | One-liner |
|---|---|---|---|
| The Honest Broker | Pragmatic Constitutionalist | Stability, Federal, Rules, Markets, Trust | Plays by the rules — and expects everyone else to |
| The System Fixer | Independent Architect | Change, Outcomes, Pragmatism, Skepticism (centered on 4 dims) | Not left or right — just tired of broken machinery |
| The Long Gamer | Principled Globalist | Global, Idealism, Collective, Federal | Thinks in decades and across borders |
| The Good Neighbor | Rooted Pragmatist | Local, Pragmatism, Collective (local), Stability | Believes the best solutions start closest to home |
| The Missourian | Constructive Skeptic | Skepticism, Outcomes, Pragmatism, Individual | You'll believe it when you see it — and you're usually right |
| The Eternal Optimist | Civic Optimist | Trust, Change, Collective, Idealism | Democracy is messy and you're here for all of it |
| The Steward | Steady Steward | Stability, Rules, Trust, Local | Someone has to protect what works — you volunteered |
| The Free Agent | Sovereign Independent | Individual, Skepticism, Local, Markets | Never fit a box and stopped trying |
| The Standard Bearer | Principled Institutionalist | Rules, Trust, Global, Idealism, Federal | The institutions aren't perfect, but they're what we've got |
| The Pioneer | Growth-First Independent | Change, Markets, National, Pragmatism | Progress is possible, and you know how to build it |

### Results Architecture

**Output:** Named primary type + constellation visual + dimensional breakdown + secondary type(s)

**Constellation design:** Radar/spider chart — 8 axes, fixed positions, consistent layout across all users. Shape is unique per person — the fingerprint IS the identity. Blue fill on dark navy background. Shareable artifact.

**Reveal copy structure:**
*"You are [The Primary Type] — [working name one-liner]."*
*"With strong affinities for [Secondary 1] and [Secondary 2]."* (if 2 secondaries clear threshold)

**Myers-Briggs/DISC parallel:** Named type is the headline. Constellation is the visual proof. Dimensional breakdown is the supporting detail. Secondary types add nuance and make results feel personal rather than generic.

---

## 5. Quiz Experience Design

### Voice and Personality
- Warm, smart, sense of humor
- Never edgy or partisan
- "Knowledgeable friend who makes you laugh occasionally"
- Curious, not clinical. Engaged, not bureaucratic.

### Chapter Structure
Communicated via progress bar design, not explicit question numbering. Gives location without tunnel feeling.

### Layer Labels (shown to user)
- Layer 1: "What you believe"
- Layer 2: "How you apply it"  
- Layer 3: "What drives your vote"
- Layer 4: "Where you draw the line"

### Encouragement Mechanics
- After Layer 1: profile completeness ~40%, curiosity-driven prompt to continue
- After Layer 2: completeness ~65%
- After Layer 3: completeness ~85%
- Curiosity-driven, not guilt-driven

### Results Reveal
- Feels like Myers-Briggs or DISC — a moment, not just a bar chart
- Named type as headline
- Constellation as hero visual
- "Here's what makes you genuinely unusual"
- "Here's where you sit relative to other Bedrock users"
- Shareable — people screenshot and share their constellation

### Open Questions (resolve before build)
- Account creation timing — before quiz, after L1, or at save point?
- Importance ratings — still in or out? If in, belongs in Layer 3
- Open text on every question — every question or optional "want to say more?"

---

## 6. Layer Intro and Outro Copy

---

### LAYER 1 INTRO

Most civic tools ask where you stand on the issues. We're asking something different — and harder.

We want to know how you think. Not which party you agree with, not which policies you support — but the underlying values that drive those positions. The stuff that's been true about you for twenty years.

Twenty questions. About twelve minutes. No wrong answers — only honest ones.

One thing: every question has an "It depends" option. It's not a cop-out — it's often the most accurate answer. If you pick it, we'll ask one quick follow-up. Your nuance is the point.

Ready? Let's find your bedrock.

---

### LAYER 1 OUTRO / LAYER 2 TEASER

You just did something most voters never do.

You articulated what you actually believe — not what your party believes, not what your feed believes. Yours.

Your constellation is taking shape. But right now it's based purely on values. The next layer connects those values to real policy debates happening right now.

*Layer 2 — How You Apply It — takes about 4 minutes. Your ballot recommendations get significantly sharper.*

---

### LAYER 2 INTRO

Now for the real world.

Layer 1 was about how you think. Layer 2 is about where that thinking leads when it meets actual policy debates — healthcare, climate, guns, education, immigration, and more.

These questions are more concrete. More current. More likely to make you feel something.

Nine questions. About four minutes. Same rules.

One format note: each question asks for your best first move — not your complete theory of the problem. You may believe in more than one approach. We're asking where you'd start.

---

### LAYER 2 OUTRO / LAYER 3 TEASER

Your profile is getting specific.

Your values are mapped. Your policy instincts are on record. Your recommendations are already meaningfully better than they were twenty minutes ago.

But two people can hold identical values and still vote very differently. What matters next is what actually drives your vote when you're standing in the booth.

*Layer 3 — What Drives Your Vote — takes about 4 minutes. This is where recommendations go from good to genuinely yours.*

---

### LAYER 3 INTRO

This one's different.

Layers 1 and 2 were about what you believe. Layer 3 is about what you'll do with it.

These questions aren't about values or policy — they're about how you actually make voting decisions. What you prioritize. What you'll trade off. What would make you cross party lines.

Eight questions. About four minutes. Probably the most revealing layer of all.

---

### LAYER 3 OUTRO / LAYER 4 TEASER

Almost complete.

Your civic identity is fully formed. Your constellation reflects how you think, how you apply it, and what drives your decisions.

One more layer — and it's different from everything before it.

*Layer 4 — Where You Draw the Line — isn't a quiz. It's a declaration. About five minutes. Completely optional. And the thing that separates a good recommendation from an airtight one.*

---

### LAYER 4 INTRO

These aren't preferences. They're lines.

A candidate can be 90% aligned with your values and still be disqualified by one position, one vote, or one behavior.

This is where you tell us yours.

Select as many or as few as apply. Add your own at the bottom if something isn't on the list.

*Optional — but if you have real lines, drawing them here means we'll never recommend someone who crosses them.*

---

## 7. Layer 1 Questions — Complete

*20 questions: 8 anchor + 8 crossover + 4 synthesis*
*Pure values. Abstract, timeless. No policy references.*
*Bias-checked and cleared.*

### Format Key
- **[DIM]** = Primary dimension
- **[SEC]** = Secondary dimension (crossover/synthesis only)
- **[F/U]** = Follow-up: OT = open text, MC = multiple choice select all that apply
- **[EE]** = Easter egg

---

### ANCHOR QUESTIONS (8)

---

**A1 — Stability↔Change**

When something in society isn't working well, what's your instinct?

**A.** Fix it carefully — change that moves too fast creates new problems faster than it solves old ones.
*"The wisdom of caution. A lot of well-meaning reformers have learned this the hard way."*

**B.** Change it boldly — the cost of moving too slowly is paid by the people the system is failing right now.
*"Urgency as a moral position. Hard to argue with when you're the one waiting."*

**C.** Fix the system that produces the problem — change the rules and incentives, and better outcomes follow.
*"The root cause approach. Fix the incentive structure and you don't fight the same battle twice."*

**It depends** → OT: *"What shapes your answer — the stakes, who's affected, the track record of change in that area?"*

---

**A2 — Local↔Federal**

Most problems affecting Americans day-to-day — housing, school quality, public safety — are best handled by:

**A.** Local and state governments — closer to the problem, more accountable, better at tailoring solutions.
*"Subsidiarity — decisions made at the lowest level capable of making them well. Older than America, but America made it famous."*

**B.** The federal government — national problems need national solutions, and local governments too often protect local interests at the expense of people who need help most.
*"The equity argument. Local control can mean local exclusion. Child labor laws and food safety standards required federal action because states weren't going there on their own. Federal urban renewal programs of the same era demolished functional neighborhoods in the name of national priorities. The direction of the mistake cuts both ways."*

**C.** Whoever has the strongest track record on that specific problem — some things states have solved brilliantly, others have required federal action.
*"Federalism as a tool, not a religion."*

**It depends** → MC: *"What tips the balance?"*
- Whether the problem crosses state lines
- Whether local governments have already tried and failed
- Whether equal treatment across states matters for this issue

**[EE on A]:** *"The 10th Amendment — 'powers not delegated to the United States are reserved to the States' — is the shortest and most fought-over sentence in the Bill of Rights. Invoked to defend slavery. Invoked to legalize marijuana. Same 28 words."*

---

**A3 — National↔Global**

When American and global interests conflict, the United States should generally:

**A.** Prioritize American interests — a government's first obligation is to its own citizens, and influence abroad is only sustainable when we're strong at home.
*"There's a reason we have a State Department and not a World Department."*

**B.** Weigh global interests seriously — in an interconnected world, what's bad for the world tends to become bad for America, and global leadership builds influence money can't buy.
*"The post-WWII order America built was the greatest strategic investment in American history."*

**C.** Lead by example rather than intervention — America's most durable influence has always come from being worth emulating.
*"John Winthrop called it a city on a hill in 1630. Still the most distinctly American theory of foreign policy."*

**It depends** → MC (select all that apply): *"What tips the balance?"*
- The type of issue — trade, security, and humanitarian crises feel different
- The cost to Americans
- Whether other nations are sharing the burden


---

**A4 — Rules↔Outcomes**

A mandatory minimum sentencing law that many judges and legal scholars argue produces outcomes disproportionate to the actual crimes. What should happen?

**A.** Follow the law while working to change it — rule of law only works if everyone respects it, even when it's imperfect.
*"The moment people start picking which laws deserve respect, you've lost something hard to get back."*

**B.** Use every available tool to mitigate unjust outcomes now — a law that reliably produces injustice has forfeited its moral authority.
*"Not every legal thing is just, and not every just thing is legal. America has known this since before it was America."*

**C.** Adjust enforcement in the meantime — sentencing guidelines and prosecution priorities can be recalibrated without waiting for legislation.
*"The distance between a law on paper and a law in practice is where a lot of the real action happens."*

**It depends** → MC (select all that apply): *"What shapes your answer?"*
- How severe the injustice is
- How realistic near-term legislative change is
- Whether the harm is ongoing

**[EE on B]:** *"In 1849 Thoreau went to jail rather than pay a tax funding the Mexican-American War. Emerson visited and asked 'Henry, what are you doing in there?' Thoreau replied: 'Waldo, what are you doing out there?' The essay he wrote — Civil Disobedience — later influenced Gandhi and Martin Luther King Jr."*

---

**A5 — Markets↔Governance**

When it comes to solving big economic and social problems — healthcare costs, housing shortages, environmental damage — your instinct is:

**A.** Let markets lead, with guardrails where necessary — competition and price signals allocate resources better than government programs.
*"Prices carry information no central planner can replicate. The track record of command economies is not ambiguous."*

**B.** Government needs to lead, using market tools where they work — some problems are too important, too long-term, or too inequitable to leave to markets that have no incentive to solve them.
*"Markets are excellent at a lot of things. Problems where costs fall on people outside the transaction aren't one of them."*

**C.** Build the market you want — design rules and incentives so doing the right thing is also the profitable thing.
*"Not 'government vs. markets' but 'what rules make markets work for everyone?' Cap and trade made pollution expensive without picking winners."*

**It depends** → MC (select all that apply): *"What shapes your answer?"*
- Whether the market has actually failed or just needs better rules
- Whether costs fall on people outside the transaction
- Whether government has a good track record on this specific problem

---

**A6 — Pragmatism↔Idealism**

In politics and civic life, lasting change usually comes from:

**A.** Taking the deal in front of you — half a loaf beats no loaf, and pursuing perfect outcomes has a long history of destroying good ones.
*"Not glamorous, but it's how Social Security, Medicare, and the Civil Rights Act got across the finish line — all compromised, all transformative."*

**B.** Holding the line until the world catches up — movements that settle for less rarely get more, and the way to expand the possible is to keep demanding what's right.
*"Abolitionists, suffragists, and Second Amendment advocates were all told they were asking for too much. All eventually moved the needle by refusing to settle."*

**C.** Building the coalition first — the limiting factor is rarely the idea, it's the political will, and you build will by bringing more people along before you ask for the vote.
*"The community organizer theory of change. Obama called it 'the long game.' So did Madison, in different words."*

**It depends** → OT: *"What shapes your answer — whether the moment is politically ripe, how much harm is accumulating, whether a partial win forecloses the fuller one?"*


---

**A7 — Individual↔Collective**

When individual freedom and community wellbeing genuinely conflict — one person's choice imposes real costs on others — what should generally give way?

**A.** Individual freedom should be the strong default — the history of collective overreach is longer and darker than the history of too much individual liberty.
*"The burden of proof should always be on whoever wants to restrict what someone else can do."*

**B.** Community wellbeing — we're shaped by and responsible to our communities, and a freedom that imposes serious costs on others isn't worth protecting.
*"Rights don't exist in a vacuum. The person downwind has interests too."*

**C.** Protect the individual from government, but not necessarily from community standards — your neighbors can ask more of you than your government can.
*"HOAs are annoying but they're not unconstitutional. There's actually a coherent philosophy in there."*

**It depends** → MC (select all that apply): *"What shapes your answer?"*
- How serious the cost to others is
- Whether the community norm is itself fair
- Whether government or community is doing the asking

**[EE on C]:** *"Eighteen states still have laws requiring citizens to help a neighbor in distress. Vermont's is the most famous — you can be fined for walking past someone drowning. One of the few places American law says being a decent neighbor is mandatory."*

---

**A8 — Trust↔Skepticism**

When a major American institution — a federal agency, the Supreme Court, a scientific body, the mainstream press — reaches a conclusion you find surprising or uncomfortable, your first instinct is:

**A.** Give it serious weight — institutions with long track records of rigor have earned some deference, even when their conclusions are inconvenient.
*"The accumulated expertise of thousands of people working on a problem for decades is not nothing."*

**B.** Scrutinize it hard — institutions have interests, blind spots, and failure modes, and healthy skepticism is what keeps them honest.
*"Every major institutional failure in American history — from the Tuskegee study to the savings and loan collapse to the 2008 financial crisis — was preceded by too much deference."*

**C.** Calibrate based on the institution's track record on this specific type of question — the CDC gets more benefit of the doubt on epidemiology than on nutrition.
*"Blanket trust and blanket skepticism are both intellectually lazy. The work is knowing which institutions have earned it on which questions."*

**It depends** → OT: *"What shapes how much trust you extend — the type of institution, whether you can see their reasoning, whether they have a stake in the outcome?"*

---

### CROSSOVER QUESTIONS (8)

---

**C1 — Stability↔Change × Rules↔Outcomes**

The Constitution has been amended 27 times in 235 years. Some think that's about right. Others think it's too few. Your view:

**A.** About right — the amendment process is deliberately hard because fundamental law should reflect deep consensus, not momentary majorities.
*"Madison designed it this way on purpose — and 235 years later the document is still standing."*

**B.** Too few — structural problems in American democracy can't be fixed through ordinary legislation, and the difficulty of amendment has let them calcify.
*"Jefferson thought the whole thing should be rewritten every generation. Probably too aggressive, but the impulse wasn't crazy."*

**C.** The number isn't the point — what matters is whether the amendment process is accessible to citizens or captured by whoever has the most resources.
*"A constitution that can only be amended by well-funded organized interests isn't really a people's document."*

**It depends** → OT: *"What would make you more or less comfortable with the amendment process being used more frequently?"*

**[EE on B]:** *"The 27th Amendment — preventing Congress from giving itself an immediate pay raise — was proposed in 1789 and not ratified until 1992. A University of Texas student named Gregory Watson rediscovered it in 1982, wrote a paper arguing it was still open for ratification, got a C, and spent the next decade getting state legislatures to ratify it anyway. He got his grade changed to an A in 2017."*

---

**C2 — Individual↔Collective × Markets↔Governance**

The federal government is considering a large public investment — infrastructure, broadband, a green energy grid — paid for by higher taxes on higher earners. Your reaction:

**A.** Skeptical — broad public investments rarely deliver efficiently, and taking more from individuals to fund programs government manages poorly is a bad trade.
*"Government programs have constituencies that outlive their usefulness. The question isn't whether government can invest well. It's whether it will."*

**B.** Supportive — some things markets won't build because the return is too diffuse or too long-term, and a society that can't make collective investments in shared infrastructure is slowly eating itself.
*"Broadband in rural America wasn't going to happen through market incentives alone. Sometimes the only entity with the right time horizon is the public one."*

**C.** Depends on the investment — some infrastructure requires collective action, others are better left to markets, and 'public investment' covers a lot of very different bets.
*"The Hoover Dam and Solyndra are both 'government investments.' The details matter enormously."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether the private sector has already tried and failed
- Whether the benefits are genuinely broad
- Whether there's a credible implementation plan
- Whether the tax burden is fairly distributed

---

**C3 — Trust↔Skepticism × Local↔Federal**

When your local and federal government disagree about what's best for your community — on zoning, environmental standards, school curriculum — who do you trust more?

**A.** Local government — they know the community, they're accountable to the people affected, and the further away a decision is made the less it reflects local reality.
*"Your city council member shops at the same grocery store you do. Your senator probably doesn't know your zip code."*

**B.** Federal government — local majorities have a long history of making decisions that work for the powerful and against the vulnerable.
*"Closeness to power isn't the same as accountability to everyone. Local governments can be captured by local interests just as thoroughly as federal ones."*

**C.** Whichever has less to gain from the outcome — the more an institution benefits from a decision, the less I trust its judgment, regardless of level.
*"A local government that owns the land in question is not a neutral arbiter. Neither is a federal agency whose budget depends on the program it's evaluating."*

**It depends** → OT: *"What would make you trust one level over the other on a specific issue?"*

**[EE on A]:** *"The United States has approximately 90,000 units of local government — more than any other country on earth. Americans have always been serious about keeping power close to home. Whether that's working as intended is a separate question."*

---

**C4 — Local↔Federal × Individual↔Collective**

Your town has a serious housing shortage. A state law would override local zoning and require significantly more dense development. Your reaction:

**A.** The state is overreaching — zoning is one of the most local decisions there is, and communities should shape their own growth.
*"The people who live somewhere should have meaningful say over what it becomes. That's not nimbyism — that's democracy at its most direct."*

**B.** The state is right to intervene — local zoning has been used for decades to exclude people by income and race, and the housing crisis is too severe to leave to the communities that created it.
*"When local decisions impose costs on people who have no vote in that locality — the worker who can't afford to live near their job — local democracy has a legitimacy problem."*

**C.** Override the zoning but compensate the community — if the state imposes regional priorities on a local area, it should share the infrastructure costs that come with growth.
*"Power without responsibility is just imposition. If you mandate the growth, fund the schools and roads."*

**It depends** → MC (select all that apply): *"What shapes your answer?"*
- Whether the shortage affects people outside the community
- Whether the community created the problem through exclusionary zoning
- Whether the state is offering resources alongside the mandate

---

**C5 — National↔Global × Pragmatism↔Idealism**

The United States has the opportunity to join a new international agreement on a problem requiring global coordination — pandemic preparedness, cyber security, nuclear proliferation. It requires real commitments and some loss of unilateral flexibility. Your instinct:

**A.** Be cautious — international agreements erode American sovereignty, and the history of multilateral institutions is full of good intentions and poor execution.
*"When an international body gets it wrong, Americans don't get to vote the decision-makers out."*

**B.** Engage seriously — problems that cross borders require solutions that cross borders, and a United States that won't commit to multilateral frameworks loses the credibility to shape them.
*"You either help write the rules or you live under rules written by others."*

**C.** Join but negotiate hard for enforcement mechanisms with teeth — agreements without consequences are just press releases.
*"The Paris Agreement had beautiful goals and no enforcement. The Chemical Weapons Convention has inspection regimes and real consequences. One of these is not like the other."*

**It depends** → MC (select all that apply): *"What shapes your answer?"*
- Whether the problem can't be solved unilaterally
- Whether the agreement has real enforcement
- Whether other major powers are genuinely committed
- What America would have to give up

**[EE on B]:** *"The United States proposed the League of Nations, championed it at Versailles, and refused to join it. Wilson won the Nobel Peace Prize for the idea and died having failed to ratify it at home. Twenty-seven years later, America helped write the Universal Declaration of Human Rights and has never ratified the treaty making it binding. Eleanor Roosevelt chaired the drafting committee. America's relationship with its own ideals has always been complicated — and always will be."*

---

**C6 — Pragmatism↔Idealism × Trust↔Skepticism**

A candidate you broadly agree with has a real chance of winning — but only if they soften a position you care deeply about. They're asking for your support. What do you do?

**A.** Support them — a candidate who wins on 70% of your priorities does more good than a principled candidate who loses and does nothing.
*"Politics is the art of the possible, and the possible requires winning."*

**B.** Withhold support unless they hold the line — a candidate who softens under pressure before the election will soften further after it.
*"Campaign commitments are the only leverage voters have. A party that learns it can soften positions without losing support will keep softening them."*

**C.** Support them publicly but organize to hold them accountable after — winning matters, but so does building infrastructure that makes backsliding costly.
*"Show up for the win, then make sure they remember who showed up. It's how durable political coalitions actually work."*

**It depends** → OT: *"What would determine whether you'd support them — the specific issue, how much they're softening, something about the candidate?"*

**[EE on A]:** *"In 1964 LBJ privately told aides that signing the Civil Rights Act would cost Democrats the South 'for a generation.' He signed it, was right about the political cost, and passed the Voting Rights Act, Medicare, and Medicaid in the next eighteen months — because he won. The legislation of idealists is usually written by pragmatists who got elected."*

---

**C7 — Stability↔Change × Individual↔Collective**

Major economic transitions — manufacturing decline, the shift to clean energy, automation — tend to concentrate costs on specific communities while spreading benefits broadly. Who should bear responsibility?

**A.** Primarily the individuals affected — economies change, skills need to update, and while transition support is appropriate, personal responsibility for adapting is part of the social contract.
*"The communities that rebuilt fastest after economic disruption were the ones treated as capable of adapting, not as permanent victims."*

**B.** Primarily society as a whole — when a community bears concentrated costs so the rest of the country benefits, the beneficiaries have a real obligation to those left behind.
*"Some communities bore the cost of cheaper goods, cleaner energy, higher productivity. The people who benefited most owe something real to the people who paid most."*

**C.** The industries and investors who captured the gains — if a company automates away ten thousand jobs and books record profits, the moral case for that company funding the transition is stronger than the case for taxpayers.
*"You captured the upside, you fund the downside. It's how environmental liability works."*

**It depends** → MC (select all that apply): *"What shapes your answer?"*
- Whether the transition was driven by policy or market forces
- How concentrated the costs are
- Whether affected workers had meaningful warning
- Whether the companies involved are still profitable

**[EE on B]:** *"When the Erie Canal opened in 1825 it destroyed the economies of every town along the older trade routes overnight. Nobody compensated them. The towns that adapted survived. The ones that didn't are still there, smaller, wondering what happened. America has always been better at building the new thing than caring for the people displaced by it."*

---

**C8 — Markets↔Governance × Rules↔Outcomes**

A major industry — pharmaceuticals, social media, financial services — has produced serious harm at scale. Investigations confirm it was foreseeable and the industry knew. What should happen?

**A.** Enforce existing laws and let markets correct — companies that harm people should face legal consequences, but new regulation tends to protect the bad actor from the competitor who might replace them.
*"Regulation written for yesterday's bad actor tends to entrench that actor. Courts and competition have teeth too, without the capture problem."*

**B.** Write new rules with real teeth — courts are too slow, competition takes too long, and the people harmed in the meantime are real.
*"After 2008, 'let the market correct' meant millions lost their homes while the institutions that caused it got bailouts."*

**C.** Make the executives personally liable — a fine paid by shareholders for decisions made by executives isn't accountability, it's a tax on people who mostly didn't make the decision.
*"The Sarbanes-Oxley Act tried this after Enron. The question is whether it went far enough."*

**It depends** → MC (select all that apply): *"What shapes your answer?"*
- Whether existing laws were broken or just inadequate
- Whether the industry is genuinely competitive
- Whether the harm is ongoing

---

### SYNTHESIS QUESTIONS (4)

---

**S1 — Stability × Rules × Federal × Trust**

After a series of domestic attacks, a president declares a national emergency and invokes executive powers never used in peacetime — suspending certain civil liberties, directing agencies without congressional approval, restricting movement. The threats are real. The legal authority is genuinely ambiguous. Your position:

**A.** The executive needs these tools — in a genuine emergency, the pace of congressional deliberation is a liability, and a president who can't act decisively has failed the most basic obligation of the office.
*"Lincoln suspended habeas corpus without congressional authorization. The Union survived."*

**B.** Congress must be involved immediately — emergency powers without legislative oversight are how democracies become something else.
*"Every president who has tested the limits of emergency power has left the office larger than they found it."*

**C.** Allow the emergency action but require automatic expiration and mandatory reauthorization — give the executive the speed the moment requires, but build in a hard stop.
*"The problem with emergency powers isn't the emergency — it's the 'temporary' measures that outlast the crisis by decades."*

**It depends** → OT: *"What would determine how much executive emergency authority you'd support — the nature of the threat, the specific powers, the track record of the president?"*

**[EE on C]:** *"The federal income tax was introduced in 1861 as a temporary Civil War measure. Repealed in 1872. Back in 1894. Struck down by the Supreme Court. Back via constitutional amendment in 1913. The United States has been arguing about a tax that was supposed to last four years for over 160 years. 'Temporary' is doing a lot of work in American governance."*

---

**S2 — National × Global × Individual × Collective**

A large wave of people is arriving at the southern border — some fleeing violence, some seeking economic opportunity, some with unclear circumstances. The immigration system is overwhelmed. What should the United States do?

**A.** The core problem is enforcement — the United States has laws and isn't applying them consistently, which is unfair to legal immigrants and an invitation to more of the same.
*"A law that isn't enforced isn't a law — it's a suggestion."*

**B.** The core problem is capacity — the asylum system is so backlogged it functionally doesn't work, and people who would qualify legally have no realistic path to use it.
*"The average wait for a green card from certain countries exceeds 50 years. That's not a backlog — that's a closed door with a waiting room."*

**C.** The core problem is the conditions people are fleeing — as long as extreme violence and poverty persist in sending countries, no level of enforcement or processing capacity will resolve the underlying pressure.
*"You can manage the symptom at the border or address the disease at the source — but border policy alone has never stopped a refugee crisis."*

**It depends** → OT: *"What factors matter most — the distinction between asylum seekers and economic migrants, security screening, fairness to people immigrating legally?"*

**[EE]:** *"The United States has no official national language. Roughly 350 languages are spoken in American homes today. New York City alone has residents who speak over 200 languages — more linguistic diversity in one city than most countries have in their entire territory. America has always been this, even when it pretended otherwise."*

---

**S3 — Rules × Markets × Trust × Skepticism**

American political campaigns are enormously expensive and funded largely by wealthy individuals, corporations, and opaque outside groups. The Supreme Court has ruled much of this is protected free speech. What's the right response?

**A.** Accept the current system and focus on transparency — money in politics is inevitable, the First Amendment constraints are real, and full disclosure lets voters draw their own conclusions.
*"You may not be able to stop the money but you can shine a light on it."*

**B.** Push for public financing and strict limits — the First Amendment argument for unlimited campaign spending conflates money with speech in a way that drowns out everyone else.
*"One person one vote means something different in a system where the price of entry into political influence is measured in millions."*

**C.** Focus on the revolving door rather than campaign finance — the more corrupting influence isn't what goes into campaigns but what officials do after leaving office.
*"Campaign finance reform has been the focus of reformers for fifty years with limited success. The more direct transaction — public service followed by private enrichment — operates almost completely in the open."*

**It depends** → OT: *"What feels like the most corrupting influence — where the money comes from, what donors expect, what happens after officials leave office?"*

**[EE on C]:** *"In 1799 Aaron Burr got a water company chartered to address a genuine public health crisis, inserted a clause allowing surplus capital to be used for 'any monied transactions,' never really built the water system, and turned the surplus into the Bank of Manhattan — which eventually became JPMorgan Chase. The gap between public purpose and private enrichment has been a feature of American civic life since almost the beginning."*

---

**S4 — Stability × Individual × Collective × Federal × Trust**

During a severe pandemic, the federal government mandates vaccines, masks, and business closures. The measures demonstrably reduce deaths. They also damage small businesses, disrupt children's education, and restrict movement for an extended period. Looking back, the right balance was:

**A.** The restrictions were justified — collective action problems require collective solutions, and individuals who refused to participate imposed real costs on people around them.
*"Your freedom to move through the world unvaccinated during a pandemic is not a purely personal choice — it has a transmission probability attached to it."*

**B.** The restrictions went too far — costs fell heavily on specific groups while the people making decisions bore far fewer of those costs personally.
*"When the people making decisions bear fewer costs than the people subject to them, the legitimacy of those decisions deserves scrutiny regardless of the public health merits."*

**C.** The problem wasn't the restrictions but the lack of honest accounting — the public was told tradeoffs were simple when they weren't, and the erosion of trust came from the gap between what officials said and what was actually known.
*"Guidance that changed without explanation, and projections wrong in both directions, eroded the trust that effective crisis response depends on."*

**It depends** → OT: *"What would have made the response feel more legitimate — different policies, more honest communication, more local control, clearer expiration dates?"*

**[EE on B]:** *"During the 1918 influenza pandemic Philadelphia held a Liberty Loan parade despite warnings from its public health director. Cases exploded within days. San Francisco, which closed schools and banned public gatherings, fared significantly better. The Philadelphia health director who was overruled was named Wilmer Krusen. Almost nobody knows his name, which is its own kind of lesson about how we remember these things."*


---

## 8. Layer 2 Questions — Complete

*9 questions: issue positions*
*Stem on every question: "Of the following, what's the right first move?"*
*Bias-checked and cleared.*

---

**L2-Q1 — Healthcare**

The United States spends more on healthcare per person than any other wealthy country and gets middling results. Of the following, what's the right first move?

**A.** Force price transparency and real competition — publish what hospitals charge, end surprise billing, break up regional monopolies.
*"When was the last time you comparison-shopped for a hospital? Markets need prices to work, and American healthcare has deliberately hidden them."*

**B.** Expand public coverage and give government real negotiating power — extend Medicare, let it bargain on drug prices, cover the gaps private insurance won't.
*"Forty million Americans have inadequate or no insurance. The most efficient intervention is the one that reaches them first — and private markets have had decades to do it."*

**C.** Redesign how we pay — move from fee-for-service to outcomes-based payment so providers make money when patients stay healthy, not when they get sick.
*"Fee-for-service medicine is like paying a mechanic by the part replaced rather than whether your car runs."*

**It depends** → OT: *"What do you think is the most broken part — costs, access, quality, insurance complexity?"*


---

**L2-Q2 — Climate and Energy**

Climate change is real and human-caused. The policy debate is about how to respond. Of the following, what's the right first move?

**A.** Get the prices right — put a price on carbon, remove fossil fuel subsidies, and let markets drive the transition without picking winners.
*"The acid rain cap-and-trade program cut emissions 50% at a fraction of projected cost. Make pollution expensive and people find cheaper ways to avoid it."*

**B.** Set mandatory standards and fund the transition — the scale and urgency require government to move faster than markets will on their own.
*"The electric grid, the interstate highway system, and the internet all required public investment to get built at necessary scale."*

**C.** Win the technology race — the country that leads on solar, battery storage, and next-generation nuclear wins both the climate and the economic competition.
*"Solar cost $75 per watt in 1977. It costs less than $0.20 today. That's the learning curve. The question is how fast we want to accelerate it."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- How fast you think the transition needs to happen
- How much you trust government to pick the right technologies
- Whether international competitiveness matters as much as domestic emissions
- How you weigh costs on current energy users against future generations

**[EE on C]:** *"The United States has more wind energy capacity than any country except China — enough to power about 46 million homes. Texas alone generates more wind power than most countries. The state that built its economy on oil quietly became one of the largest wind energy producers in the world, mostly because the economics made sense. American energy transitions have always been less ideological and more practical than the political debate suggests."*

---

**L2-Q3 — Gun Policy**

The Second Amendment protects an individual right to own firearms. The debate is about where that right has limits. Of the following, what's the right first move?

**A.** Enforce what's already on the books — fix the background check database, fund mental health reporting, prosecute straw purchases.
*"A background check system with known gaps, a mental health reporting system most states underfund, prosecution rates for straw purchases near zero. The problem may be less about the laws than the will to enforce them."*

**B.** Close the gaps with targeted new laws — universal background checks, red flag laws, and safe storage requirements don't infringe the core right to self-defense.
*"Every constitutional right has limits where it imposes serious costs on others. The question is where those limits are, not whether they exist."*

**C.** Address the root causes — gun violence is concentrated in communities with high poverty, low opportunity, and inadequate mental health resources.
*"The countries with the lowest gun violence rates aren't just countries with stricter laws — they're countries with stronger safety nets and less concentrated poverty."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether you think more laws would actually be enforced
- Whether the focus should be on handguns or military-style rifles
- Whether mental health is more central than access

**[EE on A]:** *"Dodge City — the most iconic frontier town in American history — had a strict ordinance requiring all visitors to check their firearms at the sheriff's office upon arrival. The sign at the city limits read 'The Carrying of Firearms Strictly Prohibited.' Wyatt Earp enforced it. The Old West was more complicated than the legend."*

---

**L2-Q4 — Education**

American public education produces wildly unequal outcomes depending almost entirely on zip code. Of the following, what's the right first move?

**A.** Fix the funding model — schools funded by local property taxes will always produce unequal outcomes. Equalize funding first.
*"A district where median home value is $800,000 will always outspend one where it's $150,000. That's not a teacher quality problem — it's arithmetic."*

**B.** Expand choice within the public system — magnet schools, charter schools, and open enrollment give families options without defunding the schools most students attend.
*"The strongest school systems in the world all have meaningful choice built in. Choice and public education don't have to be in conflict."*

**C.** Invest in early childhood — dollar for dollar, pre-K investment produces better long-term outcomes than almost any other education spending.
*"By the time a child enters kindergarten, the gaps that will define their educational trajectory are already forming."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether your concern is primarily equity or quality
- Whether you distinguish between charter schools and private vouchers
- Whether you think the problem starts before kindergarten

**[EE on C]:** *"The Perry Preschool Project, launched in 1962 in Ypsilanti, Michigan, enrolled 58 low-income children in a high-quality preschool and tracked them for 40 years. Those who attended were more likely to graduate high school, hold steady jobs, own homes, and stay out of prison. The return on investment was calculated at $7 to $12 for every dollar spent. One of the most studied interventions in American social policy."*

---

**L2-Q5 — Immigration (Legal Pathways)**

Setting aside border enforcement, the legal immigration system determines who gets to come to America and how. Of the following, what's the right first move?

**A.** Shift to a skills-based points system — select immigrants primarily for education, skills, and economic potential. Canada and Australia do this.
*"About two-thirds of American green cards go to family members of existing residents — a policy designed in 1965 that changed the composition of immigration far more than expected."*

**B.** Clear the backlog and fix the wait times — before redesigning the system, make the existing one function. People who followed the rules deserve an answer in their lifetime.
*"The average wait for a green card from certain countries exceeds 50 years. That's not a backlog — that's a closed door with a waiting room."*

**C.** Significantly raise the overall numbers — the United States has an aging population, a below-replacement birth rate, and industries that can't find enough workers.
*"Japan chose restriction and is now managing a shrinking, aging population with severe labor shortages. The United States has a different option — but the window may be narrower than most people realize."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether you prioritize economic contribution or family unity
- Whether current overall levels are too high, too low, or about right
- Whether immigration levels affect wages for existing workers

**[EE on C]:** *"In 1977 ABC aired a Schoolhouse Rock segment called 'The Great American Melting Pot' — a three-minute animated song about immigration that ended with the Statue of Liberty serving soup. Watched by roughly every American child of that generation. Probably the most effective civic education about immigration ever produced in this country. Also a pretty accurate description of how the country actually works — one grandmother at a time."*

---

**L2-Q6 — Fiscal Policy**

The federal debt is approximately $34 trillion and growing. Of the following, what's the right first move?

**A.** Cut spending — the federal government does too many things poorly and funds too many programs that have outlived their purpose.
*"The federal budget has never actually shrunk in nominal terms — not once in modern history. Not because every program is essential. Because every program has a constituency."*

**B.** Raise revenue — the United States collects less in taxes as a share of the economy than most comparable wealthy countries.
*"American federal tax revenue as a share of GDP is lower than Germany, France, Canada, the UK, and Japan. The gap isn't just a spending problem."*

**C.** A bipartisan grand bargain that takes both seriously — every serious deficit reduction plan in American history has required both revenue increases and spending cuts.
*"The deficit is the gap between revenue and spending. Every commission that has studied this seriously — Simpson-Bowles, Domenici-Rivlin — has reached the same conclusion: you need both."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether you think the debt is an immediate crisis or a long-term problem
- Whether tax increases or spending cuts should lead
- Whether you think the political system is capable of a grand bargain


---

**L2-Q7 — Foreign Policy**

The United States spends more on its military than the next ten countries combined and maintains alliances and commitments on every continent. Of the following, what's the right first move?

**A.** Recommit to the alliances and institutions — the post-WWII order America built has produced the longest period of great-power peace in modern history.
*"NATO has existed for 75 years without a single Article 5 invocation. That's not luck. That's the alliance working as designed."*

**B.** Demand more from partners and less from our treasury — allies who can afford to spend more on their own defense should.
*"Most NATO members still don't meet the 2% of GDP spending target they committed to in 2006. American taxpayers have been subsidizing European security for decades."*

**C.** Rebalance toward economic and diplomatic tools — military superiority hasn't produced the outcomes in Afghanistan, Iraq, or Libya that justified the investment.
*"The United States has the most powerful military in human history and has fought four major wars since 1950 with mixed results. At some point the question isn't whether we can win militarily — it's whether winning militarily solves the problem."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether great-power competition with China changes the calculus
- Whether military strength deters conflict or invites it
- Whether domestic investment should take priority

**[EE on A]:** *"Iceland is a full NATO member with no standing army. Its contribution to collective defense is primarily its geography and its Coast Guard, which has fought three 'Cod Wars' against the United Kingdom over fishing rights. The alliance that has kept the peace in Europe for 75 years includes a country whose most recent military conflict was about fish."*

---

**L2-Q8 — Reproductive Healthcare**

Since the Supreme Court overturned Roe v. Wade in 2022, abortion policy has been set by state legislatures, producing a patchwork that varies dramatically by geography. Of the following, what's the right first move?

**A.** Let the democratic process work at the state level — the Court returned this question to elected legislatures, and different states reaching different conclusions reflects genuine moral disagreement no national consensus can resolve right now.
*"When the Court settled this nationally for fifty years it didn't resolve the disagreement — it suppressed it."*

**B.** Pass a national legislative framework — rights that vary by zip code aren't really rights, and a functioning democracy should reach a durable compromise reflecting where most Americans actually are.
*"Polling consistently shows most Americans support access in early pregnancy and restrictions later — a position held by neither party's base but by a significant majority of the country."*

**C.** Protect access to contraception and reproductive healthcare broadly — whatever your view on abortion, the legal reasoning in Dobbs created uncertainty around contraception and IVF that most Americans didn't intend.
*"Clarifying those protections is a narrower, more achievable goal that commands much broader consensus than the abortion debate itself."*

**It depends** → OT: *"What factors matter most — stage of pregnancy, specific circumstances, role of religious belief, federal vs. state authority?"*

**[EE on B]:** *"In 1972 — the year before Roe — the Republican platform supported abortion access and the Democratic platform was silent on it. George H.W. Bush was pro-choice before becoming Reagan's running mate. Al Gore was pro-life before running for president. Jesse Jackson opposed abortion until 1988. The sorting of both parties into hard positions happened gradually, then suddenly — entirely within living memory. The issue didn't change. The parties around it did."*

---

**L2-Q9 — Technology and Privacy**

Technology companies now know more about most Americans than the government does — what you read, who you talk to, where you go, what you buy. Of the following, what's the right first move?

**A.** Break up the platforms — the concentration of data and market power in a handful of companies is the core problem. Standard Oil didn't get regulated into submission. It got broken up.
*"Google processes 8.5 billion searches a day. Meta has 3 billion monthly users. At some point 'market dominance' becomes 'infrastructure' — and infrastructure has historically been subject to different rules."*

**B.** Give Americans control of their own data — you should be able to see what's collected about you, correct it, and delete it. Europe's GDPR did this in 2018. Americans still don't have a federal equivalent.
*"Your medical records are protected by HIPAA. Your browsing history and location data can be bought and sold without your knowledge. The asymmetry is a choice, not an accident."*

**C.** Regulate the algorithms, not the data — the harm isn't that companies collect information, it's that they use it to maximize engagement in ways that damage mental health, spread misinformation, and polarize the electorate.
*"Facebook's own research showed its algorithms made users angrier and more polarized — and it deployed them anyway because engagement drove revenue."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether competition or regulation is the more effective tool
- Whether you're more concerned about privacy or algorithmic harm
- Whether American tech dominance is a national security asset worth protecting

**[EE on B]:** *"The United States has comprehensive federal privacy laws for video rental records, children's online activity, and educational records. There is no comprehensive federal privacy law for anything else. The Video Privacy Protection Act of 1988 was passed specifically because a reporter got Robert Bork's Blockbuster rental history during his Supreme Court confirmation. Your Blockbuster history has been federally protected for 35 years. Your location data has not."*

---

## 9. Layer 3 Questions — Complete

*8 questions: voting behavior and priority intensity*
*Behavioral register — noticeably different feel from Layers 1 and 2*
*No Easter egg on Q8 — it's the capstone*
*Bias-checked and cleared.*

---

**L3-Q1 — Character vs. Policy**

A candidate you mostly agree with has a serious and credible character issue — a pattern of personal dishonesty, a history of treating people badly, or conduct that would end most careers elsewhere. How much does that matter?

**A.** It's disqualifying — character and conduct in office are inseparable, and a person who behaves badly in private will eventually behave badly in public.
*"The most reliable predictor of how someone will exercise power is how they've exercised it before — in relationships, in business, in private moments when they thought no one was watching."*

**B.** Policy mostly wins — I'm electing someone to do a job, not be a role model. If the record is strong and the alternative is worse, I can hold my nose.
*"FDR had a famously complicated personal life. LBJ was legendarily cruel to his staff. Both transformed the country. Waiting for a candidate with good character AND good policy is often waiting for someone who doesn't exist."*

**C.** Depends on whether the character issue is relevant to the job — financial fraud tells you something about how someone will handle public money. A messy divorce probably doesn't.
*"Not all character flaws are created equal."*

**It depends** → OT: *"What would push you to 'disqualifying' — the type of conduct, how recent, the volume of incidents, whether they've acknowledged it?"*

**[EE on B]:** *"Grover Cleveland was elected president in 1884 despite his opponents publicizing that he'd fathered a child out of wedlock. They chanted 'Ma, ma, where's my pa?' His supporters responded: 'Gone to the White House, ha ha ha.' He won."*

---

**L3-Q2 — Cross-Party Conditions**

Most voters have a general partisan lean. What would most reliably make you vote against it?

**A.** A candidate who crosses a specific policy line — there are one or two issues where my position is firm enough that the wrong answer disqualifies someone regardless of party.
*"Knowing your non-negotiables in advance is more principled than deciding after the fact."*

**B.** A candidate who seems genuinely unfit — not someone I disagree with, but someone who lacks the basic competence, temperament, or integrity the job requires.
*"Policy disagreements are normal. A candidate who can't tell the truth, manage a team, or handle pressure is a different category of problem."*

**C.** An exceptionally strong candidate on the other side — someone whose record, character, and judgment are compelling enough to vote for regardless of the party label.
*"Ticket-splitting used to be common. It declined as parties sorted. The instinct — vote for the person, not the jersey — is still alive in a lot of voters."*

**It depends** → OT: *"Is there a specific combination of factors that would flip your vote?"*


---

**L3-Q3 — Electability**

You're in a primary. Your preferred candidate holds positions closest to yours but faces an uphill general election battle. A more moderate candidate is more electable but less aligned. How do you vote?

**A.** Vote for who I actually want — primaries exist to express genuine preference, and strategically voting for someone you don't really want often produces a candidate nobody's excited about.
*"'Electable' is often a proxy for 'familiar' — and familiar isn't always better."*

**B.** Vote for who can win — a candidate who loses the general helps nobody, and winning is the prerequisite for everything else.
*"The perfect candidate who loses has zero influence on policy. The imperfect candidate who wins has enormous influence."*

**C.** Depends on how big the electability gap is — if my preferred candidate is slightly less electable, I vote my conscience. If they're genuinely unelectable, the math changes.
*"There's a difference between 'harder to elect' and 'unelectable.' The first is worth accepting for a candidate you believe in."*

**It depends** → OT: *"What factors shape your thinking — how important the office is, how different the candidates are on policy, how reliable the electability polling tends to be?"*

---

**L3-Q4 — Downballot Salience**

Most American ballots include state legislature, county commissioner, school board, judges, ballot measures — often a dozen or more decisions beyond the top of the ticket. How do you approach those?

**A.** I research them seriously — downballot races often have more direct impact on daily life than federal ones.
*"Your state legislature sets your tax rates, your school board sets curriculum, your county sheriff sets enforcement priorities. Local government is more present."*

**B.** I vote the top of the ticket and do my best on the rest — I follow the major races closely but don't have time to research every downballot race thoroughly.
*"Most voters are here. The information environment for downballot races is genuinely poor — local journalism has collapsed and candidate websites are sparse."*

**C.** I focus on ballot measures and skip races where I don't know enough — I'd rather leave a race blank than vote uninformed.
*"An uninformed vote isn't necessarily better than no vote. Leaving a race blank is a defensible choice — one the instructions on most ballots explicitly permit."*

**It depends** → OT: *"What shapes how much you engage — the office, whether it's contested, whether you can find good information?"*

**[EE on A]:** *"The average American voter faces 15 to 30 separate decisions on a general election ballot. In California in 2016, voters decided 17 statewide propositions alone — covering marijuana legalization, death penalty repeal, and workplace rules for adult film actors. That was before the candidates. A fully engaged California voter in a presidential year can face 40 or more distinct choices. Most voters research about three of them thoroughly."*

---

**L3-Q5 — Incumbency**

When an incumbent is running for reelection, how does that affect your thinking?

**A.** Meaningful advantage — a track record is real information. I know what they've actually done, not just what they've promised.
*"Campaign promises are cheap. Voting records, budget decisions, and constituent services are evidence."*

**B.** Mild disadvantage — incumbents accumulate obligations and the habits of power over time. Fresh perspective is harder to maintain the longer someone has been in office.
*"The longer someone holds office, the more relationships, donors, and institutional interests they accumulate. Challengers haven't had time to be captured yet."*

**C.** Entirely depends on the record — incumbency itself is neutral. A strong record deserves reelection. A weak one deserves a challenger.
*"Incumbency is neither a credential nor a scarlet letter. The question is always the same: did they do the job well?"*

**It depends** → OT: *"What shapes how you think about incumbents — the office, how long they've served, what they did with the time?"*


---

**L3-Q6 — Party vs. Candidate**

The candidate from your usual party is mediocre — not corrupt, just unremarkable. The candidate from the other party is genuinely impressive. How do you vote?

**A.** Vote the party — a mediocre member of the right caucus votes with the right majority and advances the right agenda. Individual quality matters less than which team controls the chamber.
*"Congress is a team sport. A brilliant independent-minded member of the minority has less influence than a mediocre member of the majority."*

**B.** Vote the candidate — democracy works better when voters reward quality and punish mediocrity regardless of party.
*"The sorting of Congress into two rigid teams where quality is irrelevant has produced exactly the Congress you'd expect."*

**C.** Depends on the stakes — in a year when chamber control is on the line, the structural argument wins. In a safe year, voting for the better candidate costs nothing and signals something.
*"Principles are easier to act on when the stakes are low."*

**It depends** → OT: *"What would push you toward the better candidate — how impressive they are, how mediocre your usual party's candidate is, how safe the seat is?"*

---

**L3-Q7 — Time Horizon**

When deciding how to vote, are you primarily thinking about the next two to four years, or the next ten to twenty?

**A.** The near term — elections have immediate consequences for real people, and voting for abstract long-term considerations while ignoring present-day impact is a luxury not everyone can afford.
*"People losing healthcare or watching their business close aren't comforted by long-term thinking."*

**B.** The long term — the most consequential decisions government makes — judicial appointments, infrastructure, constitutional norms — play out over decades, not years.
*"The senators who confirmed Supreme Court justices in the 1980s shaped American law for forty years. Long-term thinking is how durable things get built."*

**C.** Both, weighted by the office — presidential and judicial elections demand long-term thinking. Congressional and local elections often demand near-term accountability.
*"A Supreme Court justice serves for life. A city council member serves two years. Your time horizon should match the time horizon of the office."*

**It depends** → OT: *"What shapes your time horizon — the specific issues, who's most affected, the office being filled?"*

**[EE on B]:** *"The Constitution was written in 1787 by delegates whose average age was 42. Benjamin Franklin was 81 and had to be carried into the convention hall. Gouverneur Morris, who wrote the final draft, was 35. The document they produced in four months of a Philadelphia summer has outlasted every other national constitution written in the same century. Whatever they were doing in that room, the time horizon was definitely not 'next election cycle.'"*

---

**L3-Q8 — Issue Priority (capstone)**

*No Easter egg. No micro-reactions. Let it land.*
*UI note: "Tell us" opens a text field immediately — more invitation than option. Visually distinct from "It depends" on every other question.*

If you could move the needle on exactly one issue in American public life — one thing that, if fixed, would matter most to you — what would it be?

**A.** The machinery of democracy itself — gerrymandering, money in politics, voting access, judicial independence. Fix the system that produces all the other decisions.

**B.** Economic security and opportunity — healthcare costs, housing affordability, wages, childcare. The material conditions of most Americans' lives are harder than they should be.

**C.** National unity and civic health — the polarization and distrust that makes every other problem harder to solve.

**Tell us** → *"What's the one issue you'd move if you could — in your own words. This becomes part of your Bedrock profile and helps us find the candidates and media that match what actually matters to you."*

## 10. Layer 4 — Dealbreaker Screen — Complete

*12-24 binary filters presented as a distinct module after Layer 3*
*Not a quiz — a declaration. Different register, different UI, different emotional weight.*
*Completely optional but strongly encouraged.*
*Balanced list: paired items on contested issues so neither side feels targeted.*

### Framing Question

*"Which of these, if true of a candidate, would make them a non-starter for you — no matter how much you agreed with everything else about them?"*

### The List

**PROCESS & INSTITUTIONS**
1. Questioned the legitimacy of a certified election result without credible evidence
2. Used public office for personal financial gain
3. Accepted gifts or payments from industries they regulate
4. Supports removing or threatening judges for their rulings
5. Has a documented pattern of lying about verifiable facts

**CIVIL LIBERTIES**
6. Supports deploying federal law enforcement against peaceful protesters
7. Supports warrantless surveillance of American citizens
8. Supports restricting access to legal voting without evidence of fraud

**NATIONAL SECURITY**
9. Supports withdrawing from NATO or other core defense alliances unilaterally

**POLICY ABSOLUTES — paired by issue**

*Abortion*
10. Supports a complete abortion ban with no exceptions
11. Supports unrestricted abortion access at any point in pregnancy with no limitations

*Firearms*
12. Supports confiscating legally owned firearms from legal owners
13. Opposes all restrictions on firearms including military-style weapons

*Healthcare*
14. Supports mandatory government-run healthcare with no private option
15. Supports eliminating Medicare, Medicaid, or other public health coverage entirely

*Policing*
16. Supports defunding or abolishing police departments
17. Supports eliminating civilian oversight of law enforcement

*Other*
18. Supports race or gender-based preferences in hiring or admissions without accountability measures
19. Supports eliminating LGBTQ+ anti-discrimination protections
20. Denies scientific consensus on climate change
21. Supports directing public education funds primarily to religious institutions

**CHARACTER**
22. Credibly accused of sexual misconduct
23. Has made racist, antisemitic, or other discriminatory public statements
24. Has been convicted of a felony

**Open text:** *"Anything else that would disqualify a candidate for you, regardless of their other positions?"*

### Design Notes
- Paired items on contested issues (abortion, firearms, healthcare, policing) displayed side by side — makes balance visible immediately
- Select all that apply — no minimum, no maximum
- Open text field at bottom captures anything not on the list
- UI should feel distinct from quiz — checkboxes not radio buttons, no micro-reactions, no Easter eggs
- Results from this layer applied as hard exclusion filters in recommendation engine — a candidate who crosses a user's line is excluded regardless of dimensional alignment score

### Balance Notes
- 5 process/institutional items — genuinely cross-partisan
- 3 civil liberties items — genuinely cross-partisan
- 1 national security item — cross-partisan
- 12 policy absolute items — 6 filter left-leaning candidates, 6 filter right-leaning candidates
- 3 character items — genuinely cross-partisan
- Total: 24 items + open text

---

*Layer 4 complete. All four layers now fully specced.*

*[Recommendation engine, candidate data model, media diet pillar, and page inventory to be added in subsequent sessions]*


## 16. Open Questions — Resolve Before Build

**NOTE FOR CLAUDE CODE:** These are unresolved design decisions requiring Matt's input. Flag them when relevant but do not make decisions on them independently. Raise them explicitly before proceeding with any build work that depends on them.

1. Account creation timing — before quiz, after Layer 1, or at save point?
2. ~~Importance ratings~~ — **resolved:** single "pick your top 3 dimensions" question at end of Layer 1, before constellation reveal
3. ~~Open text on every question~~ — **resolved:** subtle "+ add context" link on every question, expands inline on click, no forced visibility
4. Recommendation engine matching formula — biggest unresolved design question; **run a dedicated session with Opus 4.7 or Deep Thinking mode before speccing this**
5. Candidate data model — how positions map to dimensions
6. Media diet MVP scope — how many sources at launch
7. Outreach emails to Ballotpedia (data@ballotpedia.org) and VoteMate (partnerships@votemateus.org) — drafted in earlier session, pending Matt adding name/background before sending
8. Cookie banner — **legal review required before launch:** confirm whether strictly-necessary-only cookie policy (exactly two cookies, Plausible analytics which is cookieless) requires a user consent banner under applicable law (GDPR, CCPA). If required, design minimal non-intrusive implementation consistent with privacy-first brand.
9. Opt-out toggle for anonymized research — **required feature before launch:** users must be able to opt out of having their responses used in anonymized aggregate research. Accessible in account settings. Must be built and tested before Privacy & Data page goes live.
10. Scoring logic open-source — **required before launch:** full scoring methodology to be documented and published on GitHub. Trust & Methodology page links to it directly.
11. Anthropic API data handling — **confirm before launch:** verify current Anthropic API policy on data storage and model training. Update Privacy & Data "On Claude" section if policy has changed.
12. Pricing/donation model — confirm before launch. FAQ currently flags this.
13. Data sources and coverage limitations for ballot recommendations — confirm before launch. FAQ currently flags this.
14. Media ratings methodology — confirm AllSides and Ad Fontes Media as primary sources before launch. FAQ currently flags this.
15. Your Conversations — scope and UX to be fully specced. See Section 14.
16. Homepage visual design — civic identity layer needs visual treatment above/around the three pillars. Design decision required before build.
17. Demographic module interaction with scoring — **confirm before build:** how political lineage data interacts with dimensional scores in candidate matching. See Section 12.

**REMINDER FOR MATT — two sessions to run with a more powerful model before build:**
- **Recommendation engine logic:** Use Opus 4.7 or Deep Thinking mode for the matching formula design — multi-constraint optimization that benefits from deeper reasoning
- **Full bias and competitive landscape check:** Run the complete quiz question set through Opus asking "what would a sophisticated critic from the left say, and from the right" — fresh eyes on the whole instrument at once
---

## 17. Environment Variables

*All of these go in `.env.local` at the project root. This file is gitignored and never committed.*
*Claude Code should create this file during initial scaffolding and populate it with placeholders.*

```
# GitHub
GITHUB_TOKEN=your_token_here

# Anthropic
ANTHROPIC_API_KEY=your_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Civic Information API
GOOGLE_CIVIC_API_KEY=your_key_here

# OpenStates
OPENSTATES_API_KEY=your_key_here

# OpenSecrets
OPENSECRETS_API_KEY=your_key_here

# VoteSmart (free for nonprofits — apply at votesmart.org)
VOTESMART_API_KEY=your_key_here

# Ballotpedia (paid license — pending)
BALLOTPEDIA_API_KEY=your_key_here

# Plausible Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=bedrock.guide

# Environment
NEXT_PUBLIC_APP_ENV=development
```

*Notes:*
- *Keys marked `NEXT_PUBLIC_` are exposed to the browser — only use for non-sensitive public identifiers*
- *All others are server-side only*
- *Ballotpedia key will be blank until licensing conversation is complete*
- *VoteSmart key will be blank until nonprofit application is approved*
- *During Phase 1 (mocked data), only ANTHROPIC_API_KEY and Supabase keys are needed*

---

## 11. Page Copy Inventory

*All copy finalized June 2026. Name throughout is "Bedrock" in prose. Domain bedrock.guide used in nav wordmark and URL contexts. Contact email hello@bedrock.guide throughout.*

*Component placeholders marked [COMPONENT: ...] are required UI elements — not optional. Must be built before the relevant page goes live.*

---

### About Us

**I'm not red. I'm not blue. I'm red, white, and blue.**
And I couldn't find a single civic tool built for people who think that way. So I built one.

**There's got to be a better way.**
I'm frustrated — and I suspect you are too. Frustrated that real problems with real solutions sit unsolved year after year. Frustrated that the tools built for voters assume you have a party and flatten everything else. Frustrated that even engaged, thoughtful citizens walk into voting booths uninformed about most of what's on their ballot.

But frustration without action is just noise. So instead of waiting for someone else to fix it, I built something.

Our political system has become so polarized that real problems stop getting solved. Not because solutions don't exist. Because solving them would require leaders to put country over party. Over self. Over their next fundraising email.

The issues most Americans actually agree on — and there are more of them than you think — sit unsolved year after year while our politicians perform outrage for their bases.

Parties have nationalized every local race. The media ecosystem rewards the loudest voices and punishes the most honest ones. Leaders who could unite us have decided division is more useful to them.

**The people this hurts most.**
The fastest-growing voter segment in America — people who don't fully belong to either party — has no real civic infrastructure built for it.

Every existing tool assumes a party as a starting point. The media ecosystem sorts you into a tribe whether you want one or not. The political conversation treats you as a swing voter to be captured rather than a citizen to be served.

That's not an accident. It's a structural failure.

Independent-minded voters aren't apathetic. They're often the most thoughtful people in the room. They deserve tools built specifically for them — tools that start from their values, not a party's. Tools that dig down to the bedrock of what they actually believe, not the tribal shortcuts everyone else offers.

That's what Bedrock is. My answer to all of it.

**The mission.**
Help independent-minded citizens understand, articulate, and act on what they actually believe — because democracy works better when more people show up with clarity and conviction rather than confusion and indifference.

Country over self isn't only a presidential virtue. It starts with citizens who know what they actually believe and show up ready to act on it.

**Where this comes from.**
I'm Matt Blumberg — technology entrepreneur, business author, and for the last several years, host of a podcast called *Country Over Self*. Vibe coded with Claude.

The podcast grew out of a simple obsession: I've read over 150 presidential biographies, and the question I kept coming back to wasn't about policy or party. It was about character. When did American presidents choose the country over themselves? Over their power, their party, their legacy?

What I found, over and over, was that courage in public life isn't partisan. It shows up on the left and the right. It always has.

Bedrock is the same question pointed in a different direction. Not at the presidents. At the rest of us. The bedrock of democratic life isn't in Washington. It's in what ordinary citizens actually believe — and whether they show up knowing it.

Listen to *Country Over Self* on Spotify, Apple Podcasts, or YouTube →

**What I believe.**
Democracy works better when more citizens understand what they actually believe and act on it. That's not a partisan position. It's a precondition for everything else.

Civic identity isn't something you get assigned once. It's something you develop over time. Bedrock is built around that idea.

And transparency isn't a feature. It's the foundation. If you don't understand how a tool works, you can't trust what it produces. So we show our work — every dimension, every methodology decision, every recommendation explained.

**On bias.**
Every tool has a perspective baked into it. Including this one.

The eight dimensions Bedrock uses to map civic values were designed to be genuinely cross-partisan — every position at every pole has a defensible, honorable answer. We publish the methodology. We open-source the scoring logic.

If you think we've gotten something wrong, there's a feedback mechanism on every question. Or email hello@bedrock.guide. I read it.

**The long game.**
Bedrock started as a passion project. It may someday grow into a nonprofit or public benefit corporation. Before then — and if and when it does — no political donors, no party affiliation, and published methodology.

No interest in where you land. Only in helping you get there honestly.

I'm not red. I'm not blue. I'm red, white, and blue. And I think more of us are than anyone in Washington wants to admit.

There's got to be a better way. This is mine.

— Matt

---

### How It Works

**There's got to be a better way to articulate what you believe, with all its nuances.**
Most civic quizzes give you a left-right score and call it a day. Bedrock doesn't. Here's what we actually do — and why.

**It's a conversation, not a survey.**
The quiz is designed to feel like a thoughtful back-and-forth, not a form. It follows up when your answers are interesting. It sits with complexity instead of flattening it. It lets you say "it depends" and actually means it.

It saves your progress. It gets smarter every time you return.

**Eight dimensions. Not two.**
We don't put you on a left-right spectrum. We map you across eight dimensions of civic identity — the real tensions every thoughtful voter navigates whether they know it or not.

Before you answer a single question, we show you all eight. No black boxes.

Stability ↔ Change — Steady vs. Bold
Local ↔ Federal — Close to Home vs. Bigger Stage
National ↔ Global — Home First vs. Bigger Picture
Rules ↔ Outcomes — Fair Process vs. Fair Result
Markets ↔ Governance — Let It Compete vs. Set the Rules
Pragmatism ↔ Idealism — What Works vs. What's Right
Individual ↔ Collective — Personal vs. Shared Responsibility
Trust ↔ Skepticism — Trust the System vs. Question It

Every dimension has honorable, defensible positions at both ends. There is no right answer. There's only yours.

Read the full methodology →

**Four layers of questions.**
The quiz builds in four stages — each one going deeper than the last.

*Layer 1 — Your values foundation.*
Twenty questions about what you believe at the level of principle. Closes with one question: of the eight dimensions, which feel most central to who you are as a voter? Then — before you move on — your constellation appears for the first time. A radar chart unique to you across all eight dimensions. The shape is yours. No one else's will look exactly like it.

*Layer 2 — Your real-world positions.*
Eight questions on actual policy debates and real events — chosen specifically because they produce cross-partisan discomfort. This is where stated values meet actual positions. Sometimes they align. Sometimes they don't. Both are useful.

*Layer 3 — What drives your vote.*
Eight questions about voting behavior, priority intensity, and the factors that have actually shaped how you've voted in the past. This layer sharpens how the recommendation engine weighs your profile.

*Layer 4 — Where you draw the line.*
The dealbreakers. The issues where a single position overrides everything else — democratic process, rights, governance conduct, character. Most civic tools never ask these questions. They're often the most predictive of all.

**A little context — after the quiz.**
Once you've completed the four layers, we ask a short set of optional questions about your political background: your relationship to political parties, where you're coming from ideologically, and basic geography and demographics.

These come last deliberately. We don't ask them upfront because demographic context can color how people answer values questions — and we want your unfiltered thinking, not your tribal identity. Asked afterward, the same information becomes calibration data that helps us interpret your profile more accurately.

You can skip them entirely. They're never used for anything other than improving your recommendations.

**"It depends" is a real answer.**
Independent-minded voters don't think in absolutes. Neither does Bedrock.

Every question lets you say "it depends" — and when you do, the quiz follows up. What does it depend on? Which situations? Which conditions? That follow-up is where the richest signal lives.

**What you get.**
Your civic identity first. A named type — one of ten — with a constellation that shows exactly how you got there across all eight dimensions. Not a party label. Not a left-right score. A plain-English summary of where you stand, what you're consistent on, and where you're genuinely torn.

*[COMPONENT: Constellation map — 10 civic types, dominant dimensions, one-liner descriptions. Required on this page. Radar/spider chart, 8 axes, blue fill on dark navy. Shareable artifact.]*

Three things built on top of it:

*Your ballot.* Every race we can reliably cover, matched to your values with a plain-English explanation of why. Transparent sourcing so you can check our work. Printable guide you can take to the polls.

*Your media diet.* A three-tier recommendation — sources that deepen what you know, sources that expand how you think, and sources that challenge you where it counts. Not just media that agrees with you. Media that makes you smarter.

*Your conversations.* A Claude-powered chat interface that uses your values profile to help you have difficult civic conversations across difference — with your uncle about immigration, your neighbor about guns, anyone across any divide. Knowing where you actually stand makes it easier to understand where someone else does.

**Your profile is yours.**
It lives in your account. It's used only to power your recommendations and conversations. No ads. No third parties. No political organizations. Ever.

You can update it anytime. You can delete it anytime, completely and permanently.

Read our full privacy and data policy →

**Ready?**
There's got to be a better way to show up as a citizen. This is it.

Find your bedrock →

---

### Trust & Methodology

**There's got to be a better way to earn trust.**
Trust isn't claimed. It's built — through transparency, accountability, and showing your work. Here's ours.

**Who built this.**
Me — Matt Blumberg. Vibe coded with Claude.

No political party. No political donors. No institutional backer with an agenda. A technology entrepreneur who got frustrated enough to build something.

Read the full story →

**Who funds this.**
Right now: me personally.

If the platform grows: small user donations, nonpartisan civic foundation grants, and potentially a nonprofit structure with full financial transparency. That may happen someday. Before then — and if and when it does — no political parties, PACs, political donors, advertising, or any organization with a stake in where you land will ever fund this.

**The core design decision.**
Most civic quizzes map you onto a single left-right spectrum. We think that's wrong — not just imprecise, but actively misleading. Real political identity is multidimensional. Flattening it into one axis loses almost everything that matters.

So we built an eight-dimension model instead.

Each dimension captures a genuine tension that every thoughtful voter navigates — not a proxy for party affiliation, not a coded version of left vs. right. Eight real spectrums, each with honorable positions at both ends.

**The eight dimensions.**
Before you answer a single question, we show you all eight. No black boxes.

*[COMPONENT: Dimensions reference table — all eight dimensions with shorthand label, user-facing label, and one-sentence plain-English description. Required on this page.]*

**The deep dive.**
*For the skeptics. Each dimension explained fully — what it measures, why it's not a partisan proxy, and a concrete example of the tension in practice.*

*1. Stability ↔ Change — Steady vs. Bold*
How much should existing systems, institutions, and norms change — and how fast? This isn't about being timid or reckless. It's about whether you trust gradual improvement more than structural transformation, or vice versa. And it often depends — you might want bold change in healthcare but steady hands on the economy. That's not inconsistency. That's nuance, and we want to capture it.

Example: When the criminal justice system produces unjust outcomes, do you want to reform it from within — better training, better laws, better accountability — or do you think the structure itself needs to be overhauled entirely?

*2. Local ↔ Federal — Close to Home vs. Bigger Stage*
When a problem needs solving, where should the decision-making power live — closest to the people affected, or at the scale needed to make it stick? Local control can mean responsiveness and accountability. Federal power can mean consistency and reach.

Example: Should school curriculum be set by local school boards who know their communities, or by national standards that ensure every child gets the same foundation regardless of zip code?

*3. National ↔ Global — Home First vs. Bigger Picture*
When American interests and global cooperation pull in different directions, which wins — and how often? It's not isolationism vs. globalism. It's about where you draw the circle of concern, and why.

Example: If a trade agreement would create jobs abroad and lower prices for American consumers, but cost American manufacturing jobs — is that a win, a loss, or something more complicated?

*4. Rules ↔ Outcomes — Fair Process vs. Fair Result*
If a process is fair but produces unequal outcomes, is that acceptable? If an outcome seems just but the process was messy, does that matter? This is one of the deepest tensions in democratic life.

Example: A judge follows sentencing guidelines precisely and gives two people identical sentences for the same crime. One grew up with resources and opportunity, the other didn't. The process was identical. The impact on their lives won't be. Is that justice?

*5. Markets ↔ Governance — Let It Compete vs. Set the Rules*
When something important is broken — housing, healthcare, education, the environment — is the better lever competition and private incentives, or regulation and public investment? This isn't capitalism vs. socialism. It's a practical question about which tools work better, and when.

Example: Prescription drug prices are high. Do you want more competition between pharmaceutical companies to drive prices down, or a government body that negotiates or sets prices directly?

*6. Pragmatism ↔ Idealism — What Works vs. What's Right*
Are your positions anchored to a vision of what should be — a principle you won't compromise — or are they constantly negotiated against what's actually achievable? Neither is naive. Both are honorable.

Example: A bipartisan immigration bill would meaningfully reduce illegal crossings and create a path to legal status for long-term residents — but it requires compromises that neither side loves. Do you support passing it, or hold out for something that gets it more right?

*7. Individual ↔ Collective — Personal vs. Shared Responsibility*
Where does responsibility primarily live — with the individual, or with the community? This isn't about laziness vs. generosity, or freedom vs. control. It's about how you understand the relationship between personal agency and the systems people are born into.

Example: Someone is struggling financially after a job loss. How much of their path forward is on them — and how much should a social safety net absorb?

*8. Trust ↔ Skepticism — Trust the System vs. Question It*
Do you believe existing institutions — courts, agencies, elections, media — are basically legitimate and worth working within? Or are they captured or structurally flawed in ways that demand challenge? Healthy skepticism has a long and honorable tradition across the entire political spectrum.

Example: A court rules in a way you believe is deeply wrong. Do you accept it as legitimate even if you'll fight to change it, or do you think the institution itself has lost its claim to authority?

**How we tested for bias.**
Every dimension was designed so that both poles have defensible, honorable positions. Neither end should feel like the obviously correct answer or the obviously wrong one.

We ran five stress tests before finalizing the model:

*The partisan smell test* — does either pole secretly smell like Democrat or Republican? If yes, we rewrote it.

*The independence test* — are the dimensions actually measuring different things, or are some just proxies for each other? We identified two pairs with redundancy risk and designed questions specifically to pull them apart.

*The real person test* — we mapped eight distinct political archetypes across all eight dimensions and confirmed they produce genuinely different profiles with no dangerous overlap.

*The questionability test* — can we write at least two or three good, non-leading questions for each dimension? If a dimension was real but unquestionable without sounding partisan, we fixed it.

*The output test* — would two candidates with genuinely different governing philosophies score differently across these dimensions? We tested against real political figures. They do.

**How the quiz is structured.**
Four layers, each going deeper than the last. Full description in How It Works →

*Layer 1 — Values foundation:* Twenty questions across three tiers — eight anchor questions establishing your baseline on each dimension, eight crossover questions loading on two dimensions simultaneously, and four synthesis questions loading on three or more at once. Closes with a dimension importance rating, then your first constellation reveal.

*Layer 2 — Reality check:* Eight questions — real policy debates and actual events chosen specifically because they produce cross-partisan discomfort.

*Layer 3 — Voting behavior:* Eight questions about what actually drives your vote — priority intensity, past patterns, decisive factors.

*Layer 4 — Threshold questions:* The dealbreakers. Hard filters on democratic process, rights and dignity, governance conduct, and character. A single position here can override dimensional alignment in candidate matching.

*Context module:* Optional questions about political background, asked after the four layers. Calibration data, not quiz scoring. Full explanation in How It Works →

**How "it depends" works.**
"It depends" is a first-class answer throughout — not a middle option, not a cop-out. When you select it the quiz follows up: what does it depend on? We track both the substantive lean when you do lean, and the pattern of which dimensions produce the most genuine uncertainty. Both inform matching.

**How scoring works.**
Your answers produce a profile across all eight dimensions — a multidimensional map of where you stand and how strongly. The importance ratings from Layer 1 act as weights. Threshold responses from Layer 4 act as hard filters.

[FLAG: Full scoring logic to be documented and open-sourced before launch. This section will link to the published methodology on GitHub.]

**What your profile powers.**
Your civic identity — one of ten named types, with a constellation unique to you. Three things built on top of it: your ballot recommendations, your media diet, your conversations. Full descriptions in How It Works →

**How we handle mistakes.**
We'll make them. Here's the commitment:

If a question is biased — we fix it and say so publicly. If a recommendation is wrong — we correct it and explain why. If our methodology has a flaw — we publish the flaw and the fix.

Feedback mechanism on every question. hello@bedrock.guide for anything else. A human reads it. If your question reveals a gap in how we've explained ourselves, we update this page.

**Three accountability commitments.**
*Published methodology* — open to scrutiny, updated when we learn something. You're reading it now.

*Open-source scoring logic* — you can see exactly how your profile is built. [FLAG: GitHub link to be added before launch.]

*No political donors* — ever. The independence of this platform is non-negotiable.

**Still skeptical?**
Good. You should be. Skepticism is healthy — we built an entire dimension around it.

hello@bedrock.guide. A human reads it.

---

### Privacy & Data

**There's got to be a better way to talk about privacy.**
Most privacy policies are written by lawyers for lawyers. This one is written for you. Same legal commitments. Plain English.

**The short version.**
We collect your quiz responses and build a civic profile from them. We use that profile to power your recommendations and conversations. That's it. Nothing else. Ever.

No ads. No data brokers. No political organizations. No third parties. Full stop.

**What we collect.**
*When you create an account:*
Your email address. Your password — encrypted, never readable by us. Two-factor authentication phone number, if you choose to add it.

*When you take the quiz:*
Your answers across all four layers. Your importance ratings. Your open-text responses. Your "it depends" follow-up answers. How your thinking changes over time as you return.

*When you complete the context module:*
Your optional responses about political background, geographic context, and basic demographics. These are treated identically to your quiz responses — same storage, same protections, same deletion. They are never used for anything other than improving your recommendations.

*That's the complete list.* We don't collect your location, your browsing history, your contacts, or anything else.

**How we use it.**
Your profile powers four things:

Your civic identity — the dimensional profile and named type that everything else is built on.

Your ballot recommendations — matching your values to candidates and races.

Your media recommendations — matching your civic identity to journalists, Substacks, and podcasts.

Your conversations — providing context to the Claude-powered interface so it understands where you're coming from before you say a word.

That's all. We don't analyze it for any other purpose. We don't sell it. We don't share it. We don't use it to train AI models.

**Who sees it.**
You. And the systems that power your experience.

Not us personally — nobody at Bedrock reads your individual responses. Not Anthropic — your profile data doesn't pass to them beyond what's needed to process each conversation in real time. Not anyone else — ever, for any reason, including legal requests we consider overreaching.

If we ever receive a legal demand for user data we'll notify you unless prohibited by law from doing so — and we'll fight requests we believe are inappropriate.

**How we store it.**
Your profile is encrypted at rest and in transit. Your password is hashed — even we can't read it. We use industry-standard security practices and update them regularly.

Inactive accounts are flagged after two years with a simple question: want to keep your profile? If we don't hear back, we delete it.

**Your rights.**
You're in control. Always.

*See it.* View your complete profile and all stored responses anytime from your account settings.

*Update it.* Retake any section of the quiz and update your profile anytime.

*Export it.* Download your complete profile as a plain-text document anytime.

*Delete it.* Delete your account and all associated data permanently, anytime, in one click. No waiting period. Gone means gone.

**On research.**
We may use anonymized, aggregated data across all quiz responses for research purposes — to improve the quiz, publish civic insights, and better understand how independent voters think. Never individual responses. Never anything traceable to you.

We'll publish any research we produce. If we learn something from your data, we share it with everyone.

If you'd prefer your responses not be used even anonymously, you can opt out in account settings.

**On cookies.**
We use exactly two cookies — one to keep you logged in, one to remember your preferences. No tracking. No advertising. No third parties.

For analytics we use Plausible — a privacy-first tool that doesn't track individual users and doesn't require cookies. We chose it specifically because it doesn't compromise your privacy to tell us how the product is performing.

[FLAG: Legal review required before launch — confirm whether strictly-necessary-only cookie policy requires a user consent banner under GDPR, CCPA, or other applicable law. If required, implement minimal non-intrusive banner consistent with privacy-first brand.]

**On Claude.**
The quiz conversation and Your Conversations are powered by Claude — Anthropic's AI. Your responses are processed by Claude in real time. Anthropic does not store your individual responses or use them for model training. For Anthropic's full privacy practices, see anthropic.com/privacy.

[FLAG: Confirm current Anthropic API data handling policy before launch. Update this section if policy has changed.]

**Changes to this policy.**
If we ever change how we handle your data in a meaningful way, we'll tell you directly — by email, before the change takes effect. Not buried in an updated terms of service. A plain email that says what's changing and why.

You'll always have the option to delete your account before any change takes effect.

**Questions.**
hello@bedrock.guide. A human reads it.

**The one-sentence version.**
Your data powers your experience and nothing else — and you can delete all of it anytime in one click.

---

*[INTERNAL — Privacy & Data functionality required before launch:]*

*Must-have before launch:*
- Account deletion — one click, immediate, permanent, no loops
- Profile export — download as plain text
- Profile view — complete stored responses visible in account settings
- Quiz retake — update any section independently
- Opt-out toggle — responses excluded from anonymized research, accessible in account settings
- Two-factor authentication — optional at account creation
- Cookie audit — confirm exactly two cookies before policy goes live
- Privacy-first analytics — Plausible confirmed and implemented before launch
- Third-party script audit — confirm nothing loading additional cookies
- Legal request notification system — alert users when demands received
- Privacy policy change notification — email before changes take effect
- Inactive account notification — two-year threshold, email prompt before deletion
- Confirm Anthropic API data handling policy — update copy if needed
- Cookie banner legal review — see Open Questions #8

---

### FAQ

**There's got to be a better way to answer your questions.**
So here they are — plain English, no hedging.

**About Bedrock**

*What is Bedrock?*
A civic identity platform for independent-minded voters. It maps your values across eight dimensions, gives you a named civic identity and a constellation that's unique to you, then builds three things on top of it: personalized ballot recommendations, a curated media diet, and a Claude-powered conversation interface to help you talk across political difference.

*Who is this for?*
Anyone who thinks for themselves politically — especially people who don't fit neatly into either party. You don't have to be registered as an independent. You just have to be willing to answer honestly.

*Is Bedrock partisan?*
No. We have no party affiliation, no political donors, and no interest in where you land — only in helping you get there honestly. The quiz is designed so every position at every pole has a defensible, honorable answer. There is no right answer. There's only yours.

*Who built this?*
Matt Blumberg — technology entrepreneur, business author, and host of the *Country Over Self* podcast. Vibe coded with Claude. No political backing. No institutional agenda. Read the full story →

*Is this free?*
Yes. Creating an account and taking the quiz is free. If you find it valuable, there will be an option to support the platform — but it will never be paywalled.
[FLAG: Confirm pricing/donation model before launch.]

**About the Quiz**

*How long does the quiz take?*
About 15 minutes for a first pass through the four layers. Longer if you engage deeply with the open-text boxes and follow-up questions — which we encourage. The more you put in, the more accurate your profile.

*What are the four layers?*
Layer 1 maps your foundational values across eight dimensions — and ends with your first constellation reveal. Layer 2 tests those values against real policy debates and actual events. Layer 3 surfaces what actually drives your vote. Layer 4 asks the dealbreakers — the positions that override everything else. Read the full breakdown →

*What's my constellation?*
A radar chart unique to you — eight axes, one for each dimension, shaped by your answers. No two constellations look exactly alike. It appears for the first time at the end of Layer 1 and deepens as you complete the quiz. It's designed to be shareable.

*What are the ten civic types?*
The named output of the quiz — one primary type, plus secondary affinities. Each type has a plain-English label, a working name, a one-liner, and a dimensional profile. You'll recognize yourself in yours.
Read the full type directory →

*What is "it depends" and why is it a real answer?*
Because for independent-minded voters it often is. When you select "it depends" the quiz follows up — asking what it depends on, which situations, which conditions. That follow-up is where the richest signal lives. We track your "it depends" patterns across the whole quiz because they tell us something important about how you think.

*Can I retake the quiz?*
Yes — any layer, any time. Your profile updates when you do. We'd encourage revisiting before every major election and after significant events that might shift your thinking.

*What's the context module?*
A short set of optional questions about your political background — asked after the four layers, not before. We ask them last deliberately: pre-quiz demographic questions can color how people answer values questions. Post-quiz, the same information becomes calibration data. You can skip it entirely.

*What are the eight dimensions?*
Stability↔Change, Local↔Federal, National↔Global, Rules↔Outcomes, Markets↔Governance, Pragmatism↔Idealism, Individual↔Collective, and Trust↔Skepticism. We show you all eight before you answer a single question. Read the full methodology →

**About Your Ballot**

*How do you match me to candidates?*
Your dimensional profile, importance weights, and threshold filters run against candidate profiles built from public positions, voting records, and stated platforms. Claude generates a plain-English explanation of why each candidate matches or doesn't match your values.

*How complete is the ballot coverage?*
We cover every race we have reliable data for — federal, state, and local. Coverage varies by race and location. Some downballot races have limited public information and we'll tell you that honestly rather than guess. Transparent sourcing on every recommendation so you can check our work.
[FLAG: Confirm data sources and coverage limitations before launch.]

*Can I print my ballot guide?*
Yes. Once your recommendations are generated you can print a clean, formatted guide to take to the polls.

*What if I disagree with a recommendation?*
Good — that's useful. There's a feedback mechanism on every recommendation. Tell us why you disagree and it informs both your profile and our methodology. Your profile is yours to update anytime.

*Does Bedrock tell me who to vote for?*
No. We show you how candidates align with your values and explain why. The vote is yours. Always.

**About Your Media Diet**

*How do you recommend media sources?*
We curate a database of high-quality journalism, Substacks, and podcasts — rated for political lean, rigor, independence, and which civic dimensions they cover most thoughtfully. Your profile generates a three-tier recommendation: sources that deepen what you know, sources that expand how you think, and sources that challenge you where it counts.

*Why three tiers? Why not just sources that match my views?*
Because a media diet that only confirms what you already believe makes you a worse citizen, not a better one. The best independent voters maintain a deliberately balanced media diet. We think that's worth building into the product rather than leaving to chance.

*How do you rate sources for bias and quality?*
We use established credibility research — including AllSides and Ad Fontes Media — as our foundation for bias and quality ratings. We add our own dimension coverage tags indicating which of the eight civic dimensions each source addresses most rigorously.
[FLAG: Confirm specific data sources and methodology for media ratings before launch.]

*Can I suggest a source?*
Yes — there's a suggestion mechanism in your media recommendations. We review every suggestion and update the database regularly.

**About Your Conversations**

*What is Your Conversations?*
A Claude-powered chat interface that uses your values profile as context. You describe a difficult civic conversation you need to have — with a family member, a neighbor, a colleague — and Claude helps you prepare for it: understanding where the other person might be coming from, finding common ground, and navigating the disagreement productively rather than defensively.

*What kinds of conversations can it help with?*
Any civic disagreement across political difference. Immigration, guns, abortion, taxes, elections — if it's a topic where you and someone else see things differently, Your Conversations can help you approach it more thoughtfully.

*Does it tell me what to say?*
No. It helps you think. The goal isn't a script — it's clarity about where you stand, genuine curiosity about where the other person stands, and the tools to have a real conversation rather than a performative one.

*Does it use my values profile?*
Yes. Claude knows your dimensional profile before you say a word. You don't have to explain yourself from scratch every time. It meets you where you are.

**About Your Account and Data**

*Do I need an account?*
Yes. Without an account your profile can't be saved and the product can't deliver on its core promise — a civic identity that deepens over time. Creating an account requires only an email and password.

*What do you do with my data?*
Power your experience and nothing else. No ads. No third parties. No political organizations. Ever. Read the full privacy policy →

*Can I delete my account?*
Yes — anytime, in one click, permanently. No waiting period. Gone means gone.

*Is my political profile secure?*
Yes. Encrypted at rest and in transit. Your password is hashed — even we can't read it.

*What happens if Bedrock shuts down?*
Before any shutdown we'll give users advance notice, the ability to export their complete profile as a plain-text document, and confirmation of permanent deletion. We won't disappear your data without warning.

**About Country Over Self**

*What is Country Over Self?*
A podcast hosted by Matt Blumberg exploring the moments when American presidents chose the country over themselves — over their power, their party, their legacy. The intellectual origin of Bedrock. The same question that drove the podcast — what does it look like to put country over self — is the question this platform tries to help ordinary citizens answer in their own civic lives.

Listen on Spotify, Apple Podcasts, or YouTube →

**Still have a question?**
hello@bedrock.guide. A human reads it.

---

## 12. Demographic Module

*Asked after all four quiz layers — not before. Post-quiz demographic questions are calibration data that help interpret dimensional scores without biasing them. Explicitly not part of quiz scoring.*

### Design Principles
- Asked after the quiz — pre-quiz demographic questions contaminate answers by triggering tribal identity
- Framed as context, not classification
- Entire module is optional — users can skip entirely
- Political lineage labels (Question 2) are deliberately specific and historically grounded — they signal that Bedrock understands the actual diversity within parties, not just party labels

### Intro Copy
"Last question — a little context helps us calibrate. How would you describe your political background?"

### Question 1 — Political background
"How would you describe your relationship to political parties?"

- Always independent — never affiliated
- Drifted away from a party — used to be closer to one
- Registered with a party but vote differently
- Currently affiliated — but it's complicated
- It's complicated

*Note: "It's complicated" as a standalone option validates the most honest answer for the target audience and will be the most-selected option after "always independent."*

### Question 2 — Political lineage (conditional)
Appears only if user selects "drifted away," "registered but vote differently," or "currently affiliated" in Question 1.

"Which tradition feels most like your political background — even if you've moved away from it?"

- Progressive / liberal Democrat
- Moderate / centrist Democrat
- Blue Dog / conservative Democrat
- Moderate / Rockefeller Republican
- Chamber of Commerce / business Republican
- Social conservative Republican
- National conservative / MAGA Republican
- Libertarian
- None of these feel right
- It's complicated

*Note: These labels are deliberately specific and historically grounded — they signal that Bedrock understands the actual diversity within parties, not just party labels.*

### Question 3 — Basic demographics (optional block)
"A little more context — optional, and never used for anything other than improving our recommendations:"

- Age range: Under 30 / 30–44 / 45–59 / 60+
- Geographic context: Urban / Suburban / Rural / Small town
- Region: Northeast / South / Midwest / West / Other

*Presented as a simple optional block, not individual required questions.*

### Question 4 — Open text (optional)
"Anything else about your political background that would help us understand where you're coming from? Totally optional — but we're genuinely curious."

[Free text field — no character limit, no required response]

### Data Handling
- Demographic responses treated identically to quiz responses: same storage, same protections, same deletion rights
- Never used for anything other than improving recommendations
- Opt-out toggle in account settings applies to demographic data as well as quiz data
- [FLAG: Demographic module requires its own section in the scoring/matching documentation — specifically how political lineage data interacts with dimensional scores in candidate matching. See Open Question #17.]

---

## 13. Homepage Architecture

### Structure
The homepage has four sections in order:

**1. Nav**
Mark (mountain/strata SVG) + wordmark (BEDROCK.guide) + nav links (How it works / The framework / About) + "Take the quiz" CTA button

**2. Hero**
Rotating headline system — three slides, auto-advances every 5 seconds, dot indicators, manual click resets timer, buttons always visible below slides.

Slide 1: Eyebrow "Not red. Not blue." / Headline "All of it." (tri-color: red/white/blue, DM Sans 700 68px) / Subhead: full platform overview
Slide 2: Eyebrow "There's got to be a better way." / Headline "Find what you *actually* believe." (Libre Baskerville, gold italic on "actually") / Subhead: values quiz focus
Slide 3: Eyebrow "For the voters who haven't given up." / Headline "There's got to be a better way." (DM Sans 46px) / Subhead: independent voter audience

**3. Civic Identity + Three Pillars**
Civic identity is the overarching layer — not a pillar itself. Needs visual design treatment to make the hierarchy clear (above or surrounding the three pillars). Copy: "Your civic identity — one of ten named types, with a constellation unique to you. Everything below is built on top of it."

Three pillars in order, each with tri-color accent bar:
- Your ballot (red accent) — "Every race, matched to your values. From president to school board."
- Your media diet (white accent) — "Independent journalism matched to how you actually think."
- Your conversations (blue accent) — "Claude-powered prep for difficult conversations across difference."

**4. Tagline band**
*"Not red, not blue — red, white, and blue."* (gold italic Libre Baskerville 22px)
Attribution: "From the *Country Over Self* podcast." (*Country Over Self* italicized)

### Nav Links — Two States

**Public nav (pre-login):**
Mark + wordmark · How It Works · The Framework · About · Take the Quiz (primary CTA button)

**App nav (post-login):**
Mark + wordmark · Quiz · Your Ballot · Your Media · Your Conversations · My Profile · [account avatar]

**Quiz nav item — three states:**
- Not started → label "Take the Quiz" → begins quiz
- In progress → label "Continue Quiz" → resumes at current question
- Complete → label "My Quiz" → offers to review answers or retake any layer

**Behavior:**
- Nav is persistent on all pages, both public and app states
- On mobile: collapses to hamburger menu showing all items
- Homepage public nav is the only nav that differs — slightly more marketing-oriented; all other pages use the same persistent nav

---

## 15. My Profile Page

*The user's civic identity home base. A persistent page accessible from nav after account creation — not just a one-time results reveal.*

### What It Shows
- Named primary civic type + working name + one-liner
- Constellation (radar/spider chart, 8 axes, blue fill on dark navy — shareable artifact)
- Dimensional breakdown — score and label on all 8 dimensions
- Secondary type(s) — shown if similarity score clears threshold
- Quiz completion indicator (40% after L1 / 65% after L2 / 85% after L3 / 100% after L4)
- Last updated date
- Links to retake any individual layer

### Behavior
- Updates automatically when user completes or retakes any quiz layer
- **Shareable** — user can generate a public link showing their constellation only (no other profile data exposed)
- **Exportable** — download full profile as plain text (per privacy commitments in Section 11)
- Accessible from nav as "My Profile" post-login

---

## 16. Your Conversations — Feature Spec

*Third pillar. New scope added June 2026. Full UX spec TBD — this section captures the product decisions made to date.*

### What It Is
A Claude-powered chat interface that uses the user's dimensional profile as persistent context. Users describe a difficult civic conversation they need to have and Claude helps them prepare for it.

### Core Interaction
User inputs: the person they need to talk to, that person's approximate beliefs/position, and the topic. Claude, knowing the user's values profile, helps them:
- Understand where the other person might be coming from
- Identify genuine common ground
- Navigate the disagreement productively rather than defensively
- Approach the conversation with curiosity rather than opposition

### Key Design Decisions
- **Scope:** Broad — any civic disagreement, any time, not limited to election season
- **Profile integration:** Claude has the user's full dimensional profile as context before the conversation begins. User doesn't need to explain themselves from scratch.
- **Tab placement:** Separate tab in nav alongside Your Ballot and Your Media Diet
- **Goal:** Clarity and preparation, not a script. The output is better thinking, not talking points.
- **Tone:** Claude approaches these conversations as a thoughtful, non-judgmental guide — same voice as the rest of the product

### Open Questions
- UX design of the interface — form inputs vs. conversational prompt vs. structured template
- Whether conversation history is saved and for how long
- Whether Claude has access to information about the "other person" beyond what the user provides
- Integration with ballot recommendations (e.g., "Help me talk to my neighbor about Candidate X")

[FLAG: Full UX spec required before build. Add to build sequence after core quiz flow is stable.]

---

## 15. Visual Identity (Summary)

*Full details in docs/brand-guidelines.md and src/styles/tokens.css. This section captures key decisions for Claude Code reference.*

### Logo Mark
Irregular mountain/rock peak silhouette with three horizontal wave bands:
- Red fills from peak downward (top ~35%)
- White is wave-edged middle band
- Blue fills base (~50%)
- Left-face shadow gradient for geological depth
- SVG clipPath construction: polygon `points="0,60 0,52 3,47 6,50 11,41 29,4 33,13 37,8 41,17 45,11 51,20 56,15 60,19 60,60"`

### Wordmark
"BEDROCK" — Libre Baskerville 700, ~20px, all-caps, letter-spacing 0.05em
".guide" appended — Libre Baskerville 400, ~13px, rgba(232,228,218,0.45), same baseline
Mark sits left of wordmark with ~14px gap

### Colors
- Page background: #1A2D45
- Nav bar: #132238
- Crimson: #D44035
- Warm white: #E8E4DA
- Blue: #6B9FEA
- Gold: #C8A96E

### Typography
- Display/headings: Libre Baskerville
- Body/UI: DM Sans
- Both Google Fonts

### Contact
hello@bedrock.guide (all pages, all contexts)

