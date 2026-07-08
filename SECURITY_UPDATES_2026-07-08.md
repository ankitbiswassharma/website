# Security Updates — 2026-07-08

Full-project security pass: dependency audit, code review (frontend + backend),
and follow-up on open hardening items. **Code changes below are committed to the
repo but not yet built/deployed** — deploy steps at the end.

## What changed

**Dependencies**
- `frontend/package.json`: added an `overrides` entry pinning **postcss ≥ 8.5.10**.
  Next.js pulled in postcss 8.4.x, which is affected by GHSA-qx2v-qp2m-jg93
  (XSS via unescaped `</style>` in CSS stringify output, moderate). Lockfile now
  resolves postcss **8.5.16**; `npm audit` reports **0 vulnerabilities**.

**Backend — SSRF guard on outbound webhooks (`app/utils/net.py`, `integration_service.py`)**
- Admin-registered webhook endpoints are operator-supplied URLs that the server
  then POSTs to. There was no check that the target is public, so an endpoint
  like `http://169.254.169.254/…` (cloud metadata), `http://backend:8000`, or
  `http://127.0.0.1` would let the platform reach internal services.
- New `assert_public_http_url()` rejects non-HTTP(S) schemes and any host that
  resolves to a loopback / private / link-local / reserved / multicast address.
- Enforced at **registration** (`register_endpoint`, returns 400) and again at
  **dispatch time** (guards endpoints stored before this check existed and
  narrows the DNS-rebind window; unsafe targets are logged as failed deliveries).

**Backend — API docs hidden in production (`app/main.py`)**
- `/docs`, `/redoc`, and `/openapi.json` enumerated every admin/staff/client
  route and payload publicly. They are now disabled when `APP_ENV=production`
  and remain available in dev.

## Review notes — no change needed (already sound)

The rest of the code review found the app in good shape; recording it so the
next reviewer doesn't re-derive it:
- Stored-XSS surface (lead "requirements" rendered via `dangerouslySetInnerHTML`
  in the admin UI): public input is HTML-escaped (`plain_text_to_html`), admin
  rich text is bleach-sanitized to a tag allowlist with no attributes. Safe.
- Razorpay checkout **and** webhook signatures verified with constant-time HMAC;
  webhook rejects when the secret is unset. ERP purchase sync is HMAC-gated.
- Auth: OTP + session tokens stored hashed; passwords PBKDF2-HMAC-SHA256
  (240k iterations); per-IP rate limits on admin/staff/client login and public
  forms; `client_ip()` reads the last (Traefik-appended) XFF entry, not the
  spoofable first one.
- APIs are header-token authenticated (not cookies), so CSRF doesn't apply.

## Still open (operational — need your dashboards/host, can't be done from the repo)

- **Secret rotation** (`SECURITY_SECRET_ROTATION.md`) — Razorpay / GoDaddy /
  session secret rotation after the June React2Shell incident. Still pending.
- **Container-hardening deploy** (`SECURITY_HARDENING_2026-07-03.md`) — the
  non-root/`cap_drop` container changes are coded but not yet built/deployed,
  including the one-time `backend_storage` volume chown.

## Deploy / verify

```bash
# Frontend: pick up the postcss override
cd frontend && npm ci

# Rebuild + restart
docker compose build --no-cache frontend backend
docker compose down && docker compose up -d

# Verify
docker compose logs --tail=30 backend frontend        # boot clean
curl -sS -o /dev/null -w '%{http_code}\n' https://muskit.in/api/v1/../docs   # 404 in prod
```

Smoke-test after deploy: register a webhook endpoint with an internal URL
(`http://127.0.0.1`) and confirm it's rejected with 400; register a normal
public endpoint and confirm dispatch still works.
