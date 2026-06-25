# RCE Audit — Musk-IT Platform

**Date:** 2026-06-25  **Scope:** Next.js frontend (`frontend/`) + FastAPI backend (`backend/`)
**Status:** Read-only audit. No code modified.

> ⚠️ **This is not hypothetical. The server is actively compromised right now.** The pasted `ps`/`top` output shows a Monero miner (`/tmp/pls_pak_choi`, PID 174914, pool `15.235.234.220:3333`) whose **parent PID is 2272 — the `next-server` process**. The Next.js runtime spawned the miner. The vulnerability below is the entry point, and it has already been used.

---

## Ranked findings (by exploitability)

### 1. CRITICAL — CONFIRMED EXPLOITED: React2Shell, unauthenticated RCE (CVE-2025-55182 / CVE-2025-66478)

- **Where:** `frontend/package.json` → `next 15.3.1`, `react 19.1.0`, `react-dom 19.1.0`; App Router in use (`frontend/app/`).
- **Input source:** A single crafted, **unauthenticated** HTTP request to any App Router route / React Server Component ("Flight" protocol) endpoint. No login, token, or custom config required.
- **Path from input to execution:**
  `HTTP request → React Server Components Flight-protocol deserialization (unsafe) → arbitrary JS executed inside the next-server Node process → child process spawned`.
  This is exactly the observed behavior: `next-server` (PID 2272) → `/tmp/pls_pak_choi` (PID 174914).
- **Why it matches the incident:** CVSS 10.0, pre-auth, default configuration exploitable, public PoCs and mass-exploitation in the wild since disclosure on 2025-12-03. This app runs versions below every patched release and was never updated.
- **Affected vs fixed:**
  | Package | Installed | Fixed (this line) | Status |
  |---|---|---|---|
  | next | 15.3.1 | **15.3.6** (or 15.4.8 / 15.5.7 / 16.0.7) | ❌ vulnerable |
  | react | 19.1.0 | **19.1.2** (or 19.2.1) | ❌ vulnerable |
  | react-dom | 19.1.0 | **19.1.2** (or 19.2.1) | ❌ vulnerable |

  Note: CVE-2025-66478 was later merged as a duplicate of CVE-2025-55182; both IDs refer to the same flaw.

This is, to a high degree of confidence, **the RCE that was used.** Everything else below is secondary.

### 2. HIGH — Indicators of post-exploitation tampering in `frontend/node_modules`

Not a vulnerability itself, but evidence the attacker already had code execution and used it:

- `node_modules/esbuild@0.21.5` is present on disk but **absent from `package-lock.json`** (0 references) and is **not** a dependency of next/react. It was added **2026-06-24 18:16** — the day before the miner started (2026-06-25 15:26).
- A cluster of `node_modules` files (`esbuild/`, `@img/sharp-*`, `@emnapi/runtime`) were rewritten in the same 18:16–18:18 window, consistent with an attacker-run `npm install` after gaining RCE.
- **Treat the entire `node_modules`, the running container image, and `/tmp` as compromised.** Do not trust on-disk dependencies; rebuild from a clean lockfile.

### 3. MEDIUM — Server-Side Request Forgery via webhook dispatch (not RCE)

- **File:** `backend/app/services/integration_service.py:152` (`httpx.post(endpoint.target_url, ...)`); registered at `backend/app/api/routes/integrations.py:60`.
- **Input source:** admin-authenticated `target_url` (`WebhookEndpointCreate`), delivered on dispatch.
- **Path:** admin registers an arbitrary URL → platform makes a server-side POST to it → can reach internal services (e.g. `http://backend:8000`, cloud metadata endpoints). Requires admin auth, so lower priority, but worth a host/scheme allow-list.

### 4. LOW — XSS sinks (`dangerouslySetInnerHTML`), not RCE

- `frontend/components/admin/AdminLeadWorkspace.js:847`, `frontend/components/DashboardApp.js:575`, `frontend/components/JsonLd.js:8`, `frontend/app/layout.js:121`.
- JsonLd escapes `<`, and the layout one is a static theme script. The two admin-surface ones render data that originates from lead/user input and should be verified to be sanitized (`bleach` is a backend dependency — confirm it is applied to anything rendered raw). Client-side XSS only; listed for completeness.

### 5. LOW — DOCX/XML parsing of admin uploads (`python-docx` → lxml)

- `backend/app/services/docx_service.py` parses uploaded `.docx` quotation drafts. python-docx 1.2.0 is current; XXE requires admin upload and is not a direct RCE. Monitor, low priority.

---

## Dependencies with known RCE CVEs

| Package | Version | CVE | Severity | RCE? |
|---|---|---|---|---|
| **next** | **15.3.1** | **CVE-2025-55182 / CVE-2025-66478 (React2Shell)** | **10.0** | **Yes — unauth, confirmed exploited** |
| **react** | **19.1.0** | **CVE-2025-55182** | **10.0** | **Yes — unauth** |
| **react-dom** | **19.1.0** | **CVE-2025-55182** | **10.0** | **Yes — unauth** |

The remaining declared dependencies were checked and are at current, patched versions with **no known RCE CVE** at the installed version: `sharp 0.34.5` (libvips 8.17.3 / libwebp 1.6.0 — not affected by the old CVE-2023-4863 libwebp overflow), `weasyprint 66.0`, `jinja2 3.1.6`, `python-docx 1.2.0`, `fastapi 0.116.1`, `httpx 0.28.1`, `bleach 6.2.0`. (`esbuild 0.21.5` is the injected, unlisted package from finding #2, not a declared dependency.)

## Application source code — no direct RCE sink found

A full sweep of first-party code found **no** `child_process`/`exec`/`spawn`/`eval`/`new Function`/dynamic `import()`/`vm` in the Node/Next source, and **no** `subprocess`/`os.system`/`eval`/`pickle`/`yaml.load`/SSTI in the Python backend. Both jinja2 environments (`pdf_service.py`, `email_service.py`) load **static disk templates** via `FileSystemLoader` + `get_template` with `select_autoescape`; no `from_string`/`Template(user_input)` SSTI exists, including in the cold-outreach campaign path. Public lead intake (`public.py`) is pydantic-validated with a honeypot and rate limiting. **The RCE came from the framework dependency (finding #1), not from app code.**

---

## Recommended immediate actions (incident response — do before any code change)

1. **Contain:** isolate the host/container from the network; kill PID 174914; assume the box is fully compromised (running as root inside the container).
2. **Eradicate:** rebuild the frontend container from scratch with `next ≥ 15.3.6` and `react`/`react-dom ≥ 19.1.2`; do **not** reuse the existing `node_modules` or image. Remove `/tmp/pls_pak_choi` and the unlisted `esbuild`.
3. **Investigate persistence:** the pasted cron/systemd/timer enumeration looked clean, but re-check after eradication — also rotate every secret reachable from the container (`.env`: `INTEGRATIONS_INBOUND_SECRET`, SMTP/SendGrid keys, Razorpay keys, DB credentials, `PUBLIC_BASE_URL`-signed tokens).
4. **Rotate & review:** assume DB and lead data were accessible; review `next-server`/nginx/traefik logs for the initial RSC exploit request and any data exfiltration.
5. Then address findings #3–#5 as hardening.

## Sources

- [Next.js Security Advisory — CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478)
- [React — Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [vercel/next.js advisory GHSA-9qr9-h5gf-34mp](https://github.com/vercel/next.js/security/advisories/GHSA-9qr9-h5gf-34mp)
- [Unit 42 — Exploitation of CVE-2025-55182 / CVE-2025-66478](https://unit42.paloaltonetworks.com/cve-2025-55182-react-and-cve-2025-66478-next/)
- [Microsoft Security — Defending against React2Shell](https://www.microsoft.com/en-us/security/blog/2025/12/15/defending-against-the-cve-2025-55182-react2shell-vulnerability-in-react-server-components/)
- [Datadog Security Labs — React2Shell technical analysis](https://securitylabs.datadoghq.com/articles/cve-2025-55182-react2shell-remote-code-execution-react-server-components/)
