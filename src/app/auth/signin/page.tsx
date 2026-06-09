import Link from "next/link";

export default function SignInPage() {
  return (
    <div style={{ maxWidth: "400px", margin: "var(--space-16) auto", padding: "0 var(--space-6)" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)", textAlign: "center" }}>Welcome back</p>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", marginBottom: "var(--space-8)", textAlign: "center", lineHeight: "var(--leading-tight)" }}>
        Sign in to Bedrock
      </h1>

      <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)" }}>
        <form style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-secondary)", display: "block", marginBottom: "var(--space-2)" }}>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              style={{ width: "100%", backgroundColor: "var(--color-bg-deep)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)", fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-secondary)", display: "block", marginBottom: "var(--space-2)" }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              style={{ width: "100%", backgroundColor: "var(--color-bg-deep)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)", fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            style={{ backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--btn-radius)", border: "none", cursor: "pointer", marginTop: "var(--space-2)" }}
          >
            Sign in →
          </button>
        </form>

        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", textAlign: "center", marginTop: "var(--space-6)" }}>
          Don't have an account?{" "}
          <Link href="/auth/signup" style={{ color: "var(--color-blue-accent)" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
