# Secret Rotation Checklist — post-compromise

**Context:** The frontend container was running as root and was compromised via React2Shell (CVE-2025-55182). Any secret readable from that container — i.e. everything in `.env` and the database — must be treated as **leaked** and rotated. Patching Next.js closes the door; rotating secrets locks out anyone who already walked through it.

**Order matters:** rotate session/auth secrets first (locks out forged sessions), then payment + email (financial/impersonation risk), then DB, then redeploy once with the new `.env`, then verify.

---

## 1. Admin session secret — do this first (highest impact)

- **Key:** `ADMIN_SESSION_SECRET`  (also check for staff/client equivalents in `.env`)
- **Why:** Signs admin login sessions/OTP tokens. A leaked value lets an attacker forge a valid admin session without credentials. Rotating it **invalidates all existing sessions** (you and any attacker get logged out — intended).
- **How:** generate ≥32 random chars and replace the value:
  ```bash
  openssl rand -base64 48
  ```
- After rotation, every admin/staff/client user must log in again (re-trigger OTP). That's expected.

## 2. Razorpay payment credentials (financial risk)

- **Keys:** `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`  (`RAZORPAY_KEY_ID` is public-ish but regenerate the pair together)
- **Why:** A leaked key secret can create/capture payments; a leaked webhook secret lets an attacker forge "payment received" events (`/public/payments/webhooks/razorpay`).
- **How:** Razorpay Dashboard → Settings → API Keys → **Regenerate**; and Settings → Webhooks → rotate the webhook signing secret. Update both in `.env`.

## 3. Email credentials (impersonation / spam risk)

- **Keys:** `SMTP_PASSWORD` (GoDaddy mailbox `admin@muskit.in` on `smtpout.secureserver.net`), and `SENDGRID_API_KEY` if `EMAIL_PROVIDER=sendgrid`.
- **Why:** Lets an attacker send mail as you (phishing your own leads), and the cold-outreach campaign feature runs through this.
- **How:** Change the mailbox password in the GoDaddy/email admin; for SendGrid, revoke the old API key and create a new one. Update `.env`.

## 4. Integrations inbound webhook secret

- **Key:** `INTEGRATIONS_INBOUND_SECRET`
- **Why:** HMAC secret that validates inbound signed webhooks (`/api/v1/integrations/inbound/{source}`). Rotate so previously-captured signatures can't be replayed.
- **How:** `openssl rand -hex 32`, update `.env`, and re-share the new secret with any legitimate sender (Zapier/Make/Razorpay configs).

## 5. Per-endpoint outbound webhook secrets (in the database)

- **Where:** `webhook_endpoints.secret` (values like `whsec_...`) created by the admin integrations UI.
- **Why:** These sign outbound deliveries; they live in the DB, which was reachable from the compromised app.
- **How:** In the admin integrations screen, delete and re-create each webhook endpoint (regenerates the secret), or rotate via SQL and re-share with the receiving systems.

## 6. Database credentials

- **Keys:** `POSTGRES_PASSWORD` (and the `DATABASE_URL` that embeds it).
- **Why:** The app holds the DB password in memory; assume it leaked. The DB also holds lead PII — treat that data as potentially exfiltrated.
- **How:**
  ```sql
  ALTER USER muskit WITH PASSWORD '<new-strong-password>';
  ```
  Update `POSTGRES_PASSWORD` / `DATABASE_URL` in `.env` to match, then redeploy.

## 7. Redeploy cleanly with the new `.env`

```bash
docker compose down
docker compose build --no-cache frontend backend     # ensure no cached compromised layer
docker compose up -d
```

## 8. Post-rotation verification

- [ ] `docker exec muskit_website_frontend sh -c 'grep version node_modules/next/package.json'` → `15.3.6`
- [ ] Old admin session no longer works (must re-login via OTP) → confirms `ADMIN_SESSION_SECRET` rotated
- [ ] Test payment + a Razorpay webhook with the new secret
- [ ] Send one test email → confirms new SMTP/SendGrid creds
- [ ] App boots with the new `DATABASE_URL` (no auth errors in `docker compose logs db backend`)
- [ ] `git log`/`git status` — make sure no real secret value was ever committed; if it was, rotate again and scrub history

## Not secrets (no rotation needed)
`FRONTEND_URL`, `API_BASE_URL`, `CORS_ORIGINS`, `TRAEFIK_CERT_EMAIL`, `SMTP_HOST/PORT/USER`, company/admin contact fields. (TLS certs are managed by Traefik/Let's Encrypt; no action.)

---

**Also worth doing:** review `next-server` / nginx / traefik access logs around the exploitation window for the initial RSC request and any follow-on data access, and consider notifying affected leads if you conclude their data was accessed.
