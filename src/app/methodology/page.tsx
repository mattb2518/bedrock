'use client'

import { useState } from 'react'
import Link from 'next/link'
import PewTypologyGrid from '@/components/methodology/PewTypologyGrid'
import { PEW_REPORT_URL } from '@/lib/quiz/pew-typology'

// ── Dimension data for the quiz section ──────────────────────────────────────

const dimensions = [
  { label: 'Stability ↔ Change', shortLabel: 'Steady vs. Bold', desc: "How much should existing systems, institutions, and norms change — and how fast? This isn't about being timid or reckless. It's about whether you trust gradual improvement more than structural transformation, or vice versa.", example: 'The federal tax code runs to tens of thousands of pages, and almost no one defends its complexity. Do you reform it from within — close loopholes, simplify the brackets, tighten oversight — or does the structure itself need to be scrapped and rebuilt from scratch?' },
  { label: 'Local ↔ Federal', shortLabel: 'Close to Home vs. Bigger Stage', desc: 'When a problem needs solving, where should the decision-making power live — closest to the people affected, or at the scale needed to make it stick? Local control can mean responsiveness and accountability. Federal power can mean consistency and reach.', example: 'Should school curriculum be set by local school boards who know their communities, or by national standards that ensure every child gets the same foundation regardless of zip code?' },
  { label: 'National ↔ Global', shortLabel: 'Home First vs. Bigger Picture', desc: "When American interests and global cooperation pull in different directions, which wins — and how often? It's not isolationism vs. globalism. It's about where you draw the circle of concern, and why.", example: 'If a trade agreement would create jobs abroad and lower prices for American consumers, but cost American manufacturing jobs — is that a win, a loss, or something more complicated?' },
  { label: 'Rules ↔ Outcomes', shortLabel: 'Fair Process vs. Fair Result', desc: 'If a process is fair but produces unequal outcomes, is that acceptable? If an outcome seems just but the process was messy, does that matter? This is one of the deepest tensions in democratic life.', example: 'A judge follows sentencing guidelines precisely and gives two people identical sentences for the same crime. One grew up with resources and opportunity, the other didn\'t. Is that justice?' },
  { label: 'Markets ↔ Governance', shortLabel: 'Let It Compete vs. Set the Rules', desc: "When something important is broken — housing, healthcare, education, the environment — is the better lever competition and private incentives, or regulation and public investment? This isn't capitalism vs. socialism. It's a practical question about which tools work better, and when.", example: 'Prescription drug prices are high. Do you want more competition between pharmaceutical companies to drive prices down, or a government body that negotiates or sets prices directly?' },
  { label: 'Pragmatism ↔ Idealism', shortLabel: "What Works vs. What's Right", desc: "Are your positions anchored to a vision of what should be — a principle you won't compromise — or are they constantly negotiated against what's actually achievable? Neither is naive. Both are honorable.", example: "A bipartisan immigration bill would meaningfully reduce illegal crossings and create a path to legal status for long-term residents — but it requires compromises that neither side loves. Do you support passing it?" },
  { label: 'Individual ↔ Collective', shortLabel: 'Personal vs. Shared Responsibility', desc: "Where does responsibility primarily live — with the individual, or with the community? This isn't about laziness vs. generosity, or freedom vs. control. It's about how you understand the relationship between personal agency and the systems people are born into.", example: 'Someone is struggling financially after a job loss. How much of their path forward is on them — and how much should a social safety net absorb?' },
  { label: 'Trust ↔ Skepticism', shortLabel: 'Trust the System vs. Question It', desc: 'Do you believe existing institutions — courts, agencies, elections, media — are basically legitimate and worth working within? Or are they captured or structurally flawed in ways that demand challenge? Healthy skepticism has a long and honorable tradition across the entire political spectrum.', example: 'A court rules in a way you believe is deeply wrong. Do you accept it as legitimate even if you\'ll fight to change it, or do you think the institution itself has lost its claim to authority?' },
]

// ── Pillar accordion ─────────────────────────────────────────────────────────

interface PillarSection {
  id: string
  title: string
  faqAnchor: string
  content: React.ReactNode
}

function PillarAccordion({ section }: { section: PillarSection }) {
  const [open, setOpen] = useState(false)
  return (
    <div id={section.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-5) var(--space-6)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-h4)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', textAlign: 'left' }}
      >
        {section.title}
        <span aria-hidden="true" style={{ display: 'inline-block', color: 'var(--color-text-muted)', fontSize: '20px', lineHeight: 1, transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>›</span>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {section.content}
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
            <Link href={`/faq#${section.faqAnchor}`} style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
              See related FAQ questions →
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

const PILLAR_SECTIONS: PillarSection[] = [
  {
    id: 'quiz',
    title: 'The Quiz and Your Civic Mantle',
    faqAnchor: 'faq-general',
    content: (
      <>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          The quiz maps your civic identity across eight dimensions — real tensions that every thoughtful voter navigates. Layer 1 (14 questions) establishes your dimensional profile and assigns your Civic Mantle. Layers 2–4 add issue depth, behavioral modifiers, and dealbreakers, raising your completion percentage but not changing your Mantle or constellation.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Answer order is randomized for every user so no position gets a permanent advantage. Scoring keys to the content of what you chose, never the order it appeared. The eight dimensions and the bias controls behind them are documented in full below — and the scoring code is on{' '}
          <a href="https://github.com/mattb2518/bedrock" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>GitHub</a> for anyone who wants to inspect it.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Claude&apos;s role here: none. The quiz engine is deterministic — your answers go in, your scores come out by formula. No AI is involved in computing your profile or assigning your Civic Mantle.
        </p>
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)', marginTop: 'var(--space-2)' }}>
          <p style={{ margin: '0 0 var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            Independent research confirms what we&apos;re doing here matters.{' '}
            <a href={PEW_REPORT_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>
              Pew Research Center&apos;s 2026 Political Typology
            </a>{' '}
            identifies nine distinct political groups — most of which fall outside comfortable alignment with either major party. Bedrock&apos;s Civic Mantle types cut across multiple Pew groups in both directions. We&apos;re not trying to re-label you with someone else&apos;s categories. We&apos;re trying to help you understand your own.
          </p>
          <PewTypologyGrid />
        </div>
      </>
    ),
  },
  {
    id: 'ballot',
    title: 'Your Ballot & Your Officials',
    faqAnchor: 'faq-ballot',
    content: (
      <>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          When you enter your address, we fetch the candidates running in your district from congress.gov, the FEC, and your state&apos;s legislative database. For candidates we haven&apos;t seen before, we classify them in real time — reading their public record, voting history, and stated positions, then scoring them on the same eight dimensions as your values profile. This takes a moment on your first lookup; every subsequent user in the same district gets instant results from our cache. Incumbents with voting records get more confident placements. Challengers with only campaign platforms get real placements but lower confidence scores — we can&apos;t know yet if they&apos;ll follow through, and we say so.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Claude&apos;s role:</strong> The analysis behind these recommendations is generated by Claude, Anthropic&apos;s AI. Claude reads the public record, scores each candidate on the eight dimensions, and drafts the explanation you see on each card. Humans review placements before they go live and can override Claude&apos;s scoring when the evidence warrants it. We also look at thumbs up and thumbs down feedback regularly — when users systematically disagree with a recommendation, that&apos;s a signal we take seriously and investigate. The AI does the analysis. Humans stay in the loop.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Between elections, the same engine runs against your current officeholders instead of candidates. Nothing about the matching changes: eight dimensions, record weighted 3:1 over rhetoric, dealbreakers surfaced as flags — never exclusions, because you can&apos;t exclude your own senator from being your senator. Officials with thin public records (common for state legislators) carry a plain-language precision caveat instead of a false-precision score. This shows how your values compare to your representatives&apos; actual public record — not a rating or grade.
        </p>
      </>
    ),
  },
  {
    id: 'media-diet',
    title: 'Your Media Diet',
    faqAnchor: 'faq-media-diet',
    content: (
      <>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Your Media Diet matches your eight-dimension profile against a curated catalog of independent journalists, Substacks, and podcasts. Each source is scored on the same eight axes as your quiz. The match determines which of three tiers a source lands in for you specifically: Confirming (sources that deepen what you know), Expanding (sources that cover ground your current diet misses), and Challenging (sources that make the best honest case against your strongest views).
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          The catalog covers independently owned and editorially autonomous sources only — no sources controlled by large media corporations, political parties, or institutional funders with a partisan agenda. Catalog reviewed quarterly; ownership changes and documented reliability incidents trigger immediate re-review. Every entry has a last-verified date. Once classified and approved by our editorial team, each source&apos;s placement in your recommendations reflects real analysis of their published work — not a simplified left-right label.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Dealbreaker selections from Your Ballot are deliberately NOT used here. Filtering media by your hard lines is the echo chamber the product exists to fight.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Claude&apos;s role:</strong> The analysis behind these recommendations is generated by Claude, Anthropic&apos;s AI. Claude reads each source&apos;s body of work, scores it on the eight civic dimensions, and drafts the explanation you see on each card. Humans review placements before they go live and can override Claude&apos;s scoring when the evidence warrants it. We also look at thumbs up and thumbs down feedback regularly — when users systematically disagree with a recommendation, that&apos;s a signal we take seriously and investigate. We also use Perplexity to verify current ownership and status of sources in the catalog — Claude&apos;s knowledge has a cutoff date, and independent media changes ownership. Current-status verification is a systematic part of our quarterly review.
        </p>
      </>
    ),
  },
  {
    id: 'conversations',
    title: 'Your Conversations',
    faqAnchor: 'faq-conversations',
    content: (
      <>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Your Conversations is built on a framework developed by Chris Argyris and popularized by Peter Senge in The Fifth Discipline — the Ladder of Inference. The idea is simple: most difficult conversations fail not because people disagree on facts but because each person is reasoning from a different set of assumptions they&apos;ve never made explicit. The Ladder of Inference maps how we move from observable data to conclusions to actions, usually without noticing the steps we skipped. Bedrock uses this framework to help you see the reasoning behind someone else&apos;s position — and your own — before you respond. The goal isn&apos;t agreement. It&apos;s a real conversation instead of a performative one.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Conversation history is not stored. Each session starts fresh. What you explore while preparing for a difficult conversation is yours, not ours.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Claude&apos;s role:</strong> Your Conversations is built on a framework developed by Chris Argyris and popularized by Peter Senge in The Fifth Discipline — the Ladder of Inference. Claude runs that method in real time. The system prompt and guardrails are human-designed and regularly reviewed. No human is in the loop per turn, but the framework Claude follows was built by humans and is auditable.
        </p>
      </>
    ),
  },
  {
    id: 'beyond-ballot',
    title: 'Beyond Your Ballot',
    faqAnchor: 'faq-beyond-ballot',
    content: (
      <>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Beyond Your Ballot shows federal candidates outside your district whose presence in Congress would shift the balance toward independent-minded governance. It runs the same values-matching engine as Your Ballot, plus a second filter: the independent-minded governance screen.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Governance filter criteria</strong> — four criteria, must meet at least two: no party-line voting rate above 85% for incumbents; history of co-sponsoring bipartisan legislation; publicly committed to a specific structural or institutional reform — redistricting, campaign finance and disclosure, congressional term limits, age or tenure limits including Supreme Court term limits, debt-ceiling or budget-process reform, or executive and emergency-power limits, not vague unity language, and regardless of partisan direction; endorsed by a documented cross-partisan organization whose membership includes elected officials from both parties acting in a non-party capacity (for example, the Problem Solvers Caucus or Unite America) or explicitly contested their own party&apos;s position with a recorded vote or statement. This filter is editorial. We define it, we apply it, we publish the criteria so you can evaluate our judgment.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Dealbreakers are flags here, not exclusions — because you&apos;re not voting for these candidates. The card shows the flag and lets you decide.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Claude&apos;s role:</strong> The analysis behind these recommendations is generated by Claude, Anthropic&apos;s AI. Claude reads the public record, scores each candidate on the eight dimensions, and drafts the explanation you see on each card. Humans review placements before they go live and can override Claude&apos;s scoring when the evidence warrants it. We also look at thumbs up and thumbs down feedback regularly — when users systematically disagree with a recommendation, that&apos;s a signal we take seriously and investigate. The AI does the analysis. Humans stay in the loop.
        </p>
      </>
    ),
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MethodologyPage() {
  return (
    <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-16) var(--space-6)' }}>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>Trust &amp; Methodology</p>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-tight)' }}>
        There&apos;s got to be a better way to earn trust.
      </h1>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
        Trust isn&apos;t claimed. It&apos;s built — through transparency, accountability, and showing your work. Here&apos;s ours.
      </p>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-12)' }}>
        Scoring code is open-source on{' '}
        <a href="https://github.com/mattb2518/bedrock" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>GitHub</a>{' '}
        for anyone who wants to inspect it. See also:{' '}
        <Link href="/faq" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>FAQ →</Link>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>

        {/* ── How each pillar works — five accordion sections ───────────── */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>How each pillar works.</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {PILLAR_SECTIONS.map((s) => (
              <PillarAccordion key={s.id} section={s} />
            ))}
          </div>
        </section>

        {/* ── Who built this ────────────────────────────────────────────── */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Who built this.</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-3)' }}>Me — Matt Blumberg. Vibe coded with Claude.</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>No political party. No political donors. No institutional backer with an agenda. A technology entrepreneur who got frustrated enough to build something. <Link href="/about" style={{ color: 'var(--color-blue-accent)' }}>Read the full story →</Link></p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Who funds this.</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>Right now: me personally. Maybe someday if the platform grows: small user donations, nonpartisan civic foundation grants, and potentially a nonprofit structure with full financial transparency. Before then — and if and when it does — no political parties, PACs, political donors, advertising, or any organization with a stake in where you land will ever fund this.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>The core design decision.</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-3)' }}>Most civic quizzes map you onto a single left-right spectrum. We think that&apos;s wrong — not just imprecise, but actively misleading. Real political identity is multidimensional. Flattening it into one axis loses almost everything that matters.</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>So we built an eight-dimension model instead. Each dimension captures a genuine tension that every thoughtful voter navigates — not a proxy for party affiliation, not a coded version of left vs. right. Eight real spectrums, each with honorable positions at both ends.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>The eight dimensions — deep dive.</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>Before you answer a single question, we show you all eight. No black boxes.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {dimensions.map((d, i) => (
              <div key={d.label} style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-micro)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase' }}>{i + 1}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h4)', color: 'var(--color-text-primary)' }}>{d.label}</h3>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>{d.shortLabel}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-3)' }}>{d.desc}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', fontStyle: 'italic', lineHeight: 'var(--leading-relaxed)' }}><strong style={{ color: 'var(--color-text-subtle)', fontStyle: 'normal' }}>Example:</strong> {d.example}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>How we tested for bias.</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>Every dimension was designed so that both poles have defensible, honorable positions. Neither end should feel like the obviously correct answer or the obviously wrong one. We ran five stress tests before finalizing the model:</p>
          {[
            ['The partisan smell test', 'Does either pole secretly smell like Democrat or Republican? If yes, we rewrote it.'],
            ['The independence test', 'Are the dimensions actually measuring different things, or are some just proxies for each other?'],
            ['The real person test', 'We mapped eight distinct political archetypes across all eight dimensions and confirmed they produce genuinely different profiles.'],
            ['The questionability test', 'Can we write at least two or three good, non-leading questions for each dimension?'],
            ['The output test', 'Would two candidates with genuinely different governing philosophies score differently across these dimensions? We tested against real political figures. They do.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div style={{ width: '4px', backgroundColor: 'var(--color-red)', borderRadius: 'var(--radius-full)', flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)', fontSize: 'var(--text-body)' }}>{title}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>How we bias-checked every question.</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>The five tests above are about the model. But a neutral model can still be undermined by a single leading question, a loaded answer option, or a &ldquo;fun fact&rdquo; that quietly takes a side. So before launch, every question, every answer option, every micro-reaction, and every historical easter egg went through a separate, item-by-item review.</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>The method is adversarial, and we run it twice. For each item we ask: what would a sharp, good-faith critic <em>from the left</em> say — does any option read as the obviously wrong answer for a progressive, does the framing assume a center-right baseline, does a reaction reward one direction over the other? Then we ask the identical question <em>from the right</em>. An item only passes when it survives both.</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>Three things we specifically check:</p>
          {[
            ['Every option has a home.', "On every question, all of the options — not just the middle one — have to be a position a thoughtful person actually holds, stated in its own strongest terms. If one side's real view is missing, or shows up only as a straw man, that's a defect we fix — even when fixing it means adding an option or rewriting one we liked."],
            ["The easter eggs don't argue.", 'The historical asides are there to be interesting, not to make a point. A true fact selected because it flatters one side is still a thumb on the scale, so the eggs are held to history and Americana that illuminate a tension rather than resolve it.'],
            ['Structure does some of the work.', "Answer order is randomized for every user, so no position gets a permanent advantage from sitting first. Internal scoring keys to the position of an option's content, never its letter. And the Layer 4 dealbreakers are deliberately paired left and right so the balance is visible at a glance — including, where the honest answer required it, items that filter candidates on our own founder's positions."],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div style={{ width: '4px', backgroundColor: 'var(--color-gold)', borderRadius: 'var(--radius-full)', flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)', fontSize: 'var(--text-body)' }}>{title}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{desc}</p>
              </div>
            </div>
          ))}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>We&apos;re not going to claim the result is perfect. Bias-checking is a practice, not a one-time certificate — language drifts, the news cycle re-codes old words, and a sharp critic will always find something we missed. When that happens, the feedback button on every question comes straight to us, and the commitment below holds: if a question is biased, we fix it and say so.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Three accountability commitments.</h2>
          {[
            ['Published methodology', "Open to scrutiny, updated when we learn something. You're reading it now."],
            ['Open-source scoring logic', <span key="oss">You can see exactly how your profile is built. <a href="https://github.com/mattb2518/bedrock" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue-accent)', textDecoration: 'none' }}>GitHub →</a></span>],
            ['No political donors', 'Ever. The independence of this platform is non-negotiable.'],
          ].map(([title, desc]) => (
            <div key={String(title)} style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', marginBottom: 'var(--space-3)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)', fontSize: 'var(--text-body)' }}>{title}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Still skeptical?</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>Good. You should be. Skepticism is healthy — we built an entire dimension around it.</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)' }}><a href="mailto:hello@bedrock.guide" style={{ color: 'var(--color-blue-accent)' }}>hello@bedrock.guide</a>. A human reads it.</p>
        </section>

      </div>
    </div>
  )
}
