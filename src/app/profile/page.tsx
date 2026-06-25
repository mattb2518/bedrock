import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";
import ChangePassword from "@/components/auth/ChangePassword";
import ChangeEmail from "@/components/auth/ChangeEmail";
import DeleteAccount from "@/components/auth/DeleteAccount";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/profile");
  }

  const provider = user.app_metadata?.provider ?? "email";
  const joinedAt = new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div style={{ maxWidth: "var(--max-width-content)", margin: "0 auto", padding: "var(--space-16) var(--space-6)" }}>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)" }}>My Profile</p>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", color: "var(--color-text-primary)", marginBottom: "var(--space-10)", lineHeight: "var(--leading-tight)" }}>
        Your account.
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "480px" }}>

        {/* Account info */}
        <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)", marginBottom: "var(--space-4)" }}>Account</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>Email</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}>{user.email}</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>Signed in with</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-primary)", textTransform: "capitalize" }}>{provider === "google" ? "Google" : "Email & password"}</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>Member since</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}>{joinedAt}</p>
            </div>
          </div>
        </div>

        {/* Civic profile placeholder */}
        <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)", marginBottom: "var(--space-4)" }}>Civic Profile</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-4)" }}>
            Your civic type and constellation will appear here once you complete the quiz.
          </p>
          <Link href="/quiz" style={{ backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body)", padding: "var(--space-3) var(--space-5)", borderRadius: "var(--btn-radius)", textDecoration: "none", display: "inline-block" }}>
            Take the quiz →
          </Link>
        </div>

        {/* Actions */}
        <div style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)", marginBottom: "var(--space-4)" }}>Account Actions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {provider === "google" ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", lineHeight: "var(--leading-relaxed)" }}>
                Your email and password are managed through your Google account.
              </p>
            ) : (
              <>
                <ChangePassword email={user.email ?? ""} />
                <ChangeEmail currentEmail={user.email ?? ""} />
              </>
            )}
            <SignOutButton />
            <DeleteAccount />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>
              Trouble deleting? Email <a href="mailto:hello@bedrock.guide" style={{ color: "var(--color-blue-accent)" }}>hello@bedrock.guide</a> and we'll handle it within 24 hours.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
