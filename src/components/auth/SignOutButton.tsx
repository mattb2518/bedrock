"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
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
      }}
    >
      Sign out
    </button>
  );
}
