import HeroSlider from "@/components/layout/HeroSlider";
import MantleConstellation from "@/components/ui/MantleConstellation";
import { DIMENSION_PAIRS } from "@/components/ui/Constellation";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── Civic Mantle Teaser ───────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-bg-section)", padding: "var(--space-20) var(--space-6)" }}>
        <div style={{ maxWidth: "var(--max-width-wide)", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto var(--space-12)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
              Civic Mantle
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", lineHeight: "var(--leading-tight)", marginBottom: "var(--space-4)" }}>
              Ten mantles.<br />One is yours.
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
              Not a label — a mantle, something you claim. The quiz maps your values across eight dimensions and surfaces the civic identity that&apos;s already yours — each one a constellation traced across those dimensions, like the ten below.
            </p>
          </div>

          {/* Ten-mantle star map */}
          <MantleConstellation />

          {/* The eight dimensions, spelled out */}
          <div style={{ marginTop: "var(--space-16)", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
              Mapped across eight dimensions
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-2) var(--space-5)", maxWidth: "800px", margin: "0 auto" }}>
              {DIMENSION_PAIRS.map(([a, b]) => (
                <span key={a} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                  {a} <span style={{ color: "var(--color-blue)" }}>⟷</span> {b}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div style={{ marginTop: "var(--space-12)", display: "flex", gap: "var(--space-4)", justifyContent: "center", flexWrap: "wrap" }}>
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
              Explore all ten
            </Link>
          </div>

          {/* Down cue connecting to the pillars */}
          <div style={{ textAlign: "center", marginTop: "var(--space-16)" }}>
            <a
              href="#build"
              className="scroll-cue"
              aria-label="Then build on top of it"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", textDecoration: "none", fontSize: "20px", lineHeight: 1 }}
            >
              ↓
            </a>
          </div>

        </div>

        <style>{`
          .scroll-cue { transition: var(--transition-base); animation: scrollCueBounce 2.2s ease-in-out infinite; }
          .scroll-cue:hover { color: var(--color-text-primary); border-color: var(--color-border-strong); }
          @keyframes scrollCueBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
          @media (prefers-reduced-motion: reduce) { .scroll-cue { animation: none; } }
        `}</style>
      </section>

      {/* ── Four Pillars ──────────────────────────────────── */}
      <section id="build" style={{ backgroundColor: "var(--color-bg-page)", padding: "var(--space-20) var(--space-6)", scrollMarginTop: "var(--nav-height)" }}>
        <div style={{ maxWidth: "var(--max-width-wide)", margin: "0 auto" }}>

          {/* Bridge header */}
          <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
              Then build on top of it
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
              Four things your mantle powers.
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", maxWidth: "600px", margin: "0 auto", lineHeight: "var(--leading-relaxed)" }}>
              Your Civic Mantle isn't just a label — it's the engine. Everything below is built on top of it.
            </p>
          </div>

          {/* Four pillars — 2×2 on desktop, single column on mobile */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-6)", maxWidth: "720px", margin: "0 auto" }}>

            <Link href="/ballot" style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", borderTop: "3px solid var(--color-red)", transition: "var(--transition-base)", cursor: "pointer" }}>
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
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>
                  Your Conversations
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
                  Claude-powered prep for difficult conversations across difference.
                </p>
              </div>
            </Link>

            <Link href="/beyond-ballot" style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", borderTop: "3px solid var(--color-rose)", transition: "var(--transition-base)", cursor: "pointer" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>
                  Beyond Your Ballot
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
                  Candidates you can&apos;t vote for, but whose presence in Congress would shape the country.
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
