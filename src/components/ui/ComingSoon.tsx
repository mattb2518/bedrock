import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description: string;
  accentColor?: string;
}

export default function ComingSoon({
  title,
  description,
  accentColor = "var(--color-gold)",
}: ComingSoonProps) {
  return (
    <div
      style={{
        maxWidth: "var(--max-width-content)",
        margin: "0 auto",
        padding: "var(--space-24) var(--space-6)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-small)",
          fontWeight: "var(--weight-semibold)",
          color: accentColor,
          letterSpacing: "var(--tracking-wider)",
          textTransform: "uppercase",
          marginBottom: "var(--space-5)",
        }}
      >
        Coming Soon
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-h1)",
          color: "var(--color-text-primary)",
          marginBottom: "var(--space-6)",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-body-lg)",
          color: "var(--color-text-secondary)",
          lineHeight: "var(--leading-relaxed)",
          maxWidth: "500px",
          margin: "0 auto var(--space-10)",
        }}
      >
        {description}
      </p>
      <Link
        href="/quiz"
        style={{
          backgroundColor: "var(--color-red)",
          color: "#ffffff",
          fontFamily: "var(--font-body)",
          fontWeight: "var(--weight-semibold)",
          padding: "var(--btn-padding-y) var(--btn-padding-x)",
          borderRadius: "var(--btn-radius)",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        Take the quiz first →
      </Link>
    </div>
  );
}
