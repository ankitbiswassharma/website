# Security Hardening — 2026-07-03

Closes the container-hardening item left open in `SECURITY_UPDATES_2026-06-29.md`, plus app/edge-level hardening. **Not yet built/tested — deploy steps below.**

## Changes

**Containers (the June-incident amplifier)**
- `frontend/Dockerfile`: runs as `node` (non-root); `.next` chowned so the runtime cache still works.
- `backend/Dockerfile`: runs as `app` (UID 10001, non-root).
- `docker-compose.yml`: `no-new-privileges` on all four services; `cap_drop: ALL` on backend + frontend (db/traefik need caps for their entrypoints).

**Edge (`traefik/dynamic/muskit.yml`)**
- New `security-headers` middleware on both routers: HSTS (1y, preload), nosniff, frame-deny, referrer-policy, permissions-policy, and a CSP. CSP allows `'unsafe-inline'` scripts/styles (Next.js bootstrap + JsonLd need it) and `*.razorpay.com` (checkout script, iframe, telemetry).

**Backend**
- Per-IP rate limits on admin login (`request-otp` 5/10min, `verify-otp` 10/10min) and staff login (`login` 5/5min, `verify-otp` 10/10min) — same pattern the client portal already used.
- Fixed `client_ip()`: it took the *first* X-Forwarded-For entry, which the client controls — any attacker could spoof past every IP rate limit (including the existing lead-form one). Now takes the last entry (appended by Traefik, not spoofable).

## Deploy

```bash
docker compose build --no-cache frontend backend
docker compose down && docker compose up -d
```

**⚠️ One-time fix — existing storage volume is root-owned.** The backend now runs as UID 10001 and won't be able to write quotation PDFs to `backend_storage` until:

```bash
docker run --rm -v muskit_website_backend_storage:/s alpine chown -R 10001:10001 /s
# volume name may differ; check: docker volume ls | grep backend_storage
```

## Verify after deploy

```bash
docker compose logs --tail=30 backend frontend          # both boot clean
docker exec muskit_website_backend id                    # uid=10001(app)
docker exec muskit_website_frontend id                   # uid=1000(node)
curl -sI https://muskit.in | grep -iE "strict-transport|content-security|x-frame"
```

Smoke-test: load the homepage (CSP can silently break JS — check browser console), complete a Razorpay test payment, generate one quotation PDF (exercises storage-volume ownership), log in to admin/staff/portal, and hit an OTP endpoint 6× fast to confirm the 429.

## Still open

Secret rotation (`SECURITY_SECRET_ROTATION.md`) — needs your Razorpay/GoDaddy dashboards, still pending.
