"use client";
import { useState } from "react";

const faqs = [
  {
    q: "Is Bedrock liberal or conservative?",
    a: "Neither. That's the whole point. Bedrock doesn't have a political position — it has a methodology. The eight dimensions were designed so that both poles have defensible, honorable positions. We've run the \"partisan smell test\" on every question: if either side feels obviously right or wrong, we rewrote it. Read the full methodology to see how we checked our work.",
  },
  {
    q: "Who built this and why?",
    a: "Matt Blumberg — technology entrepreneur, registered independent, frustrated with the political options available to voters who don't fit neatly in either party. No political backers, no institutional agenda. A person who got frustrated enough to build something. Read the full story on the About page.",
  },
  {
    q: "Who funds Bedrock?",
    a: "Right now: Matt personally. No political parties, PACs, political donors, advertising, or any organization with a stake in where you land will ever fund this. If and when the platform grows, the plan is small user donations and nonpartisan civic foundation grants — with full financial transparency.",
  },
  {
    q: "How is Bedrock different from other political quizzes?",
    a: "Most civic quizzes put you on a single left-right spectrum and call it a day. Bedrock maps you across eight independent dimensions of civic identity — real tensions that every thoughtful voter navigates. The result isn't a party label or a left-right score. It's a multidimensional profile. We also let you say 'it depends' and actually follow up on that — because for independent-minded voters, 'it depends' is often the honest answer.",
  },
  {
    q: "What is a civic type?",
    a: "Your civic type is a named summary of your eight-dimensional profile — one of ten types that captures where you tend to cluster across the dimensions. Think of it like a personality type, but for your political identity. It's a shortcut for communication, not a box. Your full constellation (the radar chart) is more precise. The type is just the plain-English version.",
  },
  {
    q: "Do I have to create an account?",
    a: "No — you can take the quiz and see your results without an account. But to save your profile, access Your Ballot, Your Media Diet, and Your Conversations, and return to your results later, you'll need to create one. Account creation is free and requires only an email and password.",
  },
  {
    q: "What do you do with my quiz answers?",
    a: "Use them to power your experience — Your Ballot, Your Media Diet, Your Conversations. That's it. We never sell your data, share your profile with political organizations, or use it for advertising. The full privacy policy is on the Privacy & Data page.",
  },
  {
    q: "Can I update my profile over time?",
    a: "Yes. You can retake individual layers, update specific answers, or restart entirely. Your profile should evolve as you do. The platform is designed to grow with you, not pin you to a moment in time.",
  },
  {
    q: "What if I genuinely don't know where I stand on something?",
    a: "That's a legitimate answer, and the quiz handles it. You can skip questions you're genuinely uncertain about, and they're treated differently in scoring than questions where you answered confidently. Forced answers are worse than honest abstentions.",
  },
  {
    q: "What is 'Your Ballot' exactly?",
    a: "A personalized voter guide — every race on your ballot, with candidates matched to your civic values across the eight dimensions. The goal is to help you vote your actual values rather than a party line. It's printable and saveable for election day.",
  },
  {
    q: "What is 'Your Media Diet'?",
    a: "A three-tier media recommendation: sources that deepen what you already know, sources that expand how you think, and sources that constructively challenge you. The tiers are matched to your profile, not just generic 'read across the aisle' advice.",
  },
  {
    q: "What is 'Your Conversations'?",
    a: "Claude-powered preparation for difficult political conversations with people who see things differently. Know where you stand. Understand where they're likely coming from. Navigate the disagreement productively rather than defensively. It's not debate prep — it's bridge-building prep.",
  },
  {
    q: "Is Bedrock available outside the US?",
    a: "The current version is US-focused — the ballot guide requires US races and the framework is built around American civic tensions. International versions are possible long-term, but not in the current roadmap.",
  },
  {
    q: "How do I contact you?",
    a: "hello@bedrock.guide. A human reads it.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--color-border)" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "var(--space-5) 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)" }}
      >
        <span style={{ fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", fontSize: "var(--text-body)", lineHeight: "var(--leading-normal)" }}>{q}</span>
        <span style={{ color: "var(--color-gold)", fontSize: "var(--text-h4)", flexShrink: 0, lineHeight: 1 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", paddingBottom: "var(--space-5)" }}>{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div style={{ maxWidth: "var(--max-width-content)", margin: "0 auto", padding: "var(--space-16) var(--space-6)" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)" }}>FAQ</p>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", color: "var(--color-text-primary)", marginBottom: "var(--space-6)", lineHeight: "var(--leading-tight)" }}>
        Questions.
      </h1>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-12)" }}>
        If yours isn't here, <a href="mailto:hello@bedrock.guide" style={{ color: "var(--color-blue-accent)" }}>hello@bedrock.guide</a>. A human reads it.
      </p>

      <div>
        {faqs.map((item) => (
          <FAQItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
