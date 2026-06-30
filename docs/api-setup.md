# Bedrock — API Accounts Setup & Outreach

*Created June 29, 2026. Work through this before starting the pillar build in Claude Code.*

---

## API Accounts to Create

### 1. api.data.gov — covers BOTH congress.gov and FEC

**URL:** https://api.data.gov/signup/

**Fields to fill out:**
- First name, Last name, Email
- "How will you use the API?" → paste: *"Civic information platform helping independent-minded voters understand candidates, their records, and campaign finance. Read-only display use, non-commercial public benefit."*

**What you get:** One API key via email within minutes. This same key works for both the congress.gov API and the FEC openFEC API. No payment required.

**Add to .env.local as:**
```
CONGRESS_GOV_API_KEY=your_key_here
FEC_API_KEY=your_key_here
```
*(Same key value in both fields.)*

---

### 2. Google Cloud Console — Civic Information API

**Which project to use:** Use whichever of your four projects is associated with Bedrock billing, or create a new one named `bedrock-prod`.

**Step by step:**
1. Go to https://console.cloud.google.com
2. Select or create the `bedrock-prod` project
3. In the left nav: **APIs & Services → Library**
4. Search: **"Civic Information API"** — click it → click **Enable**
5. In the left nav: **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. Label it: `Civic Info - Bedrock Prod`
8. Click **Edit Key** → under API restrictions, select **Restrict key** → choose **Civic Information API** only
9. Copy the key

No payment required at Bedrock's projected volumes (25,000 queries/day free tier).

**Add to .env.local as:**
```
GOOGLE_CIVIC_API_KEY=your_key_here
```

---

### 3. Open States v3 (Plural Open Data) — state legislative

**URL:** https://open.pluralpolicy.com/accounts/profile/

**Step by step:**
1. Click **Sign Up** — email and password only
2. Once logged in, go to your **Profile** page
3. Find the **API Key** section — your key is displayed there
4. Copy it

**Fields:** Name, Organization → use *"Matt Blumberg / Bedrock (bedrock.guide)"*

Free. No payment required.

**Add to .env.local as:**
```
OPENSTATES_API_KEY=your_key_here
```

---

### 4. MBFC via RapidAPI — media bias ratings reference

**URL:** https://rapidapi.com → search "Media Bias Fact Check"

**Step by step:**
1. Create a RapidAPI account at https://rapidapi.com (free)
2. Search for **"Media Bias Fact Check"** in the marketplace
3. Select the MBFC API listing
4. Click **Subscribe to Test** → choose the **Basic** tier to start
5. Check current pricing before subscribing (typically cents per call — verify live)
6. Add a credit card to your RapidAPI account for metered billing
7. Your key appears under **Apps → Default App → Authorization**

**Note:** Use MBFC as a reference while manually building the v1 catalog, not as a live runtime data source. Swap to a live API call in v2 once catalog automation is built.

**Add to .env.local as:**
```
RAPIDAPI_KEY=your_key_here
```

---

### 5. Anthropic API — already have this

Confirm `ANTHROPIC_API_KEY` is in `.env.local`. Used for the Conversations pillar (already live) and will also power the Article Bias Checker and the classification subsystem.

---

## Pending Outreach — Do These Before Media Diet Build Starts

### A. AllSides — non-commercial eligibility

**To:** partnerships@allsides.com  
**Subject:** Non-commercial licensing eligibility question — Bedrock

---

Hi,

I'm building Bedrock (bedrock.guide), a civic identity platform for independent-minded voters. The platform is organized as a public benefit corporation and is not ad-supported. Its purpose is to help voters understand their own values, find candidates who match them, and build a more balanced media diet.

I'd like to use AllSides bias ratings as a reference layer in our media recommendation feature. Before I build against the CC BY-NC 4.0 data, I want to confirm in writing whether Bedrock's PBC structure qualifies as non-commercial use under your license terms — or whether we'd need a commercial license agreement.

Happy to share more about the platform and how we'd use and attribute the data. What's the right next step?

Matt Blumberg  
Founder, Bedrock  
hello@bedrock.guide

---

### B. Ad Fontes Media — Data Platform pricing

**To:** info@adfontesmedia.com  
**Subject:** Data Platform inquiry — civic identity platform

---

Hi,

I'm building Bedrock (bedrock.guide), a civic identity platform designed to help independent-minded voters understand their values and build a balanced media diet. The platform is organized as a public benefit corporation.

The media recommendation feature — which I'm calling "Your Media Diet" — recommends independent journalists, Substacks, and podcasts in three tiers: confirming, expanding, and challenging. I'm interested in Ad Fontes's Data Platform as the primary source for bias and reliability ratings, particularly given your expanding coverage of independent creators and Substacks.

A few questions:
- What does Data Platform access cost, and what does the data feed look like (API, CSV, webhook)?
- Does our PBC/nonprofit structure qualify us for educator or non-commercial pricing?
- Do you have any interest in a partnership arrangement given that our use case aligns directly with your mission?

Matt Blumberg  
Founder, Bedrock  
hello@bedrock.guide

---

### C. Ballotpedia — licensing conversation (long lead time — start now)

**To:** data@ballotpedia.org  
**Subject:** Data licensing inquiry — civic identity platform, fall 2026 general election

---

Hi,

I'm building Bedrock (bedrock.guide), a civic identity platform for independent-minded voters. We match voters' values profiles against candidate records to help them make more informed decisions across the full ballot — federal, state, and local.

We're building toward the fall 2026 general election and are interested in Ballotpedia's geographic API and Ultralocal candidate data for down-ballot coverage. We're organized as a public benefit corporation.

Could you share your current rate card and tell me what the onboarding timeline typically looks like? We want to make sure we have enough lead time to integrate before the election.

Matt Blumberg  
Founder, Bedrock  
hello@bedrock.guide

---

## To-Do Checklist

- [ ] Sign up at api.data.gov → save key to .env.local (both CONGRESS_GOV and FEC fields)
- [ ] Enable Civic Information API in Google Cloud Console → create and restrict key → save to .env.local
- [ ] Sign up at open.pluralpolicy.com → save key to .env.local
- [ ] Create RapidAPI account → subscribe to MBFC API → save key to .env.local
- [ ] Send AllSides email (partnerships@allsides.com)
- [ ] Send Ad Fontes email (info@adfontesmedia.com)
- [ ] Send Ballotpedia email (data@ballotpedia.org)
- [ ] Run Perplexity prompt to expand media catalog (prompt in Claude Project session)
- [ ] Verify current status of Bari Weiss / Common Sense vs. Free Press ownership
- [ ] Verify current status of: Tangled Up In Facts, Chuck ToddCast, Richard Haas Home and Away, John Ellis newsletters
- [ ] Review and approve starter media catalog list (in Claude Project session)

