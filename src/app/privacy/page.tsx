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
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-3)" }}>Your quiz answers, your profile (Civic Mantle + dimensional scores), your account information (email, password), and your activity on the platform (searches, ballot guides saved, conversations). That's it.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>We do not collect browsing history outside Bedrock. We do not collect your location. We do not track you across other sites.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>What we use it for.</h2>
          {[
            ["Powering your experience", "Your quiz results are used to build Your Ballot & Your Officials, Your Media Diet, and Your Conversations. That's the whole point."],
            ["Finding your districts", "Your address is used to find your congressional and state legislative districts, then stored in your profile so you don't have to re-enter it. It is never sold, shared, or used for anything outside district lookup."],
            ["Your conversations", "Your Mantle, your issue positions, and your voting priorities give Claude context about where you're coming from. Your age, your location, and your region are never used — the tool treats you as a thinking person, not a demographic."],
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
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginTop: "var(--space-2)" }}>Your conversations start fresh every time. We don't build a history of what you discussed, who you discussed it with, or what advice you received. What happens in a conversation stays in that conversation.</p>
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
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Google Sign-In.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>You can create an account and sign in using Google. This is entirely your choice — email and password (or a magic link) work just as well. If you use Google Sign-In, Google will know that you authenticated with Bedrock. We have no control over what Google does with that signal. If that concerns you — and given the nature of this platform, it's a reasonable concern — use email instead. We won't treat you differently either way.</p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Exactly two cookies.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
            Bedrock uses two cookies. One is a strictly necessary authentication cookie that keeps you signed in — without it the product doesn&apos;t work. The other is Plausible Analytics, which is cookieless by design and collects no personal data. We don&apos;t use advertising cookies, tracking cookies, or any third-party cookies. If you have questions about our cookie practices, email <a href="mailto:hello@bedrock.guide" style={{ color: "var(--color-blue-accent)" }}>hello@bedrock.guide</a>.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>Your data, exported.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-4)" }}>
            You can download your complete profile as a plain-text <code style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "var(--text-small)", backgroundColor: "var(--color-bg-surface)", padding: "1px 5px", borderRadius: "var(--radius-sm)" }}>.txt</code> file from the My Profile page.
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)", marginBottom: "var(--space-2)" }}>The export includes</p>
          <ul style={{ margin: "0 0 var(--space-4)", paddingLeft: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            {[
              "Civic Mantle type and one-liner",
              "All eight dimensional scores with labels and pole descriptions",
              "Secondary type(s) if any",
              "Layer 2 issue positions (if completed)",
              "Layer 3 priority intensity and behavioral modifiers (if completed)",
              "Layer 4 dealbreaker selections (if completed)",
              "Demographic module responses (if completed)",
              "Quiz completion percentage and last updated date",
            ].map((item) => (
              <li key={item} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)" }}>{item}</li>
            ))}
          </ul>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)", marginBottom: "var(--space-2)" }}>The export does NOT include</p>
          <ul style={{ margin: 0, paddingLeft: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            {[
              "Conversation history (not stored — each session starts fresh)",
              "Feedback submitted on candidates or sources (product data, not profile data)",
            ].map((item) => (
              <li key={item} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)" }}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>On Claude.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-3)" }}>
            Several features on Bedrock — Your Conversations, the Article Bias Checker, and our candidate and media classification — are powered by Claude, an AI made by Anthropic. When you use these features, your content is sent to Anthropic&apos;s API.
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
            Under Anthropic&apos;s current API policy, your inputs and outputs are not used to train Anthropic&apos;s models, and are deleted from their servers within 7 days. Bedrock does not store your Conversations content at all — each session starts fresh. For more detail, see{' '}
            <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-blue-accent)" }}>Anthropic&apos;s privacy policy at anthropic.com/privacy</a>.
          </p>
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
