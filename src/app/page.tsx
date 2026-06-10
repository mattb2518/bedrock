import HeroSlider from "@/components/layout/HeroSlider";
import Link from "next/link";

const types = [
  { label: "The Honest Broker",    oneLiner: "The rules are the freedom." },
  { label: "The System Fixer",     oneLiner: "Not left or right — building better machinery." },
  { label: "The Long Gamer",       oneLiner: "Thinks in decades and across borders." },
  { label: "The Good Neighbor",    oneLiner: "Believes the best solutions start closest to home." },
  { label: "The Missourian",       oneLiner: "You'll believe it when you see it — and you're usually right." },
  { label: "The Eternal Optimist", oneLiner: "Democracy is messy and you're here for all of it." },
  { label: "The Steward",          oneLiner: "Knows what's worth conserving — and what isn't." },
  { label: "The Free Agent",       oneLiner: "Never fit a box and stopped trying." },
  { label: "The Standard Bearer",  oneLiner: "The institutions are imperfect — and worth defending." },
  { label: "The Pioneer",          oneLiner: "Progress is possible, and you know how to build it." },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── Civic Mantle Teaser ───────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-bg-page)", padding: "var(--space-20) var(--space-6)" }}>
        <div style={{ maxWidth: "var(--max-width-wide)", margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
              Civic Mantle
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", lineHeight: "var(--leading-tight)", marginBottom: "var(--space-4)" }}>
              Ten mantles.<br />One is yours.
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", maxWidth: "560px", margin: "0 auto" }}>
              Not a label. A mantle — something you claim. The quiz maps your values across eight dimensions and gives you a named civic identity that's specific to you.
            </p>
          </div>

          {/* Ten types grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-10)" }}>
            {types.map((t) => (
              <div
                key={t.label}
                style={{
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4) var(--space-5)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
              >
                <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-body)", fontWeight: "700", color: "var(--color-text-primary)", margin: 0 }}>
                  {t.label}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", margin: 0, lineHeight: "var(--leading-relaxed)", fontStyle: "italic" }}>
                  {t.oneLiner}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ textAlign: "center", display: "flex", gap: "var(--space-4)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/quiz"
              style={{ backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body)", padding: "var(--space-3) var(--space-6)", borderRadius: "var(--btn-radius)", textDecoration: "none" }}
            >
              Find your mantle →
            </Link>
            <Link
              href="/civic-mantle"
              style={{ backgroundColor: "transparent", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)", fontWeight: "var(--weight-medium)", fontSize: "var(--text-body)", padding: "var(--space-3) var(--space-6)", borderRadius: "var(--btn-radius)", textDecoration: "none", border: "1px solid var(--color-border)" }}
            >
              Explore all ten types
            </Link>
          </div>

        </div>
      </section>

      {/* ── Three Pillars ─────────────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-bg-section)", padding: "var(--space-20) var(--space-6)" }}>
        <div style={{ maxWidth: "var(--max-width-wide)", margin: "0 auto" }}>

          {/* Bridge header */}
          <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
              Built on top of it
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
              Three things your mantle powers.
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", maxWidth: "600px", margin: "0 auto", lineHeight: "var(--leading-relaxed)" }}>
              Your Civic Mantle isn't just a label — it's the engine. Everything below is built on top of it.
            </p>
          </div>

          {/* Three pillars */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)" }}>

            <Link href="/ballot" style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", borderTop: "3px solid var(--color-red)", transition: "var(--transition-base)", cursor: "pointer" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", fontWeight: "var(--weight-semibold)", color: "var(--color-red)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-3)" }}>
                  Pillar One
                </p>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>
                  Your Ballot
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
                  Every race, matched to your values. From president to school board.
                </p>
              </div>
            </Link>

            <Link href="/media" style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", borderTop: "3px solid var(--color-white-warm)", transition: "var(--transition-base)", cursor: "pointer" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", fontWeight: "var(--weight-semibold)", color: "var(--color-white-warm)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-3)" }}>
                  Pillar Two
                </p>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>
                  Your Media Diet
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
                  Independent journalism matched to how you actually think.
                </p>
              </div>
            </Link>

            <Link href="/conversations" style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", borderTop: "3px solid var(--color-blue-accent)", transition: "var(--transition-base)", cursor: "pointer" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", fontWeight: "var(--weight-semibold)", color: "var(--color-blue-accent)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-3)" }}>
                  Pillar Three
                </p>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>
                  Your Conversations
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
                  Claude-powered prep for difficult conversations across difference.
                </p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── Tagline band ──────────────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-bg-page)", borderTop: "1px solid var(--color-border)", padding: "var(--space-12) var(--space-6)", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "22px", color: "var(--color-gold)", marginBottom: "var(--space-3)" }}>
          "Not red, not blue — red, white, and blue."
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>
          From the{" "}
          <a href="https://www.countryoverself.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-secondary)" }}>
            <em>Country Over Self</em>
          </a>{" "}
          podcast.
        </p>
      </section>
    </>
  );
}
