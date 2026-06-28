"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQuizStore } from "@/store/quizStore";
import type { User } from "@supabase/supabase-js";

const topNavLinks = [
  { label: "Civic Mantle", href: "/civic-mantle" },
  { label: "Your Ballot", href: "/ballot" },
  { label: "Beyond Your Ballot", href: "/beyond-ballot" },
  { label: "Your Media", href: "/media" },
  { label: "Your Conversations", href: "/conversations" },
];

const aboutLinks = [
  { label: "About Bedrock", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Trust & Methodology", href: "/methodology" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy & Data", href: "/privacy" },
];

// Logo mark — references public/logo-mark.svg (single source of truth per brand guidelines)
function LogoMark() {
  return (
    <Image
      src="/logo-mark.svg"
      alt="Bedrock mark"
      width={28}
      height={28}
      style={{ display: "block", flexShrink: 0 }}
      priority
    />
  );
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isAboutActive = aboutLinks.some(
    (l) => pathname === l.href || pathname.startsWith(l.href)
  );

  // Once the user has a mantle, surface a way back to it from anywhere — the
  // results/mantle pages were previously unreachable from the nav. Gated on a
  // mounted flag so the persisted store doesn't cause a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const hasResult = useQuizStore((s) => !!s.session?.result);
  const navLinks =
    mounted && hasResult
      ? [...topNavLinks, { label: "Your Mantle", href: "/your-mantle" }]
      : topNavLinks;

  // Subscribe to auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Initials from email for avatar
  const initials = user?.email ? user.email[0].toUpperCase() : "";

  // Close About dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
        {/* Wordmark with B mark */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <LogoMark />
          <span style={{ display: "flex", alignItems: "baseline", lineHeight: 1, marginTop: "6px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--wordmark-size-nav)",
                fontWeight: "var(--wordmark-weight)",
                color: "var(--wordmark-primary)",
                letterSpacing: "-0.01em",
                lineHeight: 1,
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
                lineHeight: 1,
              }}
            >
              .guide
            </span>
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
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-small)",
                  fontWeight: active
                    ? "var(--weight-semibold)"
                    : "var(--weight-medium)",
                  color: active
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                  textDecoration: "none",
                  transition: "var(--transition-fast)",
                  whiteSpace: "nowrap",
                  borderBottom: active
                    ? "2px solid var(--color-gold)"
                    : "2px solid transparent",
                  paddingBottom: "2px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = active
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)")
                }
              >
                {link.label}
              </Link>
            );
          })}

          {/* About dropdown */}
          <div ref={aboutRef} style={{ position: "relative" }}>
            <button
              onClick={() => setAboutOpen((o) => !o)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                fontWeight: isAboutActive
                  ? "var(--weight-semibold)"
                  : "var(--weight-medium)",
                color: isAboutActive
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
                borderBottom: isAboutActive
                  ? "2px solid var(--color-gold)"
                  : "2px solid transparent",
                paddingBottom: "2px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
                transition: "var(--transition-fast)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--color-text-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = isAboutActive
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)")
              }
            >
              About
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  transform: aboutOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              >
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {aboutOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 12px)",
                  right: 0,
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-2)",
                  minWidth: "180px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  zIndex: 100,
                }}
              >
                {aboutLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setAboutOpen(false)}
                      style={{
                        display: "block",
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-small)",
                        fontWeight: active
                          ? "var(--weight-semibold)"
                          : "var(--weight-medium)",
                        color: active
                          ? "var(--color-text-primary)"
                          : "var(--color-text-secondary)",
                        textDecoration: "none",
                        padding: "var(--space-3) var(--space-4)",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: active
                          ? "var(--color-bg-deep, #0f1f33)"
                          : "transparent",
                        transition: "var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "var(--color-bg-deep, #0f1f33)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--color-text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          active ? "var(--color-bg-deep, #0f1f33)" : "transparent";
                        (e.currentTarget as HTMLElement).style.color = active
                          ? "var(--color-text-primary)"
                          : "var(--color-text-secondary)";
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

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
              (e.currentTarget.style.backgroundColor =
                "var(--color-red-light)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-red)")
            }
          >
            Take the Quiz
          </Link>

          {/* Auth: signed out → Sign in link; signed in → avatar + sign out */}
          {user === null ? (
            <Link
              href="/signin"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                borderBottom: "2px solid transparent",
                paddingBottom: "2px",
                transition: "var(--transition-fast)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-text-secondary)")
              }
            >
              Sign in
            </Link>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <Link
                href="/profile"
                title={user.email}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-gold)",
                  color: "#0a1628",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-small)",
                  fontWeight: "var(--weight-bold)",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                {initials}
              </Link>
              <button
                onClick={handleSignOut}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-small)",
                  fontWeight: "var(--weight-medium)",
                  color: "var(--color-text-muted)",
                  padding: 0,
                  whiteSpace: "nowrap",
                  transition: "var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--color-text-primary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--color-text-muted)")
                }
              >
                Sign out
              </button>
            </div>
          )}
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
          {/* About group in mobile */}
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "var(--space-3)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-micro)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "var(--tracking-wider)",
              }}
            >
              About
            </span>
            {aboutLinks.map((link) => (
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
                  paddingLeft: "var(--space-3)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
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

          {/* Mobile auth */}
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-3)" }}>
            {user === null ? (
              <Link
                href="/signin"
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-body)",
                  fontWeight: "var(--weight-medium)",
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--weight-medium)",
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  My Profile ({user.email})
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); handleSignOut(); }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--weight-medium)",
                    color: "var(--color-text-muted)",
                    padding: 0,
                    textAlign: "left",
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
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
