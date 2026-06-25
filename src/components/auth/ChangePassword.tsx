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

export default function ChangePassword({ email }: { email: string }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("New passwords don't match."); return; }
    if (next === current) { setError("New password must be different from your current one."); return; }
    setLoading(true);
    // Re-verify the current password before allowing a change.
    const { error: verifyErr } = await supabase.auth.signInWithPassword({ email, password: current });
    if (verifyErr) { setError("Your current password is incorrect."); setLoading(false); return; }
    const { error: updateErr } = await supabase.auth.updateUser({ password: next });
    if (updateErr) { setError(updateErr.message); setLoading(false); return; }
    setLoading(false);
    setDone(true);
    setCurrent(""); setNext(""); setConfirm("");
  }

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setDone(false); setError(""); }} style={btnSecondary}>
        Change password
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-secondary)" }}>Change password</p>
      <input type="password" required placeholder="Current password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} style={inputStyle} />
      <input type="password" required placeholder="New password" autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} style={inputStyle} />
      <input type="password" required placeholder="Confirm new password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} style={inputStyle} />
      {error && <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-red)" }}>{error}</p>}
      {done && <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>Password updated. You'll get a confirmation email.</p>}
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button type="submit" disabled={loading} style={btnPrimary}>{loading ? "Saving…" : "Save password"}</button>
        <button type="button" onClick={() => { setOpen(false); setError(""); }} style={{ ...btnSecondary, width: "auto", textAlign: "center" }}>Cancel</button>
      </div>
    </form>
  );
}
