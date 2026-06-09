"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    eyebrow: "Not red. Not blue.",
    headline: (
      <>
        <span style={{ color: "var(--color-red)" }}>Your values.</span>
        <br />
        <span style={{ color: "var(--color-white-warm)" }}>Your ballot.</span>
        <br />
        <span style={{ color: "var(--color-blue-accent)" }}>All of it.</span>
      </>
    ),
    subhead:
      "A civic identity platform for independent-minded voters. Map your values across eight dimensions. Get personalized ballot recommendations, a curated media diet, and help navigating difficult conversations.",
  },
  {
    eyebrow: "There's got to be a better way.",
    headline: (
      <>
        Find what you{" "}
        <em style={{ color: "var(--color-gold)" }}>actually</em> believe.
      </>
    ),
    headlineFont: "display" as const,
    subhead:
      "Most civic tools give you a left-right score and call it a day. Bedrock maps you across eight real dimensions — the tensions every thoughtful voter actually navigates.",
  },
  {
    eyebrow: "For the voters who haven't given up.",
    headline: "There's got to be a better way.",
    headlineSize: "46px" as const,
    subhead:
      "The fastest-growing voter segment in America has no real civic infrastructure built for it. Until now.",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;
      setFading(true);
      setTimeout(() => {
        setCurrent(index);
        setFading(false);
      }, 300);
    },
    [current]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const slide = slides[current];

  return (
    <section
      style={{
        backgroundColor: "var(--color-bg-page)",
        padding: "var(--space-24) var(--space-6) var(--space-20)",
        minHeight: "520px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: "var(--max-width-wide)",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Slide content */}
        <div
          style={{
            opacity: fading ? 0 : 1,
            transition: "opacity 300ms ease",
            maxWidth: "800px",
          }}
        >
          {/* Eyebrow */}
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

          {/* Headline */}
          <h1
            style={{
              fontFamily:
                slide.headlineFont === "display"
                  ? "var(--font-display)"
                  : "var(--font-body)",
              fontSize: slide.headlineSize || "var(--text-hero)",
              fontWeight: "700",
              lineHeight: "var(--leading-tight)",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-6)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            {slide.headline}
          </h1>

          {/* Subhead */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-body-lg)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--leading-relaxed)",
              maxWidth: "600px",
              marginBottom: "var(--space-10)",
            }}
          >
            {slide.subhead}
          </p>

          {/* CTAs — always visible */}
          <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-red-light)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-red)")
              }
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(232,228,218,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              How it works
            </Link>
          </div>
        </div>

        {/* Dot indicators */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            marginTop: "var(--space-10)",
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? "24px" : "8px",
                height: "8px",
                borderRadius: "var(--radius-full)",
                backgroundColor:
                  i === current
                    ? "var(--color-white-warm)"
                    : "var(--color-text-subtle)",
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
