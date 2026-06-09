import Link from "next/link";

export default function QuizPage() {
  return (
    <div style={{ maxWidth: "var(--max-width-content)", margin: "0 auto", padding: "var(--space-16) var(--space-6)", textAlign: "center" }}>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)" }}>The Quiz</p>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", color: "var(--color-text-primary)", marginBottom: "var(--space-6)", lineHeight: "var(--leading-tight)" }}>
        Find your bedrock.
      </h1>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-4)", maxWidth: "560px", margin: "0 auto var(--space-4)" }}>
        A four-layer conversation about what you actually believe. No left-right spectrum. Eight real dimensions. Your civic identity, finally.
      </p>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-muted)", marginBottom: "var(--space-10)", fontStyle: "italic" }}>
        The quiz is coming soon. Leave your email to be notified when it launches.
      </p>

      {/* Notify form placeholder */}
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap", marginBottom: "var(--space-12)" }}>
        <input
          type="email"
          placeholder="your@email.com"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--btn-radius)",
            padding: "var(--btn-padding-y) var(--btn-padding-x)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body)",
            color: "var(--color-text-primary)",
            minWidth: "280px",
            outline: "none",
          }}
        />
        <button style={{ backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body)", padding: "var(--btn-padding-y) var(--btn-padding-x)", borderRadius: "var(--btn-radius)", border: "none", cursor: "pointer" }}>
          Notify me →
        </button>
      </div>

      {/* Layer preview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)", textAlign: "left", marginBottom: "var(--space-12)" }}>
        {[
          { num: "1", label: "Your values foundation", time: "~8 min", desc: "Twenty questions at the level of principle. Ends with your constellation appearing for the first time." },
          { num: "2", label: "Your real-world positions", time: "~6 min", desc: "Eight policy questions and real events — designed to produce cross-partisan discomfort." },
          { num: "3", label: "What drives your vote", time: "~5 min", desc: "Voting behavior, priority intensity, and what's actually shaped your choices." },
          { num: "4", label: "Where you draw the line", time: "~4 min", desc: "The dealbreakers. Most civic tools never ask. They're often the most predictive of all." },
        ].map((layer) => (
          <div key={layer.num} style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
              <div style={{ backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: "700", width: "28px", height: "28px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-small)", flexShrink: 0 }}>{layer.num}</div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>{layer.time}</span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", fontSize: "var(--text-body)", marginBottom: "var(--space-2)" }}>{layer.label}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{layer.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-8)" }}>
        <Link href="/how-it-works" style={{ color: "var(--color-blue-accent)", fontFamily: "var(--font-body)", fontSize: "var(--text-body)" }}>
          How the quiz works →
        </Link>
      </div>
    </div>
  );
}
