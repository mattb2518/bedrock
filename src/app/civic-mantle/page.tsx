"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Constellation from "@/components/ui/Constellation";
import { useQuizStore } from "@/store/quizStore";

// ── Data ────────────────────────────────────────────────────────────────────

const dimensions = [
  { a: "Stability",   b: "Change"      },
  { a: "Local",       b: "Federal"     },
  { a: "National",    b: "Global"      },
  { a: "Rules",       b: "Outcomes"    },
  { a: "Markets",     b: "Governance"  },
  { a: "Pragmatism",  b: "Idealism"    },
  { a: "Individual",  b: "Collective"  },
  { a: "Trust",       b: "Skepticism"  },
];

const types = [
  {
    type: "honest_broker",
    label: "The Honest Broker",
    workingName: "Pragmatic Constitutionalist",
    oneLiner: "The rules are the freedom.",
    dimensions: ["Stability", "Federal", "Rules", "Markets", "Trust"],
    figure: { name: "George Washington", why: "Set the rules by following them — precedent, restraint, and a peaceful handoff of power." },
  },
  {
    type: "system_fixer",
    label: "The System Fixer",
    workingName: "Independent Architect",
    oneLiner: "Not left or right — building better machinery.",
    dimensions: ["Change", "Outcomes", "Pragmatism", "Skepticism"],
    figure: { name: "Theodore Roosevelt", why: "Busted the trusts and bolted his own party; broken machinery was there to be fixed." },
  },
  {
    type: "long_gamer",
    label: "The Long Gamer",
    workingName: "Principled Globalist",
    oneLiner: "Thinks in decades and across borders.",
    dimensions: ["Global", "Idealism", "Collective", "Federal"],
    figure: { name: "Benjamin Franklin", why: "Diplomat and institution-builder who thought in generations and across an ocean." },
  },
  {
    type: "good_neighbor",
    label: "The Good Neighbor",
    workingName: "Rooted Pragmatist",
    oneLiner: "Believes the best solutions start closest to home.",
    dimensions: ["Local", "Pragmatism", "Collective", "Stability"],
    figure: { name: "Jane Addams", why: "Built Hull House block by block — change starts closest to home." },
  },
  {
    type: "missourian",
    label: "The Missourian",
    workingName: "Constructive Skeptic",
    oneLiner: "You'll believe it when you see it — and you're usually right.",
    dimensions: ["Skepticism", "Outcomes", "Pragmatism", "Individual"],
    figure: { name: "Harry S. Truman", why: "The Show-Me State's own: plain-spoken, skeptical, \"the buck stops here.\"" },
  },
  {
    type: "eternal_optimist",
    label: "The Eternal Optimist",
    workingName: "Civic Optimist",
    oneLiner: "Democracy is messy and you're here for all of it.",
    dimensions: ["Trust", "Change", "Collective", "Idealism"],
    figure: { name: "Walt Whitman", why: "Sang the sprawling, messy democracy and loved every contradiction of it." },
  },
  {
    type: "steward",
    label: "The Steward",
    workingName: "Steady Steward",
    oneLiner: "Knows what's worth conserving — and what isn't.",
    dimensions: ["Stability", "Rules", "Trust", "Local"],
    figure: { name: "Dwight D. Eisenhower", why: "Steady hands on what worked; guarded the center and warned against overreach." },
  },
  {
    type: "free_agent",
    label: "The Free Agent",
    workingName: "Sovereign Independent",
    oneLiner: "Never fit a box and stopped trying.",
    dimensions: ["Individual", "Skepticism", "Local", "Markets"],
    figure: { name: "Mark Twain", why: "Never fit a box, skewered every institution, and answered to no party." },
  },
  {
    type: "standard_bearer",
    label: "The Standard Bearer",
    workingName: "Principled Institutionalist",
    oneLiner: "The institutions are imperfect — and worth defending.",
    dimensions: ["Rules", "Trust", "Global", "Idealism", "Federal"],
    figure: { name: "Abraham Lincoln", why: "Held the Union and its institutions together when they were all that was left." },
  },
  {
    type: "pioneer",
    label: "The Pioneer",
    workingName: "Growth-First Independent",
    oneLiner: "Progress is possible, and you know how to build it.",
    dimensions: ["Change", "Markets", "National", "Pragmatism"],
    figure: { name: "Alexander Hamilton", why: "Built the machinery of a national economy from scratch — progress you can engineer." },
  },
];

// ── Portrait helpers ─────────────────────────────────────────────────────────
function SilhouetteSVG({ size = 32, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor"
      style={{ width: size, height: size, color: 'var(--color-text-muted)', ...style }}>
      <circle cx="50" cy="35" r="18"/>
      <path d="M15,90 Q15,65 50,65 Q85,65 85,90 Z"/>
    </svg>
  )
}

function ForebearThumb({ type, name, size = 32 }: { type: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', flexShrink: 0 }}>
        <SilhouetteSVG size={size * 0.7} />
      </div>
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      <Image src={`/forebears/${type}.jpg`} alt={name} fill
        style={{ objectFit: 'cover', objectPosition: '50% 15%', filter: 'grayscale(100%)' }}
        onError={() => setFailed(true)} sizes={`${size}px`} />
    </div>
  )
}

function BackPortrait({ type, name }: { type: string; name: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <Image src={`/forebears/${type}.jpg`} alt={name} fill
      style={{ objectFit: 'cover', objectPosition: '50% 20%', filter: 'grayscale(100%)' }}
      onError={() => setFailed(true)} sizes="300px" />
  )
}

// ── Card component with flip ─────────────────────────────────────────────────
function TypeCard({ type, flipped, onToggle }: { type: typeof types[0]; flipped: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{ cursor: "pointer", perspective: "1000px", height: "210px" }}
      title={flipped ? "Click to flip back" : "Click to flip"}
    >
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.5s ease",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>

        {/* Front */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          backgroundColor: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
          display: "flex", flexDirection: "column", gap: "var(--space-2)",
        }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h4)", color: "var(--color-text-primary)", lineHeight: "var(--leading-tight)", margin: 0 }}>
            {type.label}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", margin: 0 }}>
            {type.workingName}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-gold)", lineHeight: "var(--leading-relaxed)", margin: 0, fontStyle: "italic", flex: 1 }}>
            {type.oneLiner}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
            {type.dimensions.map(d => (
              <span key={d} style={{
                backgroundColor: "rgba(107,159,234,0.1)",
                border: "1px solid rgba(107,159,234,0.2)",
                borderRadius: "var(--radius-full)",
                padding: "2px 8px",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-micro)",
                color: "var(--color-blue-accent)",
                fontWeight: "var(--weight-medium)",
              }}>{d}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--space-2)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text-muted)", margin: 0, opacity: 0.5 }}>flip →</p>
            <ForebearThumb type={type.type} name={type.figure.name} size={28} />
          </div>
        </div>

        {/* Back */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          backgroundColor: "var(--color-bg-deep, #0f1f33)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          <BackPortrait type={type.type} name={type.figure.name} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-2)", boxSizing: "border-box" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-muted)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", margin: 0 }}>
              An Early {type.label.replace(/^The /, "")}
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "var(--text-h4)", color: "var(--color-text-primary)", margin: 0, lineHeight: "var(--leading-tight)" }}>
              {type.figure.name}
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-secondary)", margin: 0, lineHeight: "var(--leading-relaxed)", flex: 1 }}>
              {type.figure.why}
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text-muted)", margin: 0, textAlign: "right", opacity: 0.5 }}>
              ← flip back
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CivicMantlePage() {
  const [flippedLabel, setFlippedLabel] = useState<string | null>(null);
  const { session } = useQuizStore();
  const hasMantle = (session?.completedLayers?.length ?? 0) >= 1 && !!session?.result;

  return (
    <div style={{ maxWidth: "var(--max-width-full)", margin: "0 auto", padding: "var(--space-16) var(--space-6)" }}>

      {/* Hero */}
      <div style={{ maxWidth: "720px", marginBottom: "var(--space-16)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)" }}>
          Civic Mantle
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", color: "var(--color-text-primary)", lineHeight: "var(--leading-tight)", marginBottom: "var(--space-6)" }}>
          Ten mantles.<br />One is yours.
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-4)" }}>
          A Civic Mantle isn't a label someone assigns you. It's something you claim — the civic identity that emerges from what you actually believe, not what party you belong to.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-4)" }}>
          The Bedrock quiz maps your values across eight dimensions. The result: one primary Civic Mantle and up to three secondary affinities.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", lineHeight: "var(--leading-relaxed)", borderLeft: "3px solid var(--color-border)", paddingLeft: "var(--space-4)" }}>
          Bedrock is built for the independent-minded middle. If you&apos;re a committed partisan, your results will reflect your closest Mantle — but the platform is designed for voters who don&apos;t start from a party label.
        </p>
      </div>

      {/* The eight dimensions */}
      <div style={{ marginBottom: "var(--space-16)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)" }}>
          The eight dimensions
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3) var(--space-8)", maxWidth: "800px" }}>
          {dimensions.map(d => (
            <span key={d.a} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
              {d.a} <span style={{ color: "var(--color-blue)" }}>⟷</span> {d.b}
            </span>
          ))}
        </div>
      </div>

      {/* Civic Mantle Map */}
      <div style={{ marginBottom: "var(--space-16)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-2)" }}>
          The Civic Mantle Map
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", marginBottom: "var(--space-8)", maxWidth: "560px" }}>
          Ten types. You'll recognize yourself in yours — and probably see people you know in the others. Your result will include one primary Civic Mantle and up to three secondary affinities — because most people don't fit perfectly into one box. Click any card to see real-world examples.
        </p>

        {/* 5-column grid → 2 rows of 5 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "var(--space-4)",
        }} className="mantle-grid">
          {types.map(t => (
            <TypeCard
              key={t.label}
              type={t}
              flipped={flippedLabel === t.label}
              onToggle={() => setFlippedLabel(prev => (prev === t.label ? null : t.label))}
            />
          ))}
        </div>
      </div>

      {/* Sample Constellation */}
      <div style={{ marginBottom: "var(--space-16)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
          Your constellation
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-8)", maxWidth: "560px" }}>
          Every Civic Mantle comes with a constellation — a radar chart across all eight dimensions. The outer label on each spoke is the dominant pole; the faint inner label is the opposite. Long spoke = strong lean. Short spoke = leaning the other way.
        </p>
        <div style={{ display: "flex", gap: "var(--space-12)", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
            <Constellation />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", textAlign: "center", marginTop: "var(--space-4)", fontStyle: "italic" }}>
              Sample — The Honest Broker
            </p>
          </div>
          <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column", gap: "var(--space-4)", paddingTop: "var(--space-2)" }}>
            {[
              ["Eight axes", "One spoke for each civic dimension. The outer label is the high-score pole; the faint label near center is the opposite."],
              ["Your shape", "The polygon formed by connecting your scores is unique to you — the fingerprint of your civic identity."],
              ["Shareable", "After the quiz, your constellation is yours to share. It starts conversations."],
              ["It deepens", "Your constellation updates as you complete each quiz layer — more questions, more precision."],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: "flex", gap: "var(--space-3)" }}>
                <div style={{ width: "3px", backgroundColor: "var(--color-blue-accent)", borderRadius: "var(--radius-full)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", fontSize: "var(--text-body)", marginBottom: "var(--space-1)" }}>{title}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-12)", textAlign: "center" }}>
        {hasMantle ? (
          <>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)", lineHeight: "var(--leading-tight)" }}>
              You have a Civic Mantle.
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", marginBottom: "var(--space-8)" }}>
              See your constellation, your mantle, and your full civic profile.
            </p>
            <Link href="/results" style={{ display: "inline-block", backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body)", padding: "var(--space-4) var(--space-8)", borderRadius: "var(--btn-radius)", textDecoration: "none" }}>
              View your Civic Mantle →
            </Link>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)", lineHeight: "var(--leading-tight)" }}>
              Ready to find yours?
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", marginBottom: "var(--space-8)" }}>
              Fourteen questions. Your constellation. One mantle — and the affinities that come with it.
            </p>
            <Link href="/quiz" style={{ display: "inline-block", backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body)", padding: "var(--space-4) var(--space-8)", borderRadius: "var(--btn-radius)", textDecoration: "none" }}>
              Find your Civic Mantle →
            </Link>
          </>
        )}
      </div>

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 1100px) {
          .mantle-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .mantle-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 420px) {
          .mantle-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
