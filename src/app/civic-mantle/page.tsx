const types = [
  {
    label: "The Honest Broker",
    workingName: "Pragmatic Constitutionalist",
    oneLiner: "Plays by the rules — and expects everyone else to.",
    dimensions: ["Stability", "Federal", "Rules", "Markets", "Trust"],
  },
  {
    label: "The System Fixer",
    workingName: "Independent Architect",
    oneLiner: "Not left or right — just tired of broken machinery.",
    dimensions: ["Change", "Outcomes", "Pragmatism", "Skepticism"],
  },
  {
    label: "The Long Gamer",
    workingName: "Principled Globalist",
    oneLiner: "Thinks in decades and across borders.",
    dimensions: ["Global", "Idealism", "Collective", "Federal"],
  },
  {
    label: "The Good Neighbor",
    workingName: "Rooted Pragmatist",
    oneLiner: "Believes the best solutions start closest to home.",
    dimensions: ["Local", "Pragmatism", "Collective", "Stability"],
  },
  {
    label: "The Missourian",
    workingName: "Constructive Skeptic",
    oneLiner: "You'll believe it when you see it — and you're usually right.",
    dimensions: ["Skepticism", "Outcomes", "Pragmatism", "Individual"],
  },
  {
    label: "The Eternal Optimist",
    workingName: "Civic Optimist",
    oneLiner: "Democracy is messy and you're here for all of it.",
    dimensions: ["Trust", "Change", "Collective", "Idealism"],
  },
  {
    label: "The Steward",
    workingName: "Steady Steward",
    oneLiner: "Someone has to protect what works — you volunteered.",
    dimensions: ["Stability", "Rules", "Trust", "Local"],
  },
  {
    label: "The Free Agent",
    workingName: "Sovereign Independent",
    oneLiner: "Never fit a box and stopped trying.",
    dimensions: ["Individual", "Skepticism", "Local", "Markets"],
  },
  {
    label: "The Standard Bearer",
    workingName: "Principled Institutionalist",
    oneLiner: "The institutions aren't perfect, but they're what we've got.",
    dimensions: ["Rules", "Trust", "Global", "Idealism", "Federal"],
  },
  {
    label: "The Pioneer",
    workingName: "Growth-First Independent",
    oneLiner: "Progress is possible, and you know how to build it.",
    dimensions: ["Change", "Markets", "National", "Pragmatism"],
  },
];

const dimensions = [
  { a: "Stability", b: "Change" },
  { a: "Local", b: "Federal" },
  { a: "National", b: "Global" },
  { a: "Rules", b: "Outcomes" },
  { a: "Markets", b: "Governance" },
  { a: "Pragmatism", b: "Idealism" },
  { a: "Individual", b: "Collective" },
  { a: "Trust", b: "Skepticism" },
];

// Static radar chart for "The Honest Broker" as a sample constellation
// 8 axes, center (150,150), max radius 100
// Scores: Stability=0.85, Federal=0.80, National=0.50, Rules=0.85,
//         Markets=0.80, Pragmatism=0.60, Individual=0.45, Trust=0.80
function SampleConstellation() {
  const cx = 150, cy = 150, r = 100;
  const n = 8;
  const angles = Array.from({ length: n }, (_, i) => (i * 360) / n - 90);
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const pt = (score: number, idx: number) => {
    const a = toRad(angles[idx]);
    return { x: cx + score * r * Math.cos(a), y: cy + score * r * Math.sin(a) };
  };
  const gridPt = (scale: number, idx: number) => pt(scale, idx);

  const scores = [0.85, 0.80, 0.50, 0.85, 0.80, 0.60, 0.45, 0.80];
  const dataPoints = scores.map((s, i) => pt(s, i));
  const dataPolygon = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = gridLevels.map(scale =>
    Array.from({ length: n }, (_, i) => gridPt(scale, i))
      .map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  );

  const axisLabels = ["Stability", "Federal", "National", "Rules", "Markets", "Pragmatism", "Individual", "Trust"];
  const labelR = 118;
  const labelPts = angles.map(a => ({
    x: cx + labelR * Math.cos(toRad(a)),
    y: cy + labelR * Math.sin(toRad(a)),
  }));

  const textAnchor = (x: number) => x < cx - 5 ? "end" : x > cx + 5 ? "start" : "middle";

  return (
    <svg viewBox="0 0 300 300" width="300" height="300" style={{ display: "block", margin: "0 auto" }}>
      {/* Grid polygons */}
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(107,159,234,0.15)" strokeWidth="1" />
      ))}
      {/* Axis lines */}
      {angles.map((_, i) => {
        const end = pt(1, i);
        return <line key={i} x1={cx} y1={cy} x2={end.x.toFixed(1)} y2={end.y.toFixed(1)} stroke="rgba(107,159,234,0.2)" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="rgba(107,159,234,0.25)"
        stroke="#6B9FEA"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3.5" fill="#6B9FEA" />
      ))}
      {/* Axis labels */}
      {labelPts.map((p, i) => (
        <text
          key={i}
          x={p.x.toFixed(1)}
          y={(p.y + 4).toFixed(1)}
          textAnchor={textAnchor(p.x)}
          fontSize="9"
          fill="rgba(232,228,218,0.6)"
          fontFamily="DM Sans, sans-serif"
        >
          {axisLabels[i]}
        </text>
      ))}
    </svg>
  );
}

export default function CivicMantlePage() {
  return (
    <div style={{ maxWidth: "var(--max-width-full)", margin: "0 auto", padding: "var(--space-16) var(--space-6)" }}>

      {/* ── Hero ─────────────────────────────────────────── */}
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
          The Bedrock quiz maps your values across eight dimensions. The result: one primary Civic Mantle and up to three secondary affinities — a profile as specific as a fingerprint.
        </p>
      </div>

      {/* ── Eight Dimensions ─────────────────────────────── */}
      <div style={{ marginBottom: "var(--space-16)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
          The eight dimensions
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", marginBottom: "var(--space-6)", maxWidth: "560px" }}>
          Every question in the quiz loads onto one or more of these axes. Your position on each one shapes which mantle fits.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          {dimensions.map((d) => (
            <div key={d.a} style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-full)", padding: "var(--space-2) var(--space-4)", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
              <span style={{ color: "var(--color-text-primary)", fontWeight: "var(--weight-medium)" }}>{d.a}</span>
              <span style={{ color: "var(--color-text-muted)", margin: "0 6px" }}>↔</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: "var(--weight-medium)" }}>{d.b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Type Cards ───────────────────────────────────── */}
      <div style={{ marginBottom: "var(--space-16)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-2)" }}>
          The Civic Mantle Directory
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", marginBottom: "var(--space-8)", maxWidth: "560px" }}>
          Ten types. You'll recognize yourself in yours — and probably see people you know in the others.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "var(--space-4)" }}>
          {types.map((t) => (
            <div
              key={t.label}
              style={{
                backgroundColor: "var(--color-bg-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              {/* Label */}
              <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h4)", color: "var(--color-text-primary)", lineHeight: "var(--leading-tight)", margin: 0 }}>
                {t.label}
              </p>
              {/* Working name */}
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", margin: 0, letterSpacing: "0.01em" }}>
                {t.workingName}
              </p>
              {/* One-liner */}
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-gold)", lineHeight: "var(--leading-relaxed)", margin: 0, fontStyle: "italic" }}>
                {t.oneLiner}
              </p>
              {/* Dimension chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-1)" }}>
                {t.dimensions.map((d) => (
                  <span
                    key={d}
                    style={{
                      backgroundColor: "rgba(107,159,234,0.1)",
                      border: "1px solid rgba(107,159,234,0.25)",
                      borderRadius: "var(--radius-full)",
                      padding: "2px 10px",
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-micro)",
                      color: "var(--color-blue-accent)",
                      fontWeight: "var(--weight-medium)",
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", marginTop: "var(--space-6)", fontStyle: "italic" }}>
          Your result includes one primary Civic Mantle and up to three secondary affinities — because most people don't fit perfectly into one box.
        </p>
      </div>

      {/* ── Sample Constellation ─────────────────────────── */}
      <div style={{ marginBottom: "var(--space-16)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
          Your constellation
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-8)", maxWidth: "560px" }}>
          Every Civic Mantle comes with a constellation — a radar chart across all eight dimensions. The shape is yours alone. No two are identical. It's the visual proof of what makes you specific.
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
              ["Eight axes", "One spoke for each civic dimension. Length shows how strongly you lean toward one pole."],
              ["Your shape", "The polygon formed by connecting your scores is unique to you — the fingerprint of your civic identity."],
              ["Shareable", "After the quiz, your constellation is yours to share. People screenshot it. It starts conversations."],
              ["It deepens", "Your constellation updates as you complete each layer of the quiz — more questions, more precision."],
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

      {/* ── CTA ──────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-12)", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)", lineHeight: "var(--leading-tight)" }}>
          Ready to find yours?
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", marginBottom: "var(--space-8)" }}>
          Twenty questions. Your constellation. One mantle — and the affinities that come with it.
        </p>
        <a
          href="/quiz"
          style={{
            display: "inline-block",
            backgroundColor: "var(--color-red)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontWeight: "var(--weight-semibold)",
            fontSize: "var(--text-body)",
            padding: "var(--space-4) var(--space-8)",
            borderRadius: "var(--btn-radius)",
            textDecoration: "none",
          }}
        >
          Find your Civic Mantle →
        </a>
      </div>

    </div>
  );
}
