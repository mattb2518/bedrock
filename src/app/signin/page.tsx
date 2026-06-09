"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

const inputStyle = {
  width: "100%",
  backgroundColor: "var(--color-bg-deep, #0f1f33)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-3) var(--space-4)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-body)",
  color: "var(--color-text-primary)",
  outline: "none",
  boxSizing: "border-box" as const,
};

const btnPrimary = {
  width: "100%",
  backgroundColor: "var(--color-red)",
  color: "#fff",
  fontFamily: "var(--font-body)",
  fontWeight: "var(--weight-semibold)",
  fontSize: "var(--text-body)",
  padding: "var(--space-3) var(--space-4)",
  borderRadius: "var(--btn-radius)",
  border: "none",
  cursor: "pointer",
};

const btnSecondary = {
  width: "100%",
  backgroundColor: "transparent",
  color: "var(--color-text-secondary)",
  fontFamily: "var(--font-body)",
  fontWeight: "var(--weight-medium)",
  fontSize: "var(--text-body)",
  padding: "var(--space-3) var(--space-4)",
  borderRadius: "var(--btn-radius)",
  border: "1px solid var(--color-border)",
  cursor: "pointer",
};

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(urlError === "auth_callback_failed" ? "Sign-in link expired or invalid. Try again." : "");
  const [magicSent, setMagicSent] = useState(false);

  const supabase = createClient();

  async function handlePasswordSignIn(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push(next);
    router.refresh();
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setMagicSent(true);
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  if (magicSent) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h4)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>Check your email.</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
          We sent a sign-in link to <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>. Click it to sign in — no password needed.
        </p>
        <button onClick={() => { setMagicSent(false); setEmail(""); }} style={{ ...btnSecondary, marginTop: "var(--space-5)" }}>
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Google SSO */}
      <button onClick={handleGoogle} disabled={loading} style={{ ...btnSecondary, display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
        <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>or</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-5)", backgroundColor: "var(--color-bg-deep, #0f1f33)", borderRadius: "var(--radius-md)", padding: "var(--space-1)" }}>
        {(["password", "magic"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "var(--space-2)", border: "none", borderRadius: "var(--radius-sm, 4px)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-medium)", backgroundColor: mode === m ? "var(--color-bg-surface)" : "transparent", color: mode === m ? "var(--color-text-primary)" : "var(--color-text-muted)", transition: "all 0.15s ease" }}>
            {m === "password" ? "Password" : "Magic link"}
          </button>
        ))}
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePasswordSignIn} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-secondary)", display: "block", marginBottom: "var(--space-2)" }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-secondary)", display: "block", marginBottom: "var(--space-2)" }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </div>
          {error && <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-red)" }}>{error}</p>}
          <button type="submit" disabled={loading} style={btnPrimary}>{loading ? "Signing in…" : "Sign in →"}</button>
        </form>
      ) : (
        <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-secondary)", display: "block", marginBottom: "var(--space-2)" }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", lineHeight: "var(--leading-relaxed)" }}>We'll email you a one-click sign-in link. No password needed.</p>
          {error && <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-red)" }}>{error}</p>}
          <button type="submit" disabled={loading} style={btnPrimary}>{loading ? "Sending…" : "Send magic link →"}</button>
        </form>
      )}
    </>
  );
}

export default function SignInPage() {
  return (
    <div style={{ maxWidth: "400px", margin: "var(--space-16) auto", padding: "0 var(--space-6)" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)", textAlign: "center" }}>Welcome back</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", marginBottom: "var(--space-8)", textAlign: "center", lineHeight: "var(--leading-tight)" }}>Sign in to Bedrock</h1>
      <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)" }}>
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", textAlign: "center", marginTop: "var(--space-6)" }}>
        Don't have an account? <Link href="/signup" style={{ color: "var(--color-blue-accent)" }}>Create one</Link>
      </p>
    </div>
  );
}
