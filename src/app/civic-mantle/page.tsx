"use client";

import { useState } from "react";
import Link from "next/link";

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

// REVIEW NEEDED: Politician pairings below are illustrative suggestions —
// one R, one D per type. Confirm accuracy before going live.
const types = [
  {
    label: "The Honest Broker",
    workingName: "Pragmatic Constitutionalist",
    oneLiner: "Plays by the rules — and expects everyone else to.",
    dimensions: ["Stability", "Federal", "Rules", "Markets", "Trust"],
    politicians: [
      { name: "John Kasich",  party: "R", note: "Moderate, rule-follower, bipartisan reputation" },
      { name: "Joe Manchin",  party: "D", note: "Played by the rules even when it hurt his party" },
    ],
  },
  {
    label: "The System Fixer",
    workingName: "Independent Architect",
    oneLiner: "Not left or right — just tired of broken machinery.",
    dimensions: ["Change", "Outcomes", "Pragmatism", "Skepticism"],
    politicians: [
      { name: "Chris Christie",    party: "R", note: "Outcomes-first, willing to break from party" },
      { name: "Michael Bloomberg", party: "D", note: "Independent-minded, relentlessly results-driven" },
    ],
  },
  {
    label: "The Long Gamer",
    workingName: "Principled Globalist",
    oneLiner: "Thinks in decades and across borders.",
    dimensions: ["Global", "Idealism", "Collective", "Federal"],
    politicians: [
      { name: "George H.W. Bush", party: "R", note: "Long-view foreign policy, multilateral by instinct" },
      { name: "Bill Clinton",     party: "D", note: "NAFTA, global engagement, generational thinking" },
    ],
  },
  {
    label: "The Good Neighbor",
    workingName: "Rooted Pragmatist",
    oneLiner: "Believes the best solutions start closest to home.",
    dimensions: ["Local", "Pragmatism", "Collective", "Stability"],
    politicians: [
      { name: "Phil Scott",        party: "R", note: "Vermont governor, locally-focused, pragmatic moderate" },
      { name: "Gretchen Whitmer",  party: "D", note: "Practical, locally-rooted, focused on what works" },
    ],
  },
  {
    label: "The Missourian",
    workingName: "Constructive Skeptic",
    oneLiner: "You'll believe it when you see it — and you're usually right.",
    dimensions: ["Skepticism", "Outcomes", "Pragmatism", "Individual"],
    politicians: [
      { name: "Rand Paul",    party: "R", note: "Skeptical of institutions, demands proof" },
      { name: "Bernie Sanders", party: "D", note: "\"Show me the results\" — skeptical of the same machinery from the other direction" },
    ],
  },
  {
    label: "The Eternal Optimist",
    workingName: "Civic Optimist",
    oneLiner: "Democracy is messy and you're here for all of it.",
    dimensions: ["Trust", "Change", "Collective", "Idealism"],
    politicians: [
      { name: "Ronald Reagan",  party: "R", note: "\"Morning in America\" — civic optimism as identity" },
      { name: "Barack Obama",   party: "D", note: "\"Yes We Can\" — belief in collective possibility" },
    ],
  },
  {
    label: "The Steward",
    workingName: "Steady Steward",
    oneLiner: "Someone has to protect what works — you volunteered.",
    dimensions: ["Stability", "Rules", "Trust", "Local"],
    politicians: [
      { name: "Susan Collins", party: "R", note: "Institutional protector, defender of process" },
      { name: "Pat Leahy",     party: "D", note: "Senate institutionalist, tradition over politics" },
    ],
  },
  {
    label: "The Free Agent",
    workingName: "Sovereign Independent",
    oneLiner: "Never fit a box and stopped trying.",
    dimensions: ["Individual", "Skepticism", "Local", "Markets"],
    politicians: [
      { name: "Ron Paul",       party: "R", note: "Genuinely never fit a box, stopped trying" },
      { name: "Tulsi Gabbard",  party: "D", note: "Broke from party orthodoxy repeatedly, defied categorization" },
    ],
  },
  {
    label: "The Standard Bearer",
    workingName: "Principled Institutionalist",
    oneLiner: "The institutions aren't perfect, but they're what we've got.",
    dimensions: ["Rules", "Trust", "Global", "Idealism", "Federal"],
    politicians: [
      { name: "Mitt Romney", party: "R", note: "Voted conscience over party, institutional to the end" },
      { name: "John Kerry",  party: "D", note: "Multilateral, rule-of-law instinct, institutionalist" },
    ],
  },
  {
    label: "The Pioneer",
    workingName: "Growth-First Independent",
    oneLiner: "Progress is possible, and you know how to build it.",
    dimensions: ["Change", "Markets", "National", "Pragmatism"],
    politicians: [
      { name: "Marco Rubio",     party: "R", note: "Growth-oriented, builder mentality, pragmatic ambition" },
      { name: "Pete Buttigieg",  party: "D", note: "Progress-focused, builds toward the future" },
    ],
  },
];

// ── Sample constellation (The Honest Broker) ────────────────────────────────
// Scores: Stability=0.85, Federal=0.80, National=0.50, Rules=0.85,
//         Markets=0.80, Pragmatism=0.60, Individual=0.45, Trust=0.80
function SampleConstellation() {
  const cx = 200, cy = 200, r = 140;
  const n = 8;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const angles = Array.from({ length: n }, (_, i) => (i * 360) / n - 90);
  const pt = (score: number, idx: number) => ({
    x: cx + score * r * Math.cos(toRad(angles[idx])),
    y: cy + score * r * Math.sin(toRad(angles[idx])),
  });

  const scores = [0.85, 0.80, 0.50, 0.85, 0.80, 0.60, 0.45, 0.80];
  const dataPoints = scores.map((s, i) => pt(s, i));
  const dataPolygon = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const gridPolygons = [0.25, 0.5, 0.75, 1.0].map(scale =>
    Array.from({ length: n }, (_, i) => pt(scale, i))
      .map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  );

  // Both poles per axis: outer = high pole, inner = low pole
  const outerLabels = ["Stability", "Federal",  "National",  "Rules",    "Markets",  "Pragmatism", "Individual", "Trust"];
  const innerLabels = ["Change",    "Local",     "Global",    "Outcomes", "Governance","Idealism",  "Collective", "Skepticism"];
  const outerR = r + 22;
  const innerR = 22; // near center, opposite direction

  const outerPts = angles.map(a => ({
    x: cx + outerR * Math.cos(toRad(a)),
    y: cy + outerR * Math.sin(toRad(a)),
  }));
  // inner label sits just past center in the OPPOSITE direction
  const innerPts = angles.map(a => ({
    x: cx + innerR * Math.cos(toRad(a + 180)),
    y: cy + innerR * Math.sin(toRad(a + 180)),
  }));

  const anchor = (x: number) => x < cx - 8 ? "end" : x > cx + 8 ? "start" : "middle";

  return (
    <svg viewBox="0 0 400 400" width="360" height="360" style={{ display: "block", margin: "0 auto" }}>
      {/* Grid */}
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(107,159,234,0.12)" strokeWidth="1" />
      ))}
      {/* Axis lines */}
      {angles.map((_, i) => {
        const end = pt(1, i);
        return <line key={i} x1={cx} y1={cy} x2={end.x.toFixed(1)} y2={end.y.toFixed(1)} stroke="rgba(107,159,234,0.18)" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <polygon points={dataPolygon} fill="rgba(107,159,234,0.2)" stroke="#6B9FEA" strokeWidth="2" strokeLinejoin="round" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4" fill="#6B9FEA" />
      ))}
      {/* Outer pole labels (high pole) */}
      {outerPts.map((p, i) => (
        <text key={i} x={p.x.toFixed(1)} y={(p.y + 4).toFixed(1)}
          textAnchor={anchor(p.x)} fontSize="11" fontWeight="600"
          fill="rgba(232,228,218,0.85)" fontFamily="DM Sans, sans-serif">
          {outerLabels[i]}
        </text>
      ))}
      {/* Inner pole labels (low/opposite pole) — muted, tiny */}
      {innerPts.map((p, i) => (
        <text key={i} x={p.x.toFixed(1)} y={(p.y + 3).toFixed(1)}
          textAnchor={anchor(p.x)} fontSize="8"
          fill="rgba(232,228,218,0.3)" fontFamily="DM Sans, sans-serif">
          {innerLabels[i]}
        </text>
      ))}
    </svg>
  );
}

// ── Card component with flip ─────────────────────────────────────────────────
function TypeCard({ type }: { type: typeof types[0] }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(f => !f)}
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
          <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text-muted)", margin: 0, textAlign: "right", opacity: 0.5 }}>
            flip →
          </p>
        </div>

        {/* Back */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          backgroundColor: "var(--color-bg-deep, #0f1f33)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-muted)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", margin: 0 }}>
            Real-world examples
          </p>
          {type.politicians.map(p => (
            <div key={p.name} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
              <span style={{
                flexShrink: 0,
                backgroundColor: p.party === "R" ? "rgba(212,64,53,0.15)" : "rgba(107,159,234,0.15)",
                color: p.party === "R" ? "var(--color-red)" : "var(--color-blue-accent)",
                border: `1px solid ${p.party === "R" ? "rgba(212,64,53,0.3)" : "rgba(107,159,234,0.3)"}`,
                borderRadius: "var(--radius-full)",
                padding: "1px 8px",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-micro)",
                fontWeight: "var(--weight-semibold)",
              }}>{p.party}</span>
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-small)", color: "var(--color-text-primary)", margin: 0 }}>{p.name}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.4" }}>{p.note}</p>
              </div>
            </div>
          ))}
          <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text-muted)", margin: "auto 0 0 0", textAlign: "right", opacity: 0.5 }}>
            ← flip back
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CivicMantlePage() {
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
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
          The Bedrock quiz maps your values across eight dimensions — stability vs. change, local vs. federal, rules vs. outcomes, and five more. The result: one primary Civic Mantle and up to three secondary affinities.
        </p>
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
          {types.map(t => <TypeCard key={t.label} type={t} />)}
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
            <SampleConstellation />
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
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)", lineHeight: "var(--leading-tight)" }}>
          Ready to find yours?
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", marginBottom: "var(--space-8)" }}>
          Twenty questions. Your constellation. One mantle — and the affinities that come with it.
        </p>
        <Link href="/quiz" style={{ display: "inline-block", backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body)", padding: "var(--space-4) var(--space-8)", borderRadius: "var(--btn-radius)", textDecoration: "none" }}>
          Find your Civic Mantle →
        </Link>
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
