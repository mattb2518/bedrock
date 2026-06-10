// Civic Mantle constellation — an 8-axis radar chart.
// Each spoke is one civic dimension; the outer label is the high-score pole,
// the faint inner label is the opposite. Long spoke = strong lean.
//
// Extracted from the Civic Mantle page so the homepage and the page share
// one source of truth. Parameterize via `scores` (8 values, 0..1).

// Radar axis labels, in score order. Outer = high pole, inner = low pole.
export const DIMENSION_AXES = {
  outer: ["Stability", "Federal", "National", "Rules", "Markets", "Pragmatism", "Individual", "Trust"],
  inner: ["Change", "Local", "Global", "Outcomes", "Governance", "Idealism", "Collective", "Skepticism"],
};

// The eight dimensions as opposing-pole pairs, for spelling out in copy.
export const DIMENSION_PAIRS: [string, string][] = [
  ["Stability", "Change"],
  ["Local", "Federal"],
  ["National", "Global"],
  ["Rules", "Outcomes"],
  ["Markets", "Governance"],
  ["Pragmatism", "Idealism"],
  ["Individual", "Collective"],
  ["Trust", "Skepticism"],
];

// Sample shape — The Honest Broker.
// Stability=0.85, Federal=0.80, National=0.50, Rules=0.85,
// Markets=0.80, Pragmatism=0.60, Individual=0.45, Trust=0.80
export const SAMPLE_HONEST_BROKER = [0.85, 0.8, 0.5, 0.85, 0.8, 0.6, 0.45, 0.8];

type ConstellationProps = {
  scores?: number[];
  outerLabels?: string[];
  innerLabels?: string[];
  size?: number;
  showLabels?: boolean;
};

export default function Constellation({
  scores = SAMPLE_HONEST_BROKER,
  outerLabels = DIMENSION_AXES.outer,
  innerLabels = DIMENSION_AXES.inner,
  size = 360,
  showLabels = true,
}: ConstellationProps) {
  const cx = 200, cy = 200, r = 140;
  const n = scores.length;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const angles = Array.from({ length: n }, (_, i) => (i * 360) / n - 90);
  const pt = (score: number, idx: number) => ({
    x: cx + score * r * Math.cos(toRad(angles[idx])),
    y: cy + score * r * Math.sin(toRad(angles[idx])),
  });

  const dataPoints = scores.map((s, i) => pt(s, i));
  const dataPolygon = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const gridPolygons = [0.25, 0.5, 0.75, 1.0].map(scale =>
    Array.from({ length: n }, (_, i) => pt(scale, i))
      .map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  );

  const outerR = r + 22;
  const innerR = 22; // near center, opposite direction
  const outerPts = angles.map(a => ({
    x: cx + outerR * Math.cos(toRad(a)),
    y: cy + outerR * Math.sin(toRad(a)),
  }));
  const innerPts = angles.map(a => ({
    x: cx + innerR * Math.cos(toRad(a + 180)),
    y: cy + innerR * Math.sin(toRad(a + 180)),
  }));

  const anchor = (x: number) => (x < cx - 8 ? "end" : x > cx + 8 ? "start" : "middle");

  return (
    <svg viewBox="0 0 400 400" width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
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
      {showLabels && outerPts.map((p, i) => (
        <text key={i} x={p.x.toFixed(1)} y={(p.y + 4).toFixed(1)}
          textAnchor={anchor(p.x)} fontSize="11" fontWeight="600"
          fill="rgba(232,228,218,0.85)" fontFamily="DM Sans, sans-serif">
          {outerLabels[i]}
        </text>
      ))}
      {/* Inner pole labels (low/opposite pole) — muted, tiny */}
      {showLabels && innerPts.map((p, i) => (
        <text key={i} x={p.x.toFixed(1)} y={(p.y + 3).toFixed(1)}
          textAnchor={anchor(p.x)} fontSize="8"
          fill="rgba(232,228,218,0.3)" fontFamily="DM Sans, sans-serif">
          {innerLabels[i]}
        </text>
      ))}
    </svg>
  );
}
