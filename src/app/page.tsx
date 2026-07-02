import HomeContent from "@/components/home/HomeContent";
import OnboardingTour from "@/components/ui/OnboardingTour";

export default function Home() {
  return (
    <>
      <OnboardingTour />
      <HomeContent />
      {/* ── Tagline band ──────────────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-bg-page)", borderTop: "1px solid var(--color-border)", padding: "var(--space-12) var(--space-6)", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "22px", color: "var(--color-gold)", marginBottom: "var(--space-3)" }}>
          &ldquo;Not red, not blue — red, white, and blue.&rdquo;
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>
          From the{" "}
          <a href="https://www.countryoverself.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-secondary)" }}>
            <em>Country Over Self</em>
          </a>{" "}
          podcast.
        </p>
      </section>
    </>
  );
}
