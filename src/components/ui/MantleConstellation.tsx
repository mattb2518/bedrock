// The ten mantles as ten constellation "fingerprints." Each is the same
// 8-dimension radar as the Civic Mantle page, scored to that mantle's
// dominant poles — so every type has a distinct shape. Label sits beneath.
// Used on the homepage as the Civic Mantle teaser. Pure CSS hover.
//
// Scores are in axis order: Stability, Federal, National, Rules, Markets,
// Pragmatism, Individual, Trust (high pole = high value, low pole = low value).

import Constellation from "@/components/ui/Constellation";

const MANTLES = [
  { label: "The Honest Broker",    scores: [0.85, 0.85, 0.50, 0.85, 0.85, 0.50, 0.50, 0.85] },
  { label: "The System Fixer",     scores: [0.18, 0.50, 0.50, 0.18, 0.50, 0.85, 0.50, 0.18] },
  { label: "The Long Gamer",       scores: [0.50, 0.85, 0.18, 0.50, 0.50, 0.18, 0.18, 0.50] },
  { label: "The Good Neighbor",    scores: [0.85, 0.18, 0.50, 0.50, 0.50, 0.85, 0.18, 0.50] },
  { label: "The Missourian",       scores: [0.50, 0.50, 0.50, 0.18, 0.50, 0.85, 0.85, 0.18] },
  { label: "The Eternal Optimist", scores: [0.18, 0.50, 0.50, 0.50, 0.50, 0.18, 0.18, 0.85] },
  { label: "The Steward",          scores: [0.85, 0.18, 0.50, 0.85, 0.50, 0.50, 0.50, 0.85] },
  { label: "The Free Agent",       scores: [0.50, 0.18, 0.50, 0.50, 0.85, 0.50, 0.85, 0.18] },
  { label: "The Standard Bearer",  scores: [0.50, 0.85, 0.18, 0.85, 0.50, 0.18, 0.50, 0.85] },
  { label: "The Pioneer",          scores: [0.18, 0.50, 0.85, 0.50, 0.85, 0.85, 0.50, 0.50] },
];

export default function MantleConstellation() {
  return (
    <div className="mantle-fingerprints">
      {MANTLES.map(m => (
        <div key={m.label} className="mantle-fp">
          <Constellation scores={m.scores} size={150} showLabels={false} showGrid={false} viewBox="70 70 260 260" />
          <span className="mantle-fp__label">{m.label}</span>
        </div>
      ))}

      <style>{`
        .mantle-fingerprints {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--space-2) var(--space-1);
          max-width: 900px;
          margin: 0 auto;
        }
        .mantle-fp {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding: var(--space-2) var(--space-1);
          border: 1px solid transparent;
          border-radius: var(--radius-lg);
          text-decoration: none;
          transition: var(--transition-base);
        }
        .mantle-fp:hover {
          background-color: var(--color-bg-surface);
          border-color: var(--color-border);
        }
        .mantle-fp__label {
          font-family: var(--font-display);
          font-size: var(--text-small);
          font-weight: 700;
          color: var(--color-text-secondary);
          text-align: center;
          line-height: var(--leading-snug);
          margin-top: -6px;
        }
        .mantle-fp:hover .mantle-fp__label {
          color: var(--color-text-primary);
        }
        @media (max-width: 900px) {
          .mantle-fingerprints { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 560px) {
          .mantle-fingerprints { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
