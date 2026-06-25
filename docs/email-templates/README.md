# Bedrock auth email templates

Branded replacements for Supabase's default (unbranded) auth emails, plus how to
make them send **from a Bedrock address** instead of `noreply@mail.app.supabase.co`.

Everything here is done in the **Supabase dashboard** and your **DNS** — there's no
app code involved. Two separate jobs: (A) the look, (B) the sender address.

---

## A. Make the emails branded

For each file below, open the matching Supabase template, switch to the **Source**
view, replace the body, Save. **Supabase dashboard → Authentication → Emails →
Templates.** Keep every template variable (`{{ .ConfirmationURL }}`, `{{ .Token }}`,
etc.) exactly as-is — Supabase fills them in.

> Heads-up: the dashboard **locks the Source editor until custom SMTP is enabled**
> (see section B). So section B is now a prerequisite for editing any template, not
> an optional follow-up.

### Core auth flows (the 5 every user hits)

| File | Supabase template | Variables |
|---|---|---|
| [`confirm-signup.html`](confirm-signup.html) | **Confirm sign up** | `{{ .ConfirmationURL }}` |
| [`invite.html`](invite.html) | **Invite user** | `{{ .ConfirmationURL }}` |
| [`magic-link.html`](magic-link.html) | **Magic link or OTP** | `{{ .ConfirmationURL }}` |
| [`change-email.html`](change-email.html) | **Change email address** | `{{ .ConfirmationURL }}` |
| [`reset-password.html`](reset-password.html) | **Reset password** | `{{ .ConfirmationURL }}` |

### Reauthentication (shows a code, not a link)

| File | Supabase template | Variables |
|---|---|---|
| [`reauthentication.html`](reauthentication.html) | **Reauthentication** | `{{ .Token }}` |

### Security notifications (informational, no button)

These only send if the matching notification is enabled at the project level
(Authentication → Emails → and the per-notification toggles).

| File | Supabase template | Variables |
|---|---|---|
| [`password-changed.html`](password-changed.html) | **Password changed** | — |
| [`email-changed-notification.html`](email-changed-notification.html) | **Email address changed** | `{{ .OldEmail }}` `{{ .Email }}` |
| [`phone-changed-notification.html`](phone-changed-notification.html) | **Phone number changed** | `{{ .OldPhone }}` `{{ .Phone }}` |
| [`signin-method-linked.html`](signin-method-linked.html) | **Sign-in method linked** | `{{ .Provider }}` `{{ .Email }}` |
| [`signin-method-removed.html`](signin-method-removed.html) | **Sign-in method removed** | `{{ .Provider }}` `{{ .Email }}` |
| [`mfa-added.html`](mfa-added.html) | **MFA method added** | `{{ .FactorType }}` |
| [`mfa-removed.html`](mfa-removed.html) | **MFA method removed** | `{{ .FactorType }}` |

### Suggested subject lines

The **Subject** is a separate one-line field from the body — pasting the HTML
doesn't change it. Optional, but more on-brand:

| Template | Subject |
|---|---|
| Confirm sign up | `Confirm your Bedrock account` |
| Invite user | `You're invited to Bedrock` |
| Magic link or OTP | `Your Bedrock sign-in link` |
| Change email address | `Confirm your new Bedrock email` |
| Reset password | `Reset your Bedrock password` |
| Reauthentication | `Your Bedrock verification code` |
| Password changed | `Your Bedrock password was changed` |
| Email address changed | `Your Bedrock email was changed` |
| Phone number changed | `Your Bedrock phone number was changed` |
| Sign-in method linked | `A sign-in method was added to your Bedrock account` |
| Sign-in method removed | `A sign-in method was removed from your Bedrock account` |
| MFA method added | `Two-factor authentication was turned on` |
| MFA method removed | `Two-factor authentication was turned off` |

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
