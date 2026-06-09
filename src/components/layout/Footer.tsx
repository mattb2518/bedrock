import Link from "next/link";

const columns = [
  {
    heading: "The Platform",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "The Framework", href: "/methodology" },
      { label: "Take the Quiz", href: "/quiz" },
      { label: "Your Results", href: "/results" },
    ],
  },
  {
    heading: "Features",
    links: [
      { label: "Your Ballot", href: "/ballot" },
      { label: "Your Media Diet", href: "/media" },
      { label: "Your Conversations", href: "/conversations" },
      { label: "My Profile", href: "/profile" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About Bedrock", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Privacy & Data", href: "/privacy" },
      { label: "Trust & Methodology", href: "/methodology" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "var(--color-bg-deep)",
        borderTop: "1px solid var(--color-border)",
        padding: "var(--space-16) var(--space-6) var(--space-8)",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: "var(--max-width-full)", margin: "0 auto" }}>

        {/* Top row: wordmark + columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr repeat(3, auto)",
            gap: "var(--space-12)",
            marginBottom: "var(--space-12)",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "var(--space-4)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", fontWeight: "700", color: "var(--color-text-primary)" }}>
                Bedrock
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-body)", fontWeight: "400", color: "var(--color-gold)" }}>
                .guide
              </span>
            </Link>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", lineHeight: "var(--leading-relaxed)", maxWidth: "240px" }}>
              Civic identity for independent-minded voters. Not red, not blue — red, white, and blue.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
              <a href="mailto:hello@bedrock.guide" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>hello@bedrock.guide</a>
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
                {col.heading}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {col.links.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", textDecoration: "none" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "var(--space-6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", color: "var(--color-text-muted)" }}>
            © {year} Bedrock. Independent. Nonpartisan. Yours.
          </p>
          <div style={{ display: "flex", gap: "var(--space-6)" }}>
            <Link href="/privacy" style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", color: "var(--color-text-muted)", textDecoration: "none" }}>Privacy</Link>
            <Link href="/methodology" style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", color: "var(--color-text-muted)", textDecoration: "none" }}>Methodology</Link>
            <Link href="/faq" style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", color: "var(--color-text-muted)", textDecoration: "none" }}>FAQ</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
        .footer-grid a:hover {
          color: var(--color-text-secondary) !important;
        }
      `}</style>
    </footer>
  );
}
