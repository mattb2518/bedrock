import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileAccordion from "@/components/profile/ProfileAccordion";

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

      <ProfileAccordion email={user.email ?? ""} provider={provider} joinedAt={joinedAt} />
    </div>
  );
}
