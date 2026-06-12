# Bedrock auth email templates

Branded replacements for Supabase's default (unbranded) auth emails, plus how to
make them send **from a Bedrock address** instead of `noreply@mail.app.supabase.co`.

Everything here is done in the **Supabase dashboard** and your **DNS** — there's no
app code involved. Two separate jobs: (A) the look, (B) the sender address.

---

## A. Make the emails branded (5 min, no DNS)

For each file below, open the matching Supabase template, replace the body, Save.
**Supabase dashboard → Authentication → Email Templates.** Keep every
`{{ .ConfirmationURL }}` exactly as-is — Supabase fills it in.

| File | Supabase template |
|---|---|
| [`confirm-signup.html`](confirm-signup.html) | **Confirm signup** |
| [`magic-link.html`](magic-link.html) | **Magic Link** |
| [`reset-password.html`](reset-password.html) | **Reset Password** |
| [`change-email.html`](change-email.html) | **Change Email Address** |
| [`invite.html`](invite.html) | **Invite user** |

Optional but nice: also set a friendlier **Subject** on each (e.g. "Confirm your
Bedrock account", "Your Bedrock sign-in link", "Reset your Bedrock password").

> Note: email clients can't load web fonts (Libre Baskerville / DM Sans) or SVG,
> so these use Georgia/Arial fallbacks and a CSS tri-color bar instead of the logo
> image. That's expected and renders consistently everywhere.

---

## B. Make them send from a Bedrock address (one-time, ~20 min + DNS wait)

Supabase's built-in mailer always sends from *their* address and is rate-limited
("testing only"). To send from Bedrock you point Supabase at your own email
service. Recommended: **Resend** (free tier, easiest setup). Postmark / AWS SES
also work.

1. **Create a Resend account** at https://resend.com.
2. **Add and verify the domain** `bedrock.guide` (Resend → Domains → Add Domain).
   Resend gives you a handful of DNS records (SPF/DKIM, usually on a `send.`
   subdomain). Add them wherever `bedrock.guide`'s DNS lives (likely Vercel →
   your project → Domains, or your registrar). Verification can take anywhere
   from minutes to a couple of hours to propagate.
3. **Create a Resend API key** (Resend → API Keys). Copy it.
4. **Turn on custom SMTP in Supabase:** dashboard → **Project Settings →
   Authentication → SMTP Settings → Enable Custom SMTP**, then enter:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: *(your Resend API key)*
   - Sender email: e.g. `hello@bedrock.guide` (must be on the verified domain)
   - Sender name: `Bedrock`
5. **Save and send a test** (sign up with a throwaway address). It should now
   arrive **from Bedrock**, branded, and out of spam.

After this, the auth-email rate limit also lifts (Supabase → Auth → Rate Limits).

---

## Gotchas
- The sender email's domain **must match the verified domain** in Resend, or mail
  silently fails / lands in spam.
- Don't paste the Resend API key anywhere in this repo — it goes only in the
  Supabase dashboard.
- If a template ever stops working after a Supabase update, re-check that
  `{{ .ConfirmationURL }}` is still present and unescaped.
