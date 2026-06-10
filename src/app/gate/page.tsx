"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GateForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, from }),
      });
      const data = await res.json();
      if (data.success) {
        // Full-document navigation (not router.push) so the request that hits
        // the middleware is guaranteed to carry the just-set gate cookie.
        // A soft navigation can race the Set-Cookie commit on iOS Safari.
        window.location.assign(from);
      } else {
        setError("That's not it. Try again.");
        setPassword("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          style={{
            width: "100%",
            backgroundColor: "var(--color-bg-deep)",
            border: `1px solid ${error ? "var(--color-red)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body)",
            color: "var(--color-text-primary)",
            outline: "none",
            boxSizing: "border-box" as const,
            textAlign: "center" as const,
            letterSpacing: "var(--tracking-wider)",
          }}
        />
        {error && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-red)", textAlign: "center", marginTop: "var(--space-2)" }}>{error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !password}
        style={{
          backgroundColor: loading || !password ? "var(--color-bg-surface)" : "var(--color-red)",
          color: loading || !password ? "var(--color-text-muted)" : "#fff",
          fontFamily: "var(--font-body)",
          fontWeight: "var(--weight-semibold)",
          fontSize: "var(--text-body)",
          padding: "var(--space-3) var(--space-4)",
          borderRadius: "var(--btn-radius)",
          border: "none",
          cursor: loading || !password ? "default" : "pointer",
          transition: "background-color 0.15s ease",
        }}
      >
        {loading ? "Checking…" : "Enter →"}
      </button>
    </form>
  );
}

export default function GatePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-6)" }}>
      <div style={{ maxWidth: "360px", width: "100%", textAlign: "center" }}>
        {/* Wordmark */}
        <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "var(--space-8)" }}>
          bedrock
          <span style={{ color: "var(--color-gold)", fontSize: "var(--text-body)", fontWeight: "400", marginLeft: "2px" }}>.guide</span>
        </div>

        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", marginBottom: "var(--space-8)", lineHeight: "var(--leading-relaxed)" }}>
          This site is in private preview.
        </p>

        <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)" }}>
          <Suspense>
            <GateForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
