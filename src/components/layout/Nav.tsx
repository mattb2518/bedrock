"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "The Framework", href: "/methodology" },
  { label: "Your Ballot", href: "/ballot" },
  { label: "Your Media", href: "/media" },
  { label: "Your Conversations", href: "/conversations" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav
      style={{
        backgroundColor: "var(--color-bg-section)",
        borderBottom: "1px solid var(--color-border)",
        height: "var(--nav-height)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "var(--max-width-full)",
          margin: "0 auto",
          padding: "0 var(--space-6)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--wordmark-size-nav)",
              fontWeight: "var(--wordmark-weight)",
              color: "var(--wordmark-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Bedrock
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--wordmark-tld-size-nav)",
              fontWeight: "var(--wordmark-tld-weight)",
              color: "var(--wordmark-tld)",
            }}
          >
            .guide
          </span>
        </Link>

        {/* Desktop nav links */}
        <div
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-6)",
          }}
        >
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-small)",
                  fontWeight: active ? "var(--weight-semibold)" : "var(--weight-medium)",
                  color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  textDecoration: "none",
                  transition: "var(--transition-fast)",
                  whiteSpace: "nowrap",
                  borderBottom: active ? "2px solid var(--color-gold)" : "2px solid transparent",
                  paddingBottom: "2px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = active ? "var(--color-text-primary)" : "var(--color-text-secondary)")
                }
              >
                {link.label}
              </Link>
            );
          })}

          {/* Take the Quiz CTA */}
          <Link
            href="/quiz"
            style={{
              backgroundColor: "var(--color-red)",
              color: "#ffffff",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-small)",
              fontWeight: "var(--weight-semibold)",
              padding: "var(--btn-padding-y-sm) var(--btn-padding-x-sm)",
              borderRadius: "var(--btn-radius)",
              textDecoration: "none",
              transition: "var(--transition-fast)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-red-light)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-red)")
            }
          >
            Take the Quiz
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "var(--space-2)",
            color: "var(--color-text-primary)",
          }}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            backgroundColor: "var(--color-bg-section)",
            borderTop: "1px solid var(--color-border)",
            padding: "var(--space-4) var(--space-6)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-secondary)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/quiz"
            onClick={() => setMenuOpen(false)}
            style={{
              backgroundColor: "var(--color-red)",
              color: "#ffffff",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-body)",
              fontWeight: "var(--weight-semibold)",
              padding: "var(--btn-padding-y-sm) var(--btn-padding-x-sm)",
              borderRadius: "var(--btn-radius)",
              textDecoration: "none",
              textAlign: "center",
              marginTop: "var(--space-2)",
            }}
          >
            Take the Quiz
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
