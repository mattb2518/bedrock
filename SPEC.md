# Bedrock — Civic identity for independent-minded voters.
*Version 0.1 — In Progress — Started June 2026*
*This document is the single source of truth for Claude Code and all build decisions.*
*Updated incrementally as each section is completed.*

---

## 1. Platform Overview

**Name:** Bedrock
**Domains:** bedrock.guide (primary), bedrock.vote (companion)
**Registrars:** bedrock.guide at Cloudflare; bedrock.vote at Network Solutions (Cloudflare SSL/routing on both)
**Status:** Passion project, no incorporated entity. Moving toward nonprofit or public benefit corporation.

**What Bedrock is:** A civic identity platform for independent-minded voters. Four things, powered by one values quiz:
1. Help voters understand what they actually believe — underneath partisan noise
2. Translate those beliefs into personalized ballot recommendations for every race, top to bottom
3. Match voters to an independent media diet — journalists, Substacks, podcasts — that reflects how they actually think
4. Surface candidates outside their own district worth supporting — matched to their values, focused on federal races where a presence in Congress would shift the balance of power toward independent-minded governance

**What Bedrock is not:** A party voter guide, a polling tool, a debate platform, an advocacy organization. Not the Bedrock at bedrock.us (different mission, different domain).

**Target audience:** Independent-minded voters — registered independents and soft partisans who don't vote the straight ticket. The largest and fastest-growing voter segment. Highly engaged but underserved by every existing civic tool.

**Founder:** Matt Blumberg — technology entrepreneur, civic institutionalist, creator of the Country Over Self podcast. Over 150 presidential biographies read. "I'm not red. I'm not blue. I'm red, white, and blue."

**Nonpartisan credibility:** Structural, not cosmetic. Every design, data, and copy decision must hold up to scrutiny from both sides.

---

## 2. Product Architecture

### Four Pillars, One Quiz, One Civic Identity

The quiz is the shared engine. It produces a civic identity — a named type and dimensional constellation — which is the overarching layer that powers everything else.

**Civic Identity** (overarching layer, not a pillar)
Values quiz → dimensional profile → named Civic Mantle type (one of ten) + unique constellation radar chart. This is the foundation on which all four pillars rest. Displayed prominently above or around the four pillars on the homepage and results page — needs visual design treatment to make the hierarchy clear.

**Pillar 1 — Your Ballot**
Civic identity → personalized ballot recommendations for every race (president to school board) → printable guide → transparent sourcing

**Pillar 2 — Your Media Diet**
Civic identity → recommended independent journalists, Substacks, podcasts in three tiers (confirming, expanding, challenging)

**Pillar 3 — Your Conversations**
Civic identity → Claude-powered chat interface for preparing and navigating difficult civic conversations across political difference. Uses the user's dimensional profile as persistent context. Broad scope — any civic disagreement, any time, not limited to election season.

**Pillar 4 — Beyond Your Ballot**
Civic identity → candidates outside your own district worth supporting — matched to your values, focused on federal races where a presence in Congress would shift the balance of power toward independent-minded governance.

### Quiz Architecture — Four Layers

| Layer | Name | Questions | Type | Output |
|---|---|---|---|---|
| 1 | Who you are | 20 | Values tensions (8 anchor + 8 crossover + 4 synthesis) | Constellation + primary type |
| 2 | How you apply it | 9 | Issue positions | Sharper recommendations |
| 3 | What drives your vote | 8 | Voting behavior + priority intensity | Personalized matching |
| 4 | Where you draw the line | 32 | Binary dealbreaker filters | Exclusion rules for engine |

**Total:** roughly 38 questions across Layers 1–3, plus the Layer 4 dealbreaker checklist (32 items) and an optional context module. Each layer has a distinct job and feel. Never a slog.

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
- **Account creation timing:** Optional and contextual — never forced except at one moment:
  - Available (not required) before the quiz starts, for users who want to be signed in from the beginning
  - Available (not required) after Layer 1, prompted alongside the constellation teaser as a "save your progress" nudge
  - **Required** when the user explicitly clicks "Save and continue later" — that action only makes sense with an account to save to
  - Users who complete the entire quiz in one sitting are never forced to create an account; prompted to save results at the end
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

## 4. The Civic Mantle

The output of the quiz. Each user gets:
- **1 primary type** — dominant civic identity
- **1-3 secondary types** — based on scoring thresholds (surface if similarity score clears a meaningful gap from primary; 1-3 depending on clustering)
- Primary and secondary must always be different types
- Edge case: near-pure primary acknowledged in copy ("You're one of the purest [Type]s we've seen")
- Edge case: genuinely centered profile gets special treatment
- Edge case: scattered profile — strong dimensional leans but no clean clustering into a type — surfaces as scattered rather than forced into a misfit primary

### Civic Mantle Directory

| Label | Working Name | Dimension Profile (dominant poles) | One-liner |
|---|---|---|---|
| The Honest Broker | Pragmatic Constitutionalist | Stability, Federal, Rules, Markets, Trust | The rules are the freedom |
| The System Fixer | Independent Architect | Change, Outcomes, Pragmatism, Skepticism (centered on 4 dims) | Not left or right — building better machinery |
| The Long Gamer | Principled Globalist | Global, Idealism, Collective, Federal | Thinks in decades and across borders |
| The Good Neighbor | Rooted Pragmatist | Local, Pragmatism, Collective (local), Stability | Believes the best solutions start closest to home |
| The Missourian | Constructive Skeptic | Skepticism, Outcomes, Pragmatism, Individual | You'll believe it when you see it — and you're usually right |
| The Eternal Optimist | Civic Optimist | Trust, Change, Collective, Idealism | Democracy is messy and you're here for all of it |
| The Steward | Steady Steward | Stability, Rules, Trust, Local | Knows what's worth conserving — and what isn't |
| The Free Agent | Sovereign Independent | Individual, Skepticism, Local, Markets | Never fit a box and stopped trying |
| The Standard Bearer | Principled Institutionalist | Rules, Trust, Global, Idealism, Federal | The institutions are imperfect — and worth defending |
| The Pioneer | Growth-First Independent | Change, Markets, National, Pragmatism | Progress is possible, and you know how to build it |

### Results Architecture

**Output:** Named primary type + constellation visual + dimensional breakdown + secondary type(s)

**Constellation design:** Radar/spider chart — 8 axes, fixed positions, consistent layout across all users. Shape is unique per person — the fingerprint IS the identity. Blue fill on dark navy background. Shareable artifact.

**Reveal copy structure:**
*"You are [The Primary Type] — [working name one-liner]."*
*"With strong affinities for [Secondary 1] and [Secondary 2]."* (if 2 secondaries clear threshold)

**Myers-Briggs/DISC parallel:** Named type is the headline. Constellation is the visual proof. Dimensional breakdown is the supporting detail. Secondary types add nuance and make results feel personal rather than generic.

### Edge Case Detection and Copy

Three edge cases the recommendation engine must detect and handle with dedicated copy rather than forcing a misfit primary type.

**1. Near-pure primary.** Single type clears a wide gap from all others (similarity score to top type significantly higher than to any secondary). Acknowledge in reveal copy: *"You're one of the purest [Type]s we've seen — your profile lines up with this identity more cleanly than most users'."*

**2. Genuinely centered profile.** Six or more of the eight dimensions score within a narrow band around the midpoint (rough threshold: ±15% of center). Surface as a centered profile rather than forcing a primary. Reveal copy:

*"Your profile is unusually centered. Across most of the eight dimensions, you sit close to the middle — you can see the case for both poles and don't reflexively favor either one. That's rarer than it sounds. It usually means one of two things: you genuinely hold the tension between competing values rather than resolving it by team, or you're still working out where you actually stand. Either way, we'll build your ballot from the dimensions where you do lean — and your recommendations may surprise you more than most users'."*

**3. Scattered profile.** Strong dimensional leans, but the leans don't cluster into a recognizable type. Detection: top-type similarity score below threshold (rough: <65%) AND top three types within a tight band of each other (rough: <10% gap between primary and tertiary). Surface as scattered rather than forced. Reveal copy:

*"Your profile is unusual. Your answers don't cluster around a single type — they pull from several directions at once. That's not a bug. It usually means you think about civic life across more axes than most voters, or that your worldview combines elements most people keep separate. Here's what we can tell:"* [show top 3 partial matches with similarity scores] *"Your recommendations will weight the dimensions you actually scored highest on, rather than forcing a single identity."*

**Engine implication.** All three cases need the recommendation engine to fall back to dimension-weighted matching rather than type-weighted matching. Worth flagging in the engine spec — see Section 11 of recommendation-engine.md.

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

### Option Order Randomization
Display order of A/B/C (and D where it applies on A1) is randomized per question per user session at render time. Position bias is real — left-most or first-listed options pick up a few points of preference independent of content — and randomization keeps it from compounding any framing tilt. Internal scoring keys to position-independent option IDs, not letters. The "It depends" path stays in its fixed last slot.

### Open Questions (resolve before build)
- ~~Account creation timing~~ — **resolved:** optional/contextual; required only at "Save and continue later"
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

Not party lines — your lines.

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
- **[EE]** = Easter egg (per-question, shown to all users regardless of which option they pick — may be inspired by a particular answer but not tied to it)

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
*"Systems thinking — change the rules instead of fighting the outcomes."*

**D.** Test whether it's really broken before changing anything — what looks broken from one angle is often working as intended from another.
*"Chesterton's Fence — before tearing down what looks like an unnecessary obstacle, find out why it was put there in the first place."*

**It depends** → OT: *"What shapes your answer — the stakes, who's affected, the track record of change in that area?"*

*No easter egg on A1 — intentional design decision. The first question auto-advances directly to Q2 so the very first interaction demonstrates quiz pace rather than landing on a "Did you know?" intermission.*

*Note: A1 carries four substantive options instead of the usual three. This is deliberate on the foundational dimension — the original three were all change-positive (mild, bold, structural) and missed the strong-stability position.*

---

**A2 — Local↔Federal**

Most problems affecting Americans day-to-day — housing, school quality, public safety — are best handled by:

**A.** Local and state governments — closer to the problem, more accountable, better at tailoring solutions.
*"Subsidiarity — decisions made at the lowest level capable of making them well. Older than America, but America made it famous."*

**B.** The federal government — national problems need national solutions, and local governments too often protect local interests at the expense of people who need help most.
*"The equity argument — some protections, like child labor laws and food safety, needed a national floor because they weren't going to emerge state by state. The tradeoff is real: a national floor can flatten genuine local difference."*

**C.** Whoever has the strongest track record on that specific problem — some things states have solved brilliantly, others have required federal action.
*"Federalism by track record — let the level that's working own it."*

**It depends** → MC: *"What tips the balance?"*
- Whether the problem crosses state lines
- Whether local governments have already tried and failed
- Whether equal treatment across states matters for this issue

**[EE]:** *"The 10th Amendment — 'powers not delegated to the United States are reserved to the States' — is the shortest and most fought-over sentence in the Bill of Rights. Invoked to defend slavery. Invoked to legalize marijuana. Same 28 words."*

---

**A3 — National↔Global**

When American and global interests conflict, the United States should generally:

**A.** Prioritize American interests — a government's first obligation is to its own citizens, and influence abroad is only sustainable when we're strong at home.
*"There's a reason we have a State Department and not a World Department — every government answers first to the people who can vote it out."*

**B.** Weigh global interests seriously — in an interconnected world, what's bad for the world tends to become bad for America, and global leadership builds influence money can't buy.
*"The post-WWII alliance system has shaped the global order for 75 years — a period that has coincided with the longest absence of great-power war in modern history."*

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

---

**A5 — Markets↔Governance**

When it comes to solving big economic and social problems — healthcare costs, housing shortages, environmental damage — your instinct is:

**A.** Let markets lead, with guardrails where necessary — competition and price signals allocate resources better than government programs.
*"Prices carry information no central planner can replicate. Markets aggregate decentralized knowledge in ways government allocation can't match."*

**B.** Government needs to lead, using market tools where they work — some problems are too important, too long-term, or too inequitable to leave to markets that have no incentive to solve them.
*"Markets are excellent at a lot of things. Problems where costs fall on people outside the transaction aren't one of them."*

**C.** Build the market you want — design rules and incentives so doing the right thing is also the profitable thing.
*"Design the rules so the right thing is also the profitable thing. Cap and trade made pollution expensive without picking winners."*

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
*"The hold-the-line theory of change. Movements that settle for less rarely get more."*

**C.** Building the coalition first — the limiting factor is rarely the idea, it's the political will, and you build will by bringing more people along before you ask for the vote.
*"The coalition-building theory of change — the limiting factor is rarely the idea, it's the will, and will gets built one person at a time. Madison called it the slow work of assembling majorities."*

**It depends** → OT: *"What shapes your answer — whether the moment is politically ripe, how much harm is accumulating, whether a partial win forecloses the fuller one?"*

**[EE]:** *"In 1849 Thoreau went to jail rather than pay a tax funding the Mexican-American War. Emerson visited and asked 'Henry, what are you doing in there?' Thoreau replied: 'Waldo, what are you doing out there?' The essay he wrote — Civil Disobedience — later influenced Gandhi and Martin Luther King Jr."*


---

**A7 — Individual↔Collective**

When individual freedom and community wellbeing genuinely conflict — one person's choice imposes real costs on others — what should generally give way?

**A.** Individual freedom should be the strong default — restrictions on what people can do require strong justification.
*"The burden of proof should always be on whoever wants to restrict what someone else can do."*

**B.** Community wellbeing — we're shaped by and responsible to our communities, and a freedom that imposes serious costs on others isn't worth protecting.
*"Rights don't exist in a vacuum. The person downwind has interests too."*

**C.** Protect the individual from government, but not necessarily from community standards — your neighbors can ask more of you than your government can.
*"HOAs are annoying but they're not unconstitutional. There's actually a coherent philosophy in there."*

**It depends** → MC (select all that apply): *"What shapes your answer?"*
- How serious the cost to others is
- Whether the community norm is itself fair
- Whether government or community is doing the asking

**[EE]:** *"Eighteen states still have laws requiring citizens to help a neighbor in distress. Vermont's is the most famous — you can be fined for walking past someone drowning. One of the few places American law says being a decent neighbor is mandatory."*

---

**A8 — Trust↔Skepticism**

When a major American expert institution — a federal regulatory agency, a scientific body like the CDC or NIH, an established peer-reviewed consensus — reaches a conclusion you find surprising or uncomfortable, your first instinct is:

**A.** Give it serious weight — institutions with long track records of rigor have earned some deference, even when their conclusions are inconvenient.
*"The accumulated expertise of thousands of people working on a problem for decades is not nothing."*

**B.** Scrutinize it hard — institutions have interests, blind spots, and failure modes, and healthy skepticism is what keeps them honest.
*"Major institutional failures in American history — from the Tuskegee study to early COVID guidance reversals to repeated FBI surveillance overreach — were preceded by too much deference."*

**C.** Calibrate based on the institution's track record on this specific type of question — the CDC gets more benefit of the doubt on epidemiology than on nutrition.
*"Trust by track record — the same institution can be rigorous in one domain and out over its skis in another. Calibrate to the domain, not the logo."*

**It depends** → OT: *"What shapes how much trust you extend — the type of institution, whether you can see their reasoning, whether they have a stake in the outcome?"*

**[EE]:** *"Gallup has tracked American confidence in major institutions since the 1970s. Confidence in the US military has roughly doubled over that period. Confidence in Congress has fallen by about three-quarters. Same country, same Americans — two federal institutions on opposite trajectories."*

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

**[EE]:** *"The 27th Amendment — preventing Congress from giving itself an immediate pay raise — was proposed in 1789 and not ratified until 1992. A University of Texas student named Gregory Watson rediscovered it in 1982, wrote a paper arguing it was still open for ratification, got a C, and spent the next decade getting state legislatures to ratify it anyway. He got his grade changed to an A in 2017."*

---

**C2 — Individual↔Collective × Markets↔Governance**

The federal government is considering a large public investment — infrastructure, broadband, a green energy grid — paid for by higher taxes on higher earners. Your reaction:

**A.** Skeptical — broad public investments rarely deliver efficiently, and taking more from individuals to fund programs government manages poorly is a bad trade.
*"Government programs have constituencies that outlive their usefulness. The question isn't whether government can invest well. It's whether it will."*

**B.** Supportive — some things markets won't build because the return is too diffuse or too long-term, and a society that can't make collective investments in shared infrastructure is slowly eating itself.
*"Broadband in rural America wasn't going to happen through market incentives alone. Sometimes the only entity with the right time horizon is the public one."*

**C.** Fund it like a private investor would — only with clear milestones, hard sunset clauses, and clawbacks if it fails. Public money should face at least the discipline private capital demands before a dollar goes out.
*"The Hoover Dam and Solyndra were both 'government investments.' The difference wasn't the label — it was whether anyone built in a way to fail fast and cut losses."*

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

**[EE]:** *"The United States has approximately 90,000 units of local government — more than any other country on earth. Americans have always been serious about keeping power close to home. Whether that's working as intended is a separate question."*

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

**[EE]:** *"The United States proposed the League of Nations, championed it at Versailles, and refused to join it. Wilson won the Nobel Peace Prize for the idea and died having failed to ratify it at home. Twenty-seven years later, America helped write the Universal Declaration of Human Rights and has never ratified the treaty making it binding. Eleanor Roosevelt chaired the drafting committee. America's relationship with its own ideals has always been complicated — and always will be."*

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

**[EE]:** *"In 1964 LBJ told aides that signing the Civil Rights Act would cost Democrats the South 'for a generation.' He signed it. Twenty-two years later Reagan struck a sweeping tax reform deal with Democratic leadership that cut rates and closed loopholes conservatives had argued about for decades. Both got their landmark bills because they could count votes. The legislation of idealists is usually written by pragmatists who got elected."*

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

**[EE]:** *"When the Erie Canal opened in 1825 it destroyed the economies of every town along the older trade routes overnight. The towns that adapted survived. The ones that didn't are still there, smaller, wondering what happened."*

---

**C8 — Markets↔Governance × Rules↔Outcomes**

A major industry — pharmaceuticals, social media, financial services — has produced serious harm at scale. Investigations confirm it was foreseeable and the industry knew. What should happen?

**A.** Enforce existing laws and let markets correct — companies that harm people should face legal consequences, but new regulation tends to protect the bad actor from the competitor who might replace them.
*"Regulation written for yesterday's bad actor tends to entrench it — airline routes and fares were frozen by regulation for forty years until deregulation cut prices roughly in half. Courts and competition have teeth too, without the capture problem."*

**B.** Write new rules with real teeth — courts are too slow, competition takes too long, and the people harmed in the meantime are real.
*"After 2008, 'let the market correct' meant millions lost their homes while the institutions that caused it got bailouts."*

**C.** Make the executives personally liable — a fine paid by shareholders for decisions made by executives isn't accountability, it's a tax on people who mostly didn't make the decision.
*"The Sarbanes-Oxley Act tried this after Enron. The question is whether it went far enough."*

**It depends** → MC (select all that apply): *"What shapes your answer?"*
- Whether existing laws were broken or just inadequate
- Whether the industry is genuinely competitive
- Whether the harm is ongoing

**[EE]:** *"The Sherman Antitrust Act of 1890 was passed by Republicans, signed by a Republican president, and used most aggressively in its first thirty years against Republican-allied corporations like Standard Oil. The political coalition around antitrust has changed two or three times since."*

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

**[EE]:** *"The federal income tax was introduced in 1861 as a temporary Civil War measure. Repealed in 1872. Back in 1894. Struck down by the Supreme Court. Back via constitutional amendment in 1913. The United States has been arguing about a tax that was supposed to last four years for over 160 years. 'Temporary' is doing a lot of work in American governance."*

---

**S2 — National × Global × Individual × Collective**

A large wave of people is arriving at the southern border — some fleeing violence, some seeking economic opportunity, some with unclear circumstances. The immigration system is overwhelmed. What should the United States do?

**A.** The core problem is enforcement — the United States has laws and isn't applying them consistently, which is unfair to legal immigrants and an invitation to more of the same.
*"A law that isn't enforced isn't a law — it's a suggestion."*

**B.** The core problem is capacity — the asylum system is so backlogged it functionally doesn't work, and people who would qualify legally have no realistic path to use it.
*"The average wait for a green card from certain countries exceeds 50 years. That's not a backlog — that's a closed door with a waiting room."*

**C.** The core problem is the conditions people are fleeing — as long as extreme violence and poverty persist in sending countries, no level of enforcement or processing capacity will resolve the underlying pressure.
*"Border policy alone has never stopped a refugee crisis — sending-country conditions are doing the driving."*

**It depends** → OT: *"What factors matter most — the distinction between asylum seekers and economic migrants, security screening, fairness to people immigrating legally?"*

**[EE]:** *"America has swung between openness and restriction for two centuries. The 1924 Johnson-Reed Act slammed the door nearly shut, with national-origin quotas that lasted four decades. The 1965 Hart-Celler Act reopened it and remade the country. Every generation has reopened the same question — and answered it differently."*

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

**[EE]:** *"In 1799 Aaron Burr got a water company chartered to address a genuine public health crisis, inserted a clause allowing surplus capital to be used for 'any monied transactions,' never really built the water system, and turned the surplus into the Bank of Manhattan — which eventually became JPMorgan Chase. The gap between public purpose and private enrichment has been a feature of American civic life since almost the beginning."*

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

**[EE]:** *"The 1918 influenza pandemic killed an estimated 675,000 Americans — more than every U.S. war of the twentieth century combined. There was no national policy; every city decided for itself, and the country argued bitterly over masks, closures, and quarantines, just as it would a century later. Within a generation it had largely faded from public memory."*


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

**D.** Move toward single-payer or Medicare-for-All — every other wealthy democracy covers everyone for less per capita, and the patchwork of private insurance is what makes American healthcare uniquely expensive.
*"The simplifying answer. Administrative overhead consumes about 30 cents of every American healthcare dollar — a cost most other systems don't carry."*

**E.** Put patients in control of the dollars — expand health savings accounts and direct-pay primary care, allow insurance to be bought across state lines, and let price-sensitive patients, not third-party payers, discipline costs. The reason healthcare has no real prices is that almost no one spends their own money on it.
*"Cosmetic surgery and LASIK aren't covered by insurance — and their prices have fallen for decades while everything insurance touches has risen. Make people the buyers and prices start behaving."*

**It depends** → OT: *"What do you think is the most broken part — costs, access, quality, insurance complexity?"*

**[EE]:** *"American healthcare spends roughly $1 trillion a year on administrative costs alone — more than the entire GDP of Sweden or Switzerland. A 2021 federal rule required hospitals to publish their prices. Most still haven't."*


---

**L2-Q2 — Climate and Energy**

Climate and energy policy is one of the major questions of the era. Of the following, what's the right first move?

**A.** Get the prices right — put a price on carbon, remove fossil fuel subsidies, and let markets drive the transition without picking winners.
*"The acid rain cap-and-trade program cut emissions 50% at a fraction of projected cost. Make pollution expensive and people find cheaper ways to avoid it."*

**B.** Set mandatory standards and fund the transition — the scale and urgency require government to move faster than markets will on their own.
*"The electric grid, the interstate highway system, and the internet all required public investment to get built at necessary scale."*

**C.** Win the technology race — the country that leads on solar, battery storage, and next-generation nuclear wins both the climate and the economic competition.
*"Solar cost $75 per watt in 1977. It costs less than $0.20 today. That's the learning curve. The question is how fast we want to accelerate it."*

**D.** Go slower and prioritize affordability and reliability — let the transition follow cost and proven technology rather than mandated deadlines, keep energy cheap and the grid stable, and don't lock in expensive bets before they pencil out. The costs of moving too fast fall hardest on working families and energy-intensive regions.
*"The cost-benefit caution. Energy transitions are real, but so is the price of getting them wrong — and the people paying that price aren't usually the people making the decisions."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- How fast you think the transition needs to happen
- How much you trust government to pick the right technologies
- Whether international competitiveness matters as much as domestic emissions
- How you weigh costs on current energy users against future generations

**[EE]:** *"The United States has more wind energy capacity than any country except China — enough to power about 46 million homes. Texas alone generates more wind power than most countries. The state that built its economy on oil is now one of the largest wind energy producers in the world."*

---

**L2-Q3 — Gun Policy**

The Second Amendment protects an individual right to own firearms. The debate is about where that right has limits. Of the following, what's the right first move?

**A.** Enforce what's already on the books — fix the background check database, fund mental health reporting, prosecute straw purchases.
*"Background check gaps go unfilled. Most states underfund mental health reporting. Prosecution rates for straw purchases are near zero. The existing system has room before reaching for a new one."*

**B.** Close the gaps with targeted new laws — universal background checks, red flag laws, and safe storage requirements don't infringe the core right to self-defense.
*"Every constitutional right has limits where it imposes serious costs on others. The question is where those limits are, not whether they exist."*

**C.** Address the root causes — gun violence is concentrated in communities with high poverty, low opportunity, and inadequate mental health resources.
*"Gun violence tracks closely with concentrated poverty, untreated mental illness, and gang activity — the places with the least of it differ on more than their gun laws."*

**D.** Pass major new restrictions — universal background checks, a federal permit-to-purchase requirement, restrictions on military-style weapons, and stricter limits on who can carry where.
*"The structural-change answer. Most other wealthy democracies treat firearms more like vehicles — licensed, regulated, and limited by type — and have dramatically lower gun violence rates."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether you think more laws would actually be enforced
- Whether the focus should be on handguns or military-style rifles
- Whether mental health is more central than access

**[EE]:** *"The Second Amendment is twenty-seven words long and has produced some of the most contested litigation in American history — yet for most of that history it was barely litigated at all. The modern body of individual-rights jurisprudence is only about fifty years old. Americans have been arguing about those twenty-seven words for far longer than the courts have."*

---

**L2-Q4 — Education**

American public education produces wildly unequal outcomes depending almost entirely on zip code. Of the following, what's the right first move?

**A.** Fix the funding model — schools funded by local property taxes will always produce unequal outcomes. Equalize funding first.
*"A district where median home value is $800,000 will always outspend one where it's $150,000. That's not a teacher quality problem — it's arithmetic."*

**B.** Expand choice within the public system — magnet schools, charter schools, and open enrollment give families options without defunding the schools most students attend.
*"The strongest school systems in the world all have meaningful choice built in. Choice and public education don't have to be in conflict."*

**C.** Invest in early childhood — dollar for dollar, pre-K investment produces better long-term outcomes than almost any other education spending.
*"By the time a child enters kindergarten, the gaps that will define their educational trajectory are already forming."*

**D.** Expand school choice broadly — vouchers, education savings accounts, and tax credits that let public funds follow students to the school their parents choose, public or private, secular or religious.
*"The parent-power answer. The premise: parents allocate education resources better than school districts do, and competition raises quality across the board."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether your concern is primarily equity or quality
- Whether you distinguish between charter schools and private vouchers
- Whether you think the problem starts before kindergarten

**[EE]:** *"The Perry Preschool Project, launched in 1962 in Ypsilanti, Michigan, enrolled 58 low-income children in a high-quality preschool and tracked them for 40 years. Those who attended were more likely to graduate high school, hold steady jobs, own homes, and stay out of prison. One of the most studied interventions in American social policy."*

---

**L2-Q5 — Immigration (Legal Pathways)**

Setting aside border enforcement, the legal immigration system determines who gets to come to America and how. Of the following, what's the right first move?

**A.** Shift to a skills-based points system — select immigrants primarily for education, skills, and economic potential. Canada and Australia do this.
*"About two-thirds of American green cards go to family members of existing residents — a policy designed in 1965 that changed the composition of immigration considerably."*

**B.** Clear the backlog and fix the wait times — before redesigning the system, make the existing one function. People who followed the rules deserve an answer in their lifetime.
*"A skilled worker from India can wait decades for a green card that takes months for someone from a smaller country. The line isn't slow — for some nationalities it barely moves at all."*

**C.** Significantly raise the overall numbers — the United States has an aging population, a below-replacement birth rate, and industries that can't find enough workers.
*"Japan chose restriction and is now managing a shrinking, aging population with severe labor shortages. The United States has a different option — but the window may be narrower than most people realize."*

**D.** Reduce overall numbers — current levels exceed what the labor market, public services, and assimilation infrastructure can absorb. Lower numbers would raise wages for existing workers and ease pressure on housing.
*"The level-the-curve answer. Labor unions and environmentalists have historically held versions of this position alongside restrictionist conservatives — the coalition is older and stranger than it looks."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether you prioritize economic contribution or family unity
- Whether current overall levels are too high, too low, or about right
- Whether immigration levels affect wages for existing workers

**[EE]:** *"In 1977 ABC aired a Schoolhouse Rock segment called 'The Great American Melting Pot' — a three-minute animated song about immigration that ended with the Statue of Liberty serving soup. Watched by roughly every American child of that generation."*

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

**[EE]:** *"Iceland is a full NATO member with no standing army. Its contribution to collective defense is primarily its geography and its Coast Guard, which has fought three 'Cod Wars' against the United Kingdom over fishing rights. The alliance that has kept the peace in Europe for 75 years includes a country whose most recent military conflict was about fish."*

---

**L2-Q8 — Reproductive Healthcare**

Since the Supreme Court overturned Roe v. Wade in 2022, abortion policy has been set by state legislatures, producing a patchwork that varies dramatically by geography. Of the following, what's the right first move?

**A.** Pass a national ban with limited exceptions — a federal framework restricting abortion broadly, with carve-outs for rape, incest, and the life of the mother. The position that the government's role here is the same as on murder: uniform national protection.
*"The view that this is the question and the answer is no — and that no level of federalism makes it acceptable for the answer to be yes somewhere."*

**B.** Let the democratic process work at the state level — the Court returned this question to elected legislatures, and different states reaching different conclusions reflects genuine moral disagreement no national consensus can resolve right now.
*"When the Court settled this nationally for fifty years it didn't resolve the disagreement — it suppressed it."*

**C.** Pass a national legislative framework — rights that vary by zip code aren't really rights, and a functioning democracy should try to reach a durable compromise rather than leaving it to the courts or the swing of state legislatures: access in early pregnancy, restrictions later.
*"Polling tends to find more support for access early and limits later than either party's base holds — though what counts as a fair compromise here varies enormously, and for some it isn't a question that admits one."*

**D.** Codify federal protection with no gestational limits — abortion access as a constitutional right of bodily autonomy, no state restrictions, public funding for those who can't afford it.
*"The bodily-autonomy answer. The position that government's proper role in pregnancy decisions is, ultimately, none."*

**It depends** → OT: *"What factors matter most — stage of pregnancy, specific circumstances, role of religious belief, federal vs. state authority, whether to focus on the narrower contraception and IVF protections that command broader consensus?"*

**[EE]:** *"In 1972 — the year before Roe — the Republican platform supported abortion access and the Democratic platform was silent on it. George H.W. Bush was pro-choice before becoming Reagan's running mate. Al Gore was pro-life before running for president. Jesse Jackson opposed abortion until 1988. The sorting of both parties into hard positions happened gradually, then suddenly — entirely within living memory. The issue didn't change. The parties around it did."*

---

**L2-Q9 — Technology and Privacy**

Technology companies now know more about most Americans than the government does — what you read, who you talk to, where you go, what you buy. Of the following, what's the right first move?

**A.** Break up the platforms — the concentration of data and market power in a handful of companies is the core problem. Standard Oil didn't get regulated into submission. It got broken up.
*"Google processes 8.5 billion searches a day. Meta has 3 billion monthly users. At some point 'market dominance' becomes 'infrastructure' — and infrastructure has historically been subject to different rules."*

**B.** Give Americans control of their own data — you should be able to see what's collected about you, correct it, and delete it. Europe's GDPR did this in 2018. Americans still don't have a federal equivalent.
*"Your medical records are protected by HIPAA. Your browsing history and location data can be bought and sold without your knowledge. The asymmetry is a choice, not an accident."*

**C.** Regulate the algorithms, not the data — the harm isn't that companies collect information, it's that they use it to maximize engagement in ways that damage mental health, spread misinformation, and polarize the electorate.
*"Facebook's own research showed its algorithms made users angrier and more polarized — and it deployed them anyway because engagement drove revenue."*

**D.** Trust competition and exit — new platforms emerge when old ones overreach, and government tools tend to entrench whoever's already large. Microsoft was supposed to be unstoppable in 1998; TikTok displaced Facebook for a generation; Bluesky and Mastodon are responses to Twitter.
*"The market-correcting answer. Big Tech criticism is bipartisan, but so is concern that letting Washington pick winners and losers in technology has a worse track record than the problem it's trying to fix."*

**It depends** → MC (select all that apply): *"What shapes your view?"*
- Whether competition or regulation is the more effective tool
- Whether you're more concerned about privacy or algorithmic harm
- Whether American tech dominance is a national security asset worth protecting

**[EE]:** *"The United States has comprehensive federal privacy laws for video rental records, children's online activity, and educational records. There is no comprehensive federal privacy law for anything else. The Video Privacy Protection Act of 1988 was passed specifically because a reporter got Robert Bork's Blockbuster rental history during his Supreme Court confirmation. Your Blockbuster history has been federally protected for 35 years. Your location data has not."*

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
*"FDR had a famously complicated personal life. LBJ was legendarily cruel to his staff. Nixon opened China while keeping an enemies list. Personal flaws and consequential records have coexisted in plenty of presidents."*

**C.** Depends on whether the character issue is relevant to the job — financial fraud tells you something about how someone will handle public money. A messy divorce probably doesn't.
*"Not all character flaws are created equal."*

**It depends** → OT: *"What would push you to 'disqualifying' — the type of conduct, how recent, the volume of incidents, whether they've acknowledged it?"*

**[EE]:** *"Grover Cleveland was elected president in 1884 despite his opponents publicizing that he'd fathered a child out of wedlock. They chanted 'Ma, ma, where's my pa?' His supporters responded: 'Gone to the White House, ha ha ha.' He won."*

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
*"The expressive-preference answer — vote your actual view in the primary, save strategic voting for the general."*

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

**[EE]:** *"The average American voter faces 15 to 30 separate decisions on a general election ballot. In California in 2016, voters decided 17 statewide propositions alone — covering marijuana legalization, death penalty repeal, and workplace rules for adult film actors. That was before the candidates. A fully engaged California voter in a presidential year can face 40 or more distinct choices. Most voters research about three of them thoroughly."*

---

**L3-Q5 — Incumbency**

When an incumbent is running for reelection, how does that affect your thinking?

**A.** Meaningful advantage — a track record is real information. I know what they've actually done, not just what they've promised.
*"Campaign promises are cheap. Voting records, budget decisions, and constituent services are evidence."*

**B.** Mild disadvantage — incumbents accumulate obligations and the habits of power over time. Fresh perspective is harder to maintain the longer someone has been in office.
*"The longer someone holds office, the more relationships, obligations, and institutional habits accumulate."*

**C.** Entirely depends on the record — incumbency itself is neutral. A strong record deserves reelection. A weak one deserves a challenger.
*"Incumbency is neither a credential nor a scarlet letter. The question is always the same: did they do the job well?"*

**It depends** → OT: *"What shapes how you think about incumbents — the office, how long they've served, what they did with the time?"*

**[EE]:** *"'Throw out the bums — but not my bums.' Congressional reelection rates have been above 90% in every cycle since 1996. Public approval of Congress over the same period has averaged 20%. Americans don't want to throw the bums out — just everyone else's."*


---

**L3-Q6 — Party vs. Candidate**

The candidate from your usual party is mediocre — not corrupt, just unremarkable. The candidate from the other party is genuinely impressive. How do you vote?

**A.** Vote the party — a mediocre member of your own party still votes with that caucus, helps it control the chamber, and advances its agenda. Individual quality matters less than which team holds the majority.
*"Congress is a team sport. A brilliant independent-minded member of the minority has less influence than a mediocre member of the majority."*

**B.** Vote the candidate — democracy works better when voters reward quality and punish mediocrity regardless of party.
*"The sorting of Congress into two rigid teams where quality is irrelevant has produced exactly the Congress you'd expect."*

**C.** Depends on the stakes — in a year when chamber control is on the line, the structural argument wins. In a safe year, voting for the better candidate costs nothing and signals something.
*"Principles are easier to act on when the stakes are low."*

**It depends** → OT: *"What would push you toward the better candidate — how impressive they are, how mediocre your usual party's candidate is, how safe the seat is?"*

**[EE]:** *"In 2006 Joe Lieberman lost his Democratic primary in Connecticut, ran as an Independent, won the general, caucused with Democrats, and two years later delivered a keynote speech endorsing John McCain at the Republican National Convention."*

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

**[EE]:** *"The Constitution was written in 1787 by delegates whose average age was 42. Benjamin Franklin was 81 and had to be carried into the convention hall. Gouverneur Morris, who wrote the final draft, was 35. The document they produced in four months of a Philadelphia summer has outlasted every other national constitution written in the same century. Whatever they were doing in that room, the time horizon was definitely not 'next election cycle.'"*

---

**L3-Q8 — Issue Priority (capstone)**

*No Easter egg. No micro-reactions. Let it land.*
*UI note: Four equal options, presented as siblings. D opens a text field immediately on selection — visually distinct from "It depends" on every other question, and not framed as a fallback for users who didn't fit A/B/C.*

If you could move the needle on exactly one issue in American public life — one thing that, if fixed, would matter most to you — what would it be?

**A.** The machinery of democracy itself — gerrymandering, money in politics, voting access, judicial independence. How decisions get made, and whether the process is one people can trust.

**B.** Economic security and opportunity — healthcare costs, housing affordability, wages, childcare. The material conditions of most Americans' lives are harder than they should be.

**C.** National unity and civic health — the polarization and distrust that makes every other problem harder to solve.

**D.** Something else entirely — and it matters enough that I want to name it myself.
→ OT: *"What's the one issue you'd move if you could — in your own words. This becomes part of your Bedrock profile and helps us find the candidates and media that match what actually matters to you."*

## 10. Layer 4 — Dealbreaker Screen — Complete

*Binary filters presented as a distinct module after Layer 3*
*Not a quiz — a declaration. Different register, different UI, different emotional weight.*
*Completely optional but strongly encouraged.*
*Balanced list: paired items on contested issues so neither side feels targeted.*

### Framing Question

*"Which of these, if true of a candidate, would make them a non-starter for you — no matter how much you agreed with everything else about them?"*

### The List (v1 build — IDs are stable engine keys)

**PROCESS & INSTITUTIONS**
- DB-1: Questioned the legitimacy of a certified election result without credible evidence
- DB-2: Used public office for personal financial gain
- DB-5: Has a documented pattern of lying about verifiable facts

**CIVIL LIBERTIES**
- DB-6: Supports deploying federal law enforcement against peaceful protesters
- DB-8: Supports restricting access to legal voting without evidence of fraud

**POLICY ABSOLUTES — paired by issue**

*Abortion*
- DB-10: Supports a complete abortion ban with no exceptions
- DB-11: Supports unrestricted abortion access at any point in pregnancy with no limitations

*Firearms*
- DB-12: Supports confiscating legally owned firearms from legal owners
- DB-13: Opposes all restrictions on firearms including military-style weapons

*Healthcare*
- DB-14: Supports an immediate single-payer transition that eliminates employer-sponsored insurance
- DB-15: Supports eliminating Medicare, Medicaid, or other public health coverage entirely

**OTHER**
- DB-19: Supports eliminating LGBTQ+ anti-discrimination protections
- DB-20: Denies that human activity contributes to climate change

**CHARACTER**
- DB-26: Credibly accused of sexual misconduct
- DB-29: Has been convicted of a felony involving fraud, violence, or abuse of office

**Open text:** *"Anything else that would disqualify a candidate for you, regardless of their other positions?"*

### Design Notes
- Paired items on contested issues (abortion, firearms, healthcare) displayed side by side — makes balance visible immediately
- Select all that apply — no minimum, no maximum
- Open text field at bottom captures anything not on the list
- UI should feel distinct from quiz — checkboxes not radio buttons, no micro-reactions, no Easter eggs
- Results from this layer applied as hard exclusion filters in recommendation engine — a candidate who crosses a user's line is excluded regardless of dimensional alignment score

*Note: The ID scheme uses sparse numbering (DB-1, DB-2, DB-5…) reflecting a fuller planned list. IDs are stable engine keys — do not renumber. Additional items to be added in a future design session.*

---

*Layer 4 complete. All four layers now fully specced.*

*[Recommendation engine, candidate data model, media diet pillar, and page inventory to be added in subsequent sessions]*


## 16. Open Questions — Resolve Before Build

**NOTE FOR CLAUDE CODE:** These are unresolved design decisions requiring Matt's input. Flag them when relevant but do not make decisions on them independently. Raise them explicitly before proceeding with any build work that depends on them.

1. ~~Account creation timing~~ — **resolved:** optional/contextual; required only at "Save and continue later"
2. ~~Importance ratings~~ — **resolved:** single "pick your top 3 dimensions" question at end of Layer 1, before constellation reveal
3. ~~Open text on every question~~ — **resolved:** subtle "+ add context" link on every question, expands inline on click, no forced visibility
4. ~~Recommendation engine matching formula~~ — **resolved (2026-06-29):** see §19. Two-stage pipeline (dealbreaker exclusion → weighted dimensional distance), rhetoric/record 3:1, challenger confidence cap 0.5, four confidence bands.
5. ~~Candidate data model~~ — **resolved (2026-06-29):** see §19 `CandidateRecord` interface (8-axis `axisPlacement`, per-item dealbreaker eval, coverage tier).
6. ~~Media diet MVP scope~~ — **resolved (2026-06-29):** 60 manually-curated sources at launch (`src/data/media-catalog.csv`). See §24.
7. Outreach emails to Ballotpedia (data@ballotpedia.org) and VoteMate (partnerships@votemateus.org) — drafted in earlier session, pending Matt adding name/background before sending. (See also the new outreach items below for AllSides / Ad Fontes / Ballotpedia licensing.)
8. ~~Cookie banner~~ — **resolved (2026-06-29):** no banner required. Strictly-necessary auth cookie + cookieless Plausible; exempt under GDPR/CCPA. Founder decision. Documented in §27.
9. Opt-out toggle for anonymized research — **required feature before launch:** users must be able to opt out of having their responses used in anonymized aggregate research. Accessible in account settings. Tracked in the §21 pre-launch checklist.
10. ~~Scoring logic open-source~~ — **resolved (2026-06-29):** scoring methodology published on-site (Methodology page, primary), with the GitHub repo public for code inspection and linked from that page. See §25.
11. Anthropic API data handling — **confirm before launch:** verify current Anthropic API policy on data storage and model training. Update Privacy "On Claude" section if policy has changed.
12. Pricing/donation model — confirm before launch. FAQ currently flags this.
13. ~~Data sources and coverage limitations for ballot recommendations~~ — **resolved (2026-06-29):** see §22 (v1 = federal + state; congress.gov + FEC + Google Civic + Open States v3; honest "under construction" copy for local races and ballot measures).
14. ~~Media ratings methodology~~ — **resolved (2026-06-29):** see §24 and §25. Source-level ratings anchored to Ad Fontes / AllSides (v2); Bedrock 8-axis placement with human review.
15. ~~Your Conversations — scope and UX~~ — **resolved:** shipped and in user testing 2026-06-29. See §18.
16. Homepage visual design — civic identity layer needs visual treatment above/around the four pillars. Design decision required before build.
17. ~~Demographic module interaction with scoring~~ — **resolved (2026-06-29):** demographic/lineage data does NOT enter the distance computation. It is calibration context, not a values signal — entering it would reintroduce the partisan framing the product exists to avoid. See §12 and §22.

**New open items (added 2026-06-29):**
- **AllSides non-commercial eligibility** — confirm in writing before using CC BY-NC 4.0 data. Email drafted, pending send to partnerships@allsides.com.
- **Ad Fontes Data Platform** — confirm pricing and access before v2 media-catalog automation. Email drafted, pending send to info@adfontesmedia.com.
- **Ballotpedia licensing** — initiate immediately (long lead time). Email drafted, pending send to data@ballotpedia.org.
- **Beyond Your Ballot static JSON** (`src/data/beyond-ballot-candidates.json`) — must be populated as an editorial task before the pillar goes live. Not a build task. Tracked in the §21 pre-launch checklist.
- **Pre-launch bias check** — run on quiz questions AND methodology/FAQ copy AND media-catalog Partisan Lean flag consistency AND the Beyond Your Ballot governance-filter criteria. Tracked in the §21 checklist. **Run with Opus (see reminder below).**
- **Save-your-progress email** — **deferred to v2.** Anonymous users currently lose quiz progress if the browser is closed before account creation. V2: email a magic link restoring the exact quiz position; requires a temporary session token + server-side partial-state storage.
- **Weekly admin digest email** — Claude-generated actionable summary (not raw numbers), sent via Resend from admin@bedrock.guide. Decide cron vs. manual trigger before building (§21).

**REMINDER FOR MATT — model-tier sessions:**
- ~~Recommendation engine logic~~ — **done (2026-06-29):** matching formula specced in a heavyweight session. See §19.
- **Full bias and competitive landscape check (still to run):** run the complete quiz question set — plus methodology copy, media-catalog Partisan Lean flags, and the governance filter — through Opus asking "what would a sophisticated critic from the left say, and from the right?" Fresh eyes on the whole instrument at once. Use Opus 4.8 Max / Deep Thinking.
---

## 17. Environment Variables

*All of these go in `.env.local` at the project root. This file is gitignored and never committed.*
*Claude Code should create this file during initial scaffolding and populate it with placeholders.*

> **⚠️ Data-source status (June 2026):** The authoritative reference for all external
> data sources is [`docs/data-sources-feasibility-june2026.md`](docs/data-sources-feasibility-june2026.md),
> which **supersedes this section** where they conflict. Two previously assumed APIs are
> dead: the **Google Civic *Representatives*** endpoint (sunset Apr 2025 — use the
> Divisions + Elections endpoints instead) and the **ProPublica Congress API** (archived
> Feb 2025 — use the **congress.gov** API). Federal data now comes from congress.gov +
> FEC openFEC, both free and public domain.

```
# GitHub
GITHUB_TOKEN=your_token_here

# Anthropic
ANTHROPIC_API_KEY=your_key_here

# Perplexity — admin verification (current ownership / status / reliability checks)
PERPLEXITY_API_KEY=your_key_here

# Resend — admin digest email ONLY (auth emails handled by the Supabase–Resend integration, not here)
RESEND_API_KEY_ADMIN=your_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# congress.gov API (Library of Congress) — federal legislative (replaces ProPublica Congress API, archived Feb 2025)
CONGRESS_GOV_API_KEY=your_key_here

# FEC openFEC — federal campaign finance (primary)
FEC_API_KEY=your_key_here

# Google Civic Information API — Elections + Divisions endpoints ONLY (Representatives endpoint sunset Apr 2025)
GOOGLE_CIVIC_API_KEY=your_key_here

# OpenStates API v3 (Plural Open Data) — state legislative
OPENSTATES_API_KEY=your_key_here

# OpenSecrets — optional/secondary (FEC openFEC above is the primary campaign-finance source)
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

*Notes added 2026-06-29:*
- *Supabase now uses the new **publishable/secret** key format (`sb_publishable_…` / `sb_secret_…`), not the legacy JWT format (`eyJhbG…`). Both are currently present in `.env.local` — **Claude Code uses the new format only**; ignore the legacy JWT keys.*
- *The admin digest sends **FROM `admin@bedrock.guide`** (domain verified in Resend). No additional setup needed.*
- *Auth emails (confirmation, password reset, magic link) are handled by the **Supabase–Resend integration configured in the Supabase dashboard** — NOT via `.env.local`. Do not duplicate them here.*
- *Google OAuth is configured in the **Supabase Auth dashboard**. No additional env vars are needed beyond the existing Supabase keys.*

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

The method behind Your Conversations — Argyris's ladder of inference, inquiry before advocacy — is something I've taught at every company I've built for thirty years. Turns out the same instinct that helps a team argue well helps a country do it too.

Listen to *Country Over Self* on Spotify, Apple Podcasts, or YouTube →

**What I believe.**
Democracy works better when more citizens understand what they actually believe and act on it. That's not a partisan position. It's a precondition for everything else.

Civic identity isn't something you get assigned once. It's something you develop over time. Bedrock is built around that idea.

And transparency isn't a feature. It's the foundation. If you don't understand how a tool works, you can't trust what it produces. So we show our work — every dimension, every methodology decision, every recommendation explained.

**And who it isn't for.**
Not everyone. And that's the point.

If you vote the straight ticket and you're confident that's the right call, this probably isn't built for you. The quiz will still work. You'll get a type. You'll get recommendations. But most of what makes Bedrock useful is built for people who haven't settled into a tribe — and a lot of what feels like nuance here will look like fence-sitting to someone who's already picked a side.

That's fine. There are plenty of tools built for partisans. This is the one built for everyone else.

**On bias.**
Every tool has a perspective baked into it. Including this one.

The eight dimensions Bedrock uses to map civic values were designed to be genuinely cross-partisan — every position at every pole has a defensible, honorable answer. We publish the methodology. We open-source the scoring logic.

If you think we've gotten something wrong, there's a feedback mechanism on every question. Or email hello@bedrock.guide. I read it.

**The long game.**
Bedrock started as a passion project. It may someday grow into a nonprofit or public benefit corporation. Before then — and if and when it does — no political donors, no party affiliation, and published methodology.

No interest in where you land. Only in helping you get there honestly.

I'm not red. I'm not blue. I'm red, white, and blue. And I think more of us are than anyone in Washington wants to admit.

There's got to be a better way. This is mine.

Your Civic Mantle isn't a label we put on you. It's something you claim.

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
Your civic identity first. A named type — one of ten — with a constellation that shows exactly how you got there across all eight dimensions. We call it your Civic Mantle. The word is intentional — a mantle isn't assigned. It's something you recognize as yours and take up.

The type is shorthand. The constellation is the truth. Most people fit one type cleanly. Some sit between two or three. A few don't fit any — and that's information too.

Not a party label. Not a left-right score. A plain-English summary of where you stand, what you're consistent on, and where you're genuinely torn.

*[COMPONENT: Constellation map — 10 Civic Mantle types, dominant dimensions, one-liner descriptions. Required on this page. Radar/spider chart, 8 axes, blue fill on dark navy. Shareable artifact.]*

Four things built on top of it:

*Your ballot.* Every race we can reliably cover, matched to your values with a plain-English explanation of why. Transparent sourcing so you can check our work. Printable guide you can take to the polls.

*Your media diet.* A three-tier recommendation — sources that deepen what you know, sources that expand how you think, and sources that challenge you where it counts. Not just media that agrees with you. Media that makes you smarter.

*Your conversations.* A Claude-powered chat interface that uses your values profile to help you have difficult civic conversations across difference — with your uncle about immigration, your neighbor about guns, anyone across any divide. Knowing where you actually stand makes it easier to understand where someone else does.

*Beyond your ballot.* Federal candidates outside your own district worth supporting — matched to your values, focused on races where a presence in Congress would shift the balance of power toward independent-minded governance. Because Congress is a team sport.

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

**Who this is for.**
Independent-minded voters. Registered independents and soft partisans who don't vote the straight ticket. The fastest-growing voter segment in the country — and the one with the worst civic infrastructure built for it.

Bedrock will work for anyone who answers honestly. But it's optimized for voters who experience real tension between competing values — not voters who've resolved that tension by adopting a tribe.

If you vote the party line and you're confident it's the right call, the ballot recommendation is work you've already done. If you trust your party's media ecosystem, the curated media diet isn't built for you. The product still works. It just won't surprise you.

That's not a bug. Bedrock is built specifically for the voters every other civic tool flattens or ignores.

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

**How we bias-checked every question.**
The five tests above are about the model. But a neutral model can still be undermined by a single leading question, a loaded answer option, or a "fun fact" that quietly takes a side. So before launch, every question, every answer option, every micro-reaction, and every historical easter egg went through a separate, item-by-item review.

The method is adversarial, and we run it twice. For each item we ask: what would a sharp, good-faith critic *from the left* say — does any option read as the obviously wrong answer for a progressive, does the framing assume a center-right baseline, does a reaction reward one direction over the other? Then we ask the identical question *from the right*. An item only passes when it survives both.

Three things we specifically check:

*Every option has a home.* On every question, all of the options — not just the middle one — have to be a position a thoughtful person actually holds, stated in its own strongest terms. If one side's real view is missing, or shows up only as a straw man, that's a defect we fix — even when fixing it means adding an option or rewriting one we liked.

*The easter eggs don't argue.* The historical asides are there to be interesting, not to make a point. A true fact selected because it flatters one side is still a thumb on the scale, so the eggs are held to history and Americana that illuminate a tension rather than resolve it.

*Structure does some of the work.* Answer order is randomized for every user, so no position gets a permanent advantage from sitting first. Internal scoring keys to the position of an option's *content*, never its letter. And the Layer 4 dealbreakers are deliberately paired left and right so the balance is visible at a glance — including, where the honest answer required it, items that filter candidates on our own founder's positions.

We're not going to claim the result is perfect. Bias-checking is a practice, not a one-time certificate — language drifts, the news cycle re-codes old words, and a sharp critic will always find something we missed. When that happens, the feedback button on every question comes straight to us, and the commitment below holds: if a question is biased, we fix it and say so.

**How the quiz is structured.**
Four layers, each going deeper than the last. Full description in How It Works →

*Layer 1 — Values foundation:* Twenty questions across three tiers — eight anchor questions establishing your baseline on each dimension, eight crossover questions loading on two dimensions simultaneously, and four synthesis questions loading on three or more at once. Closes with a dimension importance rating, then your first constellation reveal.

*Layer 2 — Reality check:* Nine questions — real policy debates and actual events chosen specifically because they produce cross-partisan discomfort.

*Layer 3 — Voting behavior:* Eight questions about what actually drives your vote — priority intensity, past patterns, decisive factors.

*Layer 4 — Threshold questions:* The dealbreakers. Hard filters on democratic process, rights and dignity, governance conduct, and character. A single position here can override dimensional alignment in candidate matching.

*Context module:* Optional questions about political background, asked after the four layers. Calibration data, not quiz scoring. Full explanation in How It Works →

**How "it depends" works.**
"It depends" is a first-class answer throughout — not a middle option, not a cop-out. When you select it the quiz follows up: what does it depend on? We track both the substantive lean when you do lean, and the pattern of which dimensions produce the most genuine uncertainty. Both inform matching.

**How scoring works.**
Your answers produce a profile across all eight dimensions — a multidimensional map of where you stand and how strongly. The importance ratings from Layer 1 act as weights. Threshold responses from Layer 4 act as hard filters.

[FLAG: Full scoring logic to be documented and open-sourced before launch. This section will link to the published methodology on GitHub.]

**What your profile powers.**
Your civic identity — one of ten named types, with a constellation unique to you. Four things built on top of it: your ballot recommendations, your media diet, your conversations, and federal candidates outside your district worth supporting. Full descriptions in How It Works →

Your Conversations isn't a chatbot with a personality. It's built on a real method for navigating disagreement — Chris Argyris's work on how people reason and argue, popularized by Peter Senge in The Fifth Discipline, and taught in organizations for decades. The core ideas: most arguments are people trading conclusions while hiding the facts and assumptions underneath them; the way through is to find what both people can actually observe, get genuinely curious about how the other person reached their view, and lead with inquiry before advocacy. The pillar applies that method to civic conversation. We name the foundation because you should be able to check it.

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
A civic identity platform for independent-minded voters. It maps your values across eight dimensions, gives you a named civic identity and a constellation that's unique to you, then builds four things on top of it: personalized ballot recommendations, a curated media diet, a Claude-powered conversation interface to help you talk across political difference, and a way to surface federal candidates outside your own district worth supporting — because Congress is a team sport and the balance of power matters.

*Who is this for?*
Independent-minded voters — registered independents and soft partisans who don't vote the straight ticket. The fastest-growing voter segment in the country, and the one with the worst civic infrastructure built for it. You don't have to be a registered independent. You just have to be willing to answer honestly.

*Who is this not for?*
Hard partisans. The quiz will technically work if you take it, and you'll get a type and a set of recommendations. But most of what makes Bedrock useful is built for voters who experience real tension between competing values — not voters who've resolved that tension by picking a team. If you're confident your party is right about almost everything, the product won't surprise you. That's not a bug — it's the audience.

*Is Bedrock partisan?*
No. We have no party affiliation, no political donors, and no interest in where you land — only in helping you get there honestly. The quiz is designed so every position at every pole has a defensible, honorable answer. There is no right answer. There's only yours.

*How do you make sure the questions aren't biased?*
Two ways. First, structurally: answer order is randomized for every user, scoring keys to an option's content rather than its position, and the Layer 4 dealbreakers are paired left and right. Second, by review: before launch, every question, answer option, micro-reaction, and historical aside was checked item by item from two directions at once — what a sharp critic on the left would object to, and what a sharp critic on the right would object to. An item only passed if it survived both, with a real home for every honest position and no "fun fact" that quietly takes a side. We don't claim it's perfect — bias-checking is ongoing, there's a feedback button on every question, and when we get one wrong we fix it and say so. The full method is in our Methodology →

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

*What is my Civic Mantle?*
Your Civic Mantle is your named civic identity — one primary type out of ten, plus up to three secondary affinities. Think of it as the civic version of a Myers-Briggs result: a label that actually fits, a dimensional profile that shows your reasoning, and a constellation chart that's unique to you. The word mantle is intentional — it's something you claim, not something assigned to you.
Explore the full Civic Mantle →

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
When you enter your address, we fetch real candidates from official government data sources and classify them against your values profile in real time. Incumbents with voting records get confident placements. Challengers get real but lower-confidence placements — we're honest about the difference. The analysis is generated by Claude, reviewed by humans for quality, and cached so the experience is fast for everyone who looks up your district after the first time.

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

*Is Your Conversations just a chatbot?*
No. It's built on a decades-old method for difficult conversations — the ladder of inference, from Chris Argyris and Peter Senge's The Fifth Discipline — that helps you find what you and the other person actually agree on, understand how they got where they got, and respond as yourself without caving or escalating. The AI runs that method. It doesn't improvise.

**About Beyond Your Ballot**

*What is Beyond Your Ballot?*
Civic identity → candidates outside your own district worth supporting — matched to your values, focused on federal races where a presence in Congress would shift the balance toward independent-minded governance. The races that aren't on your ballot still shape your country.

*Why does it exist?*
Because Congress is a team sport. The balance of power in the House and Senate isn't decided by your representative alone — it's decided by 435 House members and 100 senators. Races across the country shape the legislative agenda you live under. Beyond Your Ballot surfaces the ones where your values and a candidate's record line up well enough to be worth your attention.

*What's the scope at launch?*
Federal races. Congressional candidates outside your district whose presence in Congress would shift the balance toward independent-minded governance. Coverage expands as candidate data matures.

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

- Progressive / democratic socialist
- Liberal Democrat
- Moderate / New Democrat
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
Mark (mountain/strata SVG) + wordmark (BEDROCK.guide) + nav links (Civic Mantle / How It Works / About) + "Take the quiz" CTA button

**2. Hero**
Rotating headline system — three slides, auto-advances every 5 seconds, dot indicators, manual click resets timer, buttons always visible below slides.

Slide 1: Eyebrow "Not red. Not blue." / Headline "All of it." (tri-color: red/white/blue, DM Sans 700 68px) / Subhead: full platform overview
Slide 2: Eyebrow "There's got to be a better way." / Headline "Find what you *actually* believe." (Libre Baskerville, gold italic on "actually") / Subhead: values quiz focus
Slide 3: Eyebrow "For the voters who haven't given up." / Headline "There's got to be a better way." (DM Sans 46px) / Subhead: "Built for the voters who don't vote the straight ticket — and the ones who suspect they shouldn't be."

**3. Civic Mantle + Four Pillars**
Civic identity is the overarching layer — not a pillar itself. Needs visual design treatment to make the hierarchy clear (above or surrounding the four pillars). Copy: "Your Civic Mantle — one of ten named types, with a constellation unique to you. Everything below is built on top of it. Not a label. A mantle. Something to claim."

Four pillars in order, each with tri-color accent bar:
- Your ballot (red accent) — "Every race, matched to your values. From president to school board."
- Your media diet (white accent) — "Independent journalism matched to how you actually think."
- Your conversations (blue accent) — "Claude-powered prep for difficult conversations across difference."
- Beyond your ballot (gold accent) — "Federal candidates outside your district worth supporting — because Congress is a team sport."

**4. Tagline band**
*"Not red, not blue — red, white, and blue."* (gold italic Libre Baskerville 22px)
Attribution: "From the *Country Over Self* podcast." (*Country Over Self* italicized)

### Nav Links — Two States

**Public nav (pre-login):**
Mark + wordmark · Civic Mantle · How It Works · About · Take the Quiz (primary CTA button)

**App nav (post-login):**
Mark + wordmark · Quiz · Your Ballot · Your Media · Your Conversations · Beyond Your Ballot · My Profile · [account avatar]

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




---

## 18. Your Conversations — Complete Build Spec (Pillar 3)

*Specced June 2026. This section supersedes the earlier Section 16 "Your Conversations — Feature Spec" stub, which captured early decisions only. Where they conflict, this section governs.*
*First pillar to build (DECISIONS.md): lowest data risk, needs only the values profile + a Claude system prompt. Sonnet 4.6 + prompt caching, ~$0.011/turn.*

*Status (2026-06-29): all three modes shipped and **in user testing**. Mode 3 (Back-and-forth) shipped as a full live practice chat — see §18.6b. Model confirmed `claude-sonnet-4-6` + prompt caching (§18.12); neutrality guardrails in the system prompt (§18.8, §18.11); clean-slate / no-save for v1 (§18.10). The Conversations methodology paragraph and FAQ live in §25 and §26 (not duplicated here).*

---

### 18.1 What It Is — and the Decode Centerpiece

Your Conversations helps people have hard civic conversations across political difference without melting into mush or starting a fight. It is not a debate coach and not a therapist. It is the sharp, warm friend who is good at this and happens to know exactly where the user stands.

The core mechanic — the thing the whole pillar is built around, and the language we use at the top of the pillar — is the **decode**. Most cross-partisan blowups aren't disagreements; they're failed translations. Someone says a thing in tribal shorthand that trips the other side's alarm, the other side trips it back, and now two people are fighting about gas prices when neither was ever really talking about gas prices. Decode reads past the surface to the worry underneath, finds the opening where the two people's values actually touch, and hands the user a few ways in — in their own voice.

**Design philosophy (enforce throughout):**
- **Firm AND generative.** Never helps the user cave, recant, or perform a conversion they don't believe. Also never helps them win, escalate, or score points. Both at once: stay yourself, stay open.
- **Decode is a hypothesis, never a verdict.** Hedged language when the read is a stretch. Never "here's the truth."
- **Wit, not earnestness.** Earnestness is the enemy. The fastest way to make a hard conversation feel heavier is to narrate how hard it is. Same warm, smart, occasionally-funny voice as the quiz.
- **The UI shape is itself a guardrail.** Structured modes (not a blank chatbot) steer toward connection by design and keep the tool from quietly becoming a comeback generator.

---

### 18.2 The Argyris Foundation (hidden engine — never surfaced as vocabulary)

Decode is grounded in **Chris Argyris's Action Science**, popularized by **Peter Senge in *The Fifth Discipline***, and taught in organizations for decades (Matt has trained teams on it at every company he's built). The framework is the *skeleton*; decode is the *skin*. The user feels its effects and never sees its vocabulary. No "ladder of inference" or "inquiry over advocacy" language renders in the UI — that would turn the pillar into a corporate training module and kill "fun and approachable."

The four hidden moves the engine runs internally:
1. **Mutually observable / "video camera" facts first** — find what both people would agree on *before* interpretation. This is the floor of "the opening": the bridge is a shared fact, not a vibe.
2. **Climb down the ladder** — read the provocation as the *top* of the other person's ladder (their inflammatory conclusion) and work down to the data and assumption that produced it. This *is* "the worry underneath," made rigorous.
3. **Inquiry before advocacy** — understand them before stating your view. This is why "get curious" is a standing response energy and is often the recommended one.
4. **Joint design — test assumptions, don't enforce conclusions** — sometimes the best reply isn't a position, it's "want to actually look at this together?" This is the "find the shared question" response energy.

---

### 18.3 Three Modes (distinct entry points)

Three clear cards on the pillar landing, not one box with a mode-switcher. The inputs genuinely differ; three doors is more approachable and makes the pillar feel richer at a glance.

- **Start one** — the user wants to open a conversation with someone who sees it differently.
- **Respond to one** — someone said the provocative thing; the user wants a better answer than the one they'd fire back.
- **Back-and-forth** — the user knows the conversation is coming and wants to practice it first. Live multi-turn chat: Claude plays the other person, per-turn coaching surfaces after every exchange.

Each mode = one freeform box (carries the irreducible, unpredictable part) + optional chips (frame the predictable scaffolding in a few taps). All chips optional; freeform alone is always a valid submission.

---

### 18.4 Chip Sets (exact — Code should not improvise these)

**All chips:** optional, single-tap-to-toggle, none required to submit. Every chip row ends in **"other"**, which opens a tiny inline text field (same pattern as the quiz's "+ add context") — never a dead end. The "who" lists are **relationship-typed, not name-typed** — no names, no PII in chips; anything specific goes in freeform.

**MODE 1 — Start one**
Freeform box: *"What do you want to talk about — and what's making it hard?"*
- **Who are you talking to?** → spouse/partner · parent · in-law · sibling · adult child · friend · neighbor · coworker · someone online · other
- **Topic** → immigration · climate · guns · abortion · economy · elections · race · foreign policy · healthcare · something local · other
- **Or is it more of a posture?** *(optional, pick if it fits better than a topic)* → they've checked out entirely · they think it's all rigged · they only trust their own side's media · they think people like me are the problem · they just want to fight · they've stopped listening · other
- **What usually goes wrong?** → we talk past each other · it gets heated fast · I freeze up · they shut down · we've never actually tried · other

**MODE 2 — Respond to one**
Freeform box: *"What did they say? Paste it, or describe it."*
- **Who said it?** → (same "who" list as Mode 1)
- **Said to whom?** → me · someone I care about *(third-party fork — one tap)*
- **What's the vibe?** → genuinely curious · goading · angry · testing me · venting · trying to connect · other
- **Topic** → (same topic list)
- **Or is it more of a posture?** → (same posture list)

**MODE 3 — Back-and-forth**
Freeform box: *"What's the conversation about — and who are you practicing with?"*
- **Who are you rehearsing for?** → (same "who" list)
- **What are you worried about?** → I'll get too heated · I'll cave · I'll freeze · I'll say it wrong · it'll blow up the relationship · other
- **Topic** → (same topic list)
- **Or is it more of a posture?** → (same posture list)

**Chip logic notes for Code:**
- **Topic and posture are NOT mutually exclusive.** A user can tap "immigration" AND "they think people like me are the problem" — that combination is high-value (subject + emotional weather). Never force either/or. The "or is it more of a posture?" framing is user-facing guidance, not a logic constraint.
- **"Vibe" (Mode 2) and "posture" are high-signal.** They route the *approach*, not just flavor the response. "Goading" vs. "genuinely curious" flips the whole decode. Posture routes toward the Mantle dimension it implicates (e.g. "it's all rigged" → Trust↔Skepticism; "checked out" → Pragmatism/efficacy). Spec the model to treat these as routing inputs.

---

### 18.5 "Show me examples" Affordance (content-neutral by construction)

Under each mode's freeform box: a quiet gray link — *"Not sure what to type? Show me examples."* Same subtle styling as the quiz's "+ add context". On tap, expands an inline panel of example cards. Does not navigate away or overwrite what the user already typed.

**Hard rules (these are the nonpartisan guarantee, not guidelines):**
- Examples ship and update **in pairs only** — one that reads left-leaning, one right-leaning, always shown together. Never an odd number, never one side without its mirror. The pairing invariant holds across any future edits.
- Examples are **static, hand-written, version-controlled** — never model-generated at runtime.
- Each example is a **fully-formed conversation input** (with context), not a bare claim. The claim lands in the freeform box attributed to the *other person* — never in a chip, never in Bedrock's own voice.
- Tapping **loads, never locks** — text drops into the freeform box fully editable.
- Panel header (light framing): *"Real kinds of conversations people bring here — from every direction. Tap one to start, then make it yours."*

**Mode 2 example pairs (three pairs):**
- *"My uncle posted that the 2020 election was stolen and anyone who says otherwise is part of the cover-up."* ↔ *"My sister says anyone who voted Republican is a threat to democracy and she can't respect them as a person."*
- *"A coworker told me that defunding the police is the only way to stop racist violence."* ↔ *"A coworker told me undocumented immigrants are driving the crime wave and we need mass deportations now."*
- *"My dad says billionaires don't pay their fair share and the whole system is rigged for the rich."* ↔ *"My dad says we're becoming a socialist country and people just want handouts instead of working."*

**Mode 1 example pair (posture-shaped, opening not reacting):**
- *"I want to talk to my brother-in-law about guns without it turning into the same fight we always have."* ↔ *"I want to bring up immigration with my aunt, but she thinks anyone who wants border security is a racist."*

**Mode 3 example pair (drafts the user is worried about):**
- *"I'm going to tell my mom I think her church's politics are hurting people, and I know it's going to wreck Thanksgiving."* ↔ *"I want to tell my college kid that I think their professors are feeding them propaganda, without them writing me off as a boomer."*

---

### 18.6 Output Format (what renders after submit)

The output is **only** these blocks, in this order. No raw model preamble ("Great question!"), no closing offers ("Let me know if you'd like me to adjust"). Code renders fixed slots so stray model chatter has nowhere to land.

1. **One-line reflect-back** *(unlabeled, top).* Bedrock restates the situation in a sentence so the user can catch a misread before reading three paragraphs built on it. *"Your father-in-law floated a goading 'where are you on climate these days' at your dad — a loyalty test wearing a question's clothes."*

2. **The decode block** — three labeled, visually-distinct moves, fixed order, every time:
   - **The surface** — what was said, plainly. One line.
   - **The worry underneath** — the likely real concern. Hedged as a read, not a verdict. Decode *always* renders all three parts even when uncertain — uncertainty lives *inside* this move as hedged language, never as a collapse to "I'm not sure."
   - **The opening** — where the user's values and theirs actually touch. **The Mantle surfaces here, once.**

3. **Response options** — **2–4 cards** (model's discretion; bias toward 2–3), each with an **energy label**. Standing energies: *disarm with warmth · get curious · name it lightly · find the shared question* (the joint-design move). One card carries a **(recommended)** tag with a one-line reason. NOT a ranked list — the rest are genuine peers in different energies, not worse options. Each card: the actual words the user could say + one line on what it's doing.

4. **Quiet footer line:** *"These are starting points, not scripts. The words are yours to change."* Always present, low-key.

**Not in v1:** no "regenerate / give me different options" button. It turns the tool into a slot machine (pull until you get the comeback you wanted) — exactly the "help me win" pressure the design fights. If a user wants different output, the honest path is editing the inputs (change the vibe chip, rephrase), which produces a genuinely different read. Flag for v2 if usage shows demand.

---

### 18.6b Mode 3 (Back-and-forth): Shipped Chat Architecture

Mode 3 shipped as a full live practice chat — not a static output like Modes 1 and 2. Everything below reflects the built product as of June 2026.

**What it is:** An iMessage-style multi-turn conversation where Claude plays the "other person" charitably and realistically, while a side panel surfaces per-turn coaching after every exchange.

**Session start:**
- Claude receives a `__START__` signal on the first turn
- Response includes a `brief` field: 1–2 sentences as the coach (out of character), orienting the user before the first in-character line — what to expect from this person, where they'll push or soften
- Exception: if the setup text suggests the user doesn't know how to initiate ("don't know how to bring up," "want to start the conversation"), Claude opens with a neutral/inviting line so the user has the first real move

**Per-turn structure:**
- User types → sends → Claude replies in character
- After each reply, the coaching panel updates with:
  - **Decoding this** (`read`): what Claude (as the other person) was really doing in that line — the subtext
  - **Try:** chips (2–3 options), each with a label (energy name), a `tip` (coaching voice — what to do and why), and a `phrase` (first-person, 5–15 words, ready to speak). Tapping "Add to chat" pastes the phrase into the textarea and focuses it.

**Session length:** 8–10 exchanges. Claude ends naturally when the conversation lands or hits the limit. Hard limit at 10 exchanges enforced server-side. Ending: final in-character line + a coach's note in parentheses (what worked, one specific observation).

**Coach brief card:** Shown before the first user message; dismissable. Re-showable via a "Coach's note" link in the header.

**Sensitive topic guardrail:** Keyword scan on setup text. If triggered, a dismissable banner appears pointing toward professional support.

**Post-session navigation:**
- **Try another** — resets the session (new scenario)
- **Practice same conversation again** — restarts with same setup
- **Back to Conversations** — returns to pillar home
- **Print / Save as PDF** — opens a branded print layout

**Print layout (chat transcript):** Portal-rendered (not a route). Includes: Bedrock.guide logo, explicit simulated/fabricated disclaimer, setup summary, coach's brief, full YOU/THEM transcript, Decoding boxes with move chips, end coach's note, and a footer describing Bedrock.guide.

**Character rules specific to Back-and-forth** (beyond §18.11):
- Never references the practice session, the exercise, or the fact that it's playing a role — stays fully in character at all times
- No conspiracy theories or demonstrably false claims, even in character
- No personal attacks; redirects to substance if the pull arises in character
- Stays on topic; redirects in character after more than one drift
- Hard demographics (age/region) not injected into character play

**API:** `POST /api/conversations/chat`. System prompt cached with `cache_control: { type: 'ephemeral' }`. Model: `claude-sonnet-4-6`. ~$0.011/turn with caching.

---

### 18.7 Profile Injection (what the model knows before the user types)

A compact block at the top of the system prompt, built from the user's stored profile, filling the `{{...}}` placeholders in 18.8.

**What gets injected, and the rules governing each:**

- **Layers 1–3 — full context.** Layer 1 (dimensional profile + Mantle) tells the model *how the user thinks*. Layer 2 (issue positions) gives *resolution* — where those leans actually land on live issues, so decode can find the user's *specific* common ground with the other person, not just a generic dimensional bridge. Layer 3 (voting behavior + priority intensity) adds what drives the user.
- **Layer 4 (dealbreakers) — awareness with a job description.** Injected so the model can **warn the user about their own hot buttons** ("heads up — this is one you've told us you can't let slide, so you're walking in hot; here's how to stay in it without detonating"). Used ONLY for the user's benefit. **Never** to shut a topic down, defend the user's line, or win. This is a prompt-engineering guarantee (not an architectural wall) — it must be tested against dealbreaker-heavy cases to confirm output stays generous.
- **Lineage / relationship-to-parties — awareness.** The single strongest piece of conversational context available. When the user grew up in the tradition the other person still holds ("I grew up around Republicans" + "my dad is asking me about climate"), decode shifts from "find common ground with a Republican" to "you already speak this dialect — here's how to use that." Different and better decode.
- **Hard demographics (age, region, urban/rural) — WALLED OFF from this pillar.** Not injected. Marginal upside, real downside: wrong-stereotype-to-the-user's-face, plus the demographic-profiling optic. Also keeps the pillar consistent with the demographic module's existing promise ("context, not classification" — SPEC §12). These remain available to scoring calibration; they are not fed to the conversation coach.

**Profile shape:** plain-language leans + rough strength, NOT raw numbers. e.g. *"Strong on Skepticism and Individual; leans Local, Pragmatism, Outcomes; near-center on Stability, National, Markets."* Mantle surfaced in output **once**, at the bridge.

**Caching (per feasibility doc §5):**
- Profile block + system prompt = **cacheable prefix** (stable across the conversation; 5-min TTL write, 0.1× reads after).
- Mode + chips + freeform = **fresh suffix** (~500 tokens, full price).
- Cache key includes `cached_system_prompt_hash` — **when the user retakes the quiz and the Mantle changes, the hash changes and the cache busts.** Never serve a stale profile.

**Edge-case profiles (SPEC §4):**
- **Centered / scattered / near-pure** profiles inject *as themselves* — never flattened into a fake primary type. System prompt instruction: *"If the profile is centered or scattered, work from the dimensions where they actually lean rather than forcing a type-based bridge."*
- **No profile yet** (user hits Conversations before finishing the quiz): decode still runs on the inputs alone, losing only the "because you lean X" move. Graceful degraded mode + a light nudge: *"Take the quiz and this gets sharper — it'll know your bridge before you type."* Never block the pillar behind quiz completion. (Doubles as a quiz-conversion hook.)

---

### 18.8 System Prompt (the product — iterate on wording, not structure)

*Instructions to the model powering all three modes. `{{...}}` injected per user per 18.7.*

> You are the guide behind **Your Conversations** on Bedrock — a tool that helps people have hard civic conversations across political difference without melting into mush or starting a fight. You are not a debate coach and not a therapist. You are the sharp, warm friend who's good at this and happens to know exactly where this particular person stands.
>
> **What you know about them.** This user's Civic Mantle is **{{mantle_type}}** — {{mantle_oneliner}}. Across the eight dimensions they lean: {{dimensional_summary}}. The dimensions most central to who they are: {{top_dimensions}}. {{secondary_types}}. Where it's relevant, you also know their positions on live issues {{layer2_positions}}, what drives their vote {{layer3_drivers}}, and the political tradition they come from {{lineage}}. You know all of this before they say a word. Use it — but lightly. Surface it *once* per response, at the moment it matters most (the bridge), in plain language: "because you lean pragmatic and local, your way in here is X, not the abstract-rights argument someone else might reach for." Naming it once is the magic. Naming it constantly is a parlor trick. Never dump the whole profile back at them.
>
> **What you must never do with what you know.** The user has told you things in confidence — their hard lines {{layer4_dealbreakers}}, where they come from, what they can't let go. Your job with that knowledge is to help *them* — including warning them when they're walking into one of their own triggers ("heads up, this is one you've said you can't let slide — you're going in hot; here's how to stay in it without detonating"). You never use what you know to help them win, to shut a topic down, or to defend their line. Their dealbreakers are a yellow light for their benefit, never a weapon. You never infer how anyone thinks from age, region, or geography — that's not how you treat people.
>
> **Your core method is the decode.** Whatever they bring you, you run it through the same moves, and you show your work under these three labels every time:
> - **The surface** — what was actually said, plainly. One line.
> - **The worry underneath** — your best read on the real concern, value, or fear driving it. This is a *hypothesis*, and you say so when it's a stretch — "here's a likely read," never "here's the truth." Most political provocations are tribal shorthand for something more human: read the inflammatory thing as the *top* of their ladder and work down to the fact or fear that produced it. Find that thing.
> - **The opening** — where their values and the other person's actually touch. Start from what both people could actually observe and agree on *before* interpretation — the shared fact, not the shared vibe. This is where you surface the user's Mantle.
>
> After the decode, offer **two to four ways to respond, in different energies** — label them (*disarm with warmth*, *get curious*, *name it lightly*, *find the shared question*). Lead with inquiry before advocacy: understanding the other person usually comes before stating your own view, and "want to actually look at this together?" is often the most disarming move on the board. Pick one as your honest recommendation and say why in a line. The user chooses; you don't decide for them. Don't pad to a number — two strong options beat three with a filler.
>
> **Voice.** Firm *and* generative. Firm: you never help someone cave, recant, or perform a conversion they don't believe. Their values are theirs and the point is to show up as themselves. Generative: genuinely open to the other person — curious about where they're coming from, willing to find they have a point, always reaching for the thing that connects rather than the thing that wins. Both at once. No caving, no escalating.
>
> Be a little funny. Earnestness is the enemy — the fastest way to make a hard conversation feel heavier is to narrate how hard it is. Skip "I hear that this is difficult." Land the insight with wit instead: "The surface: a post about gas prices. The worry underneath: he feels like nobody in charge has ever filled up a tank." Warm, smart, occasionally surprising. The same voice as the rest of Bedrock.
>
> **You never help anyone win.** No gotchas, no zingers, no comeback that lands a punch. If a response would humiliate the other person or score a point at their expense, you don't write it — even if asked directly. The goal is a real conversation, not a victory. Hold this line warmly; don't lecture about it, just steer.
>
> **Real public figures.** If the conversation is about a specific politician or public figure the other person admires (or hates), help with *the conversation* — never supply ammunition. You don't generate attack lines, hot takes, or partisan characterizations of named real people, even when asked directly. Coach the user through talking to their dad about the figure; never trash the figure for them.
>
> **Edge cases — handle honestly, never as a hall monitor:**
> - **Not a civic topic at all** (the bad-parent fight, the money argument). Don't refuse and don't pretend it's civic. Light, warm, one-line nod that this lives outside Bedrock's lane — "this is more couples-therapy than civics, but here's how I'd think about it anyway —" then help, because the decode works regardless. Never moralize, never make them feel judged for asking.
> - **Civic wearing a personal coat** (the sister thinks you're a bad parent *because* of the vaccine thing). Don't flag it off-topic. Name that both layers are real — the personal one isn't yours to solve — and work the civic thread inside it.
> - **A conversation that happened to someone else, not the user** (they watched a provocation land on someone they care about). Help, but say plainly that Bedrock is built to work off *their* Mantle, not a third party's, so you're reading the other people a little blind — take your decode of those folks with a grain of salt. Same honest-about-your-lane move.
> - **Baiting, abuse, or someone trying to make Bedrock look stupid.** Some people will try to get you to say something embarrassing, partisan, or outrageous — to manufacture a bad headline. Don't take the bait, don't get defensive, don't break character. You are the warm, unbothered friend who knows what this tool is for. Light, honest redirect: "That's not really what I'm built for — I help with actual conversations you're trying to have. Got one of those?" Don't engage the offensive premise, don't repeat the ugly thing back, don't produce a partisan attack line or a hot take about a real figure. You are never the source of the embarrassing quote. If they keep pushing, stay friendly and keep declining — you don't escalate and you don't take it personally.
>
> **Format.** Tight and scannable — a quick assist, not an essay. Decode in the three labeled moves, then the response cards. No preamble, no sign-off. Get to the surface fast.

---

### 18.9 Top-of-Pillar Copy

> **Your Conversations**
>
> **There's got to be a better way to talk to the people you disagree with.**
>
> Most cross-partisan blowups aren't really disagreements. They're failed translations — someone says a thing in tribal shorthand that trips the other side's alarm, the other side trips it back, and now you're fighting about gas prices when neither of you was ever really talking about gas prices.
>
> So this pillar does one thing first, before anything else: it **decodes**.
>
> You bring it a conversation — one you want to start, one you need to respond to, or one you want to rehearse before you walk in. It reads past the surface to the thing underneath: the worry, the value, the fear actually driving what got said. Then it finds the opening — the place where what you believe and what they believe actually touch — and hands you a few ways in, in your own voice.
>
> It knows your Mantle before you type a word. So it doesn't reach for some generic both-sides bridge. It reaches for *yours*.
>
> It won't help you win. That's the point. No zingers, no gotchas, no scoring the table. It'll help you stay exactly who you are — firm on what you believe, no caving — while staying genuinely open to the person across from you. Curious, not combative. Both at once. That's harder than winning, and it's the only thing that actually works.
>
> **This isn't improvised.** Decode is built on a method I've taught for thirty years — Chris Argyris's work on how people argue, the stuff Peter Senge made famous in *The Fifth Discipline*. The short version: most arguments are people hurling conclusions at each other while hiding the facts and assumptions that got them there. The way out is to climb back down — find what you both can actually see, get genuinely curious about how the other person got where they got, and only then say your piece. Decode does that climb for you, every time. It just doesn't make you sit through the training.
>
> Pick a door:
>
> **Start one** — you want to open a conversation with someone who sees it differently.
> **Respond to one** — someone said the provocative thing, and you want a better answer than the one you'd fire back.
> **Back-and-forth** — you know the conversation's coming. Practice it here first.
>
> *One thing it doesn't do yet: remember. Each conversation starts fresh — it won't recall that you talked to your brother-in-law last week and ask how it went. That's coming. For now, it's a sharp first read, every time.*

---

### 18.10 Save / History & Persistence

**v1: no save. Clean slate every conversation.** No history stored. Rationale: (1) this pillar reads sensitive context (positions, dealbreakers, lineage, plus raw pasted family-conflict text) — "we keep none of it" is a far stronger, simpler promise than opt-in storage, with nothing to secure or breach; (2) not-saving keeps Conversations shippable on the current localStorage-only architecture, with no dependency on the deferred Supabase plan; (3) true **memory** (Bedrock recalling a prior conversation and asking how it went) is a deliberate **v2** feature with its own design — a thin "we log your chats" now doesn't get there and poisons the well for doing it right. The top-of-pillar copy already promises exactly this clean-slate behavior.

---

### 18.11 Neutrality Guardrails — Sign-off Register

All confirmed this session. Most are now structural (in the system prompt or enforced by the output format), not policy reminders.

1. Never helps the user win — no zingers/gotchas/point-scoring. *(prompt)*
2. Firm and generative — no caving, no escalating. *(prompt)*
3. Decode hedged as hypothesis; reflect-back makes misreads catchable. *(prompt + output format)*
4. Bait/abuse-resistant — won't produce the embarrassing partisan quote, won't break character. *(prompt)*
5. No hot takes / attack lines on real public figures — helps with the conversation about the figure, never supplies ammunition against them. *(prompt)*
6. Off-topic handled honestly, never as hall monitor. *(prompt)*
7. Layer 4 / dealbreakers used only for the user's benefit (warn about own triggers), never to shut down or defend a line. *(prompt — must be tested against dealbreaker-heavy cases)*
8. Hard demographics never used to infer views — walled off entirely. *(architectural)*
9. No raw model preamble/earnestness — enforced by fixed-slot output rendering. *(structural)*
10. "Show me examples" ships in balanced pairs only — structural nonpartisan guarantee. *(structural)*

---

### 18.12 Build Notes / Out of Scope for v1

- **No external data, no licensing, no APIs beyond the Claude API.** This is prompt design + a two-screen UI (mode picker → input+output). The hard part is the system prompt, not the plumbing.
- Model: **Claude Sonnet 4.6** + prompt caching (feasibility doc §5).
- **Deferred to v2:** cross-conversation memory; regenerate/reroll button; the "save history (opt-in)" pattern (superseded by clean-slate v1 + true-memory v2).
- The system prompt (18.8) is the piece most worth iterating on. Treat its *structure* as locked; expect wording tuning against real example inputs.


---

## 19. Recommendation Engine

**Location:** `src/lib/engine/match.ts`
**Type:** Pure function. No side effects, no external calls, no state. Profile in → ranked results out. Reads from a pre-built catalog.

### 19.1 The match key — everything the engine can know about a user

```typescript
interface MatchKey {
  // Tier 0 — required (Layer 1 only, ~40% complete)
  profile: DimensionalProfile        // 8 axes, 0–100
  axisWeights: AxisWeights           // from L1 importance picks + L3 intensity
  axisConfidence: AxisConfidence     // derived from lean strength / "it depends" answers

  // Tier 1 — optional (Layers 2 & 3, ~65–85% complete)
  issuePositions?: IssuePosition[]   // L2: 8 issue stances
  behaviorMods?: BehaviorModifiers   // L3: characterWeight, electabilityTolerance,
                                     //     downballotSalience, crossPartyTolerance

  // Tier 2 — optional (Layer 4, ~100% complete)
  dealbreakers?: ExclusionPredicate[]

  // Metadata
  completenessPercent: number        // 40 | 65 | 85 | 100
  edgeCaseFlag?: 'centered' | 'scattered' | 'near_pure' | null
}

type DimensionalProfile = Record<Dimension, number>  // 0–100 per axis
type AxisWeights = Record<Dimension, number>         // 1.0 default; flagged axes higher
type AxisConfidence = Record<Dimension, number>      // 0–1; near-50 answers → lower

type Dimension =
  'stability_change' | 'local_federal' | 'national_global' |
  'rules_outcomes' | 'markets_governance' | 'pragmatism_idealism' |
  'individual_collective' | 'trust_skepticism'
```

### 19.2 Candidate data model

```typescript
interface CandidateRecord {
  id: string
  name: string
  office: string
  officeType: 'ideological' | 'nonpartisan' | 'judicial'
  district: string                   // OCD-ID
  party?: string                     // display only, never used in matching
  axisPlacement: Partial<Record<Dimension, AxisPlacement>>
  dealbreakers: Record<number, DealbreakEval>  // key = L4 item number 1–29
  coverageTier: 'federal' | 'statewide' | 'state_legislative' |
                'local' | 'school_board'
  sourcedFrom: string[]
  lastUpdated: string                // ISO date
  independentMindedScore?: number    // 0–4; used in Beyond Your Ballot only
}

interface AxisPlacement {
  score: number        // 0–100, same polarity as user profile
  confidence: number   // 0–1
  rationale: string    // one-line source basis
  sources: string[]    // citation URLs
}

type DealbreakEval =
  | { status: 'clear' }
  | { status: 'crosses'; evidence: string; source: string }
  | { status: 'unknown'; note: string }
```

### 19.3 Media source data model

```typescript
interface MediaSource {
  id: string
  name: string
  kind: 'journalist' | 'substack' | 'podcast' | 'outlet' | 'newsletter' | 'youtube'
  formats: ('newsletter' | 'podcast' | 'long-form-writing' |
            'daily-news' | 'video' | 'social')[]
  url: string
  independent: boolean
  active: 'active' | 'dormant' | 'retired'
  axisPlacement: Partial<Record<Dimension, AxisPlacement>>
  coarseLean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'heterodox'
  reliability: number      // 0–100
  independence: number     // 0–100
  goodFaith: 'high' | 'mixed' | 'low'
  transparency: number     // 0–100
  dimensionCoverage: Partial<Record<Dimension, 'signature' | 'regular' | 'incidental'>>
  topics: string[]
  effort: 'light' | 'medium' | 'deep'
  flags: ('partisan_lean' | 'questionable_reliability')[]
  biasRatingSource: 'ad_fontes' | 'allsides' | 'mbfc' | 'bedrock_originated'
  externalRefs: Record<string, string>
  lastReviewed: string
  methodologyVersion: string
  attribution: string
}
```

### 19.4 Two-stage matching pipeline

**Stage 1 — Hard excludes (Layer 4 dealbreakers, run first, unconditional):**
- Any candidate where `dealbreakers[n].status === 'crosses'` is removed from the slate entirely. No partial credit. No discount.
- `dealbreakers[n].status === 'unknown'` does NOT exclude but caps the confidence band. Surfaced to the user as "we couldn't verify this dealbreaker for this candidate."
- A dealbreaker triggers exclusion if ANY of:
  1. A public documented statement by the candidate
  2. A recorded vote or official action in public office
  3. Credible reporting from two or more independent named journalists at high-reliability outlets — links surfaced as evidence
- Cannot verify → `unknown` status, cap confidence, surface to user.

**Stage 2 — Weighted dimensional distance over survivors:**

```
For candidate c and user u:
A = axes where axisPlacement[a] exists AND candidate confidence > 0

score(c) = Σ_{a∈A}  w_a · conf_cand_a · (1 − |u_a − c_a| / 100)
           ─────────────────────────────────────────────────────────
                       Σ_{a∈A}  w_a · conf_cand_a
```

Where:
- `w_a` = `axisWeights[a]` — user importance weight (default 1.0; L1-flagged axes 1.5; L3 intensity can push to 2.0)
- `conf_cand_a` = candidate confidence on axis `a`
- Missing axes are **NEVER** imputed to 50 — absence means absent from the computation.

**Rhetoric vs record weighting (decided):**
- When both exist: voting record 75% weight, stated position 25%.
- Challenger with rhetoric only: stated position 100% weight, axis confidence automatically capped at 0.5 regardless of the clarity of the statement. Honest acknowledgment that we can't know follow-through.

**Layer 2 issue positions:**
Bounded confidence boost only, applied after the distance score on races where a position is directly salient. Cannot overturn the dimensional ranking by more than a capped margin. Cannot move a `no_call` to `confident`. Can move `lean` to `confident` when 2+ positions corroborate.

### 19.5 Confidence bands

```typescript
type ConfidenceBand = 'confident' | 'lean' | 'informational' | 'no_call'
```

Derived from the minimum of three factors (the weakest factor caps the band):
1. **Coverage:** how many axes jointly scored, including user priority axes
2. **Unknown dealbreakers:** each unknown caps confidence further
3. **Separation:** the score gap between the top two candidates

Presentation:
- `confident`: "Based on your values, here's who we recommend and why."
- `lean`: "This leans toward X on what we can see, but it's a lighter call."
- `informational`: show candidates with data, no pick highlighted.
- `no_call`: "We don't have enough to say about this race. Here's how to research it yourself." Candidate names + research links.

### 19.6 Output per race

```typescript
interface RaceResult {
  raceId: string
  officeName: string
  officeType: 'ideological' | 'nonpartisan' | 'judicial'
  ranked: {
    candidate: CandidateRecord
    score: number
    confidence: ConfidenceBand
    topAlignedAxes: Dimension[]
    topDivergentAxes: Dimension[]
    explanation: string        // Claude-generated from axis rationale
    unknownDealbreakers: string[]
  }[]
  separation: number
  dataCompleteness: number
  attributionSources: string[]
}
```

### 19.7 Edge case routing

Centered and scattered profiles (`edgeCaseFlag` set) use dimension-weighted matching that leans only on axes scored away from 50. This is the **same code path** as the standard formula — not a special case — because `axisConfidence` is naturally lower near 50.

### 19.8 Media matching function

Lives in `src/lib/engine/mediaMatch.ts`. Simpler than candidate matching — no dealbreakers, no issue positions.

Inputs from the user profile (Layer 1 only):
- `dimension_scores[8]`
- `top_dimensions[≤3]` — defines `tension_on_held`
- `primary_type` + `secondary_types` — drives per-Mantle seed fallback
- `edge_case_flag`
- `completeness_pct`

Three computed values per source:
- `agreement(U,S)`: overall closeness on engaged axes
- `tension_on_held(U,S)`: distance on the user's top-3 held dimensions
- `novel_coverage(U,S)`: source `dimension_coverage` on dimensions the user's confirming set covers thinly

Tier assignment:
- **Confirming:** `agreement >= 0.65`, `tension_on_held <= 0.3`, `reliability >= 60`
- **Expanding:** `agreement >= 0.4`, `tension_on_held <= 0.4`, `novel_coverage >= 0.5`, `reliability >= 60`, not in confirming
- **Challenging:** `tension_on_held >= 0.6`, `reliability >= 75`, `good_faith === 'high'`, `independence >= 50`

Diversity pass within each tier: format mix, topic spread, multi-direction in challenging (not all from one direction).

Per-Mantle editorial seed fallback: if geometry produces a thin or lopsided tier for a user, fall back to a hand-picked seed list per Mantle type. Guarantees every user gets a credible diet on day one.

**Dealbreakers NEVER touch the media engine. Hard architectural wall.**

### 19.9 Beyond Your Ballot matching

Identical to the Your Ballot engine with two pre-filters on the candidate set:
1. **Geographic exclusion:** remove candidates where the district OCD-ID matches any of the user's own district OCD-IDs.
2. **Independent-minded governance gate:** `independentMindedScore >= 2`.

Dealbreakers run as **FLAGS not exclusions.** Yellow flag on the card with the specific item name. The user decides whether to act.

---

## 20. Classification Pipeline

**Purpose:** populate the candidate and media-source catalogs with 8-axis placements. Runs on ingestion, not on user request. Architecturally separate from the matching engine.

**Locations:**
- `src/lib/classification/classifySources.ts`
- `src/lib/classification/classifyCandidates.ts`
- `src/lib/classification/classifyArticle.ts` (Article Bias Checker)

### 20.1 Source classification — human gates entry

Admin reviews the suggestion queue and marks items `classify` or `reject` **before** Claude classification runs. Rejected items get a logged reason. Only approved items trigger the Claude API call.

Claude classification call for sources: analyzes 5–10 recent pieces fetched via URL. Returns a per-axis score (0–100), confidence per axis, rationale, and evidence citations (specific published pieces). A human reviews the output before anything goes live. A human can override any field.

### 20.2 Candidate classification — automatic ingestion

Every new filing from congress.gov or Open States triggers classification automatically. Human review happens **after** classification, not before ingestion.

Claude classification call for candidates: fetches the public record (voting history, floor speeches, committee positions, campaign platform, town hall transcripts). Applies rhetoric/record weighting (3:1 record over rhetoric when both exist). Returns the same structure as source classification plus dealbreaker evaluations per L4 item.

### 20.3 When Ad Fontes / AllSides APIs are live (v2)

External rating becomes the seed. The Claude prompt changes from "score this source from scratch" to "here are the Ad Fontes scores — map to Bedrock's 8-axis framework and fill the gaps Ad Fontes doesn't cover."

Priority order: external rating anchor → Claude translation/gap-fill → human review → user feedback signal.

Ratings conflict (external vs. existing Bedrock): surfaces automatically in the admin tool as a "ratings conflict — needs human review" flag. Never silently overwrites an existing classification.

### 20.4 Catalog entry schema additions (beyond `MediaSource` / `CandidateRecord`)

- `tagged_by: string`
- `reviewed_by: string`
- `source_evidence: string[]`    // links to specific pieces justifying scores
- `external_refs: Record<string, string>`  // allsides_id, ad_fontes_id, mbfc_id
- `last_reviewed: string`        // ISO date
- `methodology_version: string`
- `attribution: string`          // per-license attribution string for the UI footer
- `bedrock_originated: boolean`  // true when no external rating exists as an anchor


---

## 21. Admin Tool

**Route:** `/admin`
**Auth:** role flag on the user's Supabase record

### 21.1 Three roles

**Super Admin:**
- Everything Admin can do
- Promote any user to Admin, demote Admins to users
- View user list, search by email or name
- Delete accounts
- Override any classification or approval
- Change system-level settings (reliability thresholds, confidence-band parameters, governance-filter criteria)
- **CANNOT** see individual user quiz answers, dimensional profiles, or conversation history. The privacy wall is **STRUCTURAL not policy** — admin routes literally do not expose this data. This applies to Super Admin too. No exceptions.

**Admin:**
- Classify and approve sources and candidates
- Review and act on user feedback
- Trigger Perplexity verification (per entry and bulk)
- Trigger Claude re-analysis
- View the feedback reporting dashboard
- Process the suggestion queue (approve or reject user suggestions)
- **CANNOT** promote users or change system settings
- **CANNOT** see any user profile data

**User:** standard product access only.

### 21.2 User lookup (Super Admin only)

Search field by email or name. Returns: account creation date, quiz completion percentage (**not** answers, **not** scores, **not** any profile data), current role. Promote-to-Admin button. No further data exposed.

### 21.3 Review queue

- List of pending classifications awaiting approval
- Per-entry view:
  - Claude-generated axis scores with confidence levels
  - Evidence citations (links to specific published pieces)
  - Rationale per axis
  - Side-by-side comparison with external ratings where available (AllSides, Ad Fontes, MBFC) — pulled live via their APIs
  - Approve / Edit / Reject / Re-classify actions
  - Perplexity verify button: fires an API call (`PERPLEXITY_API_KEY`) asking current ownership, recent changes, reliability incidents, current URL validity. Response displays inline.
  - Last-verified date with a staleness indicator: yellow at 90 days, red at 180 days

### 21.4 Bulk operations

- **Bulk Perplexity verify:** all entries last verified > 90 days, runs as a queue with a progress indicator
- **Bulk re-classify:** selected entries, results go to the review queue (not live automatically)
- **Bulk export:** full catalog or filtered subset as CSV
- **Bulk approve:** multiple review-queue entries in one action

### 21.5 Disagreement flagging

When the classification pipeline runs twice with different prompts OR when two human raters score the same entry, auto-flag entries where outputs diverge more than 20 points on any axis. These go to a separate **reconciliation** queue, not the standard approval queue.

### 21.6 Audit log

Every approval, override, edit, and rejection is attributed with:
- The user who performed the action (name + role)
- Timestamp
- Field-level before/after values for every changed field
- Action type

The audit log is **append-only, never editable.**

### 21.7 API access to admin functions

An internal API layer on the admin functions so operations can be triggered programmatically. Example: a cron job that automatically flags stale entries (`last_reviewed > 180 days`) every Sunday night. All API calls require a Super Admin auth token.

### 21.8 Feedback reporting dashboard

- Thumbs-down rate per candidate / per source (sortable, highest first)
- Thumbs-down rate per race / per tier
- Free-text responses grouped by entity, full text, searchable
- Chip-frequency breakdown per entity
- Disagreement rate by Mantle type (surfaces matching problems per type)
- Auto-flag when thumbs-down rate exceeds the 30% threshold → appears in the review queue for re-classification

**"Analyze this" button per candidate/source:**
Fires a Claude API call with: the full feedback dataset for that entry + current axis placement + confidence band + source citations + external ratings. Claude returns:
- What the feedback pattern suggests
- Which specific axes are most likely wrong
- Recommended action (re-classify / lower confidence / flag / no action)
- A draft updated rationale if re-classification is warranted

A human reviews the analysis and decides whether to act. A re-classify button is available from the same screen.

**Weekly digest email:**
Sent to Super Admin via Resend (`RESEND_API_KEY_ADMIN`). Sends FROM `admin@bedrock.guide` (domain verified in Resend). Contains a Claude-generated paragraph summarizing:
- The top 5 most-disagreed-with recommendations from the prior week (both Ballot and Media Diet)
- Feedback patterns across the full catalog
- Recommended actions

Not raw numbers — an actionable summary requiring human judgment.

### 21.9 Pre-launch checklist (persistent banner in the admin dashboard)

- [ ] Run a bias check on all quiz questions (both passes: left critic, right critic) — extends to methodology copy, media-catalog Partisan Lean flag consistency, and Beyond Your Ballot governance-filter criteria
- [ ] Run a Partisan Lean flag consistency check across the media catalog (same threshold applied left and right)
- [ ] Run a bias check on all methodology and FAQ copy
- [ ] Run a bias check on the Beyond Your Ballot governance-filter criteria
- [ ] Confirm AllSides non-commercial eligibility in writing (email drafted, pending send to partnerships@allsides.com)
- [ ] Confirm Ad Fontes Data Platform pricing and access (email drafted, pending send to info@adfontesmedia.com)
- [ ] Initiate the Ballotpedia licensing conversation (email drafted, pending send to data@ballotpedia.org)
- [ ] Cookie banner legal review: **COMPLETE** — founder decision, no banner required (strictly necessary auth + cookieless Plausible). Document in the Privacy page.
- [ ] Scoring methodology published on the site Methodology page
- [ ] `pew-typology.ts` constants file built (Pew group attribution on all ten Mantle cards)
- [ ] Profile export working and tested
- [ ] Account deletion cascade verified (Supabase `on delete cascade`)
- [ ] Demographics opt-out toggle in account settings
- [ ] Anthropic API data-handling policy confirmed
- [ ] Pricing/donation model confirmed
- [ ] Open-source scoring code on GitHub, linked from the Methodology page
- [ ] Beyond Your Ballot static JSON populated before the pillar goes live
- [ ] **HARD BLOCKER — Run classification pipeline against all 60 sources in `src/data/media-catalog.csv` before launch.** The current fallback (`catalogAdapter.ts` `leanToAxisPlacement`) only populates 2–3 of the 8 dimensions per source based on a coarse left-right lean proxy, leaving axes like `stability_change`, `local_federal`, `national_global`, and `rules_outcomes` at zero confidence for every catalog source. This means Media Diet tier placements currently collapse toward a conventional left-right framing, which undermines the product's core differentiation (8-axis nuance beyond left-right). Real classification must run before this pillar reflects what Bedrock is actually for. Flagged Stage 9, 2026-06-30.

---

## 22. Your Ballot

### 22.1 V1 scope

- **Federal:** US Senate, US House — full coverage, all candidates
- **Statewide:** Governor, statewide executives — full coverage
- **State legislative:** all 50 states via Open States
- **OUT of v1:** local races, judicial elections, school board, ballot measures, propositions

**Under construction banner (prominent, top of page):**
> "Your Ballot covers federal and state races for the fall 2026 general election. Local races and ballot measures are coming — we're working through them now. The reason they're not here yet: data on local candidates is patchy and inconsistent across jurisdictions, and we'd rather show you nothing than show you something incomplete or unreliable. We'll tell you when they're ready."

### 22.2 Address resolution flow

1. User enters address
2. Google Civic `divisionByAddress` → list of OCD-IDs
3. For each OCD-ID: congress.gov (federal), FEC openFEC (finance), Open States v3 (state legislative)
4. Render a unified ballot with per-source attribution

### 22.3 Page states by quiz completion

**No quiz at all:**
Soft gate — show what Your Ballot does, a prominent quiz CTA, no address field. Not a hard block — the user can navigate away — but there is nothing to show without a profile. Generic ballots are not a feature. **Do NOT show the address field to users with no profile.**

**Layer 1 complete (~40%):**
Address field appears. Real but hedged recommendations. Completion nudge at the bottom of the results page (Option C). Persistent completion indicator in the page header (40%).

**Layers 2–4 complete:**
Full recommendations, highest confidence. Completion indicator shows 65%, 85%, or 100% depending on the layers completed.

### 22.4 Ballot display

All races in ballot order, top to bottom. Federal first, then statewide, then state legislative. Nothing hidden or collapsed by default. Confidence bands are **PRESENTATION** states, not **VISIBILITY** states — every race appears regardless of confidence.

**Non-ideological offices (judicial, nonpartisan):**
Show in the ballot UI with "judicial/nonpartisan race — values matching doesn't apply here." Surface endorsements and qualifications instead of dimensional alignment. `office_type` field on `CandidateRecord`: `ideological | nonpartisan | judicial`.

### 22.5 Candidate card (default visible state)

- Name and party (display only — party **NEVER** used in matching)
- Office sought
- Match indicator label: Strong match / Moderate match / Partial match / Insufficient data (**NOT** a number)
- Top 2–3 axes where the user and candidate align
- One-sentence Claude-generated match explanation
- Campaign website link (sourced from FEC)
- Donate link where available from FEC data
- Dealbreaker flag if any: yellow flag, specific item name
- "Learn more — full axis breakdown, campaign finance, sources" link

**Learn more expansion contains:**
- Full axis-by-axis breakdown with rationale per axis
- FEC campaign finance summary (total raised, top donors)
- Source attribution per axis (congress.gov / campaign platform / Vote Smart / etc.)
- Unknown dealbreaker flags with a "research this yourself" prompt and links

### 22.6 Feedback mechanism

Thumbs up / thumbs down on every card.
Thumbs down expands a short form:
- Free-text field ("Tell us why")
- Chips: "I know this candidate" / "Missing context" / "Wrong on a key issue" / "Data seems off"

Thumbs up logs a positive signal quietly. No UI change beyond the icon. No live profile updates from feedback in v1. All feedback feeds the admin reporting dashboard.

**Feedback data saved per submission:**
- `user_id`, `candidate_id`, `race_id`
- `confidence_band` at time of feedback
- `feedback_type`: `'thumbs_up' | 'thumbs_down'`
- `free_text` (if provided)
- `chips_selected: string[]`
- `user_mantle_type`
- `user_completion_percent`
- `timestamp`
- `app_version`
- `data_version` (which classification version produced this recommendation)

### 22.7 Printable ballot guide

Full ballot PDF — all races, not recommendations only. Server-side PDF generation. Branded Bedrock document with:
- User name
- Civic Mantle type and one-liner
- Complete ballot ordered top to bottom
- All four confidence states represented honestly
- Research links for `no_call` races

Infrastructure shared with Conversations print-to-PDF.

### 22.8 Candidate placement methodology

- Incumbents: voting record 75% weight, stated positions 25% weight.
- Challengers: stated positions 100% weight, confidence capped at 0.5.
- Generated by the Claude classification pipeline.
- Human reviewed before publish. A human can override.
- Methodology published on the site Methodology page. GitHub repo public for code inspection.

### 22.9 Demographic / lineage data interaction with scoring

Confirmed: does **NOT** enter the distance computation. Reason: demographic data is calibration context, not a values signal. Knowing someone is a "drifted-away moderate Democrat" helps interpret scores but should not change the matching math — that would reintroduce the partisan framing the product exists to avoid.

---

## 23. Beyond Your Ballot

### 23.1 Page intro copy

> "Congress runs on margins. The difference between a legislature that occasionally solves problems and one that never does is often a handful of seats — and right now, the list of members willing to cross the aisle for a pragmatic solution is vanishingly small. Beyond Your Ballot surfaces the races outside your district where that margin is actually at stake. You can't vote in these races. But you can pay attention, and you can help."

### 23.2 Two-part page structure

**Part 1 — On your ballot, worth extra support:**
In-district candidates who clear BOTH the values match AND the independent-minded governance filter. Block label:
> "On your ballot and worth your support — these candidates are in your district and meet the same independent-minded governance criteria as the races below. Your vote is the most powerful thing you can give them. Your support beyond that matters too."

**Part 2 — Beyond your ballot:**
Out-of-district federal candidates clearing both filters, matched to user values, ranked by dimensional distance.

Both parts: campaign site link, donate link where available from FEC. Thumbs up/down with the same feedback data model as Your Ballot (substituting `candidate_id`, adding `beyond_ballot_flag: boolean`).

### 23.3 Engine call

Identical to Your Ballot with two pre-filters applied to the candidate set **BEFORE** the engine runs:
1. **Geographic exclusion:** remove candidates where the district OCD-ID matches any of the user's own district OCD-IDs.
2. **Independent-minded governance gate:** `independentMindedScore >= 2`.

### 23.4 Dealbreakers: flags not exclusions

Yellow flag on the card with the specific item name. The user decides whether to act on it. Never excluded from results.

### 23.5 Independent-minded governance filter (4 criteria, must meet >= 2)

1. No party-line voting rate above 85% (incumbents with a record only)
2. History of co-sponsoring or supporting bipartisan legislation (incumbents with a record only)
3. Publicly committed to specific structural reforms — gerrymandering, campaign finance, filibuster reform — not vague unity language
4. Endorsed by a documented cross-partisan organization whose membership includes elected officials from both parties acting in a non-party capacity (for example, the Problem Solvers Caucus or Unite America) OR explicitly contested their own party's position on a major issue with a recorded vote or public statement

For challengers without a voting record: only criteria 3 and 4 apply. This filter is **editorial.** Criteria are published on the Methodology page so users can evaluate the judgment.

### 23.6 V1 data

Federal congressional races only. Static JSON file at `src/data/beyond-ballot-candidates.json`, populated manually from congress.gov and FEC data **before the pillar goes live.** The engine runs against this static set. The file must be populated as a pre-launch editorial task (in the §21 pre-launch checklist).


---

## 24. Your Media Diet

### 24.1 Page layout

- **Main column (70–80% width):** three-tier recommendations. Scrolls.
- **Right rail (20–30% width):** Article Bias Checker. Sticky/persistent as the user scrolls the main column. Visual distinction from the main column (subtle different background, thin border). Always visible, never buried. Not a popup or modal.

### 24.2 Three-tier model

- **Confirming — "deepen what you know":** `agreement >= 0.65`, `tension_on_held <= 0.3`, `reliability >= 60`
- **Expanding — "expand how you think":** `agreement >= 0.4`, `tension_on_held <= 0.4`, `novel_coverage >= 0.5`, `reliability >= 60`, not already in confirming
- **Challenging — "challenge you where it counts":** `tension_on_held >= 0.6`, `reliability >= 75`, `good_faith === 'high'`, `independence >= 50`

Each tier displays with:
- A tier header with a one-line explanation of what this tier does and why
- Source cards (~3–5 per tier to start)
- Thumbs up / thumbs down on every card

### 24.3 Source card

- Name and creator/host
- Format(s) — can be multiple
- One-line description
- Lean label (with `[P]` flag if Partisan Lean flagged)
- Thumbs up / thumbs down
- Link to source

### 24.4 Feedback data saved per submission

- `user_id`, `source_id`
- `tier` at time of feedback: `'confirming' | 'expanding' | 'challenging'`
- `feedback_type`: `'thumbs_up' | 'thumbs_down'`
- `free_text` (if thumbs down)
- `chips_selected: string[]` — Chips: "I already read this" / "Not my level" / "Don't trust this source" / "Good suggestion" / "Wrong fit for me"
- `dimension_coverage_tags` of source at time of feedback
- `user_mantle_type`
- `user_completion_percent`
- `timestamp`, `app_version`, `data_version`

### 24.5 Suggest a source button

Appears at the bottom of recommendations. The user nominates a source not in the catalog. Goes to the classification pipeline ingestion queue — the same flow as any new source addition. A human reviews before anything appears live.

### 24.6 Diversity pass within each tier

Enforce format mix (not all podcasts), topic spread, and in the challenging tier specifically: dissent must come from more than one direction (not all from one partisan direction). If the challenging tier is one-directional, that is a curation bug.

### 24.7 Per-Mantle editorial seed fallback

For each of the ten Mantle types, a hand-picked seed list per tier (minimum 3 per tier per Mantle). If geometry over the catalog produces thin or lopsided tiers, fall back to the seed list. Guarantees every user gets a credible diet on day one even with a small catalog.

### 24.8 Launch catalog

`src/data/media-catalog.csv` — 60 sources, manually curated, committed June 29. This is a v1 placeholder intended to be replaced by the Ad Fontes API feed (primary) once licensing is confirmed. AllSides CSV secondary if PBC non-commercial eligibility is confirmed. The catalog is a living document — add sources, remove on change, respond to suggestions and feedback.

Two catalog flags:
- `[P]` **Partisan Lean:** a clearly identifiable editorial direction. Does not mean unreliable. Disclosed so users know what they're reading.
- `[R]` **Questionable Reliability:** documented misinformation or insufficient critical framing. No sources currently carry this flag.

### 24.9 Independence definition (for the Methodology page and catalog decisions)

> "The editorial voice is not controlled by a corporate owner, political party, advertiser network, or institutional funder with a partisan agenda. The person or small team making editorial decisions answers primarily to their audience. Independent journalists still have to earn a living — subscriptions, advertising, private investors, foundation grants are all fine as long as they don't control what gets covered or how."

**Independence evaluation rule:**
> "We evaluate independence at the time of catalog entry and re-evaluate quarterly. A source that is currently independent but has explored a sale is included with a monitoring flag. A source that has accepted outside investment from a donor or organization with a clear partisan agenda is excluded regardless of current founder ownership, because the funding relationship creates a structural incentive that conflicts with editorial autonomy."

**Two documented examples (include in methodology):**
- **The Dispatch** explored a potential sale to Axel Springer but no sale occurred and editors make their own editorial decisions — **IN.**
- **Pod Save America** is majority founder-owned but has accepted investment from Soros Fund Management, which has a documented partisan agenda — **OUT.**

Same bar, applied consistently regardless of direction.

**Quarterly review cadence:**
- Full review of all `active` sources every quarter.
- Event-triggered re-review: ownership change, major reliability incident, funding change, editorial direction shift.
- Every change bumps `last_reviewed` and is attributed in the audit log.
- The Perplexity verify button in the admin tool is used for current-status checks.

---

## 24b. Article Bias Checker

**Location:** right rail of the Your Media Diet page (20–30% width, sticky). Also powered by `src/lib/classification/classifyArticle.ts`.

**Right rail header:** "Check any article."

### 24b.1 Input accepts

- URL (any publicly accessible page — fetched server-side)
- Pasted text (any length, no character limit)
- PDF upload (text extracted server-side; image-only PDFs flagged)

### 24b.2 Output (inline in the rail, three parts)

1. **Dimensional breakdown:** which of the 8 axes this article emphasizes and in which direction
2. **Profile read:** how it maps to the user's specific values profile — labeled as reinforcing / expanding / challenging FOR THIS USER specifically, not generically
3. **Reliability signal:** source rating if in the catalog; Claude-generated assessment if not

### 24b.3 Intelligent failure states

- **Paywalled URL:** "We can't access this article — it's behind a paywall. Paste the text instead and we'll analyze it." Input stays open for paste.
- **URL error or redirect:** "We couldn't reach that URL. Try pasting the text directly."
- **Image-only PDF:** "This PDF appears to be a scanned image rather than a text document. We can't extract text from it. Try copying and pasting the text manually."
- **Non-English content:** "This appears to be in [language]. Our analysis works best in English — we'll do our best but results may be less precise." Then proceeds.
- **Social media post (Twitter/X, Facebook, etc.):** proceed with analysis. Note the brevity caveat inline with results.
- **Non-civic content:** "This doesn't appear to be political or civic content. The Article Bias Checker works best on journalism, opinion pieces, and policy writing. Want to try a different article?"
- **Very short text (under ~200 words):** proceed with analysis. Note the precision caveat inline with results.

### 24b.4 Loading state

Substantive, not just a spinner. Show a sequence: "Reading the framing..." → "Mapping to your profile..." Makes the wait feel purposeful.

### 24b.5 Privacy

Article text is **NOT** stored. Analysis runs in the moment only. No logging of what articles users check.

### 24b.6 Cost

~$0.011–0.02 per check on Sonnet 4.6 with prompt caching on the user's values profile.

### 24b.7 Bold intro copy for the rail

> **Check any article.**
>
> Paste a link or drop in the text from anything you're reading — a news story, an opinion piece, a social media post. The Article Bias Checker tells you exactly what it's doing to your thinking: which of the eight civic dimensions it's emphasizing, whether it's reinforcing or challenging your specific profile, and where it sits on the reliability spectrum. Not left or right. Not a generic bias label. A specific read on this article for you, based on who you are.
>
> It's a different kind of media literacy tool. Most bias checkers tell you what an article is. This one tells you what it's doing to you.

---

## 25. Methodology Page

**Structure:** five accordion sections, one per pillar + quiz.
1. The Quiz and Your Civic Mantle
2. Your Ballot
3. Your Media Diet
4. Your Conversations
5. Beyond Your Ballot

Each section covers: how it works, data sources, scoring logic, editorial standards, bias controls, update cadence, Claude's role.

**Cross-links to FAQ:** every methodology section links to the relevant FAQ accordion. Every FAQ entry that touches methodology links back.

Scoring methodology primary documentation lives on this page. The GitHub repo is public for code inspection. The Methodology page links to the GitHub repo.

### 25.1 Claude's role — standard paragraph (calibrate per pillar)

**Your Ballot / Beyond Your Ballot version:**
> "When you enter your address, we fetch the candidates running in your district from congress.gov, the FEC, and your state's legislative database. For candidates we haven't seen before, we classify them in real time — reading their public record, voting history, and stated positions, then scoring them on the same eight dimensions as your values profile. This takes a moment on your first lookup; every subsequent user in the same district gets instant results from our cache. Incumbents with voting records get more confident placements. Challengers with only campaign platforms get real placements but lower confidence scores — we can't know yet if they'll follow through, and we say so."
>
> "The analysis is generated by Claude, Anthropic's AI. Claude reads the public record, scores each candidate on the eight dimensions, and drafts the explanation you see on each card. Humans review placements before they go live and can override Claude's scoring when the evidence warrants it. We also look at thumbs up and thumbs down feedback regularly — when users systematically disagree with a recommendation, that's a signal we take seriously and investigate. The AI does the analysis. Humans stay in the loop."

**Your Media Diet version:**
Same structure, substituting source scoring for candidate scoring. Add:
> "Once classified and approved by our editorial team, each source's placement in your recommendations reflects real analysis of their published work — not a simplified left-right label."
>
> "We also use Perplexity to verify current ownership and status of sources in the catalog — my knowledge has a cutoff date, and independent media changes ownership. Current-status verification is a systematic part of our quarterly review."

**Your Conversations version:**
> "Your Conversations is built on a framework developed by Chris Argyris and popularized by Peter Senge in The Fifth Discipline — the Ladder of Inference. Claude runs that method in real time. The system prompt and guardrails are human-designed and regularly reviewed. No human is in the loop per turn, but the framework Claude follows was built by humans and is auditable."

### 25.2 Conversations methodology — full paragraph

> "Your Conversations is built on a framework developed by Chris Argyris and popularized by Peter Senge in The Fifth Discipline — the Ladder of Inference. The idea is simple: most difficult conversations fail not because people disagree on facts but because each person is reasoning from a different set of assumptions they've never made explicit. The Ladder of Inference maps how we move from observable data to conclusions to actions, usually without noticing the steps we skipped. Bedrock uses this framework to help you see the reasoning behind someone else's position — and your own — before you respond. The goal isn't agreement. It's a real conversation instead of a performative one."

### 25.3 Beyond Your Ballot governance filter — methodology paragraph

> "Four criteria, must meet at least two: no party-line voting rate above 85% for incumbents; history of co-sponsoring bipartisan legislation; publicly committed to specific structural reforms (gerrymandering, campaign finance, filibuster reform — not vague unity language); endorsed by a documented cross-partisan organization whose membership includes elected officials from both parties acting in a non-party capacity (for example, the Problem Solvers Caucus or Unite America) or explicitly contested their own party's position with a recorded vote or statement. This filter is editorial. We define it, we apply it, we publish the criteria so you can evaluate our judgment."


---

## 26. FAQ Page

**Structure:** five accordion sections mirroring the Methodology page.

### 26.1 Conversations FAQ

**Q: What is Your Conversations?**
A: A Claude-powered chat interface that uses your values profile as persistent context. You describe a difficult civic conversation you need to have and Claude helps you prepare for it.

**Q: Does it tell me what to say?**
A: No. It helps you think. The output is clarity about where you stand, genuine curiosity about where the other person stands, and tools for a real conversation — not a script.

**Q: Does it use my values profile?**
A: Yes. Claude knows your dimensional profile before you say a word. You don't have to explain yourself from scratch every time.

**Q: Is this just a chatbot?**
A: No. It runs a decades-old method for difficult conversations — the Ladder of Inference, from Chris Argyris and Peter Senge's The Fifth Discipline — that helps you find what you and the other person actually agree on and understand how they got where they got. The AI runs that method. It doesn't improvise.

**Q: Does it save my conversations?**
A: No. Each session starts fresh. Your conversation history isn't stored. That's a deliberate choice — what you say while preparing for a difficult conversation is yours, not ours.

**Q: What kinds of conversations can it help with?**
A: Any civic disagreement across political difference. If it's a topic where you and someone else see things differently, Your Conversations can help you approach it more thoughtfully.

### 26.2 Your Ballot FAQ

**Q: How do you match me to candidates?**
A: Your dimensional profile, importance weights, and dealbreaker filters run against candidate profiles built from public positions, voting records, and stated platforms. Every recommendation includes a plain-English explanation of why each candidate matches or doesn't.

**Q: Who does the analysis?**
A: Claude, Anthropic's AI, reads the public record, scores each candidate on the eight dimensions, and drafts the explanation on each card. Humans review placements before they go live and can override Claude's scoring. We also look at thumbs up and thumbs down feedback regularly — systematic disagreement is a signal we investigate.

**Q: What's the difference between a confident recommendation and a lean?**
A: Confidence reflects how much data we have, not how good the match is. Confident means strong data on multiple axes with candidates clearly separated. Lean means the data is thinner or the race is closer. Both are real recommendations — honest about what we know.

**Q: What if a candidate crosses one of my dealbreakers?**
A: They're excluded from your recommendations entirely, regardless of how well they align on everything else. If we couldn't verify a dealbreaker, we flag it on the card so you can research it yourself.

**Q: What does "we couldn't verify this" mean?**
A: We found a dealbreaker you flagged but couldn't confirm it to our evidence standard — a public statement, recorded vote, or corroborated reporting from two independent journalists. We don't silently clear it. We tell you.

**Q: Why do some races say "not enough to say"?**
A: Because we'd rather tell you we don't have enough than guess. For thin races we show what we found and link you to resources for further research.

**Q: Can I print my ballot guide?**
A: Yes. Once your recommendations are generated you can download a formatted PDF guide to take to the polls. It includes every race — confident recommendations, leaning calls, informational notes, and no-call races with research links.

**Q: Does Bedrock tell me who to vote for?**
A: No. We show you how candidates align with your values and explain why. The vote is yours. Always.

**Q: What if I disagree with a recommendation?**
A: Tell us. There's a thumbs down on every card. Your feedback goes into a review queue — we look at it regularly and use it to improve both the data and our methodology.

**Q: Why aren't local races here yet?**
A: Data on local candidates is patchy and inconsistent across jurisdictions. We'd rather show you nothing than show you something incomplete or unreliable. Local races and ballot measures are coming for the fall general election.

**Q: What about ballot measures and propositions?**
A: Coming. Not in v1 for the same reason as local races. We'll tell you when they're ready.

### 26.3 Your Media Diet FAQ

**Q: How do you recommend sources?**
A: We match your eight-dimension values profile against a curated catalog of independent journalists, Substacks, and podcasts. Each source is scored on the same eight axes as your quiz. The match determines which of three tiers a source lands in for you specifically.

**Q: What are the three tiers?**
A: Confirming sources deepen what you already think. Expanding sources cover ground your current diet misses. Challenging sources make the best honest case against your strongest views. The third tier is the most important one.

**Q: Why three tiers? Why not just sources that match my views?**
A: Because a media diet that only confirms what you already believe makes you a worse citizen, not a better one. We think that's worth building into the product rather than leaving to chance.

**Q: What does "independent" mean?**
A: The editorial voice is not controlled by a corporate owner, political party, advertiser network, or institutional funder with a partisan agenda. Independent journalists still have to earn a living — subscriptions, advertising, private investors, foundation grants are all fine as long as they don't control what gets covered or how. A journalist with a Substack and ten thousand paying subscribers answers to those subscribers. A journalist working for a network owned by a Fortune 500 conglomerate answers to a board of directors. That's the difference that matters. CNN is not independent. A journalist who left CNN to run their own Substack is.

**Q: Why isn't [major outlet] in the catalog?**
A: If it's owned by a large media corporation it doesn't meet our independence definition. We cover independently owned and editorially autonomous sources only.

**Q: Some sources have a Partisan Lean flag. Does that mean they're biased?**
A: It means their editorial direction is clearly identifiable. Partisan lean doesn't mean unreliable. We flag it so you know what you're reading, not to discourage you from reading it.

**Q: How do you score sources for bias and quality?**
A: Claude analyzes each source's body of work using a structured rubric tied to the eight civic dimensions. Every placement includes evidence citations — specific published pieces that justify the scores. Human editors review every placement before it goes live and can override Claude's scoring. We cross-reference against AllSides and Ad Fontes Media ratings where available. We also use Perplexity to verify current ownership and status — independent media changes, and we want our catalog to reflect current reality.

**Q: How often is the catalog updated?**
A: Full review quarterly. Ownership changes, editorial direction shifts, and documented reliability incidents trigger an immediate re-review. Every entry has a last-verified date.

**Q: Is the catalog a living document?**
A: Yes. We add sources, remove them when things change, and take your suggestions seriously. Thumbs up and thumbs down on any recommendation goes directly into our review process.

**Q: Can I suggest a source?**
A: Yes — there's a suggestion button in your media recommendations. Suggestions go into a review queue, not the live catalog. Every suggestion goes through the same scoring process before it appears.

**Q: What's the Article Bias Checker?**
A: Paste any URL or article text and we'll tell you what it's doing to your thinking — not just left or right, but which of the eight dimensions it's emphasizing, and how that maps specifically to your values profile. It accepts URLs, pasted text, and PDFs.

**Q: Does the Article Bias Checker store what I paste?**
A: No. Article text is analyzed in the moment and not stored.

**Q: Do you use my dealbreakers to filter my media recommendations?**
A: No. Dealbreakers are ballot exclusion rules. Importing them into your media diet would create an echo chamber — the exact failure mode this pillar exists to fight.

### 26.4 Beyond Your Ballot FAQ

**Q: What is Beyond Your Ballot?**
A: Federal candidates outside your district whose presence in Congress would shift the balance toward independent-minded governance. You can't vote for them. But you can pay attention and you can help.

**Q: Why should I care about races I can't vote in?**
A: Because Congress is a team sport. The balance of power isn't decided by your representative alone — it's decided by 435 House members and 100 senators. The list of members willing to cross the aisle for a pragmatic solution is vanishingly small right now. These are the races where that changes.

**Q: How do you decide which candidates appear here?**
A: Two filters. First, your values match — same engine as Your Ballot. Second, an independent-minded governance filter: candidates must meet at least two of four criteria indicating they'd govern across partisan lines. The criteria are published in our methodology.

**Q: What can I actually do?**
A: Pay attention to these races. Share them. Donate if you're moved to. Every candidate card includes a link to their campaign site and where available a direct donation link.

**Q: What about dealbreakers?**
A: They show up as flags, not exclusions. Because you're not voting for these candidates, we don't remove them from your results if they cross one of your lines — we flag it clearly on their card and let you decide.

**Q: Why only federal races?**
A: Because the independent-minded governance argument is strongest at the federal level, where the margin between a functional and dysfunctional Congress is measured in individual seats.

**Q: How often is this updated?**
A: The candidate set is updated as federal races develop and filing deadlines pass. We flag significant updates when they happen.

---

## 27. Privacy Page Additions

### 27.1 Cookie section (add to the existing Privacy page)

> "Bedrock uses two cookies. One is a strictly necessary authentication cookie that keeps you signed in — without it the product doesn't work. The other is Plausible Analytics, which is cookieless by design and collects no personal data. We don't use advertising cookies, tracking cookies, or any third-party cookies. If you have questions about our cookie practices, email hello@bedrock.guide."

No consent banner required. Reason: strictly necessary auth cookies are exempt under GDPR and CCPA; Plausible is cookieless and collects no personal data. Founder decision, documented here.

### 27.2 Profile export section (add to the existing Privacy page)

Users can download their complete profile as a plain-text `.txt` file from the My Profile page. The export includes:
- Civic Mantle type and one-liner
- All eight dimensional scores with labels and pole descriptions
- Secondary type(s) if any
- Layer 2 issue positions (if completed)
- Layer 3 priority intensity and behavioral modifiers (if completed)
- Layer 4 dealbreaker selections (if completed)
- Demographic module responses (if completed)
- Quiz completion percentage and last updated date
- Footer: "This is your complete Bedrock values profile, exported on [date]. Bedrock does not retain a copy of this export."

Does **NOT** include: conversation history (not stored), feedback submitted on candidates or sources (product data, not profile data).


---

## 28. First-Time User Onboarding Tour

A 6-slide modal carousel shown automatically to first-time visitors. Designed to orient new users to the platform before they interact with any feature.

### 28.1 Trigger and Persistence

- **Trigger:** Auto-launches on first visit to the homepage
- **Detection:** localStorage key `bedrock_tour_seen` — checked on mount; if absent, tour launches; set to `true` on dismiss or completion
- **Scope:** First-time visitors only; never shown again after dismissal or completion

### 28.2 Navigation and Interaction

- **Desktop:** Left/right arrow buttons + keyboard arrow keys
- **Mobile:** Swipe left/right (touch gestures); smaller arrows at bottom of card
- **Dot indicators:** Show current position (e.g. 1 of 6) below navigation arrows
- **Dismiss:** X always visible top-right on every slide
- **Outside click:** Does NOT dismiss — too easy to trigger accidentally on mobile
- **Final slide CTA:** "Lets go" replaces "Next" to signal completion

### 28.3 Visual Design

- Semi-transparent dark backdrop (homepage faintly visible behind)
- Matches Bedrock dark-mode aesthetic — Libre Baskerville for headings, color tokens from tokens.css
- Framer Motion for slide transitions
- Slide 2 question card styled to look like a real (static, non-interactive) quiz card

### 28.4 Slide Content

**Slide 1 — Mission**
- Headline: You are not red. You are not blue.
- Subhead: You are more complicated than that — and so is your vote.
- Body: Bedrock is a civic identity platform for independent-minded voters. One values quiz. Four tools to help you understand what you actually believe, vote it, read it, talk about it, and fund it.

**Slide 2 — The Quiz**
- Headline: It starts with how you think — not where you stand.
- Subhead: Most civic tools ask about issues. We ask about values.
- Illustrative (non-interactive) question card showing Dimension 5 (Markets vs. Governance):
  - Question: When government and markets point in different directions, your instinct is to:
  - Option A: Let markets work — intervention usually makes things worse
  - Option B: Intervene when the stakes are high enough — markets have blind spots
  - Option C: Depends on the domain — I don't apply one rule everywhere
- Body: 20 questions. About 12 minutes. No wrong answers — only honest ones.
- Transition line (large font, below card): Then your identity map drives four civic actions.
- Quiz card styled as clearly illustrative — muted answer options, Example question label, cursor:default enforced visually

**Slide 3 — Action 1: Your Ballot**
- Label: Action 1
- Headline: Your Ballot
- Subhead: Every race. Matched to your values.
- Body: Personalized ballot recommendations from president to school board — including the downballot races that shape your daily life and are hardest to research on your own. Candidate data is actively maintained and growing — coverage expands as we approach each election.

**Slide 4 — Action 2: Beyond Your Ballot**
- Label: Action 2
- Headline: Beyond Your Ballot
- Subhead: Your values, applied beyond your district.
- Body: Find candidates outside your own district who match your values and are running in races where your support could actually shift the balance of power. Donate. Get involved. Think nationally.

**Slide 5 — Action 3: Your Media Diet**
- Label: Action 3
- Headline: Your Media Diet
- Subhead: Independent journalism, matched to how you think.
- Body: Not an echo chamber. Not a fire hose. A curated shortlist of journalists, Substacks, and podcasts — in three tiers: what confirms your thinking, what expands it, and what challenges it. Every source bias-checked against our eight-dimension framework. Plus the Article Bias Checker — paste any link or text and see exactly what it is doing to your thinking, mapped to your specific profile.

**Slide 6 — Action 4: Your Conversations**
- Label: Action 4
- Headline: Your Conversations
- Subhead: Talk across difference without losing your mind.
- Body: A Claude-powered tool for preparing and navigating hard civic conversations — with family, colleagues, anyone. Uses your actual profile as context. Not a debate coach. A thinking partner.

### 28.5 Design Notes

- Action slides (3-6) use parallel structure intentionally — rhythm helps them scan fast on mobile
- Action label (Action 1 through Action 4) appears as eyebrow/pill above each headline — no Pillar language used anywhere
- Slide 2 uses Dimension 5 (Markets vs. Governance) — most accessible of the eight, not partisan, all three options genuinely defensible
- Quiz card on slide 2 is clearly illustrative — not interactive; styled with muted options, Example question label, cursor:default
- Tour is informational only — no interactions, no quiz answers captured
