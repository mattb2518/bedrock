"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    eyebrow: "Not red. Not blue. Red, white, and blue.",
    headline: (
      <>
        <span style={{ color: "var(--color-red)" }}>Your values.</span> Ready to act on.
      </>
    ),
    subhead:
      "A civic identity platform for independent-minded voters. Map your values across eight dimensions. Get personalized ballot recommendations, a curated media diet, and help navigating difficult conversations.",
  },
  {
    eyebrow: "No tribal partisanship here.",
    headline: (
      <>
        Discover and articulate what you{" "}
        <em style={{ color: "var(--color-gold)" }}>actually</em> believe.
      </>
    ),
    subhead:
      "Most civic tools give you a left-right score and call it a day. Bedrock.guide maps you across eight real dimensions — the tensions every thoughtful voter actually navigates.",
  },
  {
    eyebrow: "For independent-minded citizens.",
    headline: <>There&apos;s got to be a better way.</>,
    subhead:
      "The fastest-growing voter segment in America has no real civic infrastructure built for it. Until now.",
  },
];

export default function HeroSlider({ compact = false }: { compact?: boolean }) {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index: number) => setCurrent(index), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      style={{
        backgroundColor: "var(--color-bg-page)",
        padding: compact ? "var(--space-10) var(--space-6) var(--space-8)" : "var(--space-24) var(--space-6) var(--space-20)",
        minHeight: compact ? undefined : "520px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ maxWidth: "var(--max-width-wide)", margin: "0 auto", width: "100%" }}>

        {/* Stacked slides — the grid cell sizes to the tallest, so rotation never shifts layout */}
        <div style={{ display: "grid" }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              aria-hidden={i !== current}
              style={{
                gridArea: "1 / 1",
                maxWidth: "820px",
                opacity: i === current ? 1 : 0,
                transition: "opacity var(--hero-rotation-fade, 600ms) ease",
                pointerEvents: i === current ? "auto" : "none",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-small)",
                  fontWeight: "var(--weight-semibold)",
                  color: "var(--color-text-muted)",
                  letterSpacing: "var(--tracking-wider)",
                  textTransform: "uppercase",
                  marginBottom: "var(--space-5)",
                }}
              >
                {slide.eyebrow}
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(34px, 5.2vw, 52px)",
                  fontWeight: "700",
                  lineHeight: "var(--leading-tight)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-6)",
                }}
              >
                {slide.headline}
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-body-lg)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--leading-relaxed)",
                  maxWidth: "600px",
                }}
              >
                {slide.subhead}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs — hidden for returning users */}
        {!compact && <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", marginTop: "var(--space-10)" }}>
          <Link
            href="/quiz"
            style={{
              backgroundColor: "var(--color-red)",
              color: "#ffffff",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-body)",
              fontWeight: "var(--weight-semibold)",
              padding: "var(--btn-padding-y) var(--btn-padding-x)",
              borderRadius: "var(--btn-radius)",
              textDecoration: "none",
              display: "inline-block",
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-red-light)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-red)")}
          >
            Find your bedrock →
          </Link>
          <Link
            href="/how-it-works"
            style={{
              backgroundColor: "transparent",
              color: "var(--color-white-warm)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-body)",
              fontWeight: "var(--weight-semibold)",
              padding: "var(--btn-padding-y) var(--btn-padding-x)",
              borderRadius: "var(--btn-radius)",
              textDecoration: "none",
              display: "inline-block",
              border: "2px solid var(--color-border-strong)",
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(232,228,218,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            How it works
          </Link>
        </div>}

        {/* Dot indicators */}
        <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-10)" }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? "24px" : "8px",
                height: "8px",
                borderRadius: "var(--radius-full)",
                backgroundColor: i === current ? "var(--color-white-warm)" : "var(--color-text-subtle)",
                border: "none",
                cursor: "pointer",
                transition: "var(--transition-base)",
                padding: 0,
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
