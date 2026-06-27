import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ maxWidth: "var(--max-width-content)", margin: "0 auto", padding: "var(--space-16) var(--space-6)" }}>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", marginBottom: "var(--space-5)" }}>About</p>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", color: "var(--color-text-primary)", marginBottom: "var(--space-8)", lineHeight: "var(--leading-tight)" }}>
        I'm not red. I'm not blue.<br />I'm red, white, and blue.
      </h1>

      <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

        <p>And I couldn't find a single civic tool built for people who think that way. So I built one.</p>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginTop: "var(--space-4)" }}>There's got to be a better way.</h2>

        <p>I'm frustrated — and I suspect you are too. Frustrated that real problems with real solutions sit unsolved year after year. Frustrated that the tools built for voters assume you have a party and flatten everything else. Frustrated that even engaged, thoughtful citizens walk into voting booths uninformed about most of what's on their ballot.</p>

        <p>But frustration without action is just noise. So instead of waiting for someone else to fix it, I built something.</p>

        <p>Our political system has become so polarized that real problems stop getting solved. Not because solutions don't exist. Because solving them would require leaders to put country over party. Over self. Over their next fundraising email.</p>

        <p>The issues most Americans actually agree on — and there are more of them than you think — sit unsolved year after year while our politicians perform outrage for their bases.</p>

        <p>Parties have nationalized every local race. The media ecosystem rewards the loudest voices and punishes the most honest ones. Leaders who could unite us have decided division is more useful to them.</p>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginTop: "var(--space-4)" }}>The people this hurts most.</h2>

        <p>The fastest-growing voter segment in America — people who don't fully belong to either party — has no real civic infrastructure built for it.</p>

        <p>Every existing tool assumes a party as a starting point. The media ecosystem sorts you into a tribe whether you want one or not. The political conversation treats you as a swing voter to be captured rather than a citizen to be served.</p>

        <p>That's not an accident. It's a structural failure.</p>

        <p>Independent-minded voters aren't apathetic. They're often the most thoughtful people in the room. They deserve tools built specifically for them — tools that start from their values, not a party's. Tools that dig down to the bedrock of what they actually believe, not the tribal shortcuts everyone else offers.</p>

        <p>That's what Bedrock is. My answer to all of it.</p>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginTop: "var(--space-4)" }}>The mission.</h2>

        <p>Help independent-minded citizens understand, articulate, and act on what they actually believe — because democracy works better when more people show up with clarity and conviction rather than confusion and indifference.</p>

        <p>Country over self isn't only a presidential virtue. It starts with citizens who know what they actually believe and show up ready to act on it.</p>

        <blockquote style={{ margin: "var(--space-2) 0", paddingLeft: "var(--space-5)", borderLeft: "3px solid var(--color-gold)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-body-lg)", color: "var(--color-gold)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-2)" }}>
            "Democracy is not a spectator sport."
          </p>
          <cite style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--color-text-muted)", fontStyle: "normal" }}>
            — Richard Haass, on the obligations of citizenship
          </cite>
        </blockquote>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginTop: "var(--space-4)" }}>Where this comes from.</h2>

        <p>I'm Matt Blumberg — technology entrepreneur, business author, and for the last several years, host of a podcast called <em>Country Over Self</em>. Vibe coded with Claude.</p>

        <p>The podcast grew out of a simple obsession: I've read over 150 presidential biographies, and the question I kept coming back to wasn't about policy or party. It was about character. When did American presidents choose the country over themselves? Over their power, their party, their legacy?</p>

        <p>What I found, over and over, was that courage in public life isn't partisan. It shows up on the left and the right. It always has.</p>

        <p>Bedrock is the same question pointed in a different direction. Not at the presidents. At the rest of us. The bedrock of democratic life isn't in Washington. It's in what ordinary citizens actually believe — and whether they show up knowing it.</p>

        <p><a href="https://www.countryoverself.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-blue-accent)" }}>Listen to <em>Country Over Self</em> on Spotify, Apple Podcasts, or YouTube →</a></p>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginTop: "var(--space-4)" }}>What I believe.</h2>

        <p>Democracy works better when more citizens understand what they actually believe and act on it. That's not a partisan position. It's a precondition for everything else.</p>

        <p>America is the rare country founded not on blood or soil, but on a set of ideas and ideals. That makes pluralism — taking other people's convictions seriously, even when you can't stand them — part of the original design, not a concession to it. That's the bet Bedrock is built on: a country of arguments held in good faith is stronger than a country that agrees by force.</p>

        <p>Civic identity isn't something you get assigned once. It's something you develop over time. Bedrock is built around that idea.</p>

        <p>And transparency isn't a feature. It's the foundation. If you don't understand how a tool works, you can't trust what it produces. So we show our work — every dimension, every methodology decision, every recommendation explained.</p>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginTop: "var(--space-4)" }}>On bias.</h2>

        <p>Every tool has a perspective baked into it. Including this one.</p>

        <p>The eight dimensions Bedrock uses to map civic values were designed to be genuinely cross-partisan — every position at every pole has a defensible, honorable answer. We publish the methodology. We open-source the scoring logic.</p>

        <p>If you think we've gotten something wrong, there's a feedback mechanism on every question. Or email <a href="mailto:hello@bedrock.guide" style={{ color: "var(--color-blue-accent)" }}>hello@bedrock.guide</a>. I read it.</p>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", color: "var(--color-text-primary)", marginTop: "var(--space-4)" }}>The long game.</h2>

        <p>Bedrock started as a passion project. It may someday grow into a nonprofit or public benefit corporation. Before then — and if and when it does — no political donors, no party affiliation, and published methodology.</p>

        <p>No interest in where you land. Only in helping you get there honestly.</p>

        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-body-lg)", color: "var(--color-gold)" }}>I'm not red. I'm not blue. I'm red, white, and blue. And I think more of us are than anyone in Washington wants to admit.</p>

        <p>There's got to be a better way. This is mine.</p>

        <p style={{ color: "var(--color-text-primary)", fontWeight: "var(--weight-semibold)" }}>— Matt</p>

        <div style={{ marginTop: "var(--space-8)", paddingTop: "var(--space-8)", borderTop: "1px solid var(--color-border)" }}>
          <Link href="/quiz" style={{ backgroundColor: "var(--color-red)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: "var(--weight-semibold)", padding: "var(--btn-padding-y) var(--btn-padding-x)", borderRadius: "var(--btn-radius)", textDecoration: "none", display: "inline-block" }}>
            Find your bedrock →
          </Link>
        </div>
      </div>
    </div>
  );
}
