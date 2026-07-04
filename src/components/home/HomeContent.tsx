"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HeroSlider from "@/components/layout/HeroSlider";
import MantleConstellation from "@/components/ui/MantleConstellation";
import Constellation from "@/components/ui/Constellation";
import { DIMENSION_PAIRS } from "@/components/ui/Constellation";
import { useQuizStore } from "@/store/quizStore";
import { mantleFor } from "@/lib/quiz/mantles";
import { profileToRadar, DIMENSIONS, poleLabel } from "@/lib/quiz/dimensions";
import type { DimensionalProfile } from "@/types/quiz";
import { PILLAR_ONE, type PillarOneMode } from "@/lib/config/pillarOne";
import { usePreviewStore } from "@/store/previewStore";

// ── Shared pillar cards ───────────────────────────────────────────────────────

function PillarCards({ pillarOneMode }: { pillarOneMode: PillarOneMode }) {
  const p1 = PILLAR_ONE[pillarOneMode]
  return (
    <div className="pillar-grid">
      <Link href="/your-ballot" style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", borderTop: "3px solid var(--color-red)", transition: "var(--transition-base)", cursor: "pointer", height: "100%", boxSizing: "border-box" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>{p1.tileTitle}</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{p1.tileBlurb}</p>
        </div>
      </Link>

      <Link href="/media-diet" style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", borderTop: "3px solid var(--color-white-warm)", transition: "var(--transition-base)", cursor: "pointer", height: "100%", boxSizing: "border-box" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>Your Media Diet</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>Curated journalism that deepens, expands, and challenges.</p>
        </div>
      </Link>

      <Link href="/conversations" style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", borderTop: "3px solid var(--color-blue-accent)", transition: "var(--transition-base)", cursor: "pointer", height: "100%", boxSizing: "border-box" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>Your Conversations</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>Claude-powered prep for difficult conversations across difference.</p>
        </div>
      </Link>

      <Link href="/beyond-your-ballot" style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", borderTop: "3px solid var(--color-rose)", transition: "var(--transition-base)", cursor: "pointer", height: "100%", boxSizing: "border-box" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>Beyond Your Ballot</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>Candidates you can&apos;t vote for, but whose presence in Congress would shape the country.</p>
        </div>
      </Link>
    </div>
  );
}

// ── Public homepage layout ────────────────────────────────────────────────────

function PublicHome({ pillarOneMode }: { pillarOneMode: PillarOneMode }) {
  return (
    <>
      <HeroSlider />

      {/* Civic Mantle teaser */}
      <section style={{ backgroundColor: "var(--color-bg-section)", padding: "var(--space-20) var(--space-6)" }}>
        <div style={{ maxWidth: "var(--max-width-wide)", margin: "0 auto" }}>
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

          <MantleConstellation />

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

          <div style={{ marginTop: "var(--space-12)", display: "flex", gap: "var(--space-4)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/quiz" style={{ backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body)", padding: "var(--space-3) var(--space-6)", borderRadius: "var(--btn-radius)", textDecoration: "none" }}>
              Find your mantle →
            </Link>
            <Link href="/civic-mantle" style={{ backgroundColor: "transparent", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)", fontWeight: "var(--weight-medium)", fontSize: "var(--text-body)", padding: "var(--space-3) var(--space-6)", borderRadius: "var(--btn-radius)", textDecoration: "none", border: "1px solid var(--color-border)" }}>
              Explore all ten
            </Link>
          </div>

          <div style={{ textAlign: "center", marginTop: "var(--space-16)" }}>
            <a href="#build" className="scroll-cue" aria-label="Then build on top of it"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", textDecoration: "none", fontSize: "20px", lineHeight: 1 }}>
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

      {/* Four Pillars */}
      <section id="build" style={{ backgroundColor: "var(--color-bg-page)", padding: "var(--space-20) var(--space-6)", scrollMarginTop: "var(--nav-height)" }}>
        <div style={{ maxWidth: "var(--max-width-wide)", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
              Then build on top of it
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
              Four things your mantle powers.
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", maxWidth: "600px", margin: "0 auto", lineHeight: "var(--leading-relaxed)" }}>
              Your Civic Mantle isn&apos;t just a label — it&apos;s the engine. Everything below is built on top of it.
            </p>
          </div>
          <PillarCards pillarOneMode={pillarOneMode} />
        </div>
        <style>{`
          .pillar-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: var(--space-6); max-width: 760px; margin: 0 auto; }
          @media (max-width: 640px) { .pillar-grid { grid-template-columns: 1fr; grid-auto-rows: auto; } }
        `}</style>
      </section>
    </>
  );
}

// ── Returning-user homepage layout ────────────────────────────────────────────

function ReturningHome({ pillarOneMode }: { pillarOneMode: PillarOneMode }) {
  const session = useQuizStore((s) => s.session);
  const result = session?.result;
  const major = result ? mantleFor(result.primaryType) : null;
  const profile = result?.profile as DimensionalProfile | undefined;
  const radarScores = profile ? profileToRadar(profile) : undefined;

  // Top traits: the user's flagged top dimensions, labeled by pole
  const topTraits = (result?.topDimensions ?? []).slice(0, 3).map((dim) => {
    const val = profile ? profile[dim] : 50;
    return poleLabel(dim, val);
  });

  // Fallback: highest-scoring dimensions from the profile
  const fallbackTraits = profile
    ? DIMENSIONS
        .map((d) => ({ label: val(d.key, profile) >= 50 ? d.poleB : d.poleA, score: Math.abs(val(d.key, profile) - 50) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((t) => t.label)
    : [];

  const traits = topTraits.length > 0 ? topTraits : fallbackTraits;

  function val(key: string, p: DimensionalProfile): number {
    return (p as unknown as Record<string, number>)[key] ?? 50;
  }

  return (
    <>
      <HeroSlider compact />

      {/* Your Actions */}
      <section style={{ backgroundColor: "var(--color-bg-section)", padding: "var(--space-16) var(--space-6)" }}>
        <div style={{ maxWidth: "var(--max-width-wide)", margin: "0 auto" }}>
          <div style={{ marginBottom: "var(--space-10)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
              Your Actions
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", lineHeight: "var(--leading-tight)" }}>
              Everything built on your civic mantle.
            </h2>
          </div>
          <PillarCards pillarOneMode={pillarOneMode} />
        </div>
        <style>{`
          .pillar-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: var(--space-6); max-width: 760px; margin: 0 auto; }
          @media (max-width: 640px) { .pillar-grid { grid-template-columns: 1fr; grid-auto-rows: auto; } }
        `}</style>
      </section>

      {/* Your Mantle preview */}
      {major && (
        <section style={{ backgroundColor: "var(--color-bg-page)", padding: "var(--space-16) var(--space-6)" }}>
          <div style={{ maxWidth: "var(--max-width-wide)", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "var(--space-12)", alignItems: "center", flexWrap: "wrap" }}>

              {/* Constellation */}
              {radarScores && (
                <div style={{ flexShrink: 0 }}>
                  <Constellation scores={radarScores} size={200} showLabels={false} viewBox="0 0 400 400" />
                </div>
              )}

              {/* Identity text */}
              <div style={{ flex: "1 1 280px" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-muted)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-3)" }}>
                  Your Civic Mantle
                </p>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", lineHeight: "var(--leading-tight)", marginBottom: "var(--space-2)" }}>
                  {major.name}
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-gold)", fontStyle: "italic", marginBottom: "var(--space-5)" }}>
                  &ldquo;{major.oneLiner}.&rdquo;
                </p>

                {traits.length > 0 && (
                  <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-6)" }}>
                    {traits.map((trait) => (
                      <span key={trait} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", padding: "2px 10px", borderRadius: 99, border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", backgroundColor: "var(--color-bg-surface)" }}>
                        {trait}
                      </span>
                    ))}
                  </div>
                )}

                <Link href="/your-mantle" style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-blue-accent)", textDecoration: "none" }}>
                  Go to your mantle →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function HomeContent({ pillarOneMode = 'officials' }: { pillarOneMode?: PillarOneMode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const hasResult = useQuizStore((s) => !!s.session?.result);
  const { mode } = usePreviewStore();

  // Before mount: render public layout to avoid hydration mismatch
  if (!mounted) return <PublicHome pillarOneMode={pillarOneMode} />;
  // Preview overrides: new_user forces public layout, mantle forces returning layout
  if (mode === 'new_user') return <PublicHome pillarOneMode={pillarOneMode} />;
  if (!hasResult) return <PublicHome pillarOneMode={pillarOneMode} />;
  return <ReturningHome pillarOneMode={pillarOneMode} />;
}
