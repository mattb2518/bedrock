# Domain & email infrastructure

Where Bedrock's domains, hosting, and email live, and how the pieces fit. Last
verified **2026-06-25**. None of this is in the app code — it all lives in
Cloudflare, Vercel, Supabase, and Resend dashboards — so this doc is the record.

## Domains

| Domain | Registrar | DNS |
|---|---|---|
| `bedrock.guide` (primary, live) | Cloudflare | Cloudflare |
| `bedrock.vote` | Network Solutions | Cloudflare |

## Website hosting — Vercel

`bedrock.guide` serves from Vercel:
- `A` `bedrock.guide` → `216.198.79.1` (DNS only / not proxied)
- `CNAME` `www` → `…vercel-dns-017.com` (DNS only)

These are intentionally **"DNS only"** (grey cloud) — Vercel serves directly.
Cloudflare's "turn on proxying" banner is a generic upsell; ignore it for these.

## Inbound mail — Cloudflare Email Routing

Email Routing is **enabled** on `bedrock.guide`. It forwards inbound mail to
Matt's personal inbox; there is no real mailbox on the domain.

**Routing rules (both Active):**
- `hello@bedrock.guide` → `matt@myblumberg.com`
- **Catch-all** (anything `@bedrock.guide`) → `matt@myblumberg.com`

Cloudflare auto-manages these supporting records (don't hand-edit — they show as
"Locked"):
- `MX` `bedrock.guide` → `route1/2/3.mx.cloudflare.net` (priorities 4 / 19 / 56)
- `TXT` `bedrock.guide` → `v=spf1 include:_spf.mx.cloudflare.net ~all`
- `TXT` `cf2024-1._domainkey` → Cloudflare DKIM

Because `hello@` forwards to Matt, replies to Bedrock's transactional emails reach
a real inbox (no dead-end no-reply address).

## Outbound transactional mail — Resend (via Supabase custom SMTP)

Supabase auth emails (confirm signup, magic link, password reset, change email,
invite) send through **Resend**, so they arrive **from Bedrock**, branded, and
out of spam. See [`email-templates/`](email-templates/) for the branded templates
and [[supabase-email-source-gated-smtp]] for why the dashboard requires SMTP.

**Resend DNS records (on the `send` subdomain so they don't touch root mail):**
- `MX` `send.bedrock.guide` → `feedback-smtp.us-east-1.amazonses.com` (priority 10)
- `TXT` `send.bedrock.guide` → `v=spf1 include:amazonses.com ~all`
- `TXT` `resend._domainkey` → Resend DKIM public key
- `TXT` `_dmarc.bedrock.guide` → `v=DMARC1; p=none;`

**Supabase → Authentication → Emails → SMTP Settings:**
- Host `smtp.resend.com` · Port `465` · Username `resend`
- Password = Resend API key *(stored only in the Supabase dashboard — never in this repo)*
- Sender email `hello@bedrock.guide` · Sender name `Bedrock`

### Notes / future
- **DMARC is `p=none`** (monitor only) for now. Once DMARC reports confirm all
  legitimate mail passes, tighten to `p=quarantine`, then later `p=reject`.
- The root mail (Cloudflare Email Routing) and the `send.*` mail (Resend) are on
  **different hostnames**, so they never conflict — inbound forwarding and
  outbound sending are fully independent.
