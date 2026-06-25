"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

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
  flex: 1,
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
  textAlign: "left" as const,
};

export default function ChangeEmail({ currentEmail }: { currentEmail: string }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (email.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setError("That's already your email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false);
    setSent(true);
  }

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setSent(false); setError(""); }} style={btnSecondary}>
        Change email
      </button>
    );
  }

  if (sent) {
    return (
      <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
          Almost done — we sent a confirmation link to <strong style={{ color: "var(--color-text-primary)" }}>{email.trim()}</strong>. Your email changes once you click it.
        </p>
        <button onClick={() => { setOpen(false); setSent(false); setEmail(""); }} style={{ ...btnSecondary, textAlign: "center" }}>Done</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-secondary)" }}>Change email</p>
      <input type="email" required placeholder="New email address" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
      {error && <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-red)" }}>{error}</p>}
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button type="submit" disabled={loading} style={btnPrimary}>{loading ? "Sending…" : "Send confirmation"}</button>
        <button type="button" onClick={() => { setOpen(false); setError(""); }} style={{ ...btnSecondary, width: "auto", textAlign: "center" }}>Cancel</button>
      </div>
    </form>
  );
}
