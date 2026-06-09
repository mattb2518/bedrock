import Link from "next/link";

export default function MethodologyPage() {
  const dimensions = [
    { label: "Stability ↔ Change", shortLabel: "Steady vs. Bold", desc: "How much should existing systems, institutions, and norms change — and how fast? This isn't about being timid or reckless. It's about whether you trust gradual improvement more than structural transformation, or vice versa.", example: "When the criminal justice system produces unjust outcomes, do you want to reform it from within — better training, better laws, better accountability — or do you think the structure itself needs to be overhauled entirely?" },
    { label: "Local ↔ Federal", shortLabel: "Close to Home vs. Bigger Stage", desc: "When a problem needs solving, where should the decision-making power live — closest to the people affected, or at the scale needed to make it stick? Local control can mean responsiveness and accountability. Federal power can mean consistency and reach.", example: "Should school curriculum be set by local school boards who know their communities, or by national standards that ensure every child gets the same foundation regardless of zip code?" },
    { label: "National ↔ Global", shortLabel: "Home First vs. Bigger Picture", desc: "When American interests and global cooperation pull in different directions, which wins — and how often? It's not isolationism vs. globalism. It's about where you draw the circle of concern, and why.", example: "If a trade agreement would create jobs abroad and lower prices for American consumers, but cost American manufacturing jobs — is that a win, a loss, or something more complicated?" },
    { label: "Rules ↔ Outcomes", shortLabel: "Fair Process vs. Fair Result", desc: "If a process is fair but produces unequal outcomes, is that acceptable? If an outcome seems just but the process was messy, does that matter? This is one of the deepest tensions in democratic life.", example: "A judge follows sentencing guidelines precisely and gives two people identical sentences for the same crime. One grew up with resources and opportunity, the other didn't. Is that justice?" },
    { label: "Markets ↔ Governance", shortLabel: "Let It Compete vs. Set the Rules", desc: "When something important is broken — housing, healthcare, education, the environment — is the better lever competition and private incentives, or regulation and public investment? This isn't capitalism vs. socialism. It's a practical question about which tools work better, and when.", example: "Prescription drug prices are high. Do you want more competition between pharmaceutical companies to drive prices down, or a government body that negotiates or sets prices directly?" },
    { label: "Pragmatism ↔ Idealism", shortLabel: "What Works vs. What's Right", desc: "Are your positions anchored to a vision of what should be — a principle you won't compromise — or are they constantly negotiated against what's actually achievable? Neither is naive. Both are honorable.", example: "A bipartisan immigration bill would meaningfully reduce illegal crossings and create a path to legal status for long-term residents — but it requires compromises that neither side loves. Do you support passing it?" },
    { label: "Individual ↔ Collective", shortLabel: "Personal vs. Shared Responsibility", desc: "Where does responsibility primarily live — with the individual, or with the community? This isn't about laziness vs. generosity, or freedom vs. control. It's about how you understand the relationship between personal agency and the systems people are born into.", example: "Someone is struggling financially after a job loss. How much of their path forward is on them — and how much should a social safety net absorb?" },
    { label: "Trust ↔ Skepticism", shortLabel: "Trust the System vs. Question It", desc: "Do you believe existing institutions — courts, agencies, elections, media — are basically legitimate and worth working within? Or are they captured or structurally flawed in ways that demand challenge? Healthy skepticism has a long and honorable tradition across the entire political spectrum.", example: "A court rules in a way you believe is deeply wrong. Do you accept it as legitimate even if you'll fight to change it, or do you think the institution itself has lost its claim to authority?" },
  ];

  return (
    <div style={{ maxWidth: "var(--max-width-content)", margin: "0 auto", padding: "var(--space-16) var(--space-6)" }}>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)" }}>Trust &amp; Methodology</p>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", color: "var(--color-text-primary)", marginBottom: "var(--space-6)", lineHeight: "var(--leading-tight)" }}>
        There's got to be a better way to earn trust.
      </h1>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-12)" }}>
        Trust isn't claimed. It's built — through transparency, accountability, and showing your work. Here's ours.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Who built this.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-3)" }}>Me — Matt Blumberg. Vibe coded with Claude.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>No political party. No political donors. No institutional backer with an agenda. A technology entrepreneur who got frustrated enough to build something. <Link href="/about" style={{ color: "var(--color-blue-accent)" }}>Read the full story →</Link></p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Who funds this.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>Right now: me personally. Maybe someday if the platform grows: small user donations, nonpartisan civic foundation grants, and potentially a nonprofit structure with full financial transparency. Before then — and if and when it does — no political parties, PACs, political donors, advertising, or any organization with a stake in where you land will ever fund this.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>The core design decision.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-3)" }}>Most civic quizzes map you onto a single left-right spectrum. We think that's wrong — not just imprecise, but actively misleading. Real political identity is multidimensional. Flattening it into one axis loses almost everything that matters.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>So we built an eight-dimension model instead. Each dimension captures a genuine tension that every thoughtful voter navigates — not a proxy for party affiliation, not a coded version of left vs. right. Eight real spectrums, each with honorable positions at both ends.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-6)" }}>The eight dimensions — deep dive.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-6)" }}>Before you answer a single question, we show you all eight. No black boxes.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {dimensions.map((d, i) => (
              <div key={d.label} style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)", marginBottom: "var(--space-3)", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase" }}>{i + 1}</span>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h4)", color: "var(--color-text-primary)" }}>{d.label}</h3>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>{d.shortLabel}</span>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-3)" }}>{d.desc}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", fontStyle: "italic", lineHeight: "var(--leading-relaxed)" }}><strong style={{ color: "var(--color-text-subtle)", fontStyle: "normal" }}>Example:</strong> {d.example}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>How we tested for bias.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-4)" }}>Every dimension was designed so that both poles have defensible, honorable positions. Neither end should feel like the obviously correct answer or the obviously wrong one. We ran five stress tests before finalizing the model:</p>
          {[
            ["The partisan smell test", "Does either pole secretly smell like Democrat or Republican? If yes, we rewrote it."],
            ["The independence test", "Are the dimensions actually measuring different things, or are some just proxies for each other?"],
            ["The real person test", "We mapped eight distinct political archetypes across all eight dimensions and confirmed they produce genuinely different profiles."],
            ["The questionability test", "Can we write at least two or three good, non-leading questions for each dimension?"],
            ["The output test", "Would two candidates with genuinely different governing philosophies score differently across these dimensions? We tested against real political figures. They do."],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div style={{ width: "4px", backgroundColor: "var(--color-red)", borderRadius: "var(--radius-full)", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--space-1)", fontSize: "var(--text-body)" }}>{title}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Three accountability commitments.</h2>
          {[
            ["Published methodology", "Open to scrutiny, updated when we learn something. You're reading it now."],
            ["Open-source scoring logic", "You can see exactly how your profile is built. GitHub link to be added before launch."],
            ["No political donors", "Ever. The independence of this platform is non-negotiable."],
          ].map(([title, desc]) => (
            <div key={title} style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-5)", marginBottom: "var(--space-3)" }}>
              <p style={{ fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--space-1)", fontSize: "var(--text-body)" }}>{title}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)" }}>{desc}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Still skeptical?</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>Good. You should be. Skepticism is healthy — we built an entire dimension around it.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", marginTop: "var(--space-3)" }}><a href="mailto:hello@bedrock.guide" style={{ color: "var(--color-blue-accent)" }}>hello@bedrock.guide</a>. A human reads it.</p>
        </section>

      </div>
    </div>
  );
}
