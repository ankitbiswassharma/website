# Dependency & Security Updates — 2026-06-29

Scan of the website's dependencies turned up real, actionable vulnerabilities beyond the
already-patched React2Shell issue. Changes below were validated by re-resolving and
re-auditing the new dependency sets (`npm audit` / `pip-audit`). **They have not been run
against the live app — build and smoke-test before deploying to production.**

## Frontend (`frontend/package.json` + `package-lock.json`) — applied

| Package   | Old    | New      | Why |
|-----------|--------|----------|-----|
| next      | 15.3.6 | 15.5.19  | Clears ~20 advisories accumulated since 15.3.6 — incl. **1 high** (cache-key confusion / image-optimizer + content injection) plus middleware SSRF, request smuggling, RSC cache poisoning, several DoS, and an App-Router CSP-nonce XSS. Stays in the 15.x line (no major bump). |
| react     | 19.1.0 | 19.2.7   | Routine patch alignment; satisfies next's `^19` peer dep. |
| react-dom | 19.1.0 | 19.2.7   | Same. |

`npm audit` after the bump: the high-severity cluster is gone. One **moderate** remains —
`postcss <8.5.10` (XSS in CSS stringify), a build-time transitive of Next with no in-range
fix; npm's only "fix" is to downgrade Next to 9.x, which is wrong. Real-world risk is low
(it only matters when stringifying untrusted CSS, which the build doesn't do). Leave it until
a Next release ships a newer postcss.

## Backend (`backend/requirements.txt`) — applied

| Package          | Old     | New     | Fixes |
|------------------|---------|---------|-------|
| fastapi          | 0.116.1 | 0.138.2 | Needed so the stack can pull a patched starlette 1.x. |
| starlette        | (unpinned, 0.47.3) | 1.3.1 | 7 CVEs/advisories: CVE-2025-62727, CVE-2026-48817/48818, PYSEC-2026-161/248/249. Now pinned explicitly. |
| bleach           | 6.2.0   | 6.4.0   | GHSA-gj48-438w-jh9v, GHSA-8rfp-98v4-mmr6 (sanitizer bypass — relevant; bleach guards your XSS sanitization). |
| python-multipart | 0.0.20  | 0.0.31  | 6 CVEs in multipart/form parsing (CVE-2026-24486, -40347, -42561, -53538/39/40). |
| weasyprint       | 66.0    | 68.0    | CVE-2025-68616 (PDF generation). |

`pip-audit` on the new set: **No known vulnerabilities found.**

Note on risk: starlette jumps a major version (0.x → 1.x). Your app code does **not** import
starlette directly — it only uses it via FastAPI — so the breaking changes are shielded. Still,
run the smoke test below before trusting production.

## Recommended but NOT applied — container hardening

Both Dockerfiles run as **root**. That was the amplifier in the June compromise (a root
container let the miner write to the host). Add a non-root user before `CMD` once you can
test the build:

- `frontend/Dockerfile`: after `RUN npm run build`, add `USER node` (the `node:20-alpine`
  image already ships a `node` user).
- `backend/Dockerfile`: create a user (e.g. `RUN useradd -m app && chown -R app /app`) and
  add `USER app` before the run command. Verify WeasyPrint can still write its temp files.

Left for you because a bad USER directive breaks the deploy and I can't test the container
build here.

## Deploy & verify

```bash
cd <repo root>
docker compose build --no-cache frontend backend
docker compose up -d
# frontend serves, backend boots clean:
docker compose logs --tail=50 backend frontend
# confirm versions:
docker exec muskit_website_frontend sh -c 'grep version node_modules/next/package.json'   # 15.5.19
docker exec muskit_website_backend python -c "import starlette,fastapi;print(starlette.__version__,fastapi.__version__)"  # 1.3.1 0.138.2
```

Smoke-test: load a few pages, submit a lead form (exercises python-multipart + bleach),
generate one PDF (WeasyPrint), and send a test email.

## Still open from the incident (separate from this scan)

Secret rotation — see `SECURITY_SECRET_ROTATION.md`. Not addressed here.
