"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const dangerOutline = {
  width: "100%",
  backgroundColor: "transparent",
  color: "var(--color-red)",
  fontFamily: "var(--font-body)",
  fontWeight: "var(--weight-medium)",
  fontSize: "var(--text-body)",
  padding: "var(--space-3) var(--space-4)",
  borderRadius: "var(--btn-radius)",
  border: "1px solid var(--color-red)",
  cursor: "pointer",
  textAlign: "left" as const,
};

const dangerSolid = {
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

export default function DeleteAccount() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Something went wrong. Please try again, or email hello@bedrock.guide.");
      setLoading(false);
      return;
    }
    await supabase.auth.signOut().catch(() => {});
    router.push("/");
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setError(""); setConfirmText(""); }} style={dangerOutline}>
        Delete account
      </button>
    );
  }

  return (
    <div style={{ border: "1px solid var(--color-red)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
        This permanently deletes your account and all associated data. <strong style={{ color: "var(--color-text-primary)" }}>This can't be undone.</strong>
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>
        Type <strong style={{ color: "var(--color-text-primary)" }}>DELETE</strong> to confirm.
      </p>
      <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE" style={inputStyle} autoComplete="off" />
      {error && <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-red)" }}>{error}</p>}
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button onClick={handleDelete} disabled={loading || confirmText !== "DELETE"} style={{ ...dangerSolid, opacity: confirmText === "DELETE" && !loading ? 1 : 0.5, cursor: confirmText === "DELETE" && !loading ? "pointer" : "not-allowed" }}>
          {loading ? "Deleting…" : "Permanently delete"}
        </button>
        <button onClick={() => { setOpen(false); setConfirmText(""); setError(""); }} style={btnSecondary}>Cancel</button>
      </div>
    </div>
  );
}
