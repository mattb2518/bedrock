export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "var(--max-width-content)", margin: "0 auto", padding: "var(--space-16) var(--space-6)" }}>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)" }}>Privacy &amp; Data</p>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", color: "var(--color-text-primary)", marginBottom: "var(--space-6)", lineHeight: "var(--leading-tight)" }}>
        There's got to be a better way to handle your data.
      </h1>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-12)" }}>
        Bedrock knows where you stand politically. That's unusually sensitive information. Here is exactly what we do with it — and what we never do.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-10)" }}>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>What we collect.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-3)" }}>Your quiz answers, your profile (civic type + dimensional scores), your account information (email, password), and your activity on the platform (searches, ballot guides saved, conversations). That's it.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>We do not collect browsing history outside Bedrock. We do not collect your location. We do not track you across other sites.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>What we use it for.</h2>
          {[
            ["Powering your experience", "Your quiz results are used to build Your Ballot, Your Media Diet, and Your Conversations. That's the whole point."],
            ["Improving the platform", "Aggregate, anonymous patterns help us improve questions, scoring, and recommendations. Individual profiles are never used for this."],
            ["Contacting you", "Only for account-related communication (password reset, significant platform changes). No marketing email without your explicit opt-in."],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div style={{ width: "4px", backgroundColor: "var(--color-blue-accent)", borderRadius: "var(--radius-full)", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--space-1)", fontSize: "var(--text-body)" }}>{title}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>What we never do. Period.</h2>
          <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
            {[
              "Sell your data to anyone.",
              "Share your profile with political parties, campaigns, PACs, or advocacy organizations.",
              "Use your data for ad targeting — ours or anyone else's.",
              "Build a political advertising profile from your data.",
              "Allow third-party tracking scripts on this platform. (Analytics: Plausible only, privacy-first, no Google Analytics.)",
              "Change these commitments retroactively without user notification and opt-out.",
            ].map((item) => (
              <div key={item} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                <span style={{ color: "var(--color-red)", fontWeight: "var(--weight-bold)", flexShrink: 0, lineHeight: "var(--leading-normal)" }}>✕</span>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Exactly two cookies.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-4)" }}>We set exactly two cookies. No third-party cookies. No tracking pixels. No fingerprinting.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[
              ["Session cookie", "Keeps you logged in. Expires when you close your browser or after 30 days of inactivity. Essential."],
              ["Quiz progress cookie", "Saves your progress so you can continue where you left off without an account. Expires after 90 days. Functional."],
            ].map(([name, desc]) => (
              <div key={name} style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4) var(--space-5)" }}>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--space-1)", fontSize: "var(--text-body)" }}>{name}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Your rights.</h2>
          {[
            ["See your data", "Download a complete copy of everything we hold on you at any time, from your profile settings."],
            ["Correct your data", "Update your profile, retake the quiz, change your account information whenever you want."],
            ["Delete your data", "Delete your account and all associated data completely and permanently. One click, no waiting, no re-engagement emails. The data is gone."],
          ].map(([right, desc]) => (
            <div key={right} style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div style={{ width: "4px", backgroundColor: "var(--color-gold)", borderRadius: "var(--radius-full)", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--space-1)", fontSize: "var(--text-body)" }}>{right}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Questions.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
            <a href="mailto:hello@bedrock.guide" style={{ color: "var(--color-blue-accent)" }}>hello@bedrock.guide</a>. A human reads it.
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>Last updated: June 2026. Any material changes will be communicated to active users via email before taking effect.</p>
        </section>

      </div>
    </div>
  );
}
