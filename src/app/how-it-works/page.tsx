import Link from "next/link";

export default function HowItWorksPage() {
  const dimensions = [
    { label: "Stability ↔ Change", sub: "Steady vs. Bold" },
    { label: "Local ↔ Federal", sub: "Close to Home vs. Bigger Stage" },
    { label: "National ↔ Global", sub: "Home First vs. Bigger Picture" },
    { label: "Rules ↔ Outcomes", sub: "Fair Process vs. Fair Result" },
    { label: "Markets ↔ Governance", sub: "Let It Compete vs. Set the Rules" },
    { label: "Pragmatism ↔ Idealism", sub: "What Works vs. What's Right" },
    { label: "Individual ↔ Collective", sub: "Personal vs. Shared Responsibility" },
    { label: "Trust ↔ Skepticism", sub: "Trust the System vs. Question It" },
  ];

  const layers = [
    { num: "1", label: "Your values foundation.", desc: "Fourteen questions about what you believe at the level of principle. Closes with your constellation appearing for the first time — a radar chart unique to you across all eight dimensions." },
    { num: "2", label: "Your real-world positions.", desc: "Nine questions on actual policy debates and real events — chosen specifically because they produce cross-partisan discomfort. This is where stated values meet actual positions." },
    { num: "3", label: "What drives your vote.", desc: "Eight questions about voting behavior, priority intensity, and the factors that have actually shaped how you've voted in the past." },
    { num: "4", label: "Where you draw the line.", desc: "The dealbreakers. The issues where a single position overrides everything else. Most civic tools never ask these questions. They're often the most predictive of all." },
  ];

  return (
    <div style={{ maxWidth: "var(--max-width-content)", margin: "0 auto", padding: "var(--space-16) var(--space-6)" }}>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)" }}>How It Works</p>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", color: "var(--color-text-primary)", marginBottom: "var(--space-6)", lineHeight: "var(--leading-tight)" }}>
        There's got to be a better way to articulate what you believe, with all its nuances.
      </h1>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-12)" }}>
        Most civic quizzes give you a left-right score and call it a day. Bedrock doesn't. Here's what we actually do — and why.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>It's a conversation, not a survey.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-3)" }}>The quiz is designed to feel like a thoughtful back-and-forth, not a form. It follows up when your answers are interesting. It sits with complexity instead of flattening it. It lets you say "it depends" and actually means it.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>It saves your progress. It gets smarter every time you return.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Eight dimensions. Not two.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-6)" }}>
            We don't put you on a left-right spectrum. We map you across eight dimensions of civic identity — the real tensions every thoughtful voter navigates whether they know it or not. Before you answer a single question, we show you all eight. No black boxes.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {dimensions.map((d) => (
              <div key={d.label} style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4) var(--space-5)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)" }}>{d.label}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>{d.sub}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", marginTop: "var(--space-4)", fontStyle: "italic" }}>Every dimension has honorable, defensible positions at both ends. There is no right answer. There's only yours.</p>
          <p style={{ marginTop: "var(--space-4)" }}><Link href="/methodology" style={{ color: "var(--color-blue-accent)", fontFamily: "var(--font-body)", fontSize: "var(--text-body)" }}>Read the full methodology →</Link></p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-6)" }}>Four layers of questions.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {layers.map((l) => (
              <div key={l.num} style={{ display: "flex", gap: "var(--space-5)", alignItems: "flex-start" }}>
                <div style={{ backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "var(--text-body)", width: "32px", height: "32px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{l.num}</div>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--space-1)" }}>Layer {l.num} — {l.label}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>"It depends" is a real answer.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>Independent-minded voters don't think in absolutes. Neither does Bedrock. Every question lets you say "it depends" — and when you do, the quiz follows up. What does it depend on? Which situations? Which conditions? That follow-up is where the richest signal lives.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>What you get.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-4)" }}>Your civic identity first. A named type — one of ten — with a constellation that shows exactly how you got there across all eight dimensions. Not a party label. Not a left-right score. A plain-English summary of where you stand, what you're consistent on, and where you're genuinely torn.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-4)" }}>The type is shorthand. The constellation is the truth. Most people fit one type cleanly. Some sit between two or three. A few don't fit any — and that's information too.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>Four things built on top of it: <strong style={{ color: "var(--color-text-primary)" }}>Your Ballot</strong> — every race matched to your values, printable. <strong style={{ color: "var(--color-text-primary)" }}>Beyond Your Ballot</strong> — candidates you can&apos;t vote for, but whose presence in Congress would shape the country. <strong style={{ color: "var(--color-text-primary)" }}>Your Media Diet</strong> — a three-tier recommendation that makes you a smarter citizen. <strong style={{ color: "var(--color-text-primary)" }}>Your Conversations</strong> — Claude-powered preparation for difficult political conversations with people who see things differently. Three ways in: start one you need to have, figure out how to respond to one that's already happening, or rehearse one you've been avoiding. Bridge-building, not debate prep.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Your profile is yours.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-4)" }}>It lives in your account. It's used only to power your recommendations and conversations. No ads. No third parties. No political organizations. Ever.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>You can update it anytime. You can delete it anytime, completely and permanently.</p>
          <p style={{ marginTop: "var(--space-4)" }}><Link href="/privacy" style={{ color: "var(--color-blue-accent)", fontFamily: "var(--font-body)", fontSize: "var(--text-body)" }}>Read our full privacy and data policy →</Link></p>
        </section>

        <div style={{ paddingTop: "var(--space-8)", borderTop: "1px solid var(--color-border)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-body-lg)", color: "var(--color-gold)", marginBottom: "var(--space-6)" }}>There's got to be a better way to show up as a citizen. This is it.</p>
          <Link href="/quiz" style={{ backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", padding: "var(--btn-padding-y) var(--btn-padding-x)", borderRadius: "var(--btn-radius)", textDecoration: "none", display: "inline-block" }}>
            Find your bedrock →
          </Link>
        </div>
      </div>
    </div>
  );
}
