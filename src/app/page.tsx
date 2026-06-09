import HeroSlider from "@/components/layout/HeroSlider";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <HeroSlider />

      {/* Civic Identity + Three Pillars */}
      <section
        style={{
          backgroundColor: "var(--color-bg-section)",
          padding: "var(--space-20) var(--space-6)",
        }}
      >
        <div style={{ maxWidth: "var(--max-width-wide)", margin: "0 auto" }}>
          {/* Civic identity overarching layer */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "var(--space-16)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-gold)",
                letterSpacing: "var(--tracking-wider)",
                textTransform: "uppercase",
                marginBottom: "var(--space-4)",
              }}
            >
              Your Civic Identity
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h2)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-4)",
              }}
            >
              One of ten named types.
              <br />A constellation unique to you.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body-lg)",
                color: "var(--color-text-secondary)",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              Everything below is built on top of it.
            </p>
          </div>

          {/* Three pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--space-6)",
            }}
          >
            {/* Pillar 1 — Your Ballot */}
            <Link href="/ballot" style={{ textDecoration: "none" }}>
              <div
                style={{
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-8)",
                  borderTop: "3px solid var(--color-red)",
                  transition: "var(--transition-base)",
                  cursor: "pointer",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-micro)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-red)",
                    letterSpacing: "var(--tracking-wider)",
                    textTransform: "uppercase",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Pillar One
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-h3)",
                    color: "var(--color-text-primary)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Your Ballot
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-body)",
                    color: "var(--color-text-secondary)",
                    lineHeight: "var(--leading-relaxed)",
                  }}
                >
                  Every race, matched to your values. From president to school
                  board.
                </p>
              </div>
            </Link>

            {/* Pillar 2 — Your Media Diet */}
            <Link href="/media" style={{ textDecoration: "none" }}>
              <div
                style={{
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-8)",
                  borderTop: "3px solid var(--color-white-warm)",
                  transition: "var(--transition-base)",
                  cursor: "pointer",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-micro)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-white-warm)",
                    letterSpacing: "var(--tracking-wider)",
                    textTransform: "uppercase",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Pillar Two
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-h3)",
                    color: "var(--color-text-primary)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Your Media Diet
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-body)",
                    color: "var(--color-text-secondary)",
                    lineHeight: "var(--leading-relaxed)",
                  }}
                >
                  Independent journalism matched to how you actually think.
                </p>
              </div>
            </Link>

            {/* Pillar 3 — Your Conversations */}
            <Link href="/conversations" style={{ textDecoration: "none" }}>
              <div
                style={{
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-8)",
                  borderTop: "3px solid var(--color-blue-accent)",
                  transition: "var(--transition-base)",
                  cursor: "pointer",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-micro)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-blue-accent)",
                    letterSpacing: "var(--tracking-wider)",
                    textTransform: "uppercase",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Pillar Three
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-h3)",
                    color: "var(--color-text-primary)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Your Conversations
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-body)",
                    color: "var(--color-text-secondary)",
                    lineHeight: "var(--leading-relaxed)",
                  }}
                >
                  Claude-powered prep for difficult conversations across
                  difference.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Tagline band */}
      <section
        style={{
          backgroundColor: "var(--color-bg-page)",
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-12) var(--space-6)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "22px",
            color: "var(--color-gold)",
            marginBottom: "var(--space-3)",
          }}
        >
          "Not red, not blue — red, white, and blue."
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-small)",
            color: "var(--color-text-muted)",
          }}
        >
          From the{" "}
          <a
            href="https://countryoverself.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <em>Country Over Self</em>
          </a>{" "}
          podcast.
        </p>
      </section>
    </>
  );
}
