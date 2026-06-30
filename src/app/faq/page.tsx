'use client'

import { useState } from 'react'
import Link from 'next/link'

function FAQItem({ q, a }: { q: string; a: string | React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-5) 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}
      >
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', fontSize: 'var(--text-body)', lineHeight: 'var(--leading-normal)' }}>{q}</span>
        <span style={{ color: 'var(--color-gold)', fontSize: 'var(--text-h4)', flexShrink: 0, lineHeight: 1 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', paddingBottom: 'var(--space-5)' }}>
          {typeof a === 'string' ? <p style={{ margin: 0 }}>{a}</p> : a}
        </div>
      )}
    </div>
  )
}

function SectionAccordion({ id, title, methodologyAnchor, children }: { id: string; title: string; methodologyAnchor: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div id={id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-5) var(--space-6)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-h4)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', textAlign: 'left' }}
      >
        {title}
        <span aria-hidden="true" style={{ display: 'inline-block', color: 'var(--color-text-muted)', fontSize: '20px', lineHeight: 1, transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>›</span>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '0 var(--space-6) var(--space-3)' }}>
          {children}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', padding: 'var(--space-4) 0 var(--space-3)' }}>
            <Link href={`/methodology#${methodologyAnchor}`} style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
              How this works — full methodology →
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-16) var(--space-6)' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>FAQ</p>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-tight)' }}>
        Questions.
      </h1>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-12)' }}>
        If yours isn&apos;t here, <a href="mailto:hello@bedrock.guide" style={{ color: 'var(--color-blue-accent)' }}>hello@bedrock.guide</a>. A human reads it.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* ── General ──────────────────────────────────────────────────────── */}
        <SectionAccordion id="faq-general" title="General" methodologyAnchor="quiz">
          <FAQItem q="Is Bedrock liberal or conservative?" a="Neither. That's the whole point. Bedrock doesn't have a political position — it has a methodology. The eight dimensions were designed so that both poles have defensible, honorable positions. We've run the 'partisan smell test' on every question: if either side feels obviously right or wrong, we rewrote it. Read the full methodology to see how we checked our work." />
          <FAQItem q="How do you make sure the questions aren't biased?" a="Two ways. First, structurally: answer order is randomized for every user, scoring keys to an option's content rather than its position, and the Layer 4 dealbreakers are paired left and right. Second, by review: before launch, every question, answer option, micro-reaction, and historical aside was checked item by item from two directions at once — what a sharp critic on the left would object to, and what a sharp critic on the right would object to. An item only passed if it survived both, with a real home for every honest position and no 'fun fact' that quietly takes a side. We don't claim it's perfect — bias-checking is ongoing, there's a feedback button on every question, and when we get one wrong we fix it and say so. The full method is in our Methodology." />
          <FAQItem q="Who built this and why?" a="Matt Blumberg — technology entrepreneur, registered independent, frustrated with the political options available to voters who don't fit neatly in either party. No political backers, no institutional agenda. A person who got frustrated enough to build something. Read the full story on the About page." />
          <FAQItem q="Who funds Bedrock?" a="Right now: Matt personally. No political parties, PACs, political donors, advertising, or any organization with a stake in where you land will ever fund this. If and when the platform grows, the plan is small user donations and nonpartisan civic foundation grants — with full financial transparency." />
          <FAQItem q="How is Bedrock different from other political quizzes?" a="Most civic quizzes put you on a single left-right spectrum and call it a day. Bedrock maps you across eight independent dimensions of civic identity — real tensions that every thoughtful voter navigates. The result isn't a party label or a left-right score. It's a multidimensional profile. We also let you say 'it depends' and actually follow up on that — because for independent-minded voters, 'it depends' is often the honest answer." />
          <FAQItem q="What is a civic type?" a="Your civic type is a named summary of your eight-dimensional profile — one of ten types that captures where you tend to cluster across the dimensions. Think of it like a personality type, but for your political identity. It's a shortcut for communication, not a box. Your full constellation (the radar chart) is more precise. The type is just the plain-English version." />
          <FAQItem q="Do I have to create an account?" a="No — you can take the quiz and see your results without an account. But to save your civic profile and results, access Your Ballot, Your Media Diet, and Your Conversations, you'll need to create one. It's free. You can sign up with an email and password, a magic link (no password needed), or Google. If you're privacy-conscious about Google Sign-In, email is just as easy — we don't treat you differently either way." />
          <FAQItem q="What do you do with my quiz answers?" a="Use them to power your experience — Your Ballot, Your Media Diet, Your Conversations. That's it. We never sell your data, share your profile with political organizations, or use it for advertising. The full privacy policy is on the Privacy & Data page." />
          <FAQItem q="Can I update my profile over time?" a="Yes. You can retake individual layers, update specific answers, or restart entirely. Your profile should evolve as you do. The platform is designed to grow with you, not pin you to a moment in time." />
          <FAQItem q="What if I genuinely don't know where I stand on something?" a="That's a legitimate answer, and the quiz handles it. You can skip questions you're genuinely uncertain about, and they're treated differently in scoring than questions where you answered confidently. Forced answers are worse than honest abstentions." />
          <FAQItem q="Is Bedrock available outside the US?" a="The current version is US-focused — the ballot guide requires US races and the framework is built around American civic tensions. International versions are possible long-term, but not in the current roadmap." />
          <FAQItem q="How do I contact you?" a="hello@bedrock.guide. A human reads it." />
        </SectionAccordion>

        {/* ── §26.1 Your Conversations ──────────────────────────────────────── */}
        <SectionAccordion id="faq-conversations" title="Your Conversations" methodologyAnchor="conversations">
          <FAQItem q="What is Your Conversations?" a="A Claude-powered chat interface that uses your values profile as persistent context. You describe a difficult civic conversation you need to have and Claude helps you prepare for it." />
          <FAQItem q="Does it tell me what to say?" a="No. It helps you think. The output is clarity about where you stand, genuine curiosity about where the other person stands, and tools for a real conversation — not a script." />
          <FAQItem q="Does it use my values profile?" a="Yes. Claude knows your dimensional profile before you say a word. You don't have to explain yourself from scratch every time." />
          <FAQItem q="Is this just a chatbot?" a="No. It runs a decades-old method for difficult conversations — the Ladder of Inference, from Chris Argyris and Peter Senge's The Fifth Discipline — that helps you find what you and the other person actually agree on and understand how they got where they got. The AI runs that method. It doesn't improvise." />
          <FAQItem q="Does it save my conversations?" a="No. Each session starts fresh. Your conversation history isn't stored. That's a deliberate choice — what you say while preparing for a difficult conversation is yours, not ours." />
          <FAQItem q="What kinds of conversations can it help with?" a="Any civic disagreement across political difference. If it's a topic where you and someone else see things differently, Your Conversations can help you approach it more thoughtfully." />
          <FAQItem q="How does 'Back-and-forth' practice work?" a="Back-and-forth is an experimental mode where Claude plays the other person in your practice conversation — a real human being who holds those views, not a caricature or a pushover. You get the actual back-and-forth experience: real responses, real pushback, real practice. It's marked Beta because it's newer and more complex than the Openers and Responses modes — it works best when you come in with a clear setup and realistic expectations." />
          <FAQItem q="What guardrails are in place for Back-and-forth?" a="Several. Claude plays the other person charitably — a reasonable version of them, not the worst-faith caricature. It won't make personal attacks, won't use conspiracy theories or fabricated facts, and will redirect if the conversation drifts into unproductive territory. It won't help you 'win' the practice — the goal is a real conversation, not a debate victory. If anything feels off, end the session with the 'End practice' button and let us know at hello@bedrock.guide." />
          <FAQItem q="Can the Back-and-forth session end on its own?" a="Yes — and sometimes it should. Claude will close the session when the conversation reaches a natural landing (a moment of genuine connection or a good stopping point), when it senses diminishing returns (you're going in circles, the practice has peaked), or after roughly ten exchanges. When it closes, it steps briefly out of character with a coach's note — one specific observation about what worked or what to try differently. You can also end the session anytime with the 'End practice' button." />
        </SectionAccordion>

        {/* ── §26.2 Your Ballot ─────────────────────────────────────────────── */}
        <SectionAccordion id="faq-ballot" title="Your Ballot" methodologyAnchor="ballot">
          <FAQItem q="How do you match me to candidates?" a="Your dimensional profile, importance weights, and dealbreaker filters run against candidate profiles built from public positions, voting records, and stated platforms. Every recommendation includes a plain-English explanation of why each candidate matches or doesn't." />
          <FAQItem q="Who does the analysis?" a="Claude, Anthropic's AI, reads the public record, scores each candidate on the eight dimensions, and drafts the explanation on each card. Humans review placements before they go live and can override Claude's scoring. We also look at thumbs up and thumbs down feedback regularly — systematic disagreement is a signal we investigate." />
          <FAQItem q="What's the difference between a confident recommendation and a lean?" a="Confidence reflects how much data we have, not how good the match is. Confident means strong data on multiple axes with candidates clearly separated. Lean means the data is thinner or the race is closer. Both are real recommendations — honest about what we know." />
          <FAQItem q="What if a candidate crosses one of my dealbreakers?" a="They're excluded from your recommendations entirely, regardless of how well they align on everything else. If we couldn't verify a dealbreaker, we flag it on the card so you can research it yourself." />
          <FAQItem q="What does 'we couldn't verify this' mean?" a="We found a dealbreaker you flagged but couldn't confirm it to our evidence standard — a public statement, recorded vote, or corroborated reporting from two independent journalists. We don't silently clear it. We tell you." />
          <FAQItem q="Why do some races say 'not enough to say'?" a="Because we'd rather tell you we don't have enough than guess. For thin races we show what we found and link you to resources for further research." />
          <FAQItem q="Can I print my ballot guide?" a="Yes. Once your recommendations are generated you can download a formatted PDF guide to take to the polls. It includes every race — confident recommendations, leaning calls, informational notes, and no-call races with research links." />
          <FAQItem q="Does Bedrock tell me who to vote for?" a="No. We show you how candidates align with your values and explain why. The vote is yours. Always." />
          <FAQItem q="What if I disagree with a recommendation?" a="Tell us. There's a thumbs down on every card. Your feedback goes into a review queue — we look at it regularly and use it to improve both the data and our methodology." />
          <FAQItem q="Why aren't local races here yet?" a="Data on local candidates is patchy and inconsistent across jurisdictions. We'd rather show you nothing than show you something incomplete or unreliable. Local races and ballot measures are coming for the fall general election." />
          <FAQItem q="What about ballot measures and propositions?" a="Coming. Not in v1 for the same reason as local races. We'll tell you when they're ready." />
        </SectionAccordion>

        {/* ── §26.3 Your Media Diet ─────────────────────────────────────────── */}
        <SectionAccordion id="faq-media-diet" title="Your Media Diet" methodologyAnchor="media-diet">
          <FAQItem q="How do you recommend sources?" a="We match your eight-dimension values profile against a curated catalog of independent journalists, Substacks, and podcasts. Each source is scored on the same eight axes as your quiz. The match determines which of three tiers a source lands in for you specifically." />
          <FAQItem q="What are the three tiers?" a="Confirming sources deepen what you already think. Expanding sources cover ground your current diet misses. Challenging sources make the best honest case against your strongest views. The third tier is the most important one." />
          <FAQItem q="Why three tiers? Why not just sources that match my views?" a="Because a media diet that only confirms what you already believe makes you a worse citizen, not a better one. We think that's worth building into the product rather than leaving to chance." />
          <FAQItem
            q="What does 'independent' mean?"
            a="The editorial voice is not controlled by a corporate owner, political party, advertiser network, or institutional funder with a partisan agenda. Independent journalists still have to earn a living — subscriptions, advertising, private investors, foundation grants are all fine as long as they don't control what gets covered or how. A journalist with a Substack and ten thousand paying subscribers answers to those subscribers. A journalist working for a network owned by a Fortune 500 conglomerate answers to a board of directors. That's the difference that matters. CNN is not independent. A journalist who left CNN to run their own Substack is."
          />
          <FAQItem q="Why isn't [major outlet] in the catalog?" a="If it's owned by a large media corporation it doesn't meet our independence definition. We cover independently owned and editorially autonomous sources only." />
          <FAQItem q="Some sources have a Partisan Lean flag. Does that mean they're biased?" a="It means their editorial direction is clearly identifiable. Partisan lean doesn't mean unreliable. We flag it so you know what you're reading, not to discourage you from reading it." />
          <FAQItem q="How do you score sources for bias and quality?" a="Claude analyzes each source's body of work using a structured rubric tied to the eight civic dimensions. Every placement includes evidence citations — specific published pieces that justify the scores. Human editors review every placement before it goes live and can override Claude's scoring. We cross-reference against AllSides and Ad Fontes Media ratings where available. We also use Perplexity to verify current ownership and status — independent media changes, and we want our catalog to reflect current reality." />
          <FAQItem q="How often is the catalog updated?" a="Full review quarterly. Ownership changes, editorial direction shifts, and documented reliability incidents trigger an immediate re-review. Every entry has a last-verified date." />
          <FAQItem q="Is the catalog a living document?" a="Yes. We add sources, remove them when things change, and take your suggestions seriously. Thumbs up and thumbs down on any recommendation goes directly into our review process." />
          <FAQItem q="Can I suggest a source?" a="Yes — there's a suggestion button in your media recommendations. Suggestions go into a review queue, not the live catalog. Every suggestion goes through the same scoring process before it appears." />
          <FAQItem q="What's the Article Bias Checker?" a="Paste any URL or article text and we'll tell you what it's doing to your thinking — not just left or right, but which of the eight dimensions it's emphasizing, and how that maps specifically to your values profile. It accepts URLs, pasted text, and PDFs." />
          <FAQItem q="Does the Article Bias Checker store what I paste?" a="No. Article text is analyzed in the moment and not stored." />
          <FAQItem q="Do you use my dealbreakers to filter my media recommendations?" a="No. Dealbreakers are ballot exclusion rules. Importing them into your media diet would create an echo chamber — the exact failure mode this pillar exists to fight." />
        </SectionAccordion>

        {/* ── §26.4 Beyond Your Ballot ──────────────────────────────────────── */}
        <SectionAccordion id="faq-beyond-ballot" title="Beyond Your Ballot" methodologyAnchor="beyond-ballot">
          <FAQItem q="What is Beyond Your Ballot?" a="Federal candidates outside your district whose presence in Congress would shift the balance toward independent-minded governance. You can't vote for them. But you can pay attention and you can help." />
          <FAQItem q="Why should I care about races I can't vote in?" a="Because Congress is a team sport. The balance of power isn't decided by your representative alone — it's decided by 435 House members and 100 senators. The list of members willing to cross the aisle for a pragmatic solution is vanishingly small right now. These are the races where that changes." />
          <FAQItem q="How do you decide which candidates appear here?" a="Two filters. First, your values match — same engine as Your Ballot. Second, an independent-minded governance filter: candidates must meet at least two of four criteria indicating they'd govern across partisan lines. The criteria are published in our methodology." />
          <FAQItem q="What can I actually do?" a="Pay attention to these races. Share them. Donate if you're moved to. Every candidate card includes a link to their campaign site and where available a direct donation link." />
          <FAQItem q="What about dealbreakers?" a="They show up as flags, not exclusions. Because you're not voting for these candidates, we don't remove them from your results if they cross one of your lines — we flag it clearly on their card and let you decide." />
          <FAQItem q="Why only federal races?" a="Because the independent-minded governance argument is strongest at the federal level, where the margin between a functional and dysfunctional Congress is measured in individual seats." />
          <FAQItem q="How often is this updated?" a="The candidate set is updated as federal races develop and filing deadlines pass. We flag significant updates when they happen." />
        </SectionAccordion>

      </div>
    </div>
  )
}
