import type { Metadata } from "next";
import { Libre_Baskerville, DM_Sans } from "next/font/google";
import Script from "next/script";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import SyncProvider from "@/components/providers/SyncProvider";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bedrock — Know What You Actually Believe",
  description:
    "A civic identity platform for independent-minded voters. Take the quiz. Find your bedrock.",
  metadataBase: new URL("https://bedrock.guide"),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Bedrock",
    description: "Know what you actually believe.",
    url: "https://bedrock.guide",
    siteName: "Bedrock",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        {process.env.NEXT_PUBLIC_APP_ENV === "production" && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body
        style={{
          backgroundColor: "var(--color-bg-page)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SyncProvider>
          <Nav />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </SyncProvider>
      </body>
    </html>
  );
}
